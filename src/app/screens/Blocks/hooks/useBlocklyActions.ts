import { useState, useEffect } from 'react'
import type { RefObject } from 'react'
import * as Blockly from 'blockly'
import Swal from 'sweetalert2'
import customGenerator from '../../../blockly/customgenerator'
import {
  sendWebSocketData,
  addWSMessageListener,
  removeWSMessageListener,
  getWebSocket,
} from '../../../../../store/websocketSlice'
import { sendSerialMessage } from '../../../../../store/serialSlice'
import SerialService from '@/app/services/Serialservice'
import type  {ModelBundleRaw}  from '@/app/blockly/suboblocks/ai'

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

export type RunStatus = 'Start' | 'Stop'
export type RunPopupVariant = 'CONNECT' | 'NOCODE' | 'RUNNING' | null

interface UseBlocklyActionsOptions {
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>
  isConnected: boolean
  mode: string
}

// ── Workspace validation ──────────────────────────────────────────────────

type ValidationResult =
  | { valid: false; reason: 'empty' | 'noSetup' | 'errors' }
  | { valid: true; outputForDevice: Record<string, unknown> }

function validateWorkspace(workspace: Blockly.Workspace): ValidationResult {
  const allBlocks = workspace.getAllBlocks(false)

  if (allBlocks.length === 0) return { valid: false, reason: 'empty' }

  const hasSetup = allBlocks.some((b) => b.type === 'setup')
  const hasOtherBlocks = allBlocks.some((b) => b.type !== 'setup')

  if (!hasSetup && hasOtherBlocks) {
    Swal.fire({
      icon: 'warning',
      title: 'Setup Block Required',
      html: "<p style='font-size: 18px;'>Please add the <b>setup</b> block before using other blocks.</p>",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
    })
    return { valid: false, reason: 'noSetup' }
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(customGenerator.workspaceToCode(workspace))
  } catch (err) {
    console.error('Failed to generate code:', err)
    return { valid: false, reason: 'errors' }
  }

  const errors = parsed.errors as { message: string }[] | undefined
  if (errors && errors.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Block Configuration Error',
      html: `<div style="font-size:16px; text-align:left">${errors.map((e) => `• ${e.message}`).join('<br/>')}</div>`,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Fix Blocks',
    })
    return { valid: false, reason: 'errors' }
  }

  const outputForDevice = { ...parsed }
  delete outputForDevice.errors
  return { valid: true, outputForDevice }
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useBlocklyActions({ workspaceRef, isConnected, mode }: UseBlocklyActionsOptions) {
  const [runstatus, setRunStatus] = useState<RunStatus>('Start')
  const [runPopup, setRunPopup] = useState<RunPopupVariant>(null)
  const [isSending, setIsSending] = useState(false)
  const [popupType, setPopupType] = useState<'save' | 'clear'>('save')
  const [showSavetokitpop, setShowSavetokitpop] = useState(false)

  // Reset run status when device signals completion
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'PDone') setRunStatus('Start')
    }

    const ws = getWebSocket()
    if (ws && ws.readyState === WebSocket.OPEN) {
      addWSMessageListener(handleMessage)
      return () => removeWSMessageListener(handleMessage)
    }

    const interval = setInterval(() => {
      const socket = getWebSocket()
      if (socket && socket.readyState === WebSocket.OPEN) {
        addWSMessageListener(handleMessage)
        clearInterval(interval)
      }
    }, 200)

    return () => {
      clearInterval(interval)
      removeWSMessageListener(handleMessage)
    }
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────

  const showRunPopup = (variant: NonNullable<RunPopupVariant>) => {
    setRunPopup(variant)
    setTimeout(() => setRunPopup(null), 2500)
  }

  const sendToDevice = (payload: unknown) => {
    if (mode === 'Wireless') {
      sendWebSocketData(payload)
    } else {
      sendSerialMessage(JSON.stringify(payload))
    }
  }

  // ── Run / Stop ───────────────────────────────────────────────────────────

  const generateAndRun = async () => {
    const workspace = workspaceRef.current
    if (!workspace) return

    const result = validateWorkspace(workspace)
    if (!result.valid) {
      if (result.reason === 'empty') showRunPopup('NOCODE')
      return
    }
    console.log("Json:", JSON.stringify(result, null, 2));
        setRunStatus('Stop')

    if (mode !== "Wireless") {
      const unsubscribe = SerialService.addDataListener((data: string) => {
        if (/PDone/i.test(data)) {
          setRunStatus("Start");
          unsubscribe(); // optional: stop listening once we got what we needed
        }
      });

      SerialService.startReading();
    }

    // Start AI overlay if workspace contains any AI block whose model is loaded.
    // Two ways to introduce an AI block:
    //   1. `run_ai_model` block (model picked via the block's own file field), or
    //   2. dynamic `ai_<model>_<class>` blocks dropped from the AI toolbox after
    //      "+ Load AI Model" registered them in window.__aiLoadedModels.
    const allBlocks = workspace.getAllBlocks(false)
    let aiModelToStart: string | undefined

    const runAiBlock = allBlocks.find((b) => b.type === 'run_ai_model')
    if (runAiBlock) {
      const modelName = runAiBlock.getFieldValue('MODEL_FILE')
      if (modelName && modelName !== 'Select Model...' && window.__aiModels?.[modelName]) {
        aiModelToStart = modelName
      }
    }

    if (!aiModelToStart) {
      const aiBlockTypes = new Set(
        allBlocks.filter((b) => b.type.startsWith('ai_')).map((b) => b.type)
      )
      if (aiBlockTypes.size > 0) {
        const match = (window.__aiLoadedModels ?? []).find((m) =>
          m.blockTypes.some((bt) => aiBlockTypes.has(bt))
        )
        if (match && window.__aiModels?.[match.fileName]) aiModelToStart = match.fileName
      }
    }

    if (aiModelToStart) {
      window.dispatchEvent(
        new CustomEvent('ai:startPrediction', { detail: { modelName: aiModelToStart } })
      )
    }

    sendToDevice(result.outputForDevice)
  }

  const handleRunStop = async () => {
    if (runstatus === 'Stop') {
      setRunStatus('Start')
      sendToDevice({ msg: 'stop' })
      window.dispatchEvent(new Event('ai:stopPrediction'))
      await SerialService.stopReading()   // <-- release the reader
    } else {
      generateAndRun()
    }
  }

  // ── Save to kit ──────────────────────────────────────────────────────────

  const saveToKit = async (action: 'save' | 'clear' = 'save') => {
    if (!isConnected) {
      showRunPopup('CONNECT')
      return
    }

    try {
      setIsSending(true)

      if (action === 'clear') {
        await sendToDevice({ msg: 'clear' })
        setIsSending(false)
        setPopupType('clear')
        setShowSavetokitpop(true)
        setTimeout(() => setShowSavetokitpop(false), 2500)
        return
      }

      const workspace = workspaceRef.current
      if (!workspace) { setIsSending(false); return }

      const result = validateWorkspace(workspace)
      if (!result.valid) {
        if (result.reason === 'empty') showRunPopup('NOCODE')
        setIsSending(false)
        return
      }

      await sendToDevice({ save: result.outputForDevice })

      setIsSending(false)
      setPopupType('save')
      setShowSavetokitpop(true)
      setTimeout(() => setShowSavetokitpop(false), 2500)
    } catch (err: unknown) {
      setIsSending(false)
      Swal.fire({
        icon: 'error',
        title: 'Failed to communicate with kit',
        text: err instanceof Error ? err.message : 'Something went wrong.',
      })
    }
  }

  return {
    runstatus,
    setRunStatus,
    runPopup,
    isSending,
    popupType,
    showSavetokitpop,
    handleRunStop,
    saveToKit,
    showRunPopup,
  }
}
