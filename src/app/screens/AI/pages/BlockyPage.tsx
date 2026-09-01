import { useEffect, useRef, useState } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import * as tf from '@tensorflow/tfjs'
import { normalizeLandmarks } from '../utils/normalizeLandmarks'
import { loadModelFromFile } from '../utils/modelIO'

const WASM_CDN  = '/wasm'
const MODEL_URL = '/models/hand_landmarker.task'
const THRESHOLD = 0.70

interface BlockyPageProps {
  onBack: () => void
}

interface ModelData {
  model: tf.LayersModel
  classNames: string[]
}

interface PredictionResult {
  className: string
  confidence: number
}

export default function BlockyPage({ onBack }: BlockyPageProps) {
  const videoRef     = useRef<HTMLVideoElement>(null)
  const detectorRef  = useRef<HandLandmarker | null>(null)
  const rafRef       = useRef<number | null>(null)
  const modelDataRef = useRef<ModelData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [modelMeta,  setModelMeta]  = useState<{ classNames: string[] } | null>(null)
  const [predicting, setPredicting] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [errorMsg,   setErrorMsg]   = useState('')

  useEffect(() => {
    return () => stopLoop()
  }, [])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setErrorMsg('')
    setLoadingMsg('Loading model…')
    try {
      const data = await loadModelFromFile(file)
      modelDataRef.current = data
      setModelMeta({ classNames: data.classNames })
      setLoadingMsg('')
    } catch (err: unknown) {
      setLoadingMsg('')
      setErrorMsg(err instanceof Error ? err.message : String(err))
    }
  }

  async function startPredicting() {
    setErrorMsg('')
    try {
      if (!detectorRef.current) {
        setLoadingMsg('Loading detector…')
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
        detectorRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence:  0.5,
          minTrackingConfidence:      0.5,
        })
      }

      setLoadingMsg('Starting camera…')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()

      setLoadingMsg('')
      setPredicting(true)

      function loop(ts: number) {
        rafRef.current = requestAnimationFrame(loop)
        if (video.readyState < 2 || video.videoWidth === 0) return

        const result = detectorRef.current!.detectForVideo(video, ts)
        if (!result.landmarks[0]) { setPrediction(null); return }

        const vector = normalizeLandmarks(result.landmarks[0])
        const { model, classNames } = modelDataRef.current!

        const input  = tf.tensor2d([Array.from(vector)], [1, 63])
        const output = model.predict(input) as tf.Tensor
        const probs  = Array.from(output.dataSync()) as number[]
        input.dispose(); output.dispose()

        const maxIdx = probs.indexOf(Math.max(...probs))
        if (probs[maxIdx] >= THRESHOLD) {
          setPrediction({ className: classNames[maxIdx], confidence: probs[maxIdx] })
        } else {
          setPrediction(null)
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    } catch (err: unknown) {
      setLoadingMsg('')
      setErrorMsg(err instanceof Error ? err.message : String(err))
    }
  }

  function stopLoop() {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    const video = videoRef.current
    ;(video?.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop())
    if (video) video.srcObject = null
    setPredicting(false)
    setPrediction(null)
  }

  const isLoading = !!loadingMsg
  const hasModel  = !!modelMeta

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col text-white font-mono">
      <header className="flex items-center gap-4 px-6 py-[18px]">
        <button
          onClick={() => { stopLoop(); onBack() }}
          className="bg-transparent border border-slate-800 rounded-lg text-slate-600 px-3.5 py-1.5 text-[0.8rem] cursor-pointer font-mono hover:border-slate-700 transition-colors"
        >
          ← Back
        </button>

        <span className="text-base font-black tracking-[0.25em] text-slate-800">BLOCKY</span>

        {predicting && (
          <span className="ml-auto flex items-center gap-1.5 text-[0.72rem] text-green-400">
            <span className="w-[7px] h-[7px] rounded-full bg-green-400 inline-block animate-blink"
              style={{ boxShadow: '0 0 8px #4ade80' }} />
            LIVE
          </span>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-10 gap-12">
        <div className="text-center select-none">
          {predicting ? (
            <>
              <div
                style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)', transition: 'color 0.15s' }}
                className={`font-black leading-none tracking-[-0.03em] ${prediction ? 'text-slate-100' : 'text-[#0f172a]'}`}
              >
                {prediction ? prediction.className : '■ ■ ■'}
              </div>
              {prediction && (
                <div className="mt-4 flex flex-col items-center gap-1.5">
                  <div className="w-[180px] h-[3px] bg-[#0f172a] rounded">
                    <div
                      style={{ width: `${Math.round(prediction.confidence * 100)}%`, transition: 'width 0.1s ease' }}
                      className={`h-full rounded ${prediction.confidence > 0.9 ? 'bg-green-400' : 'bg-yellow-400'}`}
                    />
                  </div>
                  <span className="text-[0.72rem] text-slate-700">
                    {Math.round(prediction.confidence * 100)}%
                  </span>
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)' }}
              className="font-black leading-none text-[#0d0d14] tracking-[-0.03em]">
              ■ ■ ■
            </div>
          )}
        </div>

        {(isLoading || errorMsg) && (
          <div className={`text-[0.8rem] flex items-center gap-2 ${errorMsg ? 'text-red-400' : 'text-slate-600'}`}>
            {isLoading && <BlockySpinner />}
            {isLoading ? loadingMsg : `⚠ ${errorMsg}`}
          </div>
        )}

        {hasModel && !isLoading && (
          <div className="flex flex-wrap gap-2 justify-center max-w-[480px]">
            {modelMeta!.classNames.map((name, i) => (
              <span key={i} className="bg-[#0d0d14] border border-slate-800 rounded-full px-3 py-1 text-[0.75rem] text-slate-600 tracking-[0.05em]">
                {name}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || predicting}
            className={`bg-transparent border rounded-xl px-6 py-3 text-[0.85rem] font-bold font-mono tracking-[0.06em] transition-all ${
              isLoading || predicting
                ? 'border-slate-800 text-slate-800 cursor-not-allowed'
                : 'border-slate-700 text-slate-600 cursor-pointer hover:border-slate-600'
            }`}
          >
            {hasModel ? '↺ RELOAD MODEL' : '⊞ LOAD MODEL'}
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

          <button
            onClick={predicting ? stopLoop : startPredicting}
            disabled={!hasModel || isLoading}
            className={`border rounded-xl px-8 py-3 text-[0.85rem] font-black font-mono tracking-[0.1em] transition-all ${
              predicting
                ? 'bg-red-400/10 border-red-400/30 text-red-400 cursor-pointer'
                : hasModel && !isLoading
                  ? 'bg-slate-100 border-transparent text-[#050507] cursor-pointer'
                  : 'bg-[#0d0d14] border-transparent text-slate-800 cursor-not-allowed'
            }`}
          >
            {predicting ? '■ STOP' : '▶ PREDICT'}
          </button>
        </div>
      </main>

      <video ref={videoRef} width={640} height={480} muted playsInline className="rounded-xl object-cover" />
    </div>
  )
}

function BlockySpinner() {
  return (
    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-800 border-t-slate-600 animate-spin flex-shrink-0" />
  )
}
