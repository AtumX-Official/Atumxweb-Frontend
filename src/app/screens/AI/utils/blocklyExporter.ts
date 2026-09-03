import * as tf from '@tensorflow/tfjs'
import { registerAIClassBlocks } from '../../../blockly/suboblocks/ai'

export interface ModelBundle {
  version: number
  classNames: string[]
  modelTopology: object
  weightSpecs: tf.io.WeightsManifestEntry[]
  weightData: string
  useFocusBox?: boolean
  centroids?: Record<string, number[]>
  samples?: Record<string, number[][]>
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

export async function exportModelToBlockly(
  model: tf.LayersModel | null,
  classNames: string[],
  projectName: string = 'gesture-model',
  useFocusBox: boolean = false,
  centroids?: Record<string, number[]>,
  samples?: Record<string, number[][]>,
  extra?: Record<string, unknown>
): Promise<void> {
  if (!model) return

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
    useFocusBox,
    centroids,
    samples,
    ...extra,
  }

  const fileName = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`

  // Store globally in window
  window.__aiModels = window.__aiModels ?? {}
  window.__aiModels[fileName] = bundle as any

  // Register blocks with Blockly
  const blockTypes = registerAIClassBlocks(fileName, classNames)

  const loadedModel = {
    fileName,
    displayName: projectName,
    classNames,
    blockTypes,
  }

  window.__aiLoadedModels = [loadedModel]

  console.log(`[BlocklyExporter] Model "${projectName}" successfully exported to Blockly as "${fileName}"`, loadedModel)
}
