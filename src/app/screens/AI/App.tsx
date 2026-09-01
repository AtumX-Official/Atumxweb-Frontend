import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HandTracker, { type HandStats, type HandTrackerHandle } from './components/HandTracker'
import TrainingPanel from './components/TrainingPanel'
import BlockyPage from './pages/BlockyPage'
import PredictPage from './pages/PredictPage'
import ControlsPanel from './components/ControlsPanel'
import AIToolbar from './components/AIToolbar'
import ProjectPopup from './components/ProjectPopup'
import { useGestureClassifier, type GestureClass, type Prediction } from './hooks/useGestureClassifier'
import { useGestureClassifier2H } from './hooks/useGestureClassifier2H'
import { useSampleRecorder, type SampleRecorder } from './hooks/useSampleRecorder'
import RecordingSettings from './components/RecordingSettings'
import RecordingControls from './components/RecordingControls'
import CaptureMenu from './components/CaptureMenu'
import BackendSelector from './components/BackendSelector'
import { useBackendPreference } from './hooks/useBackendPreference'
import { detectHandInImage } from './utils/imageDetector'
import trainmodel from './icons/trainhand.gif'
import trainsucessgif from './icons/readyhandgif.gif'
import modelready from './icons/handpng.png'
import { uniqueClassName } from './utils/uniqueClassName'
type Page = 'main' | 'blocky' | 'predict'

const DEFAULT_CLASS_COLORS = ['#a3e635', '#f472b6', '#a78bfa', '#60a5fa', '#fb923c', '#34d399', '#f87171', '#fbbf24']

interface LatestRef {
  classifier: ReturnType<typeof useGestureClassifier>
  setPrediction: React.Dispatch<React.SetStateAction<Prediction | null>>
  addImage: (classId: string, imageUrl: string) => void
  recorder: SampleRecorder
}

export default function AIApp() {
  const [page, setPage] = useState<Page>('main')
  // Capability-based backend routing (GPU→JS, no-GPU→Python) with manual override.
  const { capability, preference, setPreference, backend, labelFor } = useBackendPreference()
  const pageRef = useRef<Page>('main')
  pageRef.current = page
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [classes, setClasses] = useState<GestureClass[]>([])
  const [images, setImages] = useState<Record<string, string[]>>({})
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [classColors, setClassColors] = useState<Record<string, string>>({})
  const [, setThumbOffset] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [showProjectPopup, setShowProjectPopup] = useState(false)
  const classIdCounter = useRef(0)
  const manualCaptureRef = useRef<{ classId: string } | null>(null)
  const latestRef = useRef<LatestRef | null>(null)
  const handTrackerRef = useRef<HandTrackerHandle>(null)
  // latest raw landmarks per detected hand — fed live into the layers reveal
  const liveHandsRef = useRef<{ x: number; y: number; z?: number }[][]>([])
  const [delay, setDelay] = useState<number | ''>(0)
  const [duration, setDuration] = useState<number | ''>(0)
  const [hold, setHold] = useState(true)
  const [fps, setFps] = useState<number | ''>(30)
  const [inputMode, setInputMode] = useState<'camera' | 'upload' | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── 1-hand / 2-hand mode ──────────────────────────────────────────────
  const [handMode, setHandMode] = useState<1 | 2>(1)
  const handModeRef = useRef<1 | 2>(1)
  handModeRef.current = handMode
  // Both 1-hand and 2-hand follow capability routing. The Python worker tracks
  // the right number of hands (num_hands passed at spawn), so 2-hand works on the
  // CPU route too.
  const handBackend = backend
  const handBackendLabel = labelFor(handBackend)
  const [bothHands, setBothHands] = useState(false)
  // True while the camera shows a lighting warning — used to suppress the
  // top-center "show both hands" indicator so the two don't stack.
  const [lightingWarnActive, setLightingWarnActive] = useState(false)
  const bothHandsRef = useRef(false)
  const lastBothTrueRef = useRef(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const camStageRef = useRef<HTMLDivElement>(null)
  // 2-hand rainbow hand effects (off by default; pure overlay)
  const [effectsOn, setEffectsOn] = useState(false)

  const router = useRouter()
  // Single-hand uses your colleague's original classifier (untouched).
  // Two-hand uses its own separate classifier. Both hooks are always called
  // (Rules of Hooks); we just point `classifier` at the active one.
  const classifierSingle = useGestureClassifier()
  const classifierTwo = useGestureClassifier2H()
  const classifier = handMode === 2 ? classifierTwo : classifierSingle

  // Shared recording engine (hold / timed / 3·2·1 countdown), uniform with pose.
  const recorder = useSampleRecorder({ holdIntervalMs: 500 })
  const { isCapturing, countdown, captureFlash } = recorder

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null
  const selectedColor = selectedClassId
    ? (classColors[selectedClassId] ?? DEFAULT_CLASS_COLORS[classes.findIndex((c) => c.id === selectedClassId) % DEFAULT_CLASS_COLORS.length])
    : '#a3e635'

  function addImage(classId: string, imageUrl: string) {
    setImages((prev) => ({ ...prev, [classId]: [...(prev[classId] ?? []), imageUrl] }))
  }

  function handleAddClass(name: string) {
    const unique = uniqueClassName(name, classes.map((c) => c.name))
    const id = `cls_${++classIdCounter.current}`
    classifier.initClass(id)
    setClasses((prev) => [...prev, { id, name: unique }])
    setSelectedClassId(id)
    setThumbOffset(0)
  }

  function handleDeleteClass(id: string) {
    classifier.removeClassData(id)
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setImages((prev) => { const n = { ...prev }; delete n[id]; return n })
    setClassColors((prev) => { const n = { ...prev }; delete n[id]; return n })
    if (manualCaptureRef.current?.classId === id) manualCaptureRef.current = null
    if (selectedClassId === id) { setSelectedClassId(null); setThumbOffset(0) }
  }

  function handleRenameClass(id: string, name: string) {
    // Called on commit (blur/Enter). Auto-suffix if the new name duplicates another.
    const unique = uniqueClassName(name, classes.filter((c) => c.id !== id).map((c) => c.name))
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, name: unique } : c)))
  }

  function handleClearSamples(classId?: string) {
    classifier.clearSamples(classId)
    if (classId) {
      setImages((prev) => ({ ...prev, [classId]: [] }))
    } else {
      setImages({})
    }
    setThumbOffset(0)
  }

  function handleCaptureOne(classId: string) {
    manualCaptureRef.current = { classId }
  }

  function handleDeleteSample(classId: string, index: number) {
    classifier.deleteSample(classId, index)
    setImages((prev) => {
      const arr = [...(prev[classId] ?? [])]
      arr.splice(index, 1)
      return { ...prev, [classId]: arr }
    })
  }

  async function handleUploadImage(classId: string, file: File) {
    const result = await detectHandInImage(file)
    if (!result) return
    classifier.addSample(classId, result.vector)
    addImage(classId, result.imageUrl)
  }

  async function handleFiles(files: FileList | null) {
    if (!files || !selectedClassId) return
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      await handleUploadImage(selectedClassId, file)
    }
  }

  function handleChangeColor(classId: string, color: string) {
    setClassColors((prev) => ({ ...prev, [classId]: color }))
  }

  function handleSelectClass(id: string) {
    setSelectedClassId(id)
    setThumbOffset(0)
  }

  // ── Recording controls (thin wrappers over the shared recorder) ──────────
  const numOr = (v: number | '') => (typeof v === 'number' && v > 0 ? v : undefined)

  function stopCapture() {
    recorder.stop()
  }
  function startHoldCapture() {
    if (!selectedClassId) return
    recorder.startHold(selectedClassId)
  }

  // Hands-free 3·2·1 countdown, then records like timed. The default 0.1s gap /
  // 30 frames keep the original 2-hand behaviour; both overridable in settings.
  function stopCountdownRecord() {
    recorder.stop()
  }
  function startCountdownRecord() {
    if (!selectedClassId) return
    recorder.startCountdown(selectedClassId, {
      delaySec: numOr(delay),
      durationN: numOr(duration),
      defaultDelaySec: 0.1,
      defaultDurationN: 30,
    })
  }

  // ── Switch 1-hand / 2-hand. Models use different input sizes, so start fresh.
  function handleSetHandMode(mode: 1 | 2) {
    if (mode === handMode) return
    stopCountdownRecord()
    // Reset BOTH classifiers and initialise the NEW classes on the one we're
    // switching TO (the `classifier` const still points at the old mode here).
    const target = mode === 2 ? classifierTwo : classifierSingle
    classifierSingle.resetModel(); classifierSingle.clearSamples()
    classifierTwo.resetModel(); classifierTwo.clearSamples()
    setHandMode(mode)
    setPrediction(null)
    setImages({})
    setClassColors({})
    classIdCounter.current = 0
    const id1 = `cls_${++classIdCounter.current}`
    const id2 = `cls_${++classIdCounter.current}`
    target.initClass(id1); target.initClass(id2)
    setClasses([{ id: id1, name: 'Class 1' }, { id: id2, name: 'Class 2' }])
    setSelectedClassId(id1)
    setInputMode('camera')
  }

  function toggleFullscreen() {
    const el = camStageRef.current
    if (!el) return
    // Drive the fullscreen LAYOUT off React state directly, so it works even where the
    // native Fullscreen API is blocked/rejected (the packaged app failed on some laptops
    // because isFullscreen was ONLY set by the 'fullscreenchange' event, which never
    // fires when requestFullscreen is rejected). The native call is a best-effort bonus.
    const next = !isFullscreen
    setIsFullscreen(next)
    if (next) el.requestFullscreen?.().catch(() => {})
    else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }

  useEffect(() => {
    handleAddClass('Class 1')
    handleAddClass('Class 2')
    // handleAddClass selects each class as it's added, so Class 2 ends up selected.
    // Select Class 1 (the first id) and auto-load the camera — matching 2-hand.
    setSelectedClassId('cls_1')
    setInputMode('camera')
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const handleExportToBlockly = useCallback(async () => {
    try {
      if (!classifier.isSavedToDisk) {
        await classifier.saveModel(projectName || 'gesture-model')
      }
      await classifier.exportToBlockly(projectName || 'gesture-model')
      router.push('/blocks')
    } catch (err) {
      console.error('Failed to export gesture model to Blockly:', err)
    }
  }, [classifier, projectName, router])

  latestRef.current = { classifier, setPrediction, addImage, recorder }

  const handleLandmarks = useCallback((vector: Float32Array, isValidHand: boolean = true) => {
    const { classifier: clf, setPrediction: setP, addImage: addImg, recorder: rec } = latestRef.current!

    // Only allow capturing training data if the hand is within the focus box (if enabled)
    // We do NOT block prediction below, because dropping frames causes visual flickering and UI freeze.
    const canTrain = isValidHand

    // Manual single capture (TrainingPanel "+1" button)
    const mc = manualCaptureRef.current
    if (mc) {
      manualCaptureRef.current = null
      if (canTrain) {
        clf.addSample(mc.classId, vector)
        const snap = handTrackerRef.current?.snapshot() ?? ''
        if (snap) addImg(mc.classId, snap)
      }
    }

    // Shared recorder decides when a sample is due (hold / timed / countdown).
    // Only tick while the hand is valid (focus-box gate) so invalid frames don't
    // consume the interval or the frame count.
    if (canTrain) {
      const { capture, classId } = rec.tick(performance.now())
      if (capture) {
        clf.addSample(classId, vector)
        const snap = handTrackerRef.current?.snapshot() ?? ''
        if (snap) addImg(classId, snap)
      }
    }

    // Predict only on the predict page — keep training panel clean of live predictions.
    if (clf.modelReady && pageRef.current === 'predict') {
      clf.predict(vector).then((res) => {
        if (res) setP(res)
      })
    }
  }, [])

  const handleStats = useCallback((s: HandStats) => {
    const n = s.hands.length
    // keep the freshest landmarks around for the layers reveal (skeleton + numbers)
    liveHandsRef.current = s.hands.map((h) => h.landmarks)
    if (handModeRef.current === 2) {
      const both = n >= 2
      if (both) lastBothTrueRef.current = performance.now()
      // Grace window (same as the standalone HTML): a 1–2 frame dropout of the
      // second hand shouldn't flip the indicator/prediction. Only treat both
      // hands as lost once they've actually been gone for ~0.6s.
      const display = both || (performance.now() - lastBothTrueRef.current < 600)
      if (display !== bothHandsRef.current) { bothHandsRef.current = display; setBothHands(display) }
      if (!display) {
        const { classifier: clf, setPrediction: setP } = latestRef.current!
        if (clf.modelReady && pageRef.current === 'predict') setP(null)
      }
      return
    }
    if (n === 0) {
      const { classifier: clf, setPrediction: setP } = latestRef.current!
      if (clf.modelReady && pageRef.current === 'predict') setP(null)
    }
  }, [])

  const handleTrain = useCallback(() => { classifier.trainModel(classes) }, [classes, classifier])
  const handleReset = useCallback(() => { classifier.resetModel(); setPrediction(null) }, [classifier])

  const handleCreateProject = (name: string, desc: string) => {
    setProjectName(name)
    setProjectDesc(desc)
    setShowProjectPopup(false)
    handleReset()
    setClasses([])
    setImages({})
    setClassColors({})
    setSelectedClassId(null)
    classIdCounter.current = 0
  }

  const handleOpenProject = async () => {
    try {
      const res = await (window as any).api.file.open(handMode === 2 ? 'handGesture2H' : 'handGesture')
      if (!res || !res.success) return
      const bundle = JSON.parse(res.data)
      const restoredClasses = await classifier.loadModel(bundle)
      setClasses(restoredClasses)
      setImages({})
      setClassColors({})
      setProjectName(res.fileName.replace('.json', ''))
      if (restoredClasses.length > 0) {
        setSelectedClassId(restoredClasses[0].id)
      }
    } catch (err) {
      console.error('Failed to load project:', err)
      alert('Failed to load project: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const isTrained = classifier.trainingStatus === 'ready'
  const isTraining = classifier.trainingStatus === 'training'
  const [trainingPopup, setTrainingPopup] = useState(false)
  const [showResultScreen, setShowResultScreen] = useState(false);
  useEffect(() => {
    if (isTraining) setTrainingPopup(true)
  }, [isTraining])
  useEffect(() => {
    if (isTrained) {
      const timer = setTimeout(() => {
        setShowResultScreen(true);
      }, 2000); // duration of success gif
  
      return () => clearTimeout(timer);
    } else {
      setShowResultScreen(false);
    }
  }, [isTrained]);
  if (page === 'blocky') return <BlockyPage onBack={() => setPage('main')} />

  if (page === 'predict') return (
    <PredictPage
      classes={classes}
      classColors={classColors}
      defaultColors={DEFAULT_CLASS_COLORS}
      prediction={prediction}
      predict={classifier.predict}
      onLandmarks={handleLandmarks}
      onStats={handleStats}
      onSave={classifier.saveModel}
      onBack={() => setPage('main')}
      onExportToBlockly={handleExportToBlockly}
      backendMode={handBackend}
      backendLabel={handBackendLabel}
      focusBoxEnabled={classifier.useFocusBox}
      handMode={handMode}
      effectsEnabled={effectsOn}
      liveHandsRef={liveHandsRef}
      sampleCounts={classifier.sampleCounts}
      trainAccuracy={classifier.trainAccuracy}
    />
  )


  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AIToolbar
        onBack={() => router.push('/')}
        onSave={() => classifier.saveModel(projectName || 'gesture-model')}
        isTrained={classifier.modelReady}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onNewProject={() => setShowProjectPopup(true)}
        onOpenProject={handleOpenProject}
      />
{trainingPopup && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: 'rgba(0,0,0,0.50)' }}
  >
    <div className="flex flex-col items-center justify-center bg-[#f0f0f0] w-[90vw] min-h-[375px] max-w-[450px] rounded-xl shadow-[2px_3px_8px_rgba(0,0,0,0.75)] p-6">

{/* TRAINING */}
{isTraining && (
  <>
    <img
      src={trainmodel.src}
      alt="Training Model"
      className="w-[380px] h-[380px] object-contain"
    />

    <div className="text-center text-black font-bold text-[28px] font-['Nunito'] -mt-12">
      Training Model...
    </div>
  </>
)}

{/* SUCCESS GIF */}
{isTrained && !showResultScreen && (
  <>
    <div className="relative flex items-center justify-center">
      <img
        src={trainsucessgif.src}
        alt="Confetti"
        className="w-[360px] h-[360px] object-contain"
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-[32px] font-bold text-center">
          Model Ready!
        </div>
      </div>
    </div>
  </>
)}

{/* FINAL PNG */}
{showResultScreen && (
  <>
    <img
      src={modelready.src}
      alt="Results Ready"
      className="w-[340px] h-[340px] object-contain"
    />

    <div className="text-center text-black font-bold text-[24px] font-['Nunito'] -mt-8">
      Tap "OK" to see results
    </div>

    <button
      className="mt-4 bg-[#2EED08] rounded-2xl px-6 py-3 text-white text-[18px] font-bold"
      onClick={() => setTrainingPopup(false)}
    >
      OK
    </button>
  </>
)}
</div></div>)}
      <main
        className="flex-1 flex relative z-20 justify-center items-center gap-6 p-6 overflow-hidden"
        style={{
          backgroundColor: '#efefef',
          backgroundImage: 'radial-gradient(circle, #c0c0c0 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Left: camera panel*/}
        <div className="flex justify-center items-center w-[clamp(320px,30vw,480px)] shrink-0 mx-auto">
          <div className="w-[clamp(320px,30vw,480px)] flex flex-col">

            {!showSettings ? (<>

              {/* 1-hand / 2-hand toggle */}
              <div className="w-[clamp(240px,21vw,340px)] flex mb-3 rounded-lg overflow-hidden border-2 border-black">
                <button
                  onClick={() => handleSetHandMode(1)}
                  className={`flex-1 py-2 text-sm font-extrabold transition-colors ${handMode === 1 ? 'bg-black text-[#F6EC24]' : 'bg-[#F6EC24] text-black'}`}>
                  ✋ 1 HAND
                </button>
                <button
                  onClick={() => handleSetHandMode(2)}
                  className={`flex-1 py-2 text-sm font-extrabold transition-colors ${handMode === 2 ? 'bg-black text-[#F6EC24]' : 'bg-[#F6EC24] text-black'}`}>
                  🙌 2 HANDS
                </button>
              </div>

              {/*Class Label*/}
              <div
                className="w-[clamp(240px,21vw,340px)] h-[clamp(40px,3vw,56px)] border-t-2 border-l-2 border-r-2 border-black rounded-t-lg flex items-center pl-4 font-bold"
                style={{ background: selectedClass ? selectedColor : '#d1d5db' }}>
                {selectedClass ? selectedClass.name : 'Select Class'}
              </div>

              {/* Camera Card */}
              <div
                className="w-full bg-white border-2 border-black rounded-tr-xl rounded-br-xl rounded-bl-xl p-3">
                {/* Video / Upload zone */}
                <div
                  ref={camStageRef}
                  className="relative w-full aspect-video mx-auto rounded-lg overflow-hidden bg-black"
                  style={isFullscreen ? { width: '100vw', height: '100vh', aspectRatio: 'auto', borderRadius: 0 } : undefined}
                >
                  {inputMode === 'camera' ? (
                    <HandTracker
                      ref={handTrackerRef}
                      onStats={handleStats}
                      onLandmarks={handleLandmarks}
                      prediction={null}
                      isCapturing={isCapturing}
                      targetFps={typeof fps === 'number' && fps > 0 ? fps : undefined}
                      backendMode={handBackend}
                      backendLabel={handBackendLabel}
                      focusBoxEnabled={classifier.useFocusBox}
                      handMode={handMode}
                      effectsEnabled={effectsOn}
                      idle={!isCapturing}
                      onLightingWarn={setLightingWarnActive}
                    />
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragEnter={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setDragOver(false)
                        handleFiles(e.dataTransfer.files)
                      }}
                      className={`w-full h-full bg-[#F6EC24] cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors select-none
                        ${dragOver ? 'ring-4 ring-black bg-yellow-300' : ''}
                        ${!selectedClassId ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-6xl font-black leading-none">+</span>
                      <span className="font-bold text-center text-black leading-tight">
                        Add or Drop files<br />from your computer
                      </span>
                    </div>
                  )}

                  {/* 2-hand: both-hands indicator (hidden while a lighting warning shows) */}
                  {handMode === 2 && inputMode === 'camera' && countdown === null && !lightingWarnActive && (
                    <div className={`absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white pointer-events-none z-10 ${bothHands ? 'bg-green-500/90' : 'bg-slate-600/90'}`}>
                      {bothHands ? 'BOTH HANDS ✓' : 'SHOW BOTH HANDS'}
                    </div>
                  )}

                  {/* countdown overlay */}
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white font-black z-20 pointer-events-none" style={{ fontSize: isFullscreen ? 180 : 96 }}>
                      {countdown}
                    </div>
                  )}

                  {/* capture flash — brief white pulse each time a frame is recorded */}
                  {captureFlash && (
                    <div className="absolute inset-0 z-30 pointer-events-none border-4 border-white" style={{ boxShadow: 'inset 0 0 60px rgba(255,255,255,0.7)' }} />
                  )}

                  {/* fullscreen toggle */}
                  {inputMode === 'camera' && (
                    <button
                      onClick={toggleFullscreen}
                      className="absolute top-2 right-2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-lg px-3 py-1.5 text-xs font-bold"
                      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen recording'}
                    >
                      {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
                    </button>
                  )}

                  {/* 2-hand rainbow effects toggle */}
                  {handMode === 2 && inputMode === 'camera' && (
                    <button
                      onClick={() => setEffectsOn(v => !v)}
                      className={`absolute top-12 right-2 z-30 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${effectsOn ? 'bg-fuchsia-500/90 text-white' : 'bg-black/60 hover:bg-black/80 text-white'}`}
                      title="Rainbow effects (visual only — doesn't affect the model)"
                    >
                      {effectsOn ? '✨ Effects ON' : '✨ Effects'}
                    </button>
                  )}


                  {/* fullscreen recording controls — record without leaving the big view */}
                  {isFullscreen && inputMode === 'camera' && (
                    <>
                      <div
                        className="absolute top-4 left-4 z-30 px-4 py-2 rounded-lg font-bold text-black text-lg"
                        style={{ background: selectedClass ? selectedColor : '#d1d5db' }}
                      >
                        {selectedClass ? selectedClass.name : 'Select a class first'}
                      </div>
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                        <RecordingControls
                          variant="fullscreen"
                          mode="auto"
                          onModeChange={() => {}}
                          isCapturing={isCapturing}
                          countdown={countdown}
                          disabled={!selectedClassId}
                          onHoldStart={startHoldCapture}
                          onHoldStop={stopCapture}
                          onAutoStart={startCountdownRecord}
                          onStop={stopCountdownRecord}
                          isHolding={() => recorder.currentMode() === 'hold'}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Hidden file input — triggered by upload zone click and the upload toggle */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files)
                    e.target.value = ''
                  }}
                />


              </div>
            </>

            ) : (<>
              <div className="w-full min-h-[19vw] bg-white border-2 border-black rounded-xl p-4 flex flex-col">

                <RecordingSettings
                  fps={fps}
                  onFps={setFps}
                  delay={delay}
                  onDelay={setDelay}
                  duration={duration}
                  onDuration={setDuration}
                  onClose={() => setShowSettings(false)}
                  onReset={() => { setDelay(0); setDuration(0); setHold(true); setFps(30) }}
                >
                  {/* Detection engine (GPU / CPU) — shared across all AI screens */}
                  <BackendSelector preference={preference} onChange={setPreference} capability={capability} />

                  {/* Hand-only: Focus Box training toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-m">Focus Box Training</span>
                    <button
                      onClick={() => classifier.setUseFocusBox(!classifier.useFocusBox)}
                      className={`w-[60px] h-[30px] rounded-full flex items-center p-1 transition-colors duration-200 ${classifier.useFocusBox ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-[22px] h-[22px] bg-white rounded-full shadow-md transform transition-transform duration-200 ${classifier.useFocusBox ? 'translate-x-[30px]' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </RecordingSettings>

              </div>
            </>
            )}

            <div className="w-full flex items-center justify-center mt-4">

              {!showSettings ? (
                <div className="flex items-center gap-4">

                  {/* START / STOP — Hold | Auto (shared, uniform with pose) */}
                  {inputMode === 'camera' && (
                    <RecordingControls
                      mode={hold ? 'hold' : 'auto'}
                      onModeChange={(m) => setHold(m === 'hold')}
                      showModeSwitch={false}
                      isCapturing={isCapturing}
                      countdown={countdown}
                      disabled={!selectedClassId}
                      onHoldStart={startHoldCapture}
                      onHoldStop={stopCapture}
                      onAutoStart={startCountdownRecord}
                      onStop={stopCountdownRecord}
                      isHolding={() => recorder.currentMode() === 'hold'}
                    />
                  )}

                  {inputMode === 'upload' && <>
                    <button
                      disabled={!selectedClassId}
                      onClick={() => { fileRef.current?.click() }}

                      className={`w-[140px] h-[50px] rounded-lg font-black border-2 border-transparent hover:border-black transition-all duration-200 select-none bg-[#F6EC24] text-black`}
                    >
                      UPLOAD
                    </button>
                    <input
                      ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleUploadImage(selectedClassId!, f); e.target.value = '' } }}
                    />
                  </>
                  }

                  {/* 3 DOT MENU — holds the Hold|Auto switch + Settings */}
                  {inputMode === "camera" && (
                    <CaptureMenu
                      mode={hold ? 'hold' : 'auto'}
                      onModeChange={(m) => setHold(m === 'hold')}
                      showModeSwitch={!(isCapturing || countdown !== null)}
                      onOpenSettings={() => setShowSettings(true)}
                    />
                  )}

                </div>
              ) : (
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-[140px] h-[50px] rounded-lg font-black border-2 border-transparent hover:border-black transition-all duration-200 bg-green-500 text-white"
                >
                  SAVE
                </button>
              )}

            </div>

          </div>
        </div>

        {/* Middle: training panel  */}
        <div className="w-[25vw] shrink-0  w-[clamp(300px,28vw,450px)] mx-auto">
          <TrainingPanel
            classes={classes}
            sampleCounts={classifier.sampleCounts}
            minSamples={classifier.MIN_SAMPLES}
            trainingStatus={classifier.trainingStatus}
            trainProgress={classifier.trainProgress}
            trainAccuracy={classifier.trainAccuracy}
            trainError={classifier.trainError}
            prediction={null}
            images={images}
            selectedClassId={selectedClassId}
            classColors={classColors}
            defaultColors={DEFAULT_CLASS_COLORS}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onRenameClass={handleRenameClass}
            onClearSamples={handleClearSamples}
            onCaptureOne={handleCaptureOne}
            onDeleteSample={handleDeleteSample}
            onUploadImage={handleUploadImage}
            onSelectClass={handleSelectClass}
            onChangeColor={handleChangeColor}
            onActivateCamera={(id) => {
              handleSelectClass(id)
              if (isCapturing) stopCapture()
              setInputMode('camera')
            }}
            onActivateUpload={(id) => { // upload
              handleSelectClass(id)
              if (isCapturing) stopCapture()
              setInputMode('upload')
            }}
            onTrain={handleTrain}
            onSave={classifier.saveModel}
            onReset={handleReset}
          />
        </div>

        {/* ── Right: controls panel ──────────────────────────────────── */}
        <div className="w-[clamp(320px,30vw,480px)] shrink-0 mx-auto">
          <ControlsPanel
            classes={classes}
            classColors={classColors}
            defaultColors={DEFAULT_CLASS_COLORS}
            onStart={() => setPage('predict')}
            onExportToBlockly={handleExportToBlockly}
            trainingStatus={classifier.trainingStatus}
            currentPage={"main"}
          />
        </div>
      </main>

      <ProjectPopup
        isOpen={showProjectPopup}
        onClose={() => setShowProjectPopup(false)}
        onCreate={handleCreateProject}
      />
    </div>
  )
}
