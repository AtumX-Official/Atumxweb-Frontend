import * as tf from '@tensorflow/tfjs'

/**
 * Select the GPU (WebGL) backend, falling back to CPU if WebGL is unavailable,
 * then wait until the backend is ready. Every classifier does this exact dance
 * on mount and before loading a model.
 */
export async function ensureTfBackend(): Promise<void> {
  try {
    await tf.setBackend('webgl')
  } catch {
    await tf.setBackend('cpu')
  }
  await tf.ready()
}
