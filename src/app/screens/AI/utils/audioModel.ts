import * as tf from '@tensorflow/tfjs'
import type { ClassRef } from './classifierBundle'
import { bufferToBase64, smoothProbabilities } from './classifierBundle'

export const MEL_BINS = 64
export const TIME_FRAMES = 130

export interface ProbEntry {
  name: string | undefined
  prob: number
}

export interface AudioPrediction {
  classId: string | undefined
  className: string
  confidence: number
  probabilities: ProbEntry[]
  isDetected: boolean
}

// Stable fixed-range normalization mapping decibel values strictly to [0.0, 1.0].
// Speeds up convergence and keeps representations invariant between speech and silence.
export function normalizeSpectrogram(spec: Float32Array): Float32Array {
  const out = new Float32Array(spec.length)
  for (let i = 0; i < spec.length; i++) {
    const val = Math.max(-40.0, Math.min(0.0, spec[i]))
    out[i] = (val + 40.0) / 40.0
  }
  return out
}

// ── TF.js Compact Keyword-Spotting CNN (dual-pooled) ──
// 3 conv blocks (Conv2D(relu) → MaxPool), then the feature map is summarised TWO ways
// and concatenated: global MAX pool (strongest evidence per channel — catches the short,
// peaky phonemes distinguishing "hi" vs "hello") and global AVG pool (overall context).
// Using both, instead of average alone, stops acoustically-close words collapsing onto a
// single class while keeping the parameter count tiny (no Flatten).
//
// NO BatchNorm on purpose: it uses live batch stats while training but unconverged
// moving-average stats at inference, and on these tiny datasets those never settle — so
// validation + real-time prediction collapse to ~chance accuracy (the 33% regression).
// Built with the functional API because the dual-pool branch isn't a plain Sequential stack.
export function buildAudioModel(numClasses: number): tf.LayersModel {
  const input = tf.input({ shape: [MEL_BINS, TIME_FRAMES, 1] }) // [Mels, Frames, Channels]

  const convBlock = (x: tf.SymbolicTensor, filters: number): tf.SymbolicTensor => {
    const y = tf.layers
      .conv2d({ filters, kernelSize: 3, padding: 'same', activation: 'relu' })
      .apply(x) as tf.SymbolicTensor
    return tf.layers.maxPooling2d({ poolSize: [2, 2] }).apply(y) as tf.SymbolicTensor
  }

  let x = convBlock(input, 16)
  x = convBlock(x, 32)
  x = convBlock(x, 32)

  const maxPool = tf.layers.globalMaxPooling2d({ dataFormat: 'channelsLast' }).apply(x) as tf.SymbolicTensor
  const avgPool = tf.layers.globalAveragePooling2d({ dataFormat: 'channelsLast' }).apply(x) as tf.SymbolicTensor
  let feat = tf.layers.concatenate().apply([maxPool, avgPool]) as tf.SymbolicTensor

  feat = tf.layers.dropout({ rate: 0.15 }).apply(feat) as tf.SymbolicTensor
  feat = tf.layers.dense({ units: 128, activation: 'relu' }).apply(feat) as tf.SymbolicTensor
  feat = tf.layers.dropout({ rate: 0.15 }).apply(feat) as tf.SymbolicTensor
  const output = tf.layers.dense({ units: numClasses, activation: 'softmax' }).apply(feat) as tf.SymbolicTensor

  const model = tf.model({ inputs: input, outputs: output })
  model.compile({ optimizer: tf.train.adam(0.001), loss: 'categoricalCrossentropy', metrics: ['accuracy'] })
  return model
}

/**
 * Serialize a trained audio model plus its raw per-class samples into the JSON bundle
 * string written to disk (samples are keyed by class id, matching loadModel's restore).
 */
export async function serializeAudioBundle(
  model: tf.LayersModel,
  classNames: string[],
  samplesById: Record<string, Float32Array[]>,
  classIds: string[]
): Promise<string> {
  const samples: Record<string, number[][]> = {}
  classIds.forEach((id) => { samples[id] = (samplesById[id] || []).map((arr) => Array.from(arr)) })

  let artifacts: tf.io.ModelArtifacts | undefined
  await model.save(
    tf.io.withSaveHandler(async (a) => {
      artifacts = a
      return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } }
    })
  )
  if (!artifacts) throw new Error('Failed to serialize model')

  return JSON.stringify({
    version: 1,
    classNames,
    modelTopology: artifacts.modelTopology as object,
    weightSpecs: artifacts.weightSpecs!,
    weightData: bufferToBase64(artifacts.weightData as ArrayBuffer),
    samples,
  })
}

// ── Spectrogram-domain augmentations (SpecAugment & dynamic shifts) ──

// Gain scaling — simulates speaking louder or softer by shifting normalized dB values.
function augmentVolume(normSpec: Float32Array, dbShift: number): Float32Array {
  const shift = dbShift / 40.0 // normalizer scales the 40dB range to [0.0, 1.0]
  const out = new Float32Array(normSpec.length)
  for (let i = 0; i < normSpec.length; i++) out[i] = Math.max(0.0, Math.min(1.0, normSpec[i] + shift))
  return out
}

// Time shifting — rolls spectrogram frames horizontally to handle varied start times.
function augmentTimeShift(normSpec: Float32Array, shiftFrames: number): Float32Array {
  const out = new Float32Array(normSpec.length)
  for (let m = 0; m < MEL_BINS; m++) {
    for (let f = 0; f < TIME_FRAMES; f++) {
      const targetF = f + shiftFrames
      if (targetF >= 0 && targetF < TIME_FRAMES) out[m * TIME_FRAMES + targetF] = normSpec[m * TIME_FRAMES + f]
    }
  }
  return out
}

// SpecAugment time masking — blanks out vertical bands of time frames.
function augmentTimeMask(normSpec: Float32Array, maxMaskWidth = 12): Float32Array {
  const out = new Float32Array(normSpec)
  const maskWidth = Math.floor(Math.random() * maxMaskWidth) + 1
  const maskStart = Math.floor(Math.random() * (TIME_FRAMES - maskWidth))
  for (let m = 0; m < MEL_BINS; m++) {
    for (let f = maskStart; f < maskStart + maskWidth; f++) out[m * TIME_FRAMES + f] = 0.0
  }
  return out
}

// SpecAugment frequency masking — blanks out horizontal bands of Mel frequencies.
function augmentFrequencyMask(normSpec: Float32Array, maxMaskWidth = 8): Float32Array {
  const out = new Float32Array(normSpec)
  const maskWidth = Math.floor(Math.random() * maxMaskWidth) + 1
  const maskStart = Math.floor(Math.random() * (MEL_BINS - maskWidth))
  for (let m = maskStart; m < maskStart + maskWidth; m++) {
    for (let f = 0; f < TIME_FRAMES; f++) out[m * TIME_FRAMES + f] = 0.0
  }
  return out
}

// Gaussian noise injection — simulates background static or microphone hiss.
function augmentGaussianNoise(normSpec: Float32Array, sigma = 0.05): Float32Array {
  const out = new Float32Array(normSpec.length)
  for (let i = 0; i < normSpec.length; i++) {
    const u1 = Math.random() || 1e-9
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    out[i] = Math.max(0.0, Math.min(1.0, normSpec[i] + z * sigma))
  }
  return out
}

/**
 * Build the flat augmented training set (6× per raw sample): the original plus volume
 * ±3dB, time-shift ±5 frames, and a combined mask+noise variant. Trimmed from 12× to
 * roughly halve training time on low-spec laptops while keeping a good spread. Mask sizes
 * are kept small (≤4 mels, ≤6 frames) so a short word isn't erased entirely — a blanked
 * clip still carries this class's label and would otherwise teach "silence == this word".
 */
export function buildAudioDataset(
  classes: ClassRef[],
  samplesById: Record<string, Float32Array[]>
): { specs: number[][]; labels: number[] } {
  const specs: number[][] = []
  const labels: number[] = []
  classes.forEach((cls, classIdx) => {
    for (const spec of samplesById[cls.id] || []) {
      const normSpec = normalizeSpectrogram(spec)
      const variants = [
        normSpec,
        augmentVolume(normSpec, 3.0),
        augmentVolume(normSpec, -3.0),
        augmentTimeShift(normSpec, -5),
        augmentTimeShift(normSpec, 5),
        augmentGaussianNoise(augmentTimeMask(augmentFrequencyMask(normSpec, 4), 6), 0.02),
      ]
      for (const v of variants) { specs.push(Array.from(v)); labels.push(classIdx) }
    }
  })
  return { specs, labels }
}

// ── Detection gate (smoothing + stability + cooldown hold) ──

export interface DetectionParams {
  confidenceThreshold: number
  smoothingWindow: number
  detectionCooldown: number // seconds
}

// Consecutive same-class frames required before a detection locks. Kept small and
// DECOUPLED from the probability-smoothing window, so a larger smoothing window steadies
// confidence without making detection sluggish.
const STABILITY_FRAMES = 2

/**
 * Stateful gate turning a per-frame probability vector into a stable, debounced
 * detection. A confident + stable + non-background frame always wins immediately (even
 * switching words); otherwise the last detection is briefly held to bridge the gap
 * between repeats instead of flickering to "Unknown".
 */
export function createAudioDetector() {
  const history: number[][] = [] // probability smoothing window
  const predHistory: number[] = [] // recent argmax classes, for temporal stability
  let last = { id: undefined as string | undefined, name: 'Unknown', conf: 0, time: 0 }

  function reset(): void {
    history.length = 0
    predHistory.length = 0
    last = { id: undefined, name: 'Unknown', conf: 0, time: 0 }
  }

  function resolve(probs: number[], classes: ClassRef[], params: DetectionParams, now: number): AudioPrediction {
    const smoothed = smoothProbabilities(history, probs, params.smoothingWindow)
    const probabilities = smoothed.map((p, i) => ({ name: classes[i]?.name, prob: p }))
    const maxIdx = smoothed.indexOf(Math.max(...smoothed))

    const winningClassName = classes[maxIdx]?.name ?? ''
    const isBackgroundOrNoise =
      winningClassName.toLowerCase().includes('background') || winningClassName.toLowerCase().includes('noise')

    predHistory.push(maxIdx)
    if (predHistory.length > STABILITY_FRAMES) predHistory.shift()
    const isStable = predHistory.length >= STABILITY_FRAMES && predHistory.every((idx) => idx === maxIdx)

    // Detection = confident enough + temporally stable + not the Background/Noise class.
    // Out-of-distribution audio is handled by a user-recorded "Background Noise" class
    // (excluded here) rather than an energy gate, which froze the confidence bar at 0.
    const isDetected = smoothed[maxIdx] >= params.confidenceThreshold && isStable && !isBackgroundOrNoise

    if (isDetected) {
      last = { id: classes[maxIdx]?.id, name: winningClassName, conf: smoothed[maxIdx], time: now }
      return { classId: last.id, className: winningClassName, confidence: smoothed[maxIdx], probabilities, isDetected: true }
    }

    // Nothing confident this frame — briefly hold the last detection to bridge the short
    // gap between repeats of the same word; a different word takes over instantly above.
    if (last.id && now - last.time < params.detectionCooldown * 1000) {
      return { classId: last.id, className: last.name, confidence: last.conf, probabilities, isDetected: true }
    }

    return { classId: undefined, className: 'Unknown', confidence: 0.0, probabilities, isDetected: false }
  }

  return { resolve, reset }
}
