import { useEffect, useRef, useState, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'
import { ensureTfBackend } from '../utils/tfBackend'
import { fitWithEarlyStopping } from '../utils/trainLoop'
import { computeClassWeights, modelFromBundle, restoreSamples } from '../utils/classifierBundle'
import {
  MEL_BINS,
  TIME_FRAMES,
  buildAudioModel,
  buildAudioDataset,
  createAudioDetector,
  normalizeSpectrogram,
  serializeAudioBundle,
} from '../utils/audioModel'

export type TrainingStatus = 'idle' | 'training' | 'ready' | 'error'
export type { ProbEntry, AudioPrediction as Prediction } from '../utils/audioModel'

export interface AudioClass {
  id: string
  name: string
}

const MIN_SAMPLES = 10 // allow training with at least 10 samples (25 is recommended)
const EPOCHS = 80 // a ceiling; early stopping ends training once it plateaus
const EARLY_STOP_PATIENCE = 12 // val_loss is noisy on tiny voice datasets — give it room

export function useAudioClassifier() {
  const samplesRef = useRef<Record<string, Float32Array[]>>({})
  const modelRef = useRef<tf.LayersModel | null>(null)
  const classesRef = useRef<AudioClass[]>([])
  const detectorRef = useRef(createAudioDetector())
  // Set by cancelTraining() to abort an in-progress fit at the next epoch boundary.
  const cancelRef = useRef(false)

  const [sampleCounts, setSampleCounts] = useState<Record<string, number>>({})
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>('idle')
  const [trainProgress, setTrainProgress] = useState(0)
  const [trainAccuracy, setTrainAccuracy] = useState<number | null>(null)
  const [trainError, setTrainError] = useState<string | null>(null)
  const [isSavedToDisk, setIsSavedToDisk] = useState(false)

  // Real-time detection tuning, all user-adjustable (see createAudioDetector for how the
  // window, stability, and cooldown interact).
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7)
  const [smoothingWindow, setSmoothingWindow] = useState(4)
  const [detectionCooldown, setDetectionCooldown] = useState(1.2)

  useEffect(() => {
    ensureTfBackend()
    return () => { modelRef.current?.dispose() }
  }, [])

  // ── Sample Management ──

  const initClass = useCallback((classId: string) => {
    if (!samplesRef.current[classId]) samplesRef.current[classId] = []
  }, [])

  const addSample = useCallback((classId: string, spectrogram: Float32Array) => {
    if (!samplesRef.current[classId]) return
    samplesRef.current[classId].push(new Float32Array(spectrogram)) // deep copy
    setSampleCounts((prev) => ({ ...prev, [classId]: samplesRef.current[classId].length }))
  }, [])

  const clearSamples = useCallback((classId?: string) => {
    if (classId) {
      samplesRef.current[classId] = []
      setSampleCounts((prev) => ({ ...prev, [classId]: 0 }))
    } else {
      Object.keys(samplesRef.current).forEach((id) => { samplesRef.current[id] = [] })
      setSampleCounts({})
    }
  }, [])

  const removeClassData = useCallback((classId: string) => {
    delete samplesRef.current[classId]
    setSampleCounts((prev) => { const n = { ...prev }; delete n[classId]; return n })
  }, [])

  const deleteSample = useCallback((classId: string, index: number) => {
    if (!samplesRef.current[classId]) return
    samplesRef.current[classId].splice(index, 1)
    setSampleCounts((prev) => ({ ...prev, [classId]: samplesRef.current[classId].length }))
  }, [])

  // ── Training Loop ──

  const trainModel = useCallback(async (classes: AudioClass[]) => {
    classesRef.current = classes
    setTrainError(null)
    detectorRef.current.reset()

    for (const cls of classes) {
      const count = samplesRef.current[cls.id]?.length ?? 0
      if (count < MIN_SAMPLES) {
        setTrainError(`"${cls.name}" needs at least ${MIN_SAMPLES} samples (has ${count}).`)
        return
      }
    }

    cancelRef.current = false
    setTrainingStatus('training')
    setTrainProgress(0)
    setTrainAccuracy(null)
    setIsSavedToDisk(false)

    const { specs, labels } = buildAudioDataset(classes, samplesRef.current)
    const classWeight = computeClassWeights(labels, classes.length)

    const indices = tf.util.createShuffledIndices(specs.length)
    const shuffledSpecs = Array.from(indices).map((i) => specs[i])
    const shuffledLabels = Array.from(indices).map((i) => labels[i])

    modelRef.current?.dispose()
    let model = buildAudioModel(classes.length)

    // One training pass. Tensors are (re)created here from backend-independent JS arrays so
    // a CPU-fallback retry builds fresh CPU tensors. Returns true if the loss went
    // non-finite (NaN/Inf), which some GPUs hit via unstable WebGL math.
    const runFit = async (m: tf.LayersModel): Promise<boolean> => {
      const xs = tf.tensor4d(shuffledSpecs.flat(), [shuffledSpecs.length, MEL_BINS, TIME_FRAMES, 1], 'float32')
      const ys = tf.oneHot(tf.tensor1d(shuffledLabels, 'int32'), classes.length).toFloat()
      try {
        const { fatalLoss } = await fitWithEarlyStopping(m, xs, ys, {
          epochs: EPOCHS,
          batchSize: 16,
          validationSplit: 0.15,
          classWeight,
          patience: EARLY_STOP_PATIENCE,
          isCancelled: () => cancelRef.current,
          setProgress: setTrainProgress,
          setAccuracy: setTrainAccuracy,
          guardNonFiniteLoss: true,
          markProgressOnStop: true,
        })
        return fatalLoss
      } finally {
        xs.dispose()
        ys.dispose()
      }
    }

    try {
      let sawNaN = await runFit(model)

      // GPU math blew up → retrain once on the (slower but deterministic) CPU backend.
      if (sawNaN && !cancelRef.current && tf.getBackend() !== 'cpu') {
        console.warn('[AudioClassifier] Non-finite loss on', tf.getBackend(), '— retraining on CPU')
        model.dispose()
        await tf.setBackend('cpu')
        await tf.ready()
        model = buildAudioModel(classes.length)
        sawNaN = await runFit(model)
      }

      // User exited training midway → discard the half-trained model, reset to idle.
      if (cancelRef.current) {
        model.dispose()
        modelRef.current = null
        setTrainingStatus('idle')
        setTrainProgress(0)
        setTrainAccuracy(null)
        return
      }

      if (sawNaN) {
        throw new Error('Training was numerically unstable (NaN) even on CPU. Try recording a few more samples per class and train again.')
      }

      modelRef.current = model
      setTrainingStatus('ready')
      setTrainProgress(100)
    } catch (err: unknown) {
      model.dispose()
      setTrainError(err instanceof Error ? err.message : String(err))
      setTrainingStatus('error')
    }
  }, [])

  const cancelTraining = useCallback(() => { cancelRef.current = true }, [])

  // ── Persistence ──

  const saveModel = useCallback(async (projectName?: string) => {
    if (!modelRef.current || trainingStatus !== 'ready') {
      alert('Please train your model successfully before saving!')
      return
    }
    const name = typeof projectName === 'string' && projectName ? projectName : 'audio-model'
    const json = await serializeAudioBundle(
      modelRef.current,
      classesRef.current.map((c) => c.name),
      samplesRef.current,
      classesRef.current.map((c) => c.id)
    )

    try {
      const res = await window.api.file.save('', json, 'audioClassifier', name, '', '')
      // file.save resolves with { success, error } — it does NOT throw on a cancelled
      // dialog, so only mark saved when it actually wrote a file.
      if (res && (res as { success?: boolean }).success) setIsSavedToDisk(true)
    } catch (err) {
      console.error('Failed to save audio project:', err)
      alert('Failed to save project: ' + String(err))
    }
  }, [trainingStatus])

  const loadModel = useCallback(async (bundle: any) => {
    await ensureTfBackend()

    if (!bundle.version || !bundle.classNames || !bundle.modelTopology) {
      throw new Error('Invalid audio model file.')
    }

    const model = await modelFromBundle(bundle)
    modelRef.current?.dispose()
    modelRef.current = model

    const restoredClasses = bundle.classNames.map((name: string, i: number) => ({ id: `cls_restored_${i}`, name }))
    classesRef.current = restoredClasses

    const { samples, counts } = restoreSamples(bundle, restoredClasses)
    samplesRef.current = samples
    setSampleCounts(counts)

    setTrainingStatus('ready')
    setTrainProgress(100)
    setTrainAccuracy(null)
    setTrainError(null)
    setIsSavedToDisk(true)

    return restoredClasses
  }, [])

  const resetModel = useCallback(() => {
    modelRef.current?.dispose()
    modelRef.current = null
    detectorRef.current.reset()
    setTrainingStatus('idle')
    setTrainProgress(0)
    setTrainAccuracy(null)
    setTrainError(null)
    setIsSavedToDisk(false)
  }, [])

  // ── Inference ──

  const predict = useCallback(async (spectrogram: Float32Array) => {
    if (!modelRef.current || trainingStatus !== 'ready') return null

    const input = tf.tensor4d(Array.from(normalizeSpectrogram(spectrogram)), [1, MEL_BINS, TIME_FRAMES, 1], 'float32')
    const output = modelRef.current.predict(input) as tf.Tensor
    const probs = Array.from(await output.data())
    input.dispose()
    output.dispose()

    // NaN guard — some GPUs produce non-finite WebGL outputs. Report no-detection rather
    // than argmax-ing garbage into a confident wrong class.
    if (probs.some((p) => !isFinite(p))) {
      return { classId: undefined, className: 'Unknown', confidence: 0.0, probabilities: [], isDetected: false }
    }

    return detectorRef.current.resolve(
      probs,
      classesRef.current,
      { confidenceThreshold, smoothingWindow, detectionCooldown },
      Date.now()
    )
  }, [trainingStatus, confidenceThreshold, smoothingWindow, detectionCooldown])

  return {
    sampleCounts,
    initClass,
    addSample,
    clearSamples,
    removeClassData,
    deleteSample,
    MIN_SAMPLES,
    trainModel,
    cancelTraining,
    saveModel,
    loadModel,
    resetModel,
    trainingStatus,
    trainProgress,
    trainAccuracy,
    trainError,
    predict,
    modelReady: trainingStatus === 'ready',
    isSavedToDisk,
    samplesRef,
    confidenceThreshold,
    setConfidenceThreshold,
    smoothingWindow,
    setSmoothingWindow,
    detectionCooldown,
    setDetectionCooldown,
  }
}
