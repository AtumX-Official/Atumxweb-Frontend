"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PoseTracker, { type Landmark, type PoseTrackerHandle } from './components/PoseTracker'
import TrainingPanel from './components/TrainingPanel'
import ConfidenceList from './components/ConfidenceList'
import TestInputPanel, { UploadStage, type TestInputMode } from './components/TestInputPanel'
import ControlsPanel from './components/ControlsPanel'
import AIToolbar from './components/AIToolbar'
import ProjectPopup from './components/ProjectPopup'
import NoticePopup from './components/NoticePopup'
import { useNotice } from './hooks/useNotice'
import { usePoseClassifier, type GestureClass, type Prediction } from './hooks/usePoseClassifier'
import { useSampleRecorder, type SampleRecorder } from './hooks/useSampleRecorder'
import RecordingSettings from './components/RecordingSettings'
import RecordingControls from './components/RecordingControls'
import CaptureMenu from './components/CaptureMenu'
import TrainingStatusPopup from './components/TrainingStatusPopup'
import trainposegif from './icons/trainpose.gif'
import readyposegif from './icons/readyposegif.gif'
import posepng from './icons/posepng.png'
import BackendSelector from './components/BackendSelector'
import { useBackendPreference } from './hooks/useBackendPreference'
import LayersReveal, { POSE_LAYERS } from './components/LayersReveal'
import { uniqueClassName } from './utils/uniqueClassName'
import { openProjectFile, projectNameFromFile } from './utils/projectFile'
import { blocksUrlFrom, clearAiSnapshot, peekAiSnapshot, stashAiSnapshot } from './utils/blocksHandoff'
import type { ModelBundle } from './utils/modelIO'

const DEFAULT_CLASS_COLORS = ['#36D3FF', '#F6268B', '#a78bfa', '#60a5fa', '#fb923c', '#34d399', '#f87171', '#fbbf24']

import { detectPoseInImage } from './utils/imageDetector'



interface LatestRef {
  classifier: ReturnType<typeof usePoseClassifier>
  setPrediction: React.Dispatch<React.SetStateAction<Prediction | null>>
  addImage: (classId: string, imageUrl: string) => void
  isTesting: boolean
  recorder: SampleRecorder
}

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
  const imagesRef = useRef(images)
  imagesRef.current = images
  // Every save carries the class-card pictures so an opened project shows them again.
  const saveProject = () => classifier.saveModel(projectName || 'pose-model', imagesRef.current)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [classColors, setClassColors] = useState<Record<string, string>>({})
  const [, setThumbOffset] = useState(0)

  // Settings
  const [showSettings, setShowSettings] = useState(false)
  const [fps, setFps] = useState<number | ''>(30)
  const [hold, setHold] = useState(true)
  const [delay, setDelay] = useState<number | ''>(0)
  const [duration, setDuration] = useState<number | ''>(0)

  // Camera / upload input source for the left panel
  const [inputMode, setInputMode] = useState<'camera' | 'upload' | null>(null)
  // Preview of the last image picked in upload mode (null = show the drop zone)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const uploadPreviewRef = useRef<string | null>(null)
  function showUploadPreview(file: File | null) {
    if (uploadPreviewRef.current) URL.revokeObjectURL(uploadPreviewRef.current)
    uploadPreviewRef.current = file ? URL.createObjectURL(file) : null
    setUploadPreview(uploadPreviewRef.current)
  }
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Live prediction (driven by the START button in the controls panel)
  const [isTesting, setIsTesting] = useState(false)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [showLayers, setShowLayers] = useState(false)
  // latest raw pose landmarks — fed live into the layers reveal (skeleton + numbers)
  const livePoseRef = useRef<Landmark[]>([])

  const [projectName, setProjectName] = useState('')
  const [, setProjectDesc] = useState('')
  const [showProjectPopup, setShowProjectPopup] = useState(false)
  const { notice, showNotice, dismissNotice } = useNotice()
  // Bumped on every new project. The training panel keeps its own per-class state
  // (which classes are disabled) keyed by class id, and ids restart at cls_1, so the
  // panel is remounted rather than inheriting the last project's toggles.
  const [projectSession, setProjectSession] = useState(0)
  // Cosmetic lag-shadow trail (visual only — never affects detection/training)
  const [effectsOn, setEffectsOn] = useState(false)

  // Fullscreen camera mode
  const camStageRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const classIdCounter = useRef(0)
  const poseTrackerRef = useRef<PoseTrackerHandle>(null)
  const manualCaptureRef = useRef<{ classId: string } | null>(null)
  const latestRef = useRef<LatestRef | null>(null)

  // Selected Class details
  // Classes switched off in the training panel keep their samples but must not
  // receive new ones, so recording only ever targets an enabled selection.
  const [disabledIds, setDisabledIds] = useState<string[]>([])
  const disabledRef = useRef<string[]>([])
  disabledRef.current = disabledIds
  const recordTargetId = selectedClassId && !disabledIds.includes(selectedClassId) ? selectedClassId : null
  const allClassesDisabled = classes.length > 0 && classes.every((c) => disabledIds.includes(c.id))
  // TrainingPanel is controlled: it reads the disabled set and asks us to toggle.
  const disabledClassIds = useMemo(() => new Set(disabledIds), [disabledIds])
  const handleToggleClassEnabled = useCallback((id: string) => {
    setDisabledIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])
  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null
  const selectedColor = selectedClassId
    ? (classColors[selectedClassId] ?? DEFAULT_CLASS_COLORS[classes.findIndex((c) => c.id === selectedClassId) % DEFAULT_CLASS_COLORS.length])
    : '#36D3FF'

  function toggleFullscreen() {
    const el = camStageRef.current
    if (!el) return
    // Layout is driven off state directly so fullscreen works even where the native
    // Fullscreen API is blocked/rejected (packaged app on some laptops). Native call
    // is best-effort. (See the matching fix in the hand screen's App.tsx.)
    const next = !isFullscreen
    setIsFullscreen(next)
    if (next) el.requestFullscreen?.().catch((err) => console.warn('requestFullscreen rejected — using in-window fullscreen overlay', err))
    else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    // Esc must also exit the in-window fallback, where no fullscreenchange ever fires.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) setIsFullscreen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

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
    setDisabledIds((prev) => prev.filter((x) => x !== id))
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
    const result = await detectPoseInImage(file)
    if (!result) return
    classifier.addSample(classId, result.vector)
    addImage(classId, result.imageUrl)
  }

  async function handleFiles(files: FileList | null) {
    if (!files || !recordTargetId) return
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      showUploadPreview(file)
      await handleUploadImage(recordTargetId!, file)
    }
  }

  function handleChangeColor(classId: string, color: string) {
    setClassColors((prev) => ({ ...prev, [classId]: color }))
  }

  function handleSelectClass(id: string) {
    setSelectedClassId(id)
    setThumbOffset(0)
  }

  // Pre-initialize Class 1 and Class 2, but keep the initial view on the chooser
  // state until the user explicitly selects camera or upload.
  useEffect(() => {
    // Coming back from Blocks: restore the project that was open instead.
    const snap = peekAiSnapshot('/pose')
    if (snap) {
      setInputMode(null)
      restoreBundle(JSON.parse(snap.json), snap.projectName, snap.colorsByName)
        .then(() => clearAiSnapshot('/pose'))
        .catch((err) => console.error('Failed to restore project after Blocks:', err))
      return
    }
    // Replace the list rather than appending: React Strict Mode runs this twice in
    // dev, and appending turned "Class 1, Class 2" into four cards.
    classIdCounter.current = 0
    const initial = ['Class 1', 'Class 2'].map((name) => {
      const id = `cls_${++classIdCounter.current}`
      classifier.initClass(id)
      return { id, name }
    })
    setClasses(initial)
    setSelectedClassId(initial[0].id)
    setInputMode(null)
  }, [])

  const handleExportToBlockly = useCallback(async () => {
    try {
      if (!classifier.isSavedToDisk) {
        await saveProject()
      }
      await classifier.exportToBlockly(projectName || 'pose-model')
      // Snapshot the project so Blocks' back button returns to it intact.
      const bundle = await classifier.serializeProject(imagesRef.current)
      if (bundle) {
        stashAiSnapshot('/pose', {
          json: JSON.stringify(bundle),
          projectName,
          colorsByName: Object.fromEntries(classes.filter((c) => classColors[c.id]).map((c) => [c.name, classColors[c.id]])),
        })
      }
      router.push(blocksUrlFrom('/pose'))
    } catch (err) {
      console.error('Failed to export pose model to Blockly:', err)
    }
  }, [classifier, projectName, router, classes, classColors])

  latestRef.current = { classifier, setPrediction, addImage, isTesting, recorder }

  // Handlers for incoming landmarks vector (109 elements)
  const handleLandmarks = useCallback((vector: Float32Array) => {
    const { classifier: clf, setPrediction: setP, addImage: addImg, isTesting: testingActive, recorder: rec } = latestRef.current!

    // Manual single capture (TrainingPanel "+1" button)
    const mc = manualCaptureRef.current
    if (mc) {
      manualCaptureRef.current = null
      if (!disabledRef.current.includes(mc.classId)) {
        clf.addSample(mc.classId, vector)
        const snap = poseTrackerRef.current?.snapshot() ?? ''
        if (snap) addImg(mc.classId, snap)
      }
    }

    // Shared recorder decides when a sample is due (hold / timed / countdown).
    const { capture, classId } = rec.tick(performance.now())
    // The class was switched off mid-recording — end the run instead of feeding it.
    if (capture && disabledRef.current.includes(classId)) {
      rec.stop()
    } else if (capture) {
      clf.addSample(classId, vector)
      const snap = poseTrackerRef.current?.snapshot() ?? ''
      if (snap) addImg(classId, snap)
    }

    // Predict only while live testing is on — keeps the training view clean.
    if (clf.modelReady && testingActive) {
      clf.predict(vector).then((res) => {
        if (res) setP(res)
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
    if (!recordTargetId) return
    recorder.startHold(recordTargetId)
  }
  function startCountdownCapture() {
    if (!recordTargetId) return
    recorder.startCountdown(recordTargetId, { delaySec: numOr(delay), durationN: numOr(duration), defaultDurationN: 30 })
  }

  // The panel hands over only the classes left enabled — disabled ones keep their
  // samples but stay out of the model.
  const handleTrain = useCallback((enabledClasses: GestureClass[] = classes) => {
    classifier.trainModel(enabledClasses)
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
    setProjectSession((n) => n + 1)
    handleReset()
    // Old samples are keyed by class id and the counter restarts at 1 below, so
    // without this the new project's Class 1 would inherit the previous one's data.
    classifier.clearSamples()
    setImages({})
    setClassColors({})
    classIdCounter.current = 0
    // A new project starts the way the screen first opens: two empty classes with
    // the first one selected, rather than an empty panel.
    const id1 = `cls_${++classIdCounter.current}`
    const id2 = `cls_${++classIdCounter.current}`
    classifier.initClass(id1); classifier.initClass(id2)
    setClasses([{ id: id1, name: 'Class 1' }, { id: id2, name: 'Class 2' }])
    setSelectedClassId(id1)
    setThumbOffset(0)
    setInputMode('camera')
  }

  /** Load a project bundle into the page (Open, and the return trip from Blocks). */
  async function restoreBundle(bundle: ModelBundle, name: string, colorsByName?: Record<string, string>) {
    const restoredClasses = await classifier.loadModel(bundle)
    classIdCounter.current = restoredClasses.length
    setClasses(restoredClasses)
    setImages(classifier.restoreImages(bundle, restoredClasses))
    setClassColors(Object.fromEntries(
      restoredClasses.filter((c) => colorsByName?.[c.name]).map((c) => [c.id, colorsByName![c.name]])
    ))
    setDisabledIds([])
    setProjectName(name)
    setSelectedClassId(restoredClasses[0]?.id ?? null)
  }

  const handleOpenProject = async () => {
    try {
      const res = await openProjectFile('poseClassifier')
      if (!res.success || !res.data) return
      await restoreBundle(JSON.parse(res.data), projectNameFromFile(res.fileName))
    } catch (err) {
      console.error('Failed to load project:', err)
      showNotice({
        tone: 'error',
        title: "Couldn't open that project",
        message: err instanceof Error ? err.message : String(err)
      })
    }
  }

  const isTrained = classifier.trainingStatus === 'ready'
  const isTraining = classifier.trainingStatus === 'training'
  const [trainingPopup, setTrainingPopup] = useState(false)

  // While testing, the middle column lists what the model actually learned
  // (disabled classes were left out of training). Colours resolve against the full
  // list so a class keeps the colour it has on its training card.
  const showResults = isTrained && isTesting

  // Test view input: live camera, or a single uploaded photo judged once.
  const [testMode, setTestMode] = useState<TestInputMode>('idle')
  const [testImage, setTestImage] = useState<string | null>(null)
  const [testPrediction, setTestPrediction] = useState<Prediction | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [testProcessing, setTestProcessing] = useState(false)
  // Every START begins on the "Select camera or upload" prompt, like the hand screen.
  useEffect(() => {
    if (!showResults) return
    setTestMode('idle'); setTestImage(null); setTestPrediction(null); setTestError(null)
  }, [showResults])

  async function handleTestFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setTestMode('upload')
    setTestProcessing(true)
    setTestError(null)
    setTestImage(null)
    setTestPrediction(null)
    const result = await detectPoseInImage(file)
    setTestProcessing(false)
    if (!result) {
      setTestError('No person detected — try a clearer full-body photo')
      return
    }
    setTestImage(result.imageUrl)
    setTestPrediction(await classifier.predict(result.vector))
  }
  const resultClasses = classifier.trainedClasses.length > 0 ? classifier.trainedClasses : classes
  const colorOf = (id: string, idx: number) => {
    const full = classes.findIndex((c) => c.id === id)
    return classColors[id] ?? DEFAULT_CLASS_COLORS[(full === -1 ? idx : full) % DEFAULT_CLASS_COLORS.length]
  }

  useEffect(() => {
    if (isTraining) setTrainingPopup(true)
  }, [isTraining])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {!isFullscreen && (
        <AIToolbar
          backImage="pose"
          centerProjectName
          onBack={() => router.push('/')}
          onSave={saveProject}
          isTrained={classifier.modelReady}
          projectName={projectName}
          onProjectNameChange={setProjectName}
          onNewProject={() => setShowProjectPopup(true)}
          onOpenProject={handleOpenProject}
        />
      )}

      {/* Training feedback — gif → confetti → "Tap OK to see results" */}
      <TrainingStatusPopup
        open={trainingPopup}
        isTraining={isTraining}
        isTrained={isTrained}
        onClose={() => setTrainingPopup(false)}
        trainingGif={trainposegif.src}
        successGif={readyposegif.src}
        resultPng={posepng.src}
      />

      <main
        className="flex-1 flex relative z-20 justify-center items-center gap-6 p-6 overflow-hidden bg-[#efefef] dark:bg-[#151515]"
        style={{
          backgroundImage: 'radial-gradient(circle, #c0c0c0 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Left: camera panel — while testing, a live-camera / upload-a-photo panel
            like the hand screen's predict view */}
        <div className="flex justify-center items-center w-[clamp(320px,30vw,480px)] shrink-0 mx-auto">
          {showResults ? (
            <TestInputPanel
              live="camera"
              mode={testMode}
              onModeChange={setTestMode}
              onFile={handleTestFile}
              accept="image/*"
            >
              {testMode === 'live' ? (
                <PoseTracker
                  ref={poseTrackerRef}
                  onStats={handleStats}
                  onLandmarks={handleLandmarks}
                  prediction={prediction}
                  isCapturing={false}
                  targetFps={typeof fps === 'number' && fps > 0 ? fps : undefined}
                  backendMode={backend}
                  backendLabel={poseBackendLabel}
                  effectsEnabled={effectsOn}
                />
              ) : (
                <UploadStage
                  processing={testProcessing}
                  processingLabel="Detecting pose…"
                  error={testError}
                  result={testImage ? <img src={testImage} alt="uploaded" className="w-full h-full object-contain" /> : null}
                  onFile={handleTestFile}
                  accept="image/*"
                />
              )}
            </TestInputPanel>
          ) : (
          <div className="w-[clamp(320px,30vw,480px)] flex flex-col">

            {!showSettings ? (<>

              {/* Class Label */}
              <div
                className="w-[clamp(240px,21vw,340px)] h-[clamp(40px,3vw,56px)] border-t-2 border-l-2 border-r-2 border-black dark:border-black rounded-t-lg flex items-center pl-4 font-bold"
                style={{ background: selectedClass ? selectedColor : '#d1d5db' }}>
                {selectedClass ? selectedClass.name : 'Select Class'}
              </div>

              {/* Camera Card */}
              <div className="w-full bg-white dark:bg-[#1f1f1f] border-2 border-black dark:border-black rounded-tr-xl rounded-br-xl rounded-bl-xl p-3">
                {/* Video / Upload zone */}
                <div
                  ref={camStageRef}
                  className="relative w-full aspect-video mx-auto rounded-lg overflow-hidden bg-black"
                  style={isFullscreen ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', aspectRatio: 'auto', borderRadius: 0, zIndex: 9999 } : undefined}
                >
                  {inputMode === 'camera' ? (
                    <PoseTracker
                      ref={poseTrackerRef}
                      onStats={handleStats}
                      onLandmarks={handleLandmarks}
                      prediction={isTesting ? prediction : null}
                      isCapturing={isCapturing}
                      targetFps={typeof fps === 'number' && fps > 0 ? fps : undefined}
                      backendMode={backend}
                      backendLabel={poseBackendLabel}
                      idle={!isCapturing && !isTesting}
                      effectsEnabled={effectsOn}
                    />
                  ) : inputMode === null ? (
                    <div className="w-full h-full flex items-center justify-center select-none bg-[#FFF000]">
                      <p className="font-bold text-center text-black text-xl leading-tight">
                        Select camera or<br />upload files.
                      </p>
                    </div>
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
                        ${!recordTargetId ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {uploadPreview ? (
                        <img src={uploadPreview} alt="uploaded" className="w-full h-full object-contain" />
                      ) : (<>
                        <span className="text-6xl font-black leading-none">+</span>
                        <span className="font-bold text-center text-black leading-tight">
                          Add or Drop files<br />from your computer
                        </span>
                      </>)}
                    </div>
                  )}

                  {/* nothing to record into — every class is off, or the selected one is */}
                  {inputMode !== null && classes.length > 0 && !recordTargetId && (
                    <div className="absolute inset-x-0 bottom-3 flex justify-center z-20 pointer-events-none px-3">
                      <div className="rounded-full bg-black/80 text-white text-xs font-bold px-4 py-1.5 text-center">
                        {allClassesDisabled
                          ? 'All classes are disabled — enable a class or add a new one to record'
                          : 'This class is disabled — enable it or select another class to record'}
                      </div>
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
                      className={isFullscreen
                        ? 'absolute bottom-8 right-8 z-40 bg-black/60 hover:bg-black/80 text-white rounded-full px-5 py-2.5 text-sm font-bold'
                        : 'absolute top-2 right-2 z-30 bg-black/60 hover:bg-black/80 text-white rounded-lg px-3 py-1.5 text-xs font-bold'}
                      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen recording'}
                    >
                      {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
                    </button>
                  )}

                  {/* lag-shadow trail toggle */}
                  {inputMode === 'camera' && (
                    <button
                      onClick={() => setEffectsOn((v) => !v)}
                      className={`absolute ${isFullscreen ? 'top-24 right-6' : 'top-12 right-2'} z-30 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${effectsOn ? 'bg-fuchsia-500/90 text-white' : 'bg-black/60 hover:bg-black/80 text-white'}`}
                      title="Lag-shadow trail (visual only — doesn't affect detection)"
                    >
                      {effectsOn ? '✨ Effects ON' : '✨ Effects'}
                    </button>
                  )}

                  {/* fullscreen recording controls — record without leaving the big view */}
                  {isFullscreen && inputMode === 'camera' && (
                    <>
                      <div
                        className="absolute top-6 left-6 z-40 px-5 py-2.5 rounded-full font-bold text-black text-lg shadow-lg"
                        style={{ background: selectedClass ? selectedColor : '#d1d5db' }}
                      >
                        {selectedClass ? selectedClass.name : 'Select a class first'}
                      </div>
                      {selectedClass && (
                        <div
                          className="absolute top-6 right-6 z-40 px-5 py-2.5 rounded-full font-bold text-black text-lg shadow-lg"
                          style={{ background: selectedColor }}
                        >
                          {classifier.sampleCounts[selectedClass.id] ?? 0} samples
                        </div>
                      )}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                        <RecordingControls
                          variant="fullscreen"
                          mode="auto"
                          onModeChange={() => { }}
                          isCapturing={isCapturing}
                          countdown={countdown}
                          disabled={!recordTargetId}
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

                {/* Hidden file input — triggered by upload zone click */}
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
                </RecordingSettings>
              </div>
            </>
            )}

            <div className="w-full flex items-center justify-center mt-4">

              {!showSettings ? (
                <div className="flex items-center gap-4">

                  {/* START / STOP — Hold | Auto (shared, uniform with hand) */}
                  {inputMode === 'camera' && (
                    <RecordingControls
                      mode={hold ? 'hold' : 'auto'}
                      onModeChange={(m) => setHold(m === 'hold')}
                      showModeSwitch={false}
                      isCapturing={isCapturing}
                      countdown={countdown}
                      disabled={!recordTargetId}
                      onHoldStart={startHoldCapture}
                      onHoldStop={stopCapture}
                      onAutoStart={startCountdownCapture}
                      onStop={stopCapture}
                      isHolding={() => recorder.currentMode() === 'hold'}
                    />
                  )}

                  {inputMode === 'upload' && <>
                    <button
                      disabled={!recordTargetId}
                      onClick={() => { fileRef.current?.click() }}
                      className="w-[140px] h-[50px] rounded-lg font-black border-2 border-transparent hover:border-black transition-all duration-200 select-none bg-[#F6EC24] text-black"
                    >
                      UPLOAD
                    </button>
                    <input
                      ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) { showUploadPreview(f); handleUploadImage(recordTargetId!, f); e.target.value = '' } }}
                    />
                  </>
                  }

                  {/* 3 DOT MENU — holds the Hold|Auto switch + Settings */}
                  {inputMode === 'camera' && (
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
          )}
        </div>

        {/* Middle: training panel, swapped for confidence bars while testing (like
            the hand screen's predict view). The panel stays mounted but hidden so
            its per-class enabled/disabled toggles survive a START/STOP. */}
        <div className="shrink-0 w-[clamp(300px,28vw,450px)] mx-auto">
          {showResults && (
            <ConfidenceList
              classes={resultClasses}
              prediction={testMode === 'upload' ? testPrediction : testMode === 'live' ? prediction : null}
              colorOf={colorOf}
              onViewLayers={() => setShowLayers(true)}
              layersTitle="Watch your pose travel through the model's layers"
            />
          )}
          <div className={showResults ? 'hidden' : undefined}>
          <TrainingPanel
            key={projectSession}
            classes={classes}
            sampleCounts={classifier.sampleCounts}
            minSamples={classifier.MIN_SAMPLES}
            trainingStatus={classifier.trainingStatus}
            trainProgress={classifier.trainProgress}
            trainAccuracy={classifier.trainAccuracy}
            trainError={classifier.trainError}
            prediction={isTesting ? prediction : null}
            images={images}
            selectedClassId={selectedClassId}
            classColors={classColors}
            defaultColors={DEFAULT_CLASS_COLORS}
            showLivePrediction={false}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onRenameClass={handleRenameClass}
            onClearSamples={handleClearSamples}
            onCaptureOne={handleCaptureOne}
            onDeleteSample={handleDeleteSample}
            onUploadImage={handleUploadImage}
            onSelectClass={handleSelectClass}
            disabledClassIds={disabledClassIds}
            onToggleClassEnabled={handleToggleClassEnabled}
            onChangeColor={handleChangeColor}
            onActivateCamera={(id) => {
              handleSelectClass(id)
              if (isCapturing) stopCapture()
              setInputMode('camera')
            }}
            onActivateUpload={(id) => {
              handleSelectClass(id)
              if (isCapturing) stopCapture()
              setInputMode('upload')
              showUploadPreview(null)
            }}
            onTrain={handleTrain}
            onSave={saveProject}
            onReset={handleReset}
          />
          </div>
        </div>

        {/* ── Right: controls panel ──────────────────────────────────── */}
        <div className="w-[clamp(320px,30vw,480px)] shrink-0 mx-auto">
          <ControlsPanel
            classes={classes}
            classColors={classColors}
            defaultColors={DEFAULT_CLASS_COLORS}
            onStart={() => setIsTesting((v) => !v)}
            onExportToBlockly={handleExportToBlockly}
            onViewLayers={showResults ? undefined : () => { setIsTesting(true); setShowLayers(true) }}
            trainingStatus={classifier.trainingStatus}
            currentPage={isTesting ? 'predict' : 'main'}
            comingSoonExports={['python', 'c++']}
          />
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

      <NoticePopup
        notice={classifier.notice ?? notice}
        onClose={() => { classifier.dismissNotice(); dismissNotice() }}
      />

      <ProjectPopup
        isOpen={showProjectPopup}
        onClose={() => setShowProjectPopup(false)}
        onCreate={handleCreateProject}
      />
    </div>
  )
}
