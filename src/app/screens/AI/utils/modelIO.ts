import * as tf from '@tensorflow/tfjs'

export interface ModelBundle {
  version: number
  classNames: string[]
  modelTopology: object
  weightSpecs: tf.io.WeightsManifestEntry[]
  weightData: string
  centroids?: Record<string, number[]>
  samples?: Record<string, number[][]>
  useFocusBox?: boolean
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(buffer)
  let str = ''
  const chunk = 65536
  for (let i = 0; i < uint8.length; i += chunk) {
    str += String.fromCharCode(...uint8.subarray(i, i + chunk))
  }
  return btoa(str)
}

function base64ToBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export async function saveModelToFile(
  model: tf.LayersModel,
  classNames: string[],
  projectName: any = "gesture-model",
  centroids?: Record<string, number[]>,
  samples?: Record<string, number[][]>,
  useFocusBox?: boolean,
  /** AI "language" → which Projects/ai/<Capitalized> folder to save into */
  language: string = "handGesture"
): Promise<void> {
  let artifacts: tf.io.ModelArtifacts | undefined

  await model.save(
    tf.io.withSaveHandler(async (a) => {
      artifacts = a
      return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } }
    })
  )

  if (!artifacts) throw new Error('Failed to serialize model')

  const bundle: ModelBundle = {
    version: 1,
    classNames,
    modelTopology: artifacts.modelTopology as object,
    weightSpecs: artifacts.weightSpecs!,
    weightData: bufferToBase64(artifacts.weightData as ArrayBuffer),
    centroids,
    samples,
    useFocusBox,
  }

  const safeProjectName = typeof projectName === 'string' && projectName ? projectName : 'gesture-model'
  window.api.file.save("", JSON.stringify(bundle), language, safeProjectName, "", "");
}

export async function loadModelFromFile(
  file: File
): Promise<{ model: tf.LayersModel; classNames: string[] }> {
  try { await tf.setBackend('webgl') } catch { await tf.setBackend('cpu') }
  await tf.ready()

  const text = await file.text()
  const bundle = JSON.parse(text) as ModelBundle

  if (!bundle.version || !bundle.classNames || !bundle.modelTopology) {
    throw new Error('Invalid model file. Please use a file saved from this app.')
  }

  const model = await tf.loadLayersModel(
    tf.io.fromMemory(bundle.modelTopology, bundle.weightSpecs, base64ToBuffer(bundle.weightData))
  )

  return { model, classNames: bundle.classNames }
}
