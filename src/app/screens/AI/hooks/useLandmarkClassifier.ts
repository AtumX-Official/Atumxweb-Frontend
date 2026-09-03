import { useCallback, useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import { saveModelToFile, type ModelBundle } from '../utils/modelIO'
import { exportModelToBlockly } from '../utils/blocklyExporter'
import { ensureTfBackend } from '../utils/tfBackend'
import { fitWithEarlyStopping } from '../utils/trainLoop'
import {
  computeCentroids,
  computeClassWeights,
  computeRadii,
  modelFromBundle,
  restoreCentroids,
  restoreSamples,
  smoothProbabilities,
} from '../utils/classifierBundle'

export type TrainingStatus = 'idle' | 'training' | 'ready' | 'error'

export interface GestureClass {
  id: string
  name: string
}

export interface ProbEntry {
  name: string | undefined
  prob: number
}

export interface Prediction {
  classId: string | undefined
  className: string
  confidence: number
  probabilities: ProbEntry[]
}

// Shared training hyper-parameters — identical across the hand, pose, and 2-hand classifiers.
const MIN_SAMPLES = 15
const EPOCHS = 120
const SMOOTHING_WINDOW = 8
// Self-calibrating reject gate: distance to a class centre measured in units of that
// class's OWN training spread. Replaces a fixed absolute limit, which rejected slight
// movement and small GPU↔CPU landmark drift alike. Still strict against out-of-distribution
// input: too far from every class → no detection, never a confident wrong class.
const REJECT_K = 3.0
const RADIUS_FLOOR = 0.8 // keeps a too-static recording from making the gate absurdly tight
const EARLY_STOP_PATIENCE = 15

/** Per-classifier knobs — everything that differs between the hand/pose/2-hand modes. */
export interface LandmarkClassifierConfig {
  /** Input feature length (hand: 63, pose: 109, 2-hand: 126). */
  featureDim: number
  /** Confidence floor for a detection (0.70 for hand/pose, 0.80 for 2-hand). */
  confidenceThreshold: number
  /**
   * Margin guard: reject a frame if top1 − top2 < margin (ambiguous → no-detection, never
   * a confident wrong class). Omit to disable (2-hand relies on the reject gate alone).
   */
  margin?: number
  /** Reject-gate multiplier when the focus box is on. Omit ⇒ gate always uses REJECT_K. */
  rejectKFocus?: number
  /** Whether loadModel restores the saved useFocusBox flag (hand + 2-hand: yes; pose: no). */
  supportsFocusBox: boolean
  buildModel: (numClasses: number) => tf.Sequential
  /** Expand one sample into physically-plausible variants for training. */
  augment: (vec: Float32Array) => Float32Array[]
  /** Pose ignores samples whose length doesn't match featureDim; hand modes accept any. */
  validateSampleLength: boolean
  logPrefix: string
  save: {
    defaultName: string
    /** modelIO "language" → which Projects/ai/<Capitalized> folder to save into. */
    language: string
    /** Persisted maps are keyed by class name (hand modes) or class id (pose). */
    keyBy: 'name' | 'id'
    includeFocusBox: boolean
  }
  /** Whether the Blockly export carries centroids + samples (hand modes) or names only (pose). */
  exportExtras: boolean
  /** Message shown when loading an older file lacking template metadata. Omit to stay silent. */
  legacyAlert?: string
}

export function useLandmarkClassifier(cfg: LandmarkClassifierConfig) {
  const { featureDim } = cfg

  const samplesRef = useRef<Record<string, Float32Array[]>>({})
  const modelRef = useRef<tf.Sequential | null>(null)
  const classesRef = useRef<GestureClass[]>([])
  const historyRef = useRef<number[][]>([]) // rolling probabilities for temporal smoothing
  const centroidsRef = useRef<Record<string, number[]>>({})
  const radiiRef = useRef<Record<string, number>>({}) // per-class spread, powers the reject gate
  const cancelRef = useRef(false) // set by cancelTraining() to abort at the next epoch boundary

  const [sampleCounts, setSampleCounts] = useState<Record<string, number>>({})
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>('idle')
  const [trainProgress, setTrainProgress] = useState(0)
  const [trainAccuracy, setTrainAccuracy] = useState<number | null>(null)
  const [trainError, setTrainError] = useState<string | null>(null)
  const [isSavedToDisk, setIsSavedToDisk] = useState(false)
  const [useFocusBox, setUseFocusBox] = useState(false)

  useEffect(() => {
    ensureTfBackend()
    return () => { modelRef.current?.dispose() }
  }, [])

  // ── Sample collection ──────────────────────────────────────────────────────

  const initClass = useCallback((classId: string) => {
    if (!samplesRef.current[classId]) samplesRef.current[classId] = []
  }, [])

  const addSample = useCallback((classId: string, vector: Float32Array) => {
    if (!samplesRef.current[classId]) return
    if (cfg.validateSampleLength && vector.length !== featureDim) return
    samplesRef.current[classId].push(vector)
    setSampleCounts((prev) => ({ ...prev, [classId]: samplesRef.current[classId].length }))
  }, [cfg.validateSampleLength, featureDim])

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

  // ── Training ───────────────────────────────────────────────────────────────

  const trainModel = useCallback(async (classes: GestureClass[]) => {
    classesRef.current = classes
    setTrainError(null)
    historyRef.current = []

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

    // Build augmented dataset
    const allVectors: number[][] = []
    const allLabels: number[] = []
    classes.forEach((cls, i) => {
      for (const vec of samplesRef.current[cls.id]) {
        for (const aug of cfg.augment(vec)) {
          allVectors.push(Array.from(aug))
          allLabels.push(i)
        }
      }
    })

    const classWeight = computeClassWeights(allLabels, classes.length)

    const idx = tf.util.createShuffledIndices(allVectors.length)
    const sVectors = Array.from(idx).map((i) => allVectors[i])
    const sLabels = Array.from(idx).map((i) => allLabels[i])

    const xs = tf.tensor2d(sVectors, [sVectors.length, featureDim])
    const ys = tf.oneHot(tf.tensor1d(sLabels, 'int32'), classes.length).toFloat()

    modelRef.current?.dispose()
    const model = cfg.buildModel(classes.length)

    try {
      const { stopped } = await fitWithEarlyStopping(model, xs, ys, {
        epochs: EPOCHS,
        batchSize: 32,
        validationSplit: 0.2,
        classWeight,
        patience: EARLY_STOP_PATIENCE,
        isCancelled: () => cancelRef.current,
        setProgress: setTrainProgress,
        setAccuracy: setTrainAccuracy,
      })

      // User exited training midway → discard the half-trained model, reset to idle.
      if (cancelRef.current) {
        model.dispose()
        modelRef.current = null
        setTrainingStatus('idle')
        setTrainProgress(0)
        setTrainAccuracy(null)
        return
      }

      modelRef.current = model

      // Centroid + spread per class for the self-calibrating reject gate at inference.
      const newCentroids = computeCentroids(classes, samplesRef.current, featureDim)
      centroidsRef.current = newCentroids
      radiiRef.current = computeRadii(classes, samplesRef.current, newCentroids, featureDim)

      setTrainingStatus('ready')
      setTrainProgress(100)
      if (stopped) console.log(`${cfg.logPrefix} Early stopped — val_loss plateau`)
    } catch (err: unknown) {
      model.dispose()
      setTrainError(err instanceof Error ? err.message : String(err))
      setTrainingStatus('error')
    } finally {
      xs.dispose()
      ys.dispose()
    }
  }, [cfg, featureDim])

  const cancelTraining = useCallback(() => { cancelRef.current = true }, [])

  // ── Persistence ──────────────────────────────────────────────────────────────

  const saveModel = useCallback(async (projectName?: string) => {
    if (!modelRef.current || trainingStatus !== 'ready') {
      alert('Please train your model successfully before saving!')
      return
    }
    const name = typeof projectName === 'string' && projectName ? projectName : cfg.save.defaultName

    const samples: Record<string, number[][]> = {}
    const centroids: Record<string, number[]> = {}
    classesRef.current.forEach((c) => {
      const key = cfg.save.keyBy === 'name' ? c.name : c.id
      samples[key] = (samplesRef.current[c.id] || []).map((arr) => Array.from(arr))
      if (centroidsRef.current[c.id]) centroids[key] = centroidsRef.current[c.id]
    })

    await saveModelToFile(
      modelRef.current,
      classesRef.current.map((c) => c.name),
      name,
      centroids,
      samples,
      cfg.save.includeFocusBox ? useFocusBox : undefined,
      cfg.save.language
    )
    setIsSavedToDisk(true)
  }, [cfg, trainingStatus, useFocusBox])

  const loadModel = useCallback(async (bundle: ModelBundle) => {
    await ensureTfBackend()

    if (!bundle.version || !bundle.classNames || !bundle.modelTopology) {
      throw new Error('Invalid model file. Please use a file saved from this app.')
    }

    const model = await modelFromBundle(bundle)
    modelRef.current?.dispose()
    modelRef.current = model as tf.Sequential

    const restoredClasses = bundle.classNames.map((name, i) => ({ id: `cls_restored_${i}`, name }))
    classesRef.current = restoredClasses

    const { samples, counts } = restoreSamples(bundle, restoredClasses)
    samplesRef.current = samples
    setSampleCounts(counts)

    const restoredCentroids = restoreCentroids(bundle, restoredClasses)
    centroidsRef.current = restoredCentroids
    // Recompute per-class spread so the adaptive gate behaves the same as after training.
    radiiRef.current = computeRadii(restoredClasses, samples, restoredCentroids, featureDim)

    if (cfg.legacyAlert && (!bundle.samples || !bundle.centroids)) alert(cfg.legacyAlert)

    setTrainingStatus('ready')
    setTrainProgress(100)
    setTrainAccuracy(null)
    setTrainError(null)
    setIsSavedToDisk(true)
    if (cfg.supportsFocusBox) setUseFocusBox(bundle.useFocusBox ?? false)

    return restoredClasses
  }, [cfg, featureDim])

  const resetModel = useCallback(() => {
    modelRef.current?.dispose()
    modelRef.current = null
    historyRef.current = []
    setTrainingStatus('idle')
    setTrainProgress(0)
    setTrainAccuracy(null)
    setTrainError(null)
    setIsSavedToDisk(false)
  }, [])

  // ── Inference ──────────────────────────────────────────────────────────────

  const predict = useCallback(async (vector: Float32Array): Promise<Prediction | null> => {
    if (!modelRef.current || trainingStatus !== 'ready') return null
    if (vector.length !== featureDim) return null
    const classes = classesRef.current

    const input = tf.tensor2d(vector, [1, featureDim])
    let probs: number[]
    try {
      const output = modelRef.current.predict(input) as tf.Tensor
      probs = Array.from(await output.data())
      output.dispose()
    } catch (err) {
      // Most likely an old model saved with a different input width — needs retraining.
      console.warn(`${cfg.logPrefix} predict failed — retrain this model:`, err)
      input.dispose()
      return null
    }
    input.dispose()

    const smoothed = smoothProbabilities(historyRef.current, probs, SMOOTHING_WINDOW)
    const probabilities = smoothed.map((p, i) => ({ name: classes[i]?.name, prob: p }))
    const maxIdx = smoothed.indexOf(Math.max(...smoothed))
    const predictedClass = classes[maxIdx]

    let aboveThreshold = smoothed[maxIdx] >= cfg.confidenceThreshold

    // Margin guard — reject ambiguous frames where the runner-up is almost as likely, so
    // two similar classes never produce a confident WRONG result. (Disabled for 2-hand.)
    if (cfg.margin !== undefined && aboveThreshold && smoothed.length > 1) {
      let secondBest = -Infinity
      for (let i = 0; i < smoothed.length; i++) {
        if (i !== maxIdx && smoothed[i] > secondBest) secondBest = smoothed[i]
      }
      if (smoothed[maxIdx] - secondBest < cfg.margin) aboveThreshold = false
    }

    // Self-calibrating reject: distance to the class centre in units of its own spread.
    if (aboveThreshold && predictedClass) {
      const centroid = centroidsRef.current[predictedClass.id]
      const radius = radiiRef.current[predictedClass.id] || RADIUS_FLOOR
      if (centroid) {
        let sumSq = 0
        for (let i = 0; i < featureDim; i++) { const diff = vector[i] - centroid[i]; sumSq += diff * diff }
        const dist = Math.sqrt(sumSq)
        const k = cfg.rejectKFocus !== undefined && useFocusBox ? cfg.rejectKFocus : REJECT_K
        if (dist / Math.max(radius, RADIUS_FLOOR) > k) aboveThreshold = false
      }
    }

    return {
      classId: aboveThreshold ? classes[maxIdx]?.id : undefined,
      className: aboveThreshold ? (classes[maxIdx]?.name ?? 'Unknown') : '',
      confidence: aboveThreshold ? smoothed[maxIdx] : 0,
      probabilities: aboveThreshold ? probabilities : probabilities.map((p) => ({ ...p, prob: 0 })),
    }
  }, [cfg, featureDim, trainingStatus, useFocusBox])

  const exportToBlockly = useCallback(async (projectName: string) => {
    if (!modelRef.current || trainingStatus !== 'ready') return
    const names = classesRef.current.map((c) => c.name)

    if (!cfg.exportExtras) {
      await exportModelToBlockly(modelRef.current, names, projectName)
      return
    }

    const samples: Record<string, number[][]> = {}
    const centroids: Record<string, number[]> = {}
    classesRef.current.forEach((c) => {
      samples[c.name] = (samplesRef.current[c.id] || []).map((arr) => Array.from(arr))
      if (centroidsRef.current[c.id]) centroids[c.name] = centroidsRef.current[c.id]
    })
    await exportModelToBlockly(modelRef.current, names, projectName, useFocusBox, centroids, samples)
  }, [cfg, trainingStatus, useFocusBox])

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
    exportToBlockly,
    getSamples: () => samplesRef.current,
    modelReady: trainingStatus === 'ready',
    isSavedToDisk,
    useFocusBox,
    setUseFocusBox,
  }
}
