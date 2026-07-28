import * as Blockly from 'blockly/core'
import customGenerator from '../customgenerator'

interface ModelBundleRaw {
  version: number
  classNames: string[]
  modelTopology: object
  weightSpecs: unknown[]
  weightData: string
  samples?: Record<string, number[][]>
  useFocusBox?: boolean
}

declare global {
  interface Window {
    __aiModels?: Record<string, ModelBundleRaw>
    __aiLoadedModels?: Array<{
      fileName: string
      displayName: string
      classNames: string[]
      blockTypes: string[]
    }>
  }
}

// ── Field: file picker that loads a model into window.__aiModels ─────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class FieldModelLoader extends (Blockly.Field as any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJson(_options: any): FieldModelLoader {
    return new FieldModelLoader()
  }

  constructor() {
    const loadedModel = window.__aiLoadedModels?.[0]?.fileName
    super(loadedModel || 'Select Model...')
    this.SERIALIZABLE = true
  }

  showEditor_(): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const bundle = JSON.parse(text) as ModelBundleRaw
        const classNames = bundle.classNames ?? []
        bundle.classNames = classNames
        window.__aiModels = window.__aiModels ?? {}
        window.__aiModels[file.name] = bundle
        this.setValue(file.name)

        // Register blocks with Blockly
        const blockTypes = registerAIClassBlocks(file.name, classNames)

        window.__aiLoadedModels = [
          {
            fileName: file.name,
            displayName: file.name.replace(/\.json$/i, ''),
            classNames,
            blockTypes,
          }
        ]

        // Notify UI to refresh the toolbox AI category
        window.dispatchEvent(new CustomEvent('ai:modelLoaded', { detail: { fileName: file.name } }))
      } catch {
        console.error('Failed to parse AI model file')
      }
    }

    input.click()
  }

  getText_(): string {
    return (this.getValue() as string) ?? 'Select Model...'
  }
}

Blockly.fieldRegistry.register('field_model_loader', FieldModelLoader)

// ── Block: run_ai_model ───────────────────────────────────────────────────────

Blockly.Blocks['run_ai_model'] = {
  init: function () {
    this.appendDummyInput('HEADER')
      .appendField('run ai model')
      .appendField(new FieldModelLoader(), 'MODEL_FILE')
    this.setColour('#7C3AED')
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setTooltip('Select an AI model to run prediction execution in the background.')
    this.setHelpUrl('')
  }
}

// ── Dynamic class blocks (created per loaded model in the AI toolbox) ─────────

/**
 * Registers one value block per class for the given model file.
 * Each block can be dropped into an `if` condition.
 * Returns the list of registered block type names.
 */
export function registerAIClassBlocks(fileName: string, classNames: string[]): string[] {
  const displayName = fileName.replace(/\.json$/i, '')
  const safeModel = displayName.replace(/[^a-zA-Z0-9]/g, '_')
  const blockTypes: string[] = []

  classNames.forEach((className) => {
    const safeClass = className.replace(/[^a-zA-Z0-9]/g, '_')
    const blockType = `ai_${safeModel}_${safeClass}`
    blockTypes.push(blockType)

    Blockly.Blocks[blockType] = {
      init: function () {
        this.appendDummyInput()
          .appendField(displayName + '  »  ' + className)
        this.setOutput(true, null)
        this.setColour('#7C3AED')
        this.setTooltip(`Gesture class "${className}" from model "${fileName}"`)
        this.setHelpUrl('')
      },
    }

    customGenerator.forBlock[blockType] = function () {
      return [JSON.stringify({ AIClass: className }), 0]
    }
  })

  return blockTypes
}

/**
 * Automatically registers any unregistered AI block types found in a workspace JSON.
 * This prevents Blockly serialization from crashing if a project is loaded
 * before the corresponding AI model is imported.
 */
export function registerPlaceholderAIBlocks(workspaceData: any) {
  if (!workspaceData) return

  // Automatically restore fully saved AI models bundled in the project JSON!
  if (workspaceData.aiModels && workspaceData.aiLoadedModels) {
    window.__aiModels = { ...(window.__aiModels || {}), ...workspaceData.aiModels }
    window.__aiLoadedModels = workspaceData.aiLoadedModels

    // Upgrade placeholder blocks by registering them with their real, complete class blocks immediately!
    workspaceData.aiLoadedModels.forEach((m: any) => {
      registerAIClassBlocks(m.fileName, m.classNames)
    })
  }

  // Helper to recursively find block types in serialized workspace data
  const findBlockTypes = (obj: any, types: Set<string>) => {
    if (!obj || typeof obj !== 'object') return
    if (obj.type && typeof obj.type === 'string' && obj.type.startsWith('ai_')) {
      types.add(obj.type)
    }
    for (const key of Object.keys(obj)) {
      findBlockTypes(obj[key], types)
    }
  }

  const aiTypes = new Set<string>()
  findBlockTypes(workspaceData, aiTypes)

  aiTypes.forEach((blockType) => {
    if (Blockly.Blocks[blockType]) return // Already registered

    const parts = blockType.split('_')
    // Extract class name (last part) and model display name (middle parts)
    const className = parts[parts.length - 1] || 'class'
    const displayName = parts.slice(1, parts.length - 1).join(' ') || 'model'

    Blockly.Blocks[blockType] = {
      init: function () {
        this.appendDummyInput()
          .appendField(displayName + '  »  ' + className)
        this.setOutput(true, null)
        this.setColour('#7C3AED')
        this.setTooltip(`Placeholder block for gesture class "${className}" (model not yet loaded)`)
        this.setHelpUrl('')
      },
    }

    customGenerator.forBlock[blockType] = function () {
      return [JSON.stringify({ AIClass: className }), 0]
    }
  })
}
