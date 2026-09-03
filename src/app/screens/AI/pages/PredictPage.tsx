import { useRef, useState } from 'react'
import HandTracker, { type HandTrackerHandle, type HandStats } from '../components/HandTracker'
import ControlsPanel from '../components/ControlsPanel'
import AIToolbar from '../components/AIToolbar'
import LayersReveal, { HAND_LAYERS } from '../components/LayersReveal'
import { detectHandInImage } from '../utils/imageDetector'
import type { GestureClass, Prediction } from '../hooks/useGestureClassifier'
import CameraIcon from '../icons/cameraIcon'
import UploadIcon from '../icons/uploadIcon'


interface PredictPageProps {
  classes: GestureClass[]
  classColors: Record<string, string>
  defaultColors: string[]
  prediction: Prediction | null
  predict: (vector: Float32Array) => Promise<Prediction | null>
  onLandmarks: (vector: Float32Array, isValidHand?: boolean) => void
  onStats: (stats: HandStats) => void
  onSave: () => void
  onBack: () => void
  onExportToBlockly?: (mode: 'blocks' | 'python' | 'c++') => void
  backendMode?: 'python' | 'js'
  backendLabel?: string
  focusBoxEnabled?: boolean
  handMode?: 1 | 2
  effectsEnabled?: boolean
  /** ref to latest raw landmarks per hand — feeds the "View in Layers" reveal */
  liveHandsRef?: React.MutableRefObject<{ x: number; y: number; z?: number }[][]>
  sampleCounts?: Record<string, number>
  trainAccuracy?: number | null
}

const DOTTED_BG = {
  backgroundColor: '#efefef',
  backgroundImage: 'radial-gradient(circle, #c0c0c0 1.5px, transparent 1.5px)',
  backgroundSize: '20px 20px',
}

type InputMode = 'camera' | 'upload'

export default function PredictPage({
  classes, classColors, defaultColors,
  prediction, predict,
  onLandmarks, onStats, onSave, onBack,
  onExportToBlockly,
  backendMode = 'js',
  backendLabel,
  focusBoxEnabled = false,
  handMode = 1,
  effectsEnabled = false,
  liveHandsRef,
  sampleCounts = {},
  trainAccuracy = null,
}: PredictPageProps) {
  const handTrackerRef = useRef<HandTrackerHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fallbackHandsRef = useRef<{ x: number; y: number; z?: number }[][]>([])
  const handsRef = liveHandsRef ?? fallbackHandsRef
  const [showLayers, setShowLayers] = useState(false)

  const [mode, setMode] = useState<InputMode>('camera')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadPred, setUploadPred] = useState<Prediction | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const activePrediction = mode === 'camera' ? prediction : uploadPred
  const displayPrediction = activePrediction?.className ? activePrediction : null

  function getColor(id: string, idx: number) {
    return classColors[id] ?? defaultColors[idx % defaultColors.length]
  }

  function getConf(idx: number) {
    if (!activePrediction || !activePrediction.className) return 0
    return Math.round((activePrediction?.probabilities[idx]?.prob ?? 0) * 100)
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setProcessing(true)
    setUploadError(null)
    setUploadedImage(null)
    setUploadPred(null)

    const result = await detectHandInImage(file)
    setProcessing(false)

    if (!result) {
      setUploadError('No hand detected — try a clearer hand photo')
      return
    }
    setUploadedImage(result.imageUrl)
    const pred = await predict(result.vector)
    setUploadPred(pred)
  }

  function switchToUpload() {
    setMode('upload')
    // Don't auto-open picker — let user click the zone or the button again
  }

  function openPicker() {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AIToolbar onSave={onSave} onBack={onBack} isTrained={true} />

      <main className="flex-1 relative z-20 flex gap-6 p-6 items-center justify-center overflow-auto" style={DOTTED_BG}>

        {/* ── Left: UPLOAD panel ────────────────────────────────────────── */}
        <div className="flex justify-center items-center w-[clamp(320px,30vw,480px)] shrink-0 mx-auto">
          <div className="w-[clamp(320px,30vw,480px)] flex flex-col">

            {/* Header */}
            <div className="w-[clamp(240px,21vw,340px)] h-[clamp(40px,3vw,56px)] bg-black border-t-2 border-l-2 border-r-2 border-black rounded-t-lg flex items-center pl-4 font-bold">
              <span className="text-white font-black text-[0.78rem] tracking-[0.2em]">UPLOAD</span>
            </div>

            {/* Camera feed — always mounted so camera stays warm, hidden in upload mode */}
            <div className="w-full bg-white border-2 border-black rounded-tr-xl rounded-br-xl rounded-bl-xl p-3">
              <div className="w-full aspect-video mx-auto rounded-lg overflow-hidden bg-black">
                <div className={mode === 'camera' ? '' : 'hidden'}>
                  <HandTracker
                    ref={handTrackerRef}
                    onStats={onStats}
                    onLandmarks={onLandmarks}
                    prediction={mode === 'camera' ? displayPrediction : null}
                    isCapturing={false}
                    backendMode={backendMode}
                    backendLabel={backendLabel}
                    focusBoxEnabled={focusBoxEnabled}
                    handMode={handMode}
                    effectsEnabled={effectsEnabled}
                  />
                </div>


                {/* Upload zone — shown when mode === 'upload' */}
                {mode === 'upload' && (

                  <div
                    className="relative flex flex-col items-center justify-center cursor-pointer select-none"
                    style={{
                      minHeight: 100,
                      background: isDragging ? '#ffe066' : '#F6EC24',
                      transition: 'background 0.15s',
                    }}
                    onClick={openPicker}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                      const f = e.dataTransfer.files[0]
                      if (f) handleFile(f)
                    }}
                  >
                    {processing ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-4 border-black border-t-transparent animate-spin" />
                        <span className="font-bold text-black text-sm">Detecting hand…</span>
                      </div>
                    ) : uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="uploaded"
                        className="w-full h-full object-contain"
                        style={{ maxHeight: 300, imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F6EC24] cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors select-none">
                        <span className="font-black -mt-10 text-black leading-none" style={{ fontSize: '4rem', lineHeight: 1 }}>+</span>
                        {uploadError ? (
                          <p className="font-bold text-black text-sm mt-2">{uploadError}</p>
                        ) : (
                          <p className="font-bold text-center text-black leading-tight">
                            Add or Drop files<br />from your computer
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200" />

              {/* Mode buttons */}
              <div className="flex items-center justify-center gap-4 pt-4">
                {/* Camera button */}
                <button
                  onClick={() => setMode('camera')}
                  className="flex items-center justify-center rounded-xl border-none cursor-pointer transition-colors"
                  style={{
                    width: 52, height: 52,
                  }}
                  title="Use camera"
                >
                  <CameraIcon />
                </button>

                {/* Upload button */}
                <button
                  onClick={() => { switchToUpload(); openPicker() }}
                  className="flex items-center justify-center rounded-xl border-none cursor-pointer transition-colors"
                  style={{
                    width: 52, height: 52,
                  }}
                  title="Upload image"
                >
                  <UploadIcon />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                    e.target.value = ''
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Middle: confidence bars ────────────────────────────────────── */}
        <div className="w-[25vw] shrink-0  w-[clamp(300px,28vw,450px)] mx-auto">
          {classes.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-12 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
              Train a model first
            </div>
          )}
          {classes.map((cls, i) => {
            const conf = getConf(i)
            const color = getColor(cls.id, i)
            return (
              <div
                key={cls.id}
                className="bg-white rounded-lg px-2 py-2 border-2 shadow-2xl mb-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-black text-xl text-black leading-tight">{cls.name}</span>
                  <div className="text-right shrink-0">
                    <div className="text-2xl text-black leading-none">{conf}%</div>
                    <div className="text-[0.70rem] text-gray-500 tracking-[0.18em] mt-0.5">CONFIDENCE</div>
                  </div>
                </div>
                <div className="h-3 bg-gray-100  overflow-hidden mt-3">
                  <div
                    className="h-full "
                    style={{ width: `${conf}%`, background: color, transition: 'width 0.12s ease' }}
                  />
                </div>
              </div>
            )
          })}

          {/* View the live prediction travel through the network */}
          {classes.length > 0 && (
            <button
              onClick={() => setShowLayers(true)}
              className="w-full mt-2 rounded-lg px-4 py-2.5 font-black tracking-wide text-white border-2 border-black cursor-pointer transition-transform hover:scale-[1.02]"
              style={{ background: '#04050d', boxShadow: '2px 4px 4px rgba(0,0,0,0.4)' }}
              title="Watch your gesture travel through the model's layers"
            >
              🔬 VIEW IN LAYERS
            </button>
          )}
        </div>

        {/* ── Right: controls panel ──────────────────────────────────────── */}
        <ControlsPanel
          classes={classes}
          classColors={classColors}
          defaultColors={defaultColors}
          onStart={onBack}
          onExportToBlockly={onExportToBlockly}
          trainingStatus={'ready'}
          currentPage={"predict"}
        />
      </main>

      <LayersReveal
        open={showLayers}
        mode="test"
        config={HAND_LAYERS}
        classes={classes}
        colorOf={getColor}
        sampleCounts={sampleCounts}
        isTraining={false}
        isTrained={true}
        trainProgress={100}
        trainAccuracy={trainAccuracy}
        getSubject={() => handsRef.current[0] ?? null}
        getVideo={() => handTrackerRef.current?.getVideo() ?? null}
        livePrediction={mode === 'camera' ? prediction : uploadPred}
        onClose={() => setShowLayers(false)}
      />
    </div>
  )
}
