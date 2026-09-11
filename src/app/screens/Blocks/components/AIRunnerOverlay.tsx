import { useEffect, useState, useRef, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'
import HandTracker from '../../AI/components/HandTracker'
import type { HandStats } from '../../AI/components/HandTracker'
import PoseTracker from '../../AI/components/PoseTracker'
import type { Landmark } from '../../AI/components/PoseTracker' 
import { useBackendPreference } from '../../AI/hooks/useBackendPreference'
import { sendWebSocketData } from '../../../../../store/websocketSlice' 
import { sendSerialMessage } from '../../../../../store/serialSlice'
import { generateMelSpectrogram } from '../../AI/utils/audioDSP'
import { POSE_FEATURE_DIM } from '../../AI/utils/normalizeLandmarks'
import { createPredictionStabilizer } from '../../AI/utils/predictionStabilizer'

const CONFIDENCE_THRESHOLD = 0.70
// Lowered 8→5 to match the AI screens: the stabilizer now supplies temporal stability,
// so the smoothing window only needs to damp raw noise, not carry steadiness.
const SMOOTHING_WINDOW = 5
// Top-1 must beat top-2 by this much, else the frame is ambiguous → no detection.
// Precision guard shared with the AI screens: never a confident WRONG class.
const MARGIN = 0.20
// 2-hand self-calibrating reject gate (mirrors useGestureClassifier2H)
const TWO_HAND_REJECT_K = 3.0
const TWO_HAND_RADIUS_FLOOR = 0.8

interface ModelStore {
  model: tf.LayersModel
  classNames: string[]
  samples?: Record<string, number[][]>
  useFocusBox?: boolean
  isTwoHand?: boolean
  centroids?: Record<string, number[]>
  radii?: Record<string, number>
}

interface ProbEntry {
  name: string
  prob: number
}

function base64ToBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

// Voice Activity Detection (VAD) RMS Energy Gate Utility
function calculateRMS(audioBuffer: Float32Array): number {
  let sum = 0
  for (let i = 0; i < audioBuffer.length; i++) {
    sum += audioBuffer[i] * audioBuffer[i]
  }
  return Math.sqrt(sum / audioBuffer.length)
}

// Log-mel spectrogram normalization strictly to [0.0, 1.0]
function normalizeSpectrogram(spec: Float32Array): Float32Array {
  const out = new Float32Array(spec.length)
  for (let i = 0; i < spec.length; i++) {
    const val = Math.max(-40.0, Math.min(0.0, spec[i]))
    out[i] = (val + 40.0) / 40.0
  }
  return out
}

export default function AIRunnerOverlay() {
  // Same capability routing as the AI screens (GPU→JS, no-GPU→native Python), so
  // running a model in blocks on a GPU-less school laptop uses the responsive
  // native-CPU path instead of freezing on the main-thread WASM path.
  const { backend, labelFor } = useBackendPreference()
  const [active, setActive] = useState(false)
  const modelRef = useRef<ModelStore | null>(null)
  const lastLabelRef = useRef<string>('')
  const probHistoryRef = useRef<number[][]>([])
  // Holds class indices (audio path) or class-name strings (gesture/pose path);
  // reset between modes, so they never mix at runtime.
  const predictionHistoryRef = useRef<(number | string)[]>([])
  // Shared prediction stabilizer (parity with the AI screens): hysteresis + switch-
  // debounce + confidence EMA. One instance — the runner runs a single model at a time;
  // reset whenever the model changes or hand-presence is lost.
  const stabilizerRef = useRef(createPredictionStabilizer())

  // State for real-time visual side panel
  const [isAudioMode, setIsAudioMode] = useState(false)
  const [isPoseMode, setIsPoseMode] = useState(false)
  const [isTwoHandMode, setIsTwoHandMode] = useState(false)
  const [modelName, setModelName] = useState('')
  const [detectedClass, setDetectedClass] = useState('None')
  const [confidence, setConfidence] = useState(0)
  const [probabilities, setProbabilities] = useState<ProbEntry[]>([])
  const [useFocusBox, setUseFocusBox] = useState(false)
  // resizeable floating card width (persists while the overlay is mounted)
  const [cardWidth, setCardWidth] = useState(340)
  // rainbow hand effects (2-hand models only; purely visual, never affects detection)
  const [effectsOn, setEffectsOn] = useState(false)

  // Web Audio Context & Downsampling pipeline resources
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const rollingBufferRef = useRef<Float32Array>(new Float32Array(44100))
  const audioIntervalRef = useRef<any>(null)

  const broadcastClass = useCallback((className: string) => {
    const payload = { AIClass: className }
    sendWebSocketData(payload)
    sendSerialMessage(JSON.stringify(payload))
  }, [])

  const stopDetection = useCallback(() => {
    setActive(false)
    modelRef.current?.model.dispose()
    modelRef.current = null
    lastLabelRef.current = ''
    probHistoryRef.current = []
    predictionHistoryRef.current = []
    stabilizerRef.current.reset()

    // ── Cleanup Web Audio Resources ──
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current)
      audioIntervalRef.current = null
    }
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect()
      processorNodeRef.current.onaudioprocess = null
      processorNodeRef.current = null
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect()
      sourceNodeRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setIsAudioMode(false)
    setIsPoseMode(false)
    setIsTwoHandMode(false)
    setModelName('')
    setDetectedClass('None')
    setConfidence(0)
    setProbabilities([])
    console.log('[AI] Detection stopped')
  }, [])

  // ── Web Audio Processing pipeline for Voice Classification ──
  const startAudioPipeline = useCallback(async (classNames: string[]) => {
    try {
      console.log('[AI Audio] Initializing microphone stream...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      // Replicates hardware-level downsampling to 22.05kHz directly
      const ctx = new AudioContextClass({ sampleRate: 22050 })
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      sourceNodeRef.current = source

      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorNodeRef.current = processor
      source.connect(processor)
      processor.connect(ctx.destination)

      rollingBufferRef.current.fill(0)

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)
        const roll = rollingBufferRef.current
        roll.copyWithin(0, inputData.length)
        roll.set(inputData, roll.length - inputData.length)
      }

      console.log('[AI Audio] Microphone context running')

      // Clear temporal history
      probHistoryRef.current = []
      predictionHistoryRef.current = []
      stabilizerRef.current.reset()

      // Trigger rolling predictions every 250ms
      audioIntervalRef.current = setInterval(async () => {
        if (!modelRef.current) return
        const { model } = modelRef.current

        if (ctx.state === 'suspended') {
          await ctx.resume()
        }

        const borderCopy = new Float32Array(rollingBufferRef.current)
        const rms = calculateRMS(borderCopy)

        // Silence Energy Threshold VAD check
        if (rms < 0.015) {
          setDetectedClass('Silence')
          setConfidence(0)
          setProbabilities(classNames.map(name => ({ name, prob: name.toLowerCase().includes('background') || name.toLowerCase().includes('noise') ? 1.0 : 0.0 })))

          if (lastLabelRef.current !== 'None') {
            lastLabelRef.current = 'None'
            broadcastClass('None')
          }
          return
        }

        // Convert audio slice to log-mel spectrogram features [64, 130]
        const spec = generateMelSpectrogram(borderCopy)
        const normalizedSpec = normalizeSpectrogram(spec)

        // Inference pass
        const probs = tf.tidy(() => {
          const input = tf.tensor4d(Array.from(normalizedSpec), [1, 64, 130, 1], 'float32')
          const output = model.predict(input) as tf.Tensor
          return Array.from(output.dataSync()) as number[]
        })

        // Rolling temporal smoothing
        probHistoryRef.current.push(probs)
        if (probHistoryRef.current.length > 3) probHistoryRef.current.shift()

        const smoothed = new Array(probs.length).fill(0)
        for (const p of probHistoryRef.current) {
          for (let i = 0; i < probs.length; i++) smoothed[i] += p[i]
        }
        const n = probHistoryRef.current.length
        for (let i = 0; i < smoothed.length; i++) smoothed[i] /= n

        const maxIdx = smoothed.indexOf(Math.max(...smoothed))
        const confidenceVal = smoothed[maxIdx]
        const winningClass = classNames[maxIdx] ?? 'None'

        const isBg = winningClass.toLowerCase().includes('background') || winningClass.toLowerCase().includes('noise')

        // Shared stabilizer (parity with the AI screens): hysteresis + debounce + EMA.
        const accepted = confidenceVal >= CONFIDENCE_THRESHOLD && !isBg
        const st = stabilizerRef.current.update(smoothed, accepted ? maxIdx : null)
        const finalClass = st.classIdx !== null ? (classNames[st.classIdx] ?? 'None') : 'None'

        setDetectedClass(isBg ? 'Noise/Silence' : winningClass)
        setConfidence(st.confidence)
        setProbabilities(classNames.map((name, idx) => ({ name, prob: smoothed[idx] })))

        if (finalClass !== lastLabelRef.current) {
          lastLabelRef.current = finalClass
          console.log(`[AI Audio] Detected Class: ${finalClass}`)
          broadcastClass(finalClass)
        }
      }, 250)

    } catch (err) {
      console.error('[AI Audio] Failed to start microphone capture pipeline:', err)
    }
  }, [broadcastClass])

  useEffect(() => {
    async function onStartAI(e: Event) {
      const { modelName } = (e as CustomEvent<{ modelName: string }>).detail
      const bundle = window.__aiModels?.[modelName]
      if (!bundle) {
        console.error('[AI] Model not found in memory:', modelName)
        return
      }

      try {
        try { await tf.setBackend('webgl') } catch { await tf.setBackend('cpu') }
        await tf.ready()

        const model = await tf.loadLayersModel(
          tf.io.fromMemory(
            bundle.modelTopology, 
            bundle.weightSpecs as tf.io.WeightsManifestEntry[], 
            base64ToBuffer(bundle.weightData)
          )
        )
        // Discriminate model type via topology input shapes
        const inputShape = model.inputs[0].shape
        const lastDim = inputShape[inputShape.length - 1]
        const isAudio = (inputShape.length === 4 && inputShape[1] === 64 && inputShape[2] === 130)
        // Pose feature = 33 landmarks × 3 + 10 joint angles = 109 (POSE_FEATURE_DIM).
        // (Pose models saved before the joint-angle update were 99 and must be retrained.)
        const isPose = !isAudio && (lastDim === POSE_FEATURE_DIM)
        // 2-hand feature is 126 floats (normalizeCombinedWorld). 129 kept for any
        // legacy models saved with the older layout.
        const isTwoHand = !isAudio && !isPose && (lastDim === 126 || lastDim === 129)

        // For ALL camera models (1-hand, 2-hand, pose), precompute each class's
        // training spread so we can use the same self-calibrating reject gate the AI
        // screens use — detection then behaves identically here in the runner.
        const centroids = (bundle as any).centroids as Record<string, number[]> | undefined
        let radii: Record<string, number> | undefined
        if (bundle.samples && centroids) {
          radii = {}
          for (const [name, list] of Object.entries(bundle.samples)) {
            const c = centroids[name]
            if (!c || !list.length) continue
            let rsum = 0
            for (const s of list) {
              let sq = 0
              for (let i = 0; i < c.length; i++) { const d = s[i] - c[i]; sq += d * d }
              rsum += Math.sqrt(sq)
            }
            radii[name] = rsum / list.length
          }
        }

        modelRef.current = {
          model,
          classNames: bundle.classNames,
          samples: bundle.samples,
          useFocusBox: bundle.useFocusBox ?? false,
          isTwoHand,
          centroids,
          radii,
        }
        setUseFocusBox(bundle.useFocusBox ?? false)

        setIsAudioMode(isAudio)
        setIsPoseMode(isPose)
        setIsTwoHandMode(isTwoHand)
        setModelName(modelName)
        setDetectedClass('None')
        setConfidence(0)
        setProbabilities(bundle.classNames.map((name: string) => ({ name, prob: 0 })))

        setActive(true)
        console.log('[AI] Detection started —', modelName, 'isAudio:', isAudio, 'isPose:', isPose)

        if (isAudio) {
          startAudioPipeline(bundle.classNames)
        }
      } catch (err) {
        console.error('[AI] Failed to load model:', err)
      }
    }

    window.addEventListener('ai:startPrediction', onStartAI as EventListener)
    window.addEventListener('ai:stopPrediction', stopDetection)
    return () => {
      window.removeEventListener('ai:startPrediction', onStartAI as EventListener)
      window.removeEventListener('ai:stopPrediction', stopDetection)
    }
  }, [stopDetection, startAudioPipeline])

  // ── Landmarks handler for Gesture/Pose (Camera-based) ──
  const handleLandmarks = useCallback(async (vector: Float32Array) => {
    if (!modelRef.current) return
    const { model, classNames } = modelRef.current

    const features = vector.length

    const input = tf.tensor2d(vector, [1, features])
    const output = model.predict(input) as tf.Tensor
    const probsTyped = await output.data()
    const probs = Array.from(probsTyped)

    input.dispose()
    output.dispose()

    probHistoryRef.current.push(probs)
    if (probHistoryRef.current.length > SMOOTHING_WINDOW) probHistoryRef.current.shift()
    const smoothed = new Array(probs.length).fill(0)
    for (const p of probHistoryRef.current) {
      for (let i = 0; i < probs.length; i++) smoothed[i] += p[i]
    }
    const n = probHistoryRef.current.length
    for (let i = 0; i < smoothed.length; i++) smoothed[i] /= n

    const maxIdx = smoothed.indexOf(Math.max(...smoothed))
    const confidenceVal = smoothed[maxIdx]
    let aboveThreshold = confidenceVal >= CONFIDENCE_THRESHOLD
    const predictedClassName = classNames[maxIdx] ?? 'None'

    // Margin guard — reject ambiguous frames so two similar classes never produce a
    // confident WRONG result. (Precision guard shared with the AI screens.)
    if (aboveThreshold && smoothed.length > 1) {
      let secondBest = -Infinity
      for (let i = 0; i < smoothed.length; i++) {
        if (i !== maxIdx && smoothed[i] > secondBest) secondBest = smoothed[i]
      }
      if (confidenceVal - secondBest < MARGIN) aboveThreshold = false
    }

    // Self-calibrating reject — distance to the class centre in units of its OWN
    // training spread. Same gate the AI screens use for 1-hand / 2-hand / pose, so a
    // trained model behaves identically here in the Blockly runner (incl. CPU mode).
    if (aboveThreshold) {
      const centroid = modelRef.current.centroids?.[predictedClassName]
      const radius = modelRef.current.radii?.[predictedClassName] ?? TWO_HAND_RADIUS_FLOOR
      if (centroid) {
        let sumSq = 0
        for (let i = 0; i < features; i++) { const d = vector[i] - centroid[i]; sumSq += d * d }
        const dist = Math.sqrt(sumSq)
        if (dist / Math.max(radius, TWO_HAND_RADIUS_FLOOR) > TWO_HAND_REJECT_K) aboveThreshold = false
      }
    }

    // Shared stabilizer (parity with the AI screens): hysteresis + switch-debounce + EMA,
    // so the runner holds a class steadily and doesn't spam the serial port on flicker.
    const st = stabilizerRef.current.update(smoothed, aboveThreshold ? maxIdx : null)
    const className = st.classIdx !== null ? (classNames[st.classIdx] ?? 'None') : 'None'
    const isStableFinal = st.isDetected

    // Update real-time side-panel card states
    setDetectedClass(className)
    setConfidence(st.confidence)
    setProbabilities(classNames.map((name, idx) => ({
      name,
      prob: isStableFinal ? smoothed[idx] : 0
    })))

    if (className !== lastLabelRef.current) {
      lastLabelRef.current = className
      console.log(`[AI Vision] ${className}`)
      broadcastClass(className)
    }
  }, [broadcastClass])

  const handleStats = useCallback((stats: HandStats) => {
    // 2-hand models need both hands present; single-hand needs one.
    const needed = modelRef.current?.isTwoHand ? 2 : 1
    if (stats.hands.length < needed) {
      probHistoryRef.current = []
      stabilizerRef.current.reset()
      if (lastLabelRef.current !== 'None') {
        lastLabelRef.current = 'None'
        setDetectedClass('None')
        setConfidence(0)
        setProbabilities((prev) => prev.map((p) => ({ ...p, prob: 0 })))
        console.log('[AI Gesture] No hand')
        broadcastClass('None')
      }
    }
  }, [broadcastClass])

  const handlePoseStats = useCallback((stats: { fps: number; landmarks: Landmark[] }) => {
    if (stats.landmarks.length === 0) {
      probHistoryRef.current = []
      if (lastLabelRef.current !== 'None') {
        lastLabelRef.current = 'None'
        setDetectedClass('None')
        setConfidence(0)
        setProbabilities((prev) => prev.map((p) => ({ ...p, prob: 0 })))
        console.log('[AI Pose] No pose')
        broadcastClass('None')
      }
    }
  }, [broadcastClass])

  // Drag the left-edge handle to resize the floating card; the camera (aspect-video)
  // and the bars scale with the width. Anchored bottom-right, so it grows up-left.
  function startResize(e: { clientX: number; preventDefault: () => void }) {
    e.preventDefault()
    const startX = e.clientX
    const startW = cardWidth
    const onMove = (ev: PointerEvent) => {
      const dx = startX - ev.clientX
      const max = Math.min(760, window.innerWidth - 48)
      setCardWidth(Math.max(300, Math.min(max, startW + dx)))
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <>
      {/* 1. Sleek, Floating Neo-Brutalist prediction card for Voice/Audio Models */}
      {active && isAudioMode && (
        <div className="fixed bottom-[24px] right-[24px] w-80 bg-white border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-2xl p-5 z-[9999] pointer-events-auto select-none font-sans animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b-4 border-slate-900 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                <svg className="w-4.5 h-4.5 text-teal-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-none">AI Live Feed</span>
                <span className="text-xs font-black text-slate-800 leading-tight truncate max-w-[150px]">{modelName.replace(/\.json$/i, '')}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-100 border-2 border-slate-900 rounded-full px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-[8px] font-black text-rose-700 tracking-wider uppercase">Live</span>
            </div>
          </div>

          {/* Large Detected Class Badge */}
          <div className="mb-4">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5">Active Class</div>
            <div className="flex flex-col items-center justify-center bg-[#FFDE21] border-4 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rounded-xl py-3 px-4 text-center">
              <span className="text-2xl font-black text-slate-900 tracking-wide uppercase break-all">{detectedClass}</span>
              <span className="text-[10px] font-black text-slate-700 tracking-wide uppercase mt-0.5">
                Confidence: {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>

          {/* Breakdown / Probabilities */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2 flex justify-between">
              <span>Trained Outputs</span>
              <span>Smooth Window</span>
            </div>
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {probabilities.map((prob) => {
                const isWinner = prob.name === detectedClass || (prob.name?.toLowerCase().includes('background') && detectedClass === 'Noise/Silence')
                return (
                  <div key={prob.name} className="flex items-center justify-between text-xs font-black">
                    <span className={`w-20 truncate ${isWinner ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium'}`}>
                      {prob.name}
                    </span>
                    <div className="flex-1 h-3.5 bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden mx-2.5 relative">
                      <div
                        className={`h-full transition-all duration-200 ${isWinner ? 'bg-teal-400' : 'bg-slate-300'}`}
                        style={{ width: `${prob.prob * 100}%` }}
                      ></div>
                    </div>
                    <span className={`w-8 text-right ${isWinner ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium'}`}>
                      {Math.round(prob.prob * 100)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Sleek, Floating Neo-Brutalist Camera feed card for Hand/Pose vision Models */}
      {active && !isAudioMode && (
        <div style={{ width: cardWidth }} className="fixed bottom-[24px] right-[24px] bg-white border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-2xl p-5 z-[9999] pointer-events-auto select-none font-sans animate-fade-in">
          {/* drag-to-resize handle (left edge) */}
          <div
            onPointerDown={startResize}
            title="Drag to resize"
            className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-12 rounded-full bg-slate-900/80 border-2 border-white cursor-ew-resize z-[10000] hover:bg-slate-900"
          />
          {/* Header */}
          <div className="flex items-center justify-between border-b-4 border-slate-900 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${isPoseMode ? 'bg-cyan-100' : 'bg-indigo-100'} border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]`}>
                {isPoseMode ? (
                  <svg className="w-4.5 h-4.5 text-cyan-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-none">
                  {isPoseMode ? 'AI Pose Feed' : 'AI Gesture Feed'}
                </span>
                <span className="text-xs font-black text-slate-800 leading-tight truncate max-w-[150px]">{modelName.replace(/\.json$/i, '')}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-100 border-2 border-slate-900 rounded-full px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-[8px] font-black text-rose-700 tracking-wider uppercase">Live</span>
            </div>
          </div>

          {/* Camera View Area with direct overlay rendering */}
          <div className="w-full aspect-video border-4 border-slate-900 rounded-xl overflow-hidden mb-4 bg-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] relative">
            {isPoseMode ? (
              <PoseTracker
                onLandmarks={handleLandmarks}
                onStats={handlePoseStats}
                prediction={null}
                isCapturing={false}
                backendMode={backend}
                backendLabel={labelFor(backend)}
              />
            ) : (
              <HandTracker
                onLandmarks={handleLandmarks}
                onStats={handleStats}
                prediction={null}
                isCapturing={false}
                focusBoxEnabled={useFocusBox}
                handMode={isTwoHandMode ? 2 : 1}
                backendMode={backend}
                backendLabel={labelFor(backend)}
                effectsEnabled={isTwoHandMode && effectsOn}
              />
            )}

            {/* Rainbow effects toggle — 2-hand gesture models only, purely visual */}
            {isTwoHandMode && (
              <button
                onClick={() => setEffectsOn((v) => !v)}
                title="Rainbow effects (visual only — doesn't affect detection)"
                className={`absolute top-2 right-2 z-20 rounded-lg px-2.5 py-1 text-[10px] font-black border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-colors ${effectsOn ? 'bg-fuchsia-400 text-slate-900' : 'bg-white/90 text-slate-700 hover:bg-white'}`}
              >
                {effectsOn ? '✨ ON' : '✨ FX'}
              </button>
            )}
          </div>

          {/* Large Detected Class Badge */}
          <div className="mb-4">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5">
              {isPoseMode ? 'Detected Pose' : 'Detected Gesture'}
            </div>
            <div className={`flex flex-col items-center justify-center ${isPoseMode ? 'bg-cyan-100' : 'bg-indigo-100'} border-4 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rounded-xl py-2 px-3 text-center text-slate-900`}>
              <span className="text-xl font-black uppercase break-all">{detectedClass}</span>
              <span className="text-[10px] font-black text-slate-700 tracking-wide uppercase mt-0.5">
                Confidence: {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>

          {/* probability breakdown bars */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2 flex justify-between">
              <span>{isPoseMode ? 'Trained Poses' : 'Trained Gestures'}</span>
              <span>Smooth Window</span>
            </div>
            <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
              {probabilities.map((prob) => {
                const isWinner = prob.name === detectedClass
                return (
                  <div key={prob.name} className="flex items-center justify-between text-xs font-black">
                    <span className={`w-20 truncate ${isWinner ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium'}`}>
                      {prob.name}
                    </span>
                    <div className="flex-1 h-3.5 bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden mx-2.5 relative">
                      <div
                        className={`h-full transition-all duration-200 ${isWinner ? (isPoseMode ? 'bg-cyan-400' : 'bg-indigo-400') : 'bg-slate-300'}`}
                        style={{ width: `${prob.prob * 100}%` }}
                      ></div>
                    </div>
                    <span className={`w-8 text-right ${isWinner ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-medium'}`}>
                      {Math.round(prob.prob * 100)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
