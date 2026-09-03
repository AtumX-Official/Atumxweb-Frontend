import * as tf from '@tensorflow/tfjs'
import { useLandmarkClassifier, type LandmarkClassifierConfig } from './useLandmarkClassifier'

// Public types are re-exported so existing importers (components, the 2-hand
// classifier) keep resolving them from this module.
export type { TrainingStatus, GestureClass, ProbEntry, Prediction } from './useLandmarkClassifier'

const FEATURE_DIM = 63 // 21 hand landmarks × 3 coords

// ── Augmentation helpers ──────────────────────────────────────────────────────

function rotateInPlane(vec: Float32Array, angle: number): Float32Array {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const out = new Float32Array(FEATURE_DIM)
  for (let i = 0; i < 21; i++) {
    const x = vec[i * 3]
    const y = vec[i * 3 + 1]
    out[i * 3] = x * c - y * s
    out[i * 3 + 1] = x * s + y * c
    out[i * 3 + 2] = vec[i * 3 + 2]
  }
  return out
}

function mirrorX(vec: Float32Array): Float32Array {
  const out = new Float32Array(FEATURE_DIM)
  for (let i = 0; i < 21; i++) {
    out[i * 3] = -vec[i * 3]
    out[i * 3 + 1] = vec[i * 3 + 1]
    out[i * 3 + 2] = vec[i * 3 + 2]
  }
  return out
}

function gaussianNoise(vec: Float32Array, sigma: number): Float32Array {
  const out = new Float32Array(FEATURE_DIM)
  for (let i = 0; i < FEATURE_DIM; i++) {
    const u1 = Math.random() || 1e-9
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    out[i] = vec[i] + z * sigma
  }
  return out
}

/** Expand one sample into a set of physically-plausible variants. */
function augment(vec: Float32Array): Float32Array[] {
  const mirrored = mirrorX(vec)
  const r1 = -Math.PI / 12 // -15°
  const r2 = Math.PI / 12 // +15°
  return [
    vec,
    mirrored,
    rotateInPlane(vec, r1),
    rotateInPlane(vec, r2),
    rotateInPlane(mirrored, r1),
    rotateInPlane(mirrored, r2),
    gaussianNoise(vec, 0.02),
    gaussianNoise(mirrored, 0.02),
  ]
}

// ── Model architecture ────────────────────────────────────────────────────────

function buildModel(numClasses: number): tf.Sequential {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [FEATURE_DIM],
        units: 256,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 }),
      }),
      tf.layers.batchNormalization(),
      tf.layers.dropout({ rate: 0.35 }),
      tf.layers.dense({
        units: 128,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 }),
      }),
      tf.layers.dropout({ rate: 0.25 }),
      tf.layers.dense({ units: 64, activation: 'relu' }),
      tf.layers.dense({ units: numClasses, activation: 'softmax' }),
    ],
  })
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  })
  return model
}

const GESTURE_CONFIG: LandmarkClassifierConfig = {
  featureDim: FEATURE_DIM,
  confidenceThreshold: 0.7, // margin guard protects precision, so the floor can stay moderate
  margin: 0.2, // reject when top1 − top2 is this close (fist vs thumbs-up → no confident guess)
  rejectKFocus: 4.0, // a little more lenient when the focus box is on
  supportsFocusBox: true,
  buildModel,
  augment,
  validateSampleLength: false,
  logPrefix: '[GestureClassifier]',
  save: { defaultName: 'gesture-model', language: 'handGesture', keyBy: 'name', includeFocusBox: true },
  exportExtras: true,
  legacyAlert:
    'Note: This is an older model file without template metadata. The adaptive reject gate will be bypassed. Please retrain and save to re-enable it.',
}

export function useGestureClassifier() {
  return useLandmarkClassifier(GESTURE_CONFIG)
}
