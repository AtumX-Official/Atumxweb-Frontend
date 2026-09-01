import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PoseTracker, { type Landmark, type PoseTrackerHandle } from './components/PoseTracker'
import AIToolbar from './components/AIToolbar'
import ProjectPopup from './components/ProjectPopup'
import { usePoseClassifier, type GestureClass, type Prediction } from './hooks/usePoseClassifier'
import { useSampleRecorder } from './hooks/useSampleRecorder'
import RecordingSettings from './components/RecordingSettings'
import RecordingControls from './components/RecordingControls'
import CaptureMenu from './components/CaptureMenu'
import BackendSelector from './components/BackendSelector'
import { useBackendPreference } from './hooks/useBackendPreference'
import LayersReveal, { POSE_LAYERS } from './components/LayersReveal'
import { uniqueClassName } from './utils/uniqueClassName'
import { POSE_FEATURE_DIM } from './utils/normalizeLandmarks'
import { useRouter } from 'next/navigation'

const DEFAULT_CLASS_COLORS = ['#36D3FF', '#F6268B', '#a78bfa', '#60a5fa', '#fb923c', '#34d399', '#f87171', '#fbbf24']

export default function PoseApp() {
  const router = useRouter()
  const classifier = usePoseClassifier()
  // Capability-based backend routing (GPU→JS, no-GPU→Python) with manual override.
  const { capability, preference, setPreference, backend, labelFor } = useBackendPreference()
  const poseBackendLabel = labelFor(backend)
  // Shared recording engine (hold / timed / 3·2·1 countdown) used across all
  // three modalities; replaces the per-screen capture state machine.
  const recorder = useSampleRecorder()
  const { isCapturing, countdown, captureFlash } = recorder

  const [classes, setClasses] = useState<GestureClass[]>([])
  const [images, setImages] = useState<Record<string, string[]>>({})
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [classColors, setClassColors] = useState<Record<string, string>>({})
  const [thumbOffset, setThumbOffset] = useState(0)

  // Settings
  const [showSettings, setShowSettings] = useState(false)
  const [fps, setFps] = useState<number | ''>(30)
  const [hold, setHold] = useState(true)
  const [delay, setDelay] = useState<number | ''>(0)
  const [duration, setDuration] = useState<number | ''>(0)

  // Prediction Page
  const [isTesting, setIsTesting] = useState(false)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [showLayers, setShowLayers] = useState(false)
  // latest raw pose landmarks — fed live into the layers reveal (skeleton + numbers)
  const livePoseRef = useRef<Landmark[]>([])

  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [showProjectPopup, setShowProjectPopup] = useState(false)
  // Cosmetic lag-shadow trail (visual only — never affects detection/training)
  const [effectsOn, setEffectsOn] = useState(false)

  // Fullscreen camera mode
  const camStageRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  function toggleFullscreen() {
    const el = camStageRef.current
    if (!el) return
    // Layout is driven off state directly so fullscreen works even where the native
    // Fullscreen API is blocked/rejected (packaged app on some laptops). Native call
    // is best-effort. (See the matching fix in the hand screen's App.tsx.)
    const next = !isFullscreen
    setIsFullscreen(next)
    if (next) el.requestFullscreen?.().catch(() => {})
    else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])



  const classIdCounter = useRef(0)
  const poseTrackerRef = useRef<PoseTrackerHandle>(null)
  const latestRef = useRef<{
    classifier: ReturnType<typeof usePoseClassifier>
    setPrediction: React.Dispatch<React.SetStateAction<Prediction | null>>
    addImage: (classId: string, imageUrl: string) => void
    isTesting: boolean
    recorder: typeof recorder
  } | null>(null)

  // Selected Class details
  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null
  const selectedImages = selectedClassId ? (images[selectedClassId] ?? []) : []
  const selectedColor = selectedClassId
    ? (classColors[selectedClassId] ?? DEFAULT_CLASS_COLORS[classes.findIndex((c) => c.id === selectedClassId) % DEFAULT_CLASS_COLORS.length])
    : '#36D3FF'

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

  // Rename updates freely on each keystroke (below); on blur we normalize so the
  // final name can't duplicate another class (which would corrupt save/load).
  function handleCommitClassName(id: string) {
    setClasses((prev) => {
      const cur = prev.find((c) => c.id === id)
      if (!cur) return prev
      const unique = uniqueClassName(cur.name, prev.filter((c) => c.id !== id).map((c) => c.name))
      return unique === cur.name ? prev : prev.map((c) => (c.id === id ? { ...c, name: unique } : c))
    })
  }

  function handleDeleteClass(id: string) {
    classifier.removeClassData(id)
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setImages((prev) => { const n = { ...prev }; delete n[id]; return n })
    setClassColors((prev) => { const n = { ...prev }; delete n[id]; return n })
    if (selectedClassId === id) { setSelectedClassId(null); setThumbOffset(0) }
  }

  function handleRenameClass(id: string, name: string) {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
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

  function handleSelectClass(id: string) {
    setSelectedClassId(id)
    setThumbOffset(0)
  }

  // Pre-initialize Class 1 and Class 2
  useEffect(() => {
    handleAddClass('Class 1')
    handleAddClass('Class 2')
    // handleAddClass selects each class as it's added, so Class 2 ends up selected.
    // Select Class 1 (the first id) — matching the 1-hand / 2-hand classifiers.
    setSelectedClassId('cls_1')
  }, [])

  const handleExportToBlockly = useCallback(async () => {
    try {
      if (!classifier.isSavedToDisk) {
        await classifier.saveModel(projectName || 'pose-model')
      }
      await classifier.exportToBlockly(projectName || 'pose-model')
      router.push('/blocks')
    } catch (err) {
      console.error('Failed to export pose model to Blockly:', err)
    }
  }, [classifier, projectName, router])

  latestRef.current = { classifier, setPrediction, addImage, isTesting, recorder }

  // Handlers for incoming landmarks vector (99 elements)
  const handleLandmarks = useCallback((vector: Float32Array) => {
    const { classifier: clf, addImage: addImg, isTesting: testingActive, recorder: rec } = latestRef.current!

    // Shared recorder decides when a sample is due (hold / timed / countdown).
    const { capture, classId } = rec.tick(performance.now())
    if (capture) {
      clf.addSample(classId, vector)
      const snap = poseTrackerRef.current?.snapshot() ?? ''
      if (snap) addImg(classId, snap)
    }

    // Predict if testing is active
    if (clf.modelReady && testingActive) {
      clf.predict(vector).then((res) => {
        if (res) setPrediction(res)
      })
    }
  }, [])

  const handleStats = useCallback((stats: { fps: number; landmarks: Landmark[] }) => {
    // keep the freshest pose landmarks for the layers reveal (skeleton + numbers)
    livePoseRef.current = stats.landmarks ?? []
    // If no landmarks detected, reset predictions in predict mode
    const { classifier: clf, isTesting: testingActive } = latestRef.current!
    if (clf.modelReady && testingActive && (!stats.landmarks || stats.landmarks.length === 0)) {
      setPrediction(null)
    }
  }, [])

  // ── Recording controls (thin wrappers over the shared recorder) ──────────
  const numOr = (v: number | '') => (typeof v === 'number' && v > 0 ? v : undefined)

  function stopCapture() {
    recorder.stop()
  }
  function startHoldCapture() {
    if (!selectedClassId) return
    recorder.startHold(selectedClassId)
  }
  function startCountdownCapture() {
    if (!selectedClassId) return
    recorder.startCountdown(selectedClassId, { delaySec: numOr(delay), durationN: numOr(duration), defaultDurationN: 30 })
  }

  const handleTrain = useCallback(() => {
    classifier.trainModel(classes)
  }, [classes, classifier])

  const handleReset = useCallback(() => {
    classifier.resetModel()
    setPrediction(null)
    setIsTesting(false)
  }, [classifier])

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
      const res = await (window as any).api.file.open('poseClassifier')
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

  useEffect(() => {
    if (isTraining) setTrainingPopup(true)
  }, [isTraining])

  const maxThumb = Math.max(0, selectedImages.length - 5)
  const clampedOffset = Math.min(thumbOffset, maxThumb)

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-800 bg-[#f3f4f6]">
      <AIToolbar
        onBack={() => router.push('/')}
        onSave={() => classifier.saveModel(projectName || 'pose-model')}
        isTrained={classifier.modelReady}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onNewProject={() => setShowProjectPopup(true)}
        onOpenProject={handleOpenProject}
      />

      {/* Training reveal — "how your model learns" */}
      <LayersReveal
        open={trainingPopup}
        mode="train"
        config={POSE_LAYERS}
        classes={classes}
        colorOf={(id, idx) => classColors[id] ?? DEFAULT_CLASS_COLORS[idx % DEFAULT_CLASS_COLORS.length]}
        sampleCounts={classifier.sampleCounts}
        isTraining={isTraining}
        isTrained={isTrained}
        trainProgress={classifier.trainProgress}
        trainAccuracy={classifier.trainAccuracy}
        getSubject={() => (livePoseRef.current.length ? livePoseRef.current : null)}
        getVideo={() => poseTrackerRef.current?.getVideo() ?? null}
        subjectCount={1}
        onClose={() => setTrainingPopup(false)}
        onCancel={() => setTrainingPopup(false)}
      />

      {/* Main Content Layout */}
      <main
        className="flex-1 flex relative z-20 justify-center items-stretch gap-6 p-6 overflow-hidden"
        style={{
          backgroundColor: '#efefef',
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px'
        }}
      >

        {/* COLUMN 1: Pose Classes list (Left Card) */}
        <div className="flex flex-col w-[320px] shrink-0 gap-4 mx-auto min-h-0">
          <div className="flex-1 min-h-0 bg-white rounded-2xl border-2 border-black p-5 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black border-b-2 border-slate-100 pb-3 mb-4 tracking-wider flex items-center justify-between">
              <span>POSE CLASSES</span>
              <button
                onClick={() => handleAddClass(`Class ${classes.length + 1}`)}
                className="bg-black text-[#F6EC24] font-black text-sm px-3 py-1.5 rounded-lg border hover:bg-slate-900 transition-colors"
              >
                + ADD
              </button>
            </h2>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
              {classes.map((cls, idx) => {
                const count = classifier.sampleCounts[cls.id] || 0
                const isSelected = selectedClassId === cls.id
                const color = classColors[cls.id] || DEFAULT_CLASS_COLORS[idx % DEFAULT_CLASS_COLORS.length]

                return (
                  <div
                    key={cls.id}
                    onClick={() => handleSelectClass(cls.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-black bg-slate-50' : 'border-slate-200 hover:border-slate-400 bg-white'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-black" style={{ backgroundColor: color }} />
                        <input
                          type="text"
                          value={cls.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleRenameClass(cls.id, e.target.value)}
                          onBlur={() => handleCommitClassName(cls.id)}
                          className="font-bold text-sm bg-transparent outline-none border-b border-transparent focus:border-slate-500 w-28"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClass(cls.id)
                        }}
                        className="text-slate-400 hover:text-red-500 text-xs font-black"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span className="font-mono">{count} Pose Samples</span>
                      {count > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClearSamples(cls.id)
                          }}
                          className="text-xs hover:underline text-red-400"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Quick webcam activation */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectClass(cls.id)
                          document.getElementById(`file-input-${cls.id}`)?.click()
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-[0.7rem] font-bold py-1.5 rounded-md border border-slate-300 transition-colors"
                      >
                        📁 Upload
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectClass(cls.id)
                          setIsTesting(false)
                        }}
                        className="bg-[#36D3FF] hover:bg-[#20bdff] text-[0.7rem] font-bold py-1.5 rounded-md border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        🎥 Webcam
                      </button>
                    </div>

                    {/* Hidden inputs for uploading directly to this class */}
                    <input
                      id={`file-input-${cls.id}`}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (!e.target.files) return
                        for (let f of Array.from(e.target.files)) {
                          // Standard detect placeholder vector for upload
                          const dummyVector = new Float32Array(POSE_FEATURE_DIM)
                          classifier.addSample(cls.id, dummyVector)
                          // Read file URL to save preview thumbnail
                          const reader = new FileReader()
                          reader.onload = (ev) => {
                            if (ev.target?.result) addImage(cls.id, ev.target.result as string)
                          }
                          reader.readAsDataURL(f)
                        }
                        e.target.value = ''
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Webcam Stream & Training controls (Center Column) */}
        <div className="flex-1 flex flex-col gap-4 max-w-xl mx-auto">

          {/* Webcam stream card */}
          <div className="bg-white rounded-2xl border-2 border-black p-4 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-3.5">
              <span
                className="px-4 py-1 rounded-full text-xs font-black border border-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                style={{ backgroundColor: selectedClass ? selectedColor : '#e2e8f0' }}
              >
                {selectedClass ? `${selectedClass.name} Preview` : 'Camera Preview'}
              </span>

              {selectedClassId && !isTesting && (
                <CaptureMenu
                  mode={hold ? 'hold' : 'auto'}
                  onModeChange={(m) => setHold(m === 'hold')}
                  showModeSwitch={!(isCapturing || countdown !== null)}
                  onOpenSettings={() => setShowSettings(true)}
                  dropUp={false}
                />
              )}
            </div>

            {/* Main view container */}
            <div
              ref={camStageRef}
              className="relative aspect-video rounded-xl bg-black overflow-hidden border border-black shadow-[inset_0px_4px_10px_rgba(0,0,0,0.5)]"
              style={isFullscreen ? { width: '100vw', height: '100vh', aspectRatio: 'auto', borderRadius: 0 } : undefined}
            >
              {!showSettings && (
                <button
                  onClick={toggleFullscreen}
                  className="absolute top-2 right-2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-lg px-3 py-1.5 text-xs font-bold"
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
                </button>
              )}
              {!showSettings && (
                <button
                  onClick={() => setEffectsOn((v) => !v)}
                  className={`absolute top-12 right-2 z-30 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${effectsOn ? 'bg-fuchsia-500/90 text-white' : 'bg-black/60 hover:bg-black/80 text-white'}`}
                  title="Lag-shadow trail (visual only — doesn't affect detection)"
                >
                  {effectsOn ? '✨ Effects ON' : '✨ Effects'}
                </button>
              )}
              {!showSettings ? (
                !isTesting ? (
                  <PoseTracker
                    ref={poseTrackerRef}
                    onStats={handleStats}
                    onLandmarks={handleLandmarks}
                    prediction={null}
                    isCapturing={isCapturing}
                    targetFps={typeof fps === 'number' && fps > 0 ? fps : undefined}
                    backendMode={backend}
                    backendLabel={poseBackendLabel}
                    idle={!isCapturing && !isTesting}
                    effectsEnabled={effectsOn}
                  />
                ) : (
                  <PoseTracker
                    ref={poseTrackerRef}
                    onStats={handleStats}
                    onLandmarks={handleLandmarks}
                    prediction={prediction}
                    isCapturing={false}
                    targetFps={typeof fps === 'number' && fps > 0 ? fps : undefined}
                    backendMode={backend}
                    backendLabel={poseBackendLabel}
                    idle={!isCapturing && !isTesting}
                    effectsEnabled={effectsOn}
                  />
                )
              ) : (
                /* Shared settings panel (uniform across hand + pose) */
                <div className="absolute inset-0 bg-white p-5 overflow-y-auto">
                  <RecordingSettings
                    fps={fps}
                    onFps={setFps}
                    delay={delay}
                    onDelay={setDelay}
                    duration={duration}
                    onDuration={setDuration}
                    onClose={() => setShowSettings(false)}
                    onReset={() => { setFps(30); setHold(true); setDelay(0); setDuration(0) }}
                  >
                    {/* Detection engine (GPU / CPU) — shared across all AI screens */}
                    <BackendSelector preference={preference} onChange={setPreference} capability={capability} />
                  </RecordingSettings>
                </div>
              )}

              {/* Capture pulse + hands-free countdown overlay */}
              {captureFlash && <div className="absolute inset-0 bg-white/40 pointer-events-none" />}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-7xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{countdown}</span>
                </div>
              )}

              {/* Fullscreen record controls (Auto / hands-free) — parity with hand */}
              {isFullscreen && !showSettings && !isTesting && (
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
                      onAutoStart={startCountdownCapture}
                      onStop={stopCapture}
                      isHolding={() => recorder.currentMode() === 'hold'}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Slider for snapshots */}
            {selectedImages.length > 0 && (
              <div className="mt-3">
                <input
                  type="range"
                  min={0}
                  max={maxThumb}
                  value={clampedOffset}
                  onChange={(e) => setThumbOffset(Number(e.target.value))}
                  disabled={maxThumb === 0}
                  className="thumb-slider block w-full h-[8px] my-1"
                />

                {/* Thumbnails row */}
                <div className="flex gap-2 justify-between mt-2 overflow-x-auto">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const img = selectedImages[clampedOffset + idx]
                    return (
                      <div key={idx} className="w-[88px] h-[52px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        {img && <img src={img} className="w-full h-full object-cover" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Capture triggers — Hold | Auto (shared, uniform with hand) */}
            {!showSettings && !isTesting && selectedClassId && (
              <div className="mt-4">
                <RecordingControls
                  mode={hold ? 'hold' : 'auto'}
                  onModeChange={(m) => setHold(m === 'hold')}
                  showModeSwitch={false}
                  isCapturing={isCapturing}
                  countdown={countdown}
                  disabled={!selectedClassId}
                  onHoldStart={startHoldCapture}
                  onHoldStop={stopCapture}
                  onAutoStart={startCountdownCapture}
                  onStop={stopCapture}
                  isHolding={() => recorder.currentMode() === 'hold'}
                />
              </div>
            )}
          </div>

          {/* Model toggle and Training Card */}
          <div className="bg-white rounded-2xl border-2 border-black p-5 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-4">


            {/* Error alerts if any */}
            {classifier.trainError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl leading-relaxed">
                ⚠️ {classifier.trainError}
              </div>
            )}

            {/* Train Trigger */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleReset}
                className="bg-black text-[#F6EC24] font-black py-3 rounded-xl border-2 border-transparent hover:border-black transition-all hover:bg-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs tracking-widest uppercase"
              >
                Reset Model
              </button>
              <button
                onClick={handleTrain}
                disabled={classes.length < 2 || isTraining}
                className={`font-black py-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs tracking-widest uppercase transition-all ${isTrained ? 'bg-[#2EED08] text-white hover:bg-green-600' : 'bg-[#F6EC24] text-black hover:bg-yellow-300'
                  }`}
              >
                {isTraining ? 'TRAINING...' : isTrained ? 'RETRAIN MODEL' : 'TRAIN MODEL'}
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Testing Panel (Right Column Card) */}
        <div className="flex flex-col w-[320px] shrink-0 gap-4 mx-auto">
          <div className="flex-1 bg-white rounded-2xl border-2 border-black p-5 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black border-b-2 border-slate-100 pb-3 mb-4 tracking-wider uppercase">
              Testing Workspace
            </h2>

            {!isTrained ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl mb-4">🤖</span>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  You must collect pose landmarks and **Train a Model** on the left before you can test it here.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <p className="text-xs text-slate-400 font-bold leading-normal">
                  Model successfully trained! Turn on real-time testing to run pose landmark coordinates through the custom TFJS network.
                </p>

                <button
                  onClick={() => setIsTesting(!isTesting)}
                  className={`w-full py-3 rounded-xl font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-xs tracking-wider transition-all ${isTesting ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#2EED08] text-white hover:bg-green-600'
                    }`}
                >
                  {isTesting ? 'Stop Real-Time Predict' : 'Start Real-Time Predict'}
                </button>

                <button
                  onClick={handleExportToBlockly}
                  className="w-full py-3 rounded-xl font-black border-2 border-black bg-[#F6EC24] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-xs tracking-wider transition-all hover:bg-yellow-300"
                >
                  Export to Blocks
                </button>

                <button
                  onClick={() => { setIsTesting(true); setShowLayers(true) }}
                  className="w-full py-3 rounded-xl font-black border-2 border-black bg-[#04050d] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-xs tracking-wider transition-all hover:scale-[1.02]"
                  title="Watch your pose travel through the model's layers"
                >
                  🔬 View in Layers
                </button>

                {/* Real-Time Predictions layout */}
                {isTesting && prediction && (() => {
                  const confVal = prediction.className ? Math.round(prediction.confidence * 100) : 0
                  return (
                    <div className="mt-4 border-2 border-black rounded-xl p-4 bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-[0.62rem] text-slate-400 font-bold uppercase tracking-widest">Active Output Class</span>
                      <div className="text-lg font-black text-slate-800 mb-3">{prediction.className || 'Undetected'}</div>

                      <span className="text-[0.62rem] text-slate-400 font-bold uppercase tracking-widest">Prediction Confidence</span>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1 h-3.5 bg-slate-200 rounded-full border border-slate-300 overflow-hidden">
                          <div
                            className="h-full bg-[#36D3FF] transition-[width] duration-150"
                            style={{ width: `${confVal}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold">{confVal}%</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </div>


      </main>

      <LayersReveal
        open={showLayers}
        mode="test"
        config={POSE_LAYERS}
        classes={classes}
        colorOf={(id, idx) => classColors[id] ?? DEFAULT_CLASS_COLORS[idx % DEFAULT_CLASS_COLORS.length]}
        sampleCounts={classifier.sampleCounts}
        isTraining={false}
        isTrained={true}
        trainProgress={100}
        trainAccuracy={classifier.trainAccuracy}
        getSubject={() => (livePoseRef.current.length ? livePoseRef.current : null)}
        getVideo={() => poseTrackerRef.current?.getVideo() ?? null}
        livePrediction={prediction}
        onClose={() => setShowLayers(false)}
      />

      <ProjectPopup
        isOpen={showProjectPopup}
        onClose={() => setShowProjectPopup(false)}
        onCreate={handleCreateProject}
      />
    </div>
  )
}
