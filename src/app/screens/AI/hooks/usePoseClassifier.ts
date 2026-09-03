import * as tf from '@tensorflow/tfjs'
import { useLandmarkClassifier, type LandmarkClassifierConfig } from './useLandmarkClassifier'
import { POSE_FEATURE_DIM, POSE_ANGLE_COUNT } from '../utils/normalizeLandmarks'

export type { TrainingStatus, GestureClass, ProbEntry, Prediction } from './useLandmarkClassifier'

// ── Augmentation helpers for Pose (109 float inputs) ──────────────────────────

// Left/right landmark swap table for a true horizontal mirror. The feature vector is
// hip-centered (normalizePose), so mirroring negates x AND swaps each left↔right body
// landmark — otherwise the "left shoulder" slot would hold a right-shoulder position,
// an anatomically impossible pose that just adds label noise.
const POSE_MIRROR_MAP: number[] = (() => {
  const m = Array.from({ length: 33 }, (_, i) => i)
  const pairs: [number, number][] = [
    [1, 4], [2, 5], [3, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16],
    [17, 18], [19, 20], [21, 22], [23, 24], [25, 26], [27, 28], [29, 30], [31, 32],
  ]
  for (const [a, b] of pairs) { m[a] = b; m[b] = a }
  return m
})()

function mirrorX(vec: Float32Array): Float32Array {
  const out = new Float32Array(POSE_FEATURE_DIM)
  for (let i = 0; i < 33; i++) {
    const src = POSE_MIRROR_MAP[i]
    out[i * 3] = -vec[src * 3] // negate x (coords are centered on the hips)
    out[i * 3 + 1] = vec[src * 3 + 1]
    out[i * 3 + 2] = vec[src * 3 + 2]
  }
  // Angles are stored as left/right pairs; a mirror swaps each pair but preserves the
  // angle magnitude. (Swaps even↔odd within each pair.)
  for (let k = 0; k < POSE_ANGLE_COUNT; k++) {
    const swapped = k % 2 === 0 ? k + 1 : k - 1
    out[99 + k] = vec[99 + swapped]
  }
  return out
}

function gaussianNoise(vec: Float32Array, sigma: number): Float32Array {
  const out = new Float32Array(POSE_FEATURE_DIM)
  for (let i = 0; i < POSE_FEATURE_DIM; i++) {
    const u1 = Math.random() || 1e-9
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    out[i] = vec[i] + z * sigma
  }
  return out
}

function augment(vec: Float32Array): Float32Array[] {
  const mirrored = mirrorX(vec)
  return [vec, mirrored, gaussianNoise(vec, 0.015), gaussianNoise(mirrored, 0.015)]
}

// ── Model architecture ────────────────────────────────────────────────────────

function buildModel(numClasses: number): tf.Sequential {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [POSE_FEATURE_DIM], // 33 landmarks × 3 coords + joint angles
        units: 256,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 }),
      }),
      // NO BatchNormalization: on tiny teachable-machine datasets its unconverged
      // moving-average stats at inference made accuracy a coin-flip between runs
      // (~99% one train, ~33% the next). L2 + dropout regularize deterministically.
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({
        units: 128,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 1e-4 }),
      }),
      tf.layers.dropout({ rate: 0.2 }),
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

const POSE_CONFIG: LandmarkClassifierConfig = {
  featureDim: POSE_FEATURE_DIM,
  confidenceThreshold: 0.7,
  margin: 0.2,
  supportsFocusBox: false,
  buildModel,
  augment,
  validateSampleLength: true,
  logPrefix: '[PoseClassifier]',
  save: { defaultName: 'pose-model', language: 'poseClassifier', keyBy: 'id', includeFocusBox: false },
  exportExtras: false,
  legacyAlert:
    'Note: This is an older model file without template metadata. The adaptive reject gate will be bypassed. Please retrain and save to re-enable it. (Pose models from before this update should also be retrained — the feature format changed.)',
}

export function usePoseClassifier() {
  // The pose classifier has no focus box; drop those controls from the public surface.
  const { useFocusBox: _uf, setUseFocusBox: _suf, ...rest } = useLandmarkClassifier(POSE_CONFIG)
  return rest
}
