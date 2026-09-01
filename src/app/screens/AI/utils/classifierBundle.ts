import * as tf from '@tensorflow/tfjs'
import type { ModelBundle } from './modelIO'

/** A class as tracked by the classifiers: a stable id plus a user-facing name. */
export interface ClassRef {
  id: string
  name: string
}

// ── Weight (de)serialization ──────────────────────────────────────────────────

export function bufferToBase64(buffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(buffer)
  let str = ''
  const chunk = 65536
  for (let i = 0; i < uint8.length; i += chunk) {
    str += String.fromCharCode(...uint8.subarray(i, i + chunk))
  }
  return btoa(str)
}

export function base64ToBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

/** Rebuild a TF.js model from the topology + weights stored in a saved bundle. */
export async function modelFromBundle(bundle: ModelBundle): Promise<tf.LayersModel> {
  return tf.loadLayersModel(
    tf.io.fromMemory(bundle.modelTopology, bundle.weightSpecs, base64ToBuffer(bundle.weightData))
  )
}

// ── Per-class map lookup with legacy fallbacks ────────────────────────────────

// A saved per-class map may be keyed by class NAME (current format), by class id,
// or be a plain positional list (older files). Resolve a class's entry against all
// three, in that order — the fallback the classifiers previously inlined.
function lookupByClass<T>(
  map: Record<string, T> | undefined,
  cls: ClassRef,
  index: number
): T | undefined {
  if (!map) return undefined
  const direct = map[cls.name]
  if (direct !== undefined) return direct
  const keys = Object.keys(map)
  const values = Object.values(map)
  const keyIdx = keys.indexOf(cls.id)
  return keyIdx !== -1 ? values[keyIdx] : values[index]
}

/** Restore per-class training samples (keyed by class id) plus their counts. */
export function restoreSamples(
  bundle: Pick<ModelBundle, 'samples'>,
  classes: ClassRef[]
): { samples: Record<string, Float32Array[]>; counts: Record<string, number> } {
  const samples: Record<string, Float32Array[]> = {}
  const counts: Record<string, number> = {}
  classes.forEach((c, i) => {
    const saved = lookupByClass(bundle.samples, c, i)
    samples[c.id] = saved ? saved.map((arr) => new Float32Array(arr)) : []
    counts[c.id] = saved ? saved.length : 0
  })
  return { samples, counts }
}

/** Restore per-class centroids (keyed by class id) from a saved bundle. */
export function restoreCentroids(
  bundle: Pick<ModelBundle, 'centroids'>,
  classes: ClassRef[]
): Record<string, number[]> {
  const centroids: Record<string, number[]> = {}
  classes.forEach((c, i) => {
    const saved = lookupByClass(bundle.centroids, c, i)
    if (saved) centroids[c.id] = saved
  })
  return centroids
}

// ── Centroid / spread geometry (self-calibrating reject gate) ─────────────────

/** Mean feature vector per class — the centre of each class's training cloud. */
export function computeCentroids(
  classes: ClassRef[],
  samplesById: Record<string, Float32Array[]>,
  featureDim: number
): Record<string, number[]> {
  const centroids: Record<string, number[]> = {}
  classes.forEach((cls) => {
    const samples = samplesById[cls.id] || []
    if (samples.length === 0) return
    const avg = new Float32Array(featureDim)
    for (let i = 0; i < featureDim; i++) {
      let sum = 0
      for (const sample of samples) sum += sample[i]
      avg[i] = sum / samples.length
    }
    centroids[cls.id] = Array.from(avg)
  })
  return centroids
}

/** Mean distance from each class's samples to its centroid ("spread"/radius). */
export function computeRadii(
  classes: ClassRef[],
  samplesById: Record<string, Float32Array[]>,
  centroidsById: Record<string, number[]>,
  featureDim: number
): Record<string, number> {
  const radii: Record<string, number> = {}
  classes.forEach((cls) => {
    const samples = samplesById[cls.id] || []
    const centroid = centroidsById[cls.id]
    if (samples.length === 0 || !centroid) return
    let rsum = 0
    for (const sample of samples) {
      let sq = 0
      for (let i = 0; i < featureDim; i++) {
        const d = sample[i] - centroid[i]
        sq += d * d
      }
      rsum += Math.sqrt(sq)
    }
    radii[cls.id] = rsum / samples.length
  })
  return radii
}

/**
 * Inverse-frequency class weights that counter raw-sample imbalance: the largest class
 * gets weight 1, rarer classes proportionally more. Keyed by label index for `model.fit`.
 */
export function computeClassWeights(labels: number[], numClasses: number): Record<number, number> {
  const counts = new Array(numClasses).fill(0)
  for (const l of labels) counts[l]++
  const maxCount = Math.max(...counts)
  const weights: Record<number, number> = {}
  counts.forEach((c: number, i: number) => { weights[i] = c > 0 ? maxCount / c : 1 })
  return weights
}

// ── Inference-time temporal smoothing ─────────────────────────────────────────

/**
 * Push the latest probability vector into a rolling history and return the
 * per-class average over the window, so a single-frame mistake doesn't flicker.
 * Mutates `history` in place (shifting out entries beyond `window`).
 */
export function smoothProbabilities(
  history: number[][],
  probs: number[],
  window: number
): number[] {
  history.push(probs)
  if (history.length > window) history.shift()
  const smoothed = new Array(probs.length).fill(0)
  for (const p of history) {
    for (let i = 0; i < probs.length; i++) smoothed[i] += p[i]
  }
  const n = history.length
  for (let i = 0; i < smoothed.length; i++) smoothed[i] /= n
  return smoothed
}
