import * as tf from '@tensorflow/tfjs'
import { useLandmarkClassifier, type LandmarkClassifierConfig } from './useLandmarkClassifier'

export type { TrainingStatus, GestureClass, ProbEntry, Prediction } from './useLandmarkClassifier'

/**
 * TWO-HAND gesture classifier — a thin wrapper over the shared useLandmarkClassifier core,
 * so it stays in lock-step with the single-hand and pose modes. Same public interface, so
 * the AI screen swaps between them by hand mode.
 *
 * What differs from single-hand (all captured in TWO_HAND_CONFIG below):
 *  - input is the 126-float two-hand vector (normalizeCombinedWorld): each hand's metric
 *    3D shape. The distance/placement BETWEEN the two hands is intentionally NOT included.
 *  - augmentation is noise-only — rotation/mirror would corrupt orientation, which for two
 *    hands is part of the gesture (e.g. tilt = forward/reverse).
 *  - higher confidence floor (0.80) and NO margin guard: two-hand poses are distinct enough
 *    that the self-calibrating reject gate alone carries precision.
 */

const FEATURE_DIM = 126

// ── Augmentation (noise only) ──────────────────────────────────────────────────
function gaussianNoise(vec: Float32Array, sigma: number): Float32Array {
  const out = new Float32Array(vec.length)
  for (let i = 0; i < vec.length; i++) {
    const u1 = Math.random() || 1e-9
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    out[i] = vec[i] + z * sigma
  }
  return out
}

function augment(vec: Float32Array): Float32Array[] {
  return [vec, gaussianNoise(vec, 0.02), gaussianNoise(vec, 0.02), gaussianNoise(vec, 0.03), gaussianNoise(vec, 0.03)]
}

// ── Model architecture (same shape as single-hand, 126-wide input) ──────────────
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

const TWO_HAND_CONFIG: LandmarkClassifierConfig = {
  featureDim: FEATURE_DIM,
  confidenceThreshold: 0.8, // two-hand poses are distinct → afford a higher floor
  // no margin guard — the reject gate alone carries precision here
  supportsFocusBox: true,
  buildModel,
  augment,
  validateSampleLength: false,
  logPrefix: '[GestureClassifier2H]',
  save: { defaultName: 'gesture-model', language: 'handGesture2H', keyBy: 'name', includeFocusBox: true },
  exportExtras: true,
  // no legacyAlert — the 2-hand loader has always stayed silent on older files
}

export function useGestureClassifier2H() {
  return useLandmarkClassifier(TWO_HAND_CONFIG)
}
