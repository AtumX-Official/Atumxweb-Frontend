import { useCallback, useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import { buildModelBundle, type ModelBundle } from '../utils/modelIO'
import { saveProjectFile } from '../utils/projectFile'
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
  restoreThumbnails,
  smoothProbabilities,
} from '../utils/classifierBundle'
import { shrinkImages, sketchLandmarks } from '../utils/sampleThumbnails'
import { createPredictionStabilizer } from '../utils/predictionStabilizer'
import type { Notice } from './useNotice'

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
const MIN_SAMPLES = 20 // every AI screen needs at least 20 samples per class
const EPOCHS = 120
// Lowered 8→5: the prediction stabilizer now supplies the temporal stability, so a heavy
// smoothing window is no longer needed for steadiness and only added detection latency.
const SMOOTHING_WINDOW = 5
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
  // One stabilizer per classifier instance — adds hysteresis + switch-debounce +
  // confidence EMA on top of the per-frame decision so the prediction/bar stays steady.
  const stabilizerRef = useRef(createPredictionStabilizer())

  const [sampleCounts, setSampleCounts] = useState<Record<string, number>>({})
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>('idle')
  const [trainProgress, setTrainProgress] = useState(0)
  const [trainAccuracy, setTrainAccuracy] = useState<number | null>(null)
  const [trainError, setTrainError] = useState<string | null>(null)
  const [isSavedToDisk, setIsSavedToDisk] = useState(false)
  // The classes the current model was actually fitted on. Training can be handed a
  // subset (the user disables classes in the panel), and the model's output slots
  // follow THIS list — anything reading `probabilities` by index must use it, not
  // the full class list the screen is still editing.
  const [trainedClasses, setTrainedClasses] = useState<GestureClass[]>([])
  const [useFocusBox, setUseFocusBox] = useState(false)
  // Messages the screen shows in the themed NoticePopup. These used to be
  // `window.alert`, which can't be styled and titles itself "Trix".
  const [notice, setNotice] = useState<Notice | null>(null)
  const dismissNotice = useCallback(() => setNotice(null), [])


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
    setTrainedClasses(classes)
    setTrainError(null)
    historyRef.current = []
    // The new model can have a different number of output slots than the old one
    // (classes added, deleted, or disabled), so a held-over index would point at
    // the wrong class on the first frames after training.
    stabilizerRef.current.reset()

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

    // runFit builds fresh tensors each attempt (so a CPU-fallback retry gets CPU-backed
    // tensors, not GPU-bound ones) and always disposes them.
    const runFit = async (m: tf.LayersModel) => {
      const xs = tf.tensor2d(sVectors, [sVectors.length, featureDim])
      const ys = tf.oneHot(tf.tensor1d(sLabels, 'int32'), classes.length).toFloat()
      try {
        return await fitWithEarlyStopping(m, xs, ys, {
          epochs: EPOCHS,
          batchSize: 32,
          validationSplit: 0.2,
          classWeight,
          patience: EARLY_STOP_PATIENCE,
          isCancelled: () => cancelRef.current,
          setProgress: setTrainProgress,
          setAccuracy: setTrainAccuracy,
          guardNonFiniteLoss: true,
        })
      } finally {
        xs.dispose()
        ys.dispose()
      }
    }

    modelRef.current?.dispose()
    let model = cfg.buildModel(classes.length)

    try {
      let { stopped, fatalLoss } = await runFit(model)

      // GPU math blew up (NaN/Inf) → retrain once on the slower but stable CPU backend,
      // matching the audio classifier. Fixes "trains fine on some GPUs, crashes/bad on
      // others" and the pose Train-Model crash on certain devices.
      if (fatalLoss && !cancelRef.current && tf.getBackend() !== 'cpu') {
        console.warn(`${cfg.logPrefix} Non-finite loss on ${tf.getBackend()} — retraining on CPU`)
        model.dispose()
        await tf.setBackend('cpu')
        await tf.ready()
        model = cfg.buildModel(classes.length)
        ;({ stopped, fatalLoss } = await runFit(model))
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

      if (fatalLoss) {
        throw new Error('Training was numerically unstable (NaN) even on CPU. Try recording a few more samples per class and train again.')
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
    }
  }, [cfg, featureDim])

  const cancelTraining = useCallback(() => { cancelRef.current = true }, [])

  // ── Persistence ──────────────────────────────────────────────────────────────

  /** The trained model + training data as a project bundle (what Save writes), or
   *  null when there's no trained model. `images` become the saved thumbnails. */
  const serializeProject = useCallback(async (images?: Record<string, string[]>): Promise<ModelBundle | null> => {
    if (!modelRef.current || trainingStatus !== 'ready') return null
    const samples: Record<string, number[][]> = {}
    const centroids: Record<string, number[]> = {}
    const thumbnails: Record<string, string[]> = {}
    for (const c of classesRef.current) {
      const key = cfg.save.keyBy === 'name' ? c.name : c.id
      samples[key] = (samplesRef.current[c.id] || []).map((arr) => Array.from(arr))
      if (centroidsRef.current[c.id]) centroids[key] = centroidsRef.current[c.id]
      if (images?.[c.id]?.length) thumbnails[key] = await shrinkImages(images[c.id])
    }
    return buildModelBundle(
      modelRef.current,
      classesRef.current.map((c) => c.name),
      centroids,
      samples,
      cfg.save.includeFocusBox ? useFocusBox : undefined,
      Object.keys(thumbnails).length ? thumbnails : undefined
    )
  }, [cfg, trainingStatus, useFocusBox])

  /** `images` is the screen's class-card pictures (by class id), saved as thumbnails. */
  const saveModel = useCallback(async (projectName?: string, images?: Record<string, string[]>) => {
    if (!modelRef.current || trainingStatus !== 'ready') {
      setNotice({
        tone: 'warning',
        title: 'Train first',
        message: 'There is no trained model to save yet. Train your classes, then save.'
      })
      return
    }
    const name = typeof projectName === 'string' && projectName ? projectName : cfg.save.defaultName
    const bundle = await serializeProject(images)
    if (!bundle) return
    await saveProjectFile(cfg.save.language, name, JSON.stringify(bundle))
    setIsSavedToDisk(true)
  }, [cfg, trainingStatus, serializeProject])

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
    setTrainedClasses(restoredClasses)

    const { samples, counts } = restoreSamples(bundle, restoredClasses)
    samplesRef.current = samples
    setSampleCounts(counts)

    historyRef.current = []
    stabilizerRef.current.reset()

    const restoredCentroids = restoreCentroids(bundle, restoredClasses)
    centroidsRef.current = restoredCentroids
    // Recompute per-class spread so the adaptive gate behaves the same as after training.
    radiiRef.current = computeRadii(restoredClasses, samples, restoredCentroids, featureDim)

    if (cfg.legacyAlert && (!bundle.samples || !bundle.centroids)) {
      setNotice({ tone: 'warning', title: 'Older project file', message: cfg.legacyAlert })
    }

    setTrainingStatus('ready')
    setTrainProgress(100)
    setTrainAccuracy(null)
    setTrainError(null)
    setIsSavedToDisk(true)
    if (cfg.supportsFocusBox) setUseFocusBox(bundle.useFocusBox ?? false)

    return restoredClasses
  }, [cfg, featureDim])

  /** Class-card pictures for a just-loaded bundle: the saved thumbnails, or — for
   *  files saved before thumbnails existed — a skeleton drawn from each sample. */
  const restoreImages = useCallback((bundle: ModelBundle, restoredClasses: GestureClass[]) => {
    const saved = restoreThumbnails(bundle, restoredClasses)
    const images: Record<string, string[]> = {}
    for (const c of restoredClasses) {
      images[c.id] = saved[c.id]?.length
        ? saved[c.id]
        : (samplesRef.current[c.id] || []).map((vec) => sketchLandmarks(vec))
    }
    return images
  }, [])

  const resetModel = useCallback(() => {
    modelRef.current?.dispose()
    modelRef.current = null
    historyRef.current = []
    stabilizerRef.current.reset()
    setTrainedClasses([])
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

    // Stabilize the per-frame decision: hysteresis + switch-debounce + confidence EMA,
    // so a class hovering at the threshold (or two similar classes) don't flicker the bar.
    const st = stabilizerRef.current.update(smoothed, aboveThreshold ? maxIdx : null)
    const stableClass = st.classIdx !== null ? classes[st.classIdx] : undefined
    return {
      classId: stableClass?.id,
      className: stableClass?.name ?? '',
      confidence: st.confidence,
      probabilities: st.isDetected ? probabilities : probabilities.map((p) => ({ ...p, prob: 0 })),
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
    /** length of one sample vector — lets a screen tell which classifier a file belongs to */
    featureDim,
    trainModel,
    cancelTraining,
    saveModel,
    serializeProject,
    loadModel,
    restoreImages,
    resetModel,
    trainingStatus,
    trainedClasses,
    trainProgress,
    trainAccuracy,
    trainError,
    notice,
    setNotice,
    dismissNotice,
    predict,
    exportToBlockly,
    getSamples: () => samplesRef.current,
    modelReady: trainingStatus === 'ready',
    isSavedToDisk,
    useFocusBox,
    setUseFocusBox,
  }
}
