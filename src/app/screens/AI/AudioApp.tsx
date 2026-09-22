"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AIToolbar from './components/AIToolbar'
import ProjectPopup from './components/ProjectPopup'
import NoticePopup from './components/NoticePopup'
import { useNotice } from './hooks/useNotice'
import TrainingPanel from './components/TrainingPanel'
import ConfidenceList from './components/ConfidenceList'
import TestInputPanel, { UploadStage, type TestInputMode } from './components/TestInputPanel'
import ControlsPanel from './components/ControlsPanel'
import AudioVisualizer from './components/AudioVisualizer'
import AudioLayersReveal from './components/AudioLayersReveal'
import CaptureMenu from './components/CaptureMenu'
import TrainingStatusPopup from './components/TrainingStatusPopup'
import trainaudiogif from './icons/trainaudio.gif'
import readyaudiogif from './icons/readyaudiogif.gif'
import audiopng from './icons/audiopng.png'
import { useAudioClassifier, type AudioClass, type Prediction } from './hooks/useAudioClassifier'
import { generateMelSpectrogram } from './utils/audioDSP'
import { spectrogramToDataURL } from './utils/spectrogramImage'
import { uniqueClassName } from './utils/uniqueClassName'
import HoldOnIcon from './icons/holdOn'
import HoldOffIcon from './icons/holdOff'

interface FileOpenResult {
  success: boolean
  data: string
  fileName: string
}

const DEFAULT_CLASS_COLORS = ['#F6EC24', '#36D3FF', '#F6268B', '#a78bfa', '#60a5fa', '#fb923c', '#34d399', '#f87171']

// Voice Activity Detection (VAD) Energy Gate Utility
function calculateRMS(audioBuffer: Float32Array): number {
  let sum = 0
  for (let i = 0; i < audioBuffer.length; i++) {
    sum += audioBuffer[i] * audioBuffer[i]
  }
  return Math.sqrt(sum / audioBuffer.length)
}

const isAudioFile = (file: File) =>
  file.type.startsWith('audio/') || /\.(wav|mp3|m4a|aac|ogg|flac)$/i.test(file.name)

/** Decode an audio file to mono and turn it into the model's mel spectrogram. */
async function fileToSpectrogram(file: File): Promise<Float32Array> {
  const arrayBuffer = await file.arrayBuffer()
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  const ctx = new AudioContextClass()
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0))
    const mono = new Float32Array(audioBuffer.length)
    const channelCount = audioBuffer.numberOfChannels
    for (let i = 0; i < audioBuffer.length; i++) {
      let sum = 0
      for (let ch = 0; ch < channelCount; ch++) {
        sum += audioBuffer.getChannelData(ch)[i]
      }
      mono[i] = sum / channelCount
    }
    return generateMelSpectrogram(mono)
  } finally {
    await ctx.close()
  }
}

export default function AudioApp() {
  const router = useRouter()
  const classifier = useAudioClassifier()

  const [classes, setClasses] = useState<AudioClass[]>([])
  // Painted PNGs of each recorded spectrogram, in capture order — the shared training
  // panel's class cards take image URLs (they were built for camera snapshots). The
  // spectrograms themselves live in classifier.samplesRef, which the layers reveal reads.
  const [images, setImages] = useState<Record<string, string[]>>({})
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [classColors, setClassColors] = useState<Record<string, string>>({})

  // Audio state
  const [isMicReady, setIsMicReady] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [recordProgress, setRecordProgress] = useState(0)
  const [recordTimeLeft, setRecordTimeLeft] = useState(3.0)
  // VAD Energy Threshold state
  const [rmsThreshold, setRmsThreshold] = useState(0.01)

  // Settings
  const [showSettings, setShowSettings] = useState(false)
  const [hold, setHold] = useState(false) // default to false (click to record 2s is much easier for voice commands)
  const [delay, setDelay] = useState<number>(0) // seconds delay before recording starts
  const [showUnknownInBreakdown, setShowUnknownInBreakdown] = useState(false)

  // Live prediction (driven by the START button in the controls panel)
  const [isTesting, setIsTesting] = useState(false)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [showLayers, setShowLayers] = useState(false)
  // Test view input: live microphone, or a single uploaded clip judged once.
  const [testMode, setTestMode] = useState<TestInputMode>('idle')
  const [testSpectrogram, setTestSpectrogram] = useState<string | null>(null)
  const [testFileName, setTestFileName] = useState('')
  const [testPrediction, setTestPrediction] = useState<Prediction | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [testProcessing, setTestProcessing] = useState(false)

  // Project details
  const [projectName, setProjectName] = useState('')
  const [, setProjectDesc] = useState('')
  const [showProjectPopup, setShowProjectPopup] = useState(false)
  const { notice, showNotice, dismissNotice } = useNotice()
  // Bumped on every new project. The training panel keeps its own per-class state
  // (which classes are disabled) keyed by class id, and ids restart at cls_1, so the
  // panel is remounted rather than inheriting the last project's toggles.
  const [projectSession, setProjectSession] = useState(0)

  // Audio nodes and context refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null)
  // Re-render once the analyser node exists so the visualizer receives it.
  const [analyserReady, setAnalyserReady] = useState(0)

  // Recording buffer state refs
  const recordingRef = useRef<{ isRecording: boolean }>({ isRecording: false })
  const recordingBufferRef = useRef<Float32Array>(new Float32Array(44100)) // 2 seconds @ 22050Hz
  const recordingIndexRef = useRef<number>(0)
  const rollingBufferRef = useRef<Float32Array>(new Float32Array(44100)) // sliding 2s window for testing
  // Which class the in-flight recording belongs to. Held in a ref because the
  // capture can be started for a class other than the selected one (the "+1"
  // button on a class card) and finishes asynchronously on the audio thread.
  const recordTargetRef = useRef<string | null>(null)

  const latestFinishedRef = useRef<(waveform: Float32Array) => void>(() => {})

  const classIdCounter = useRef(0)

  // Selected Class details
  // Classes switched off in the training panel keep their samples but must not
  // receive new ones, so recording only ever targets an enabled selection.
  const [disabledIds, setDisabledIds] = useState<string[]>([])
  const disabledRef = useRef<string[]>([])
  disabledRef.current = disabledIds
  const recordTargetId = selectedClassId && !disabledIds.includes(selectedClassId) ? selectedClassId : null
  const allClassesDisabled = classes.length > 0 && classes.every((c) => disabledIds.includes(c.id))
  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null
  const selectedColor = selectedClassId
    ? (classColors[selectedClassId] ?? DEFAULT_CLASS_COLORS[classes.findIndex((c) => c.id === selectedClassId) % DEFAULT_CLASS_COLORS.length])
    : '#F6EC24'

  // Initialize audio streams
  const initAudio = async () => {
    try {
      setMicError(null)

      // Tear down any previous audio graph first so this can be called again
      // (e.g. to revive the mic after Reset) without leaking nodes/streams.
      if (processorNodeRef.current) {
        processorNodeRef.current.disconnect()
        processorNodeRef.current.onaudioprocess = null
        processorNodeRef.current = null
      }
      if (sourceNodeRef.current) { sourceNodeRef.current.disconnect(); sourceNodeRef.current = null }
      if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach((t) => t.stop()); mediaStreamRef.current = null }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { await audioContextRef.current.close() } catch { /* already closing */ }
      }
      audioContextRef.current = null
      setIsMicReady(false)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      // Request 22050Hz directly so the browser does hardware downsampling automatically
      const ctx = new AudioContextClass({ sampleRate: 22050 })
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      sourceNodeRef.current = source

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyserRef.current = analyser
      source.connect(analyser)
      setAnalyserReady((n) => n + 1)

      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorNodeRef.current = processor
      source.connect(processor)
      processor.connect(ctx.destination) // Connect to destination to trigger processes

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)

        // Update sliding window rolling buffer for testing
        const roll = rollingBufferRef.current
        roll.copyWithin(0, inputData.length)
        roll.set(inputData, roll.length - inputData.length)

        // Handle active recording
        if (recordingRef.current.isRecording) {
          const recBuffer = recordingBufferRef.current
          const writeIdx = recordingIndexRef.current
          const remaining = recBuffer.length - writeIdx

          if (remaining > 0) {
            const toWrite = Math.min(remaining, inputData.length)
            recBuffer.set(inputData.subarray(0, toWrite), writeIdx)
            recordingIndexRef.current += toWrite

            const progress = (recordingIndexRef.current / 44100) * 100
            const secLeft = Math.max(0, 2.0 - (recordingIndexRef.current / 22050))

            setRecordProgress(progress)
            setRecordTimeLeft(secLeft)
          }

          if (recordingIndexRef.current >= 44100) {
            recordingRef.current.isRecording = false
            setIsCapturing(false)

            const finalWave = new Float32Array(recBuffer)
            // Trigger processing out of the audio thread
            setTimeout(() => {
              latestFinishedRef.current(finalWave)
            }, 10)
          }
        }
      }

      setIsMicReady(true)
    } catch (err) {
      console.error('Failed to initialize microphone:', err)
      setMicError(err instanceof Error ? err.message : String(err))
    }
  }

  // Auto request mic on mount
  useEffect(() => {
    initAudio()
    return () => {
      // Cleanup audio context and streams to free microphone resources
      recordingRef.current.isRecording = false
      if (processorNodeRef.current) {
        processorNodeRef.current.disconnect()
        processorNodeRef.current.onaudioprocess = null
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect()
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        // A re-init may already have closed it; closing twice rejects.
        audioContextRef.current.close().catch(() => { /* already closed */ })
      }
    }
  }, [])

  // Keep the mic responsive independently of the model. Reset Model used to leave
  // the AudioContext suspended/closed with no way to revive it except reopening the
  // screen; this brings it back: resume if merely suspended, fully re-init if closed.
  const ensureMicAlive = useCallback(async () => {
    const ctx = audioContextRef.current
    if (!ctx || ctx.state === 'closed') {
      await initAudio()
      return
    }
    if (ctx.state === 'suspended') {
      try { await ctx.resume() } catch { /* will retry on next user gesture */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRecordingFinished = (waveform: Float32Array) => {
    const classId = recordTargetRef.current
    // Switched off while the clip was recording — drop it rather than add it.
    if (!classId || disabledRef.current.includes(classId)) return

    // Extract speech features
    const spec = generateMelSpectrogram(waveform)

    // Save to hook
    classifier.addSample(classId, spec)

    // Painted PNG for the class-card grid (the raw spectrogram is already in samplesRef).
    setImages((prev) => ({
      ...prev,
      [classId]: [...(prev[classId] ?? []), spectrogramToDataURL(spec)]
    }))
  }

  latestFinishedRef.current = handleRecordingFinished

  // Pre-initialize generic classes the child can rename, plus a noise bucket.
  // The classifier suppresses classes named "background"/"noise" from triggering,
  // so keeping this default gives kids a free catch-all for silence/noise.
  useEffect(() => {
    handleAddClass('Class 1')
    handleAddClass('Class 2')
    handleAddClass('Background Noise')
    setSelectedClassId('cls_1')
  }, [])

  function handleAddClass(name: string) {
    const unique = uniqueClassName(name, classes.map((c) => c.name))
    const id = `cls_${++classIdCounter.current}`
    classifier.initClass(id)
    setClasses((prev) => [...prev, { id, name: unique }])
    setSelectedClassId(id)
  }

  function handleDeleteClass(id: string) {
    classifier.removeClassData(id)
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setImages((prev) => { const n = { ...prev }; delete n[id]; return n })
    setClassColors((prev) => { const n = { ...prev }; delete n[id]; return n })
    if (recordTargetRef.current === id) recordTargetRef.current = null
    if (selectedClassId === id) setSelectedClassId(null)
  }

  function handleRenameClass(id: string, name: string) {
    // Called on commit (blur/Enter). Auto-suffix if the new name duplicates another —
    // duplicate names corrupt the save/load bundle.
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
  }

  function handleDeleteSample(classId: string, index: number) {
    classifier.deleteSample(classId, index)
    setImages((prev) => {
      const arr = [...(prev[classId] ?? [])]
      arr.splice(index, 1)
      return { ...prev, [classId]: arr }
    })
  }

  function handleChangeColor(classId: string, color: string) {
    setClassColors((prev) => ({ ...prev, [classId]: color }))
  }

  function handleSelectClass(id: string) {
    setSelectedClassId(id)
  }

  async function handleUploadAudio(classId: string, file: File) {
    if (!isAudioFile(file)) {
      showNotice({
        tone: 'warning',
        title: 'Unsupported file',
        message: 'Please choose an audio file such as WAV, MP3, M4A, OGG, or AAC.'
      })
      return
    }

    try {
      const spec = await fileToSpectrogram(file)
      classifier.addSample(classId, spec)
      setImages((prev) => ({
        ...prev,
        [classId]: [...(prev[classId] ?? []), spectrogramToDataURL(spec)]
      }))
    } catch (err) {
      console.error('Failed to import audio sample:', err)
      showNotice({
        tone: 'error',
        title: "Couldn't read that audio",
        message: 'This file could not be decoded. Try a different WAV or MP3 file.'
      })
    }
  }

  const startRecording = async (classId?: string) => {
    const target = classId ?? selectedClassId
    if (target && disabledRef.current.includes(target)) return
    if (!target || !isMicReady) return
    recordTargetRef.current = target

    // Ensure audio context is running (fixes browser suspension blocks)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    setRecordProgress(0)
    setRecordTimeLeft(2.0)

    // Handle Delay if configured
    if (delay > 0) {
      setIsCapturing(true)
      // Visual countdown before starting active recording buffer
      let count = delay
      const interval = setInterval(() => {
        count--
        if (count <= 0) {
          clearInterval(interval)
          startActiveBuffer()
        }
      }, 1000)
    } else {
      startActiveBuffer()
    }
  }

  const startActiveBuffer = () => {
    recordingIndexRef.current = 0
    recordingBufferRef.current.fill(0.0)
    recordingRef.current.isRecording = true
    setIsCapturing(true)
  }

  const stopRecording = () => {
    if (!recordingRef.current.isRecording) return
    recordingRef.current.isRecording = false
    setIsCapturing(false)

    // Pad early released waveform and add it safely
    const written = recordingIndexRef.current
    const partialWave = new Float32Array(44100)
    partialWave.set(recordingBufferRef.current.subarray(0, Math.min(44100, written)))
    handleRecordingFinished(partialWave)
  }

  // The panel hands over only the classes left enabled — disabled ones keep their
  // samples but stay out of the model.
  const handleTrain = useCallback((enabledClasses: AudioClass[] = classes) => {
    classifier.trainModel(enabledClasses)
  }, [classes, classifier])

  const handleReset = useCallback(() => {
    classifier.resetModel()
    setPrediction(null)
    setIsTesting(false)
    // Reset clears the model only — keep the microphone working so the user can
    // immediately re-record without closing and reopening the Audio Classifier.
    void ensureMicAlive()
  }, [classifier, ensureMicAlive])

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
    // A new project starts the way the screen first opens: two empty classes plus
    // the noise catch-all, with the first one selected, rather than an empty panel.
    const id1 = `cls_${++classIdCounter.current}`
    const id2 = `cls_${++classIdCounter.current}`
    const id3 = `cls_${++classIdCounter.current}`
    classifier.initClass(id1); classifier.initClass(id2); classifier.initClass(id3)
    setClasses([
      { id: id1, name: 'Class 1' },
      { id: id2, name: 'Class 2' },
      { id: id3, name: 'Background Noise' }
    ])
    setSelectedClassId(id1)
  }

  const handleOpenProject = async () => {
    try {
      const res = (await window.api?.file?.open?.('audioClassifier')) as FileOpenResult | undefined
      if (!res || !res.success) return
      const bundle = JSON.parse(res.data)
      const restoredClasses: AudioClass[] = await classifier.loadModel(bundle)
      setClasses(restoredClasses)

      // Repaint the thumbnails from the restored spectrograms
      const loadedImages: Record<string, string[]> = {}
      restoredClasses.forEach((c: AudioClass) => {
        loadedImages[c.id] = (classifier.samplesRef.current[c.id] || []).map((s) => spectrogramToDataURL(s))
      })
      setImages(loadedImages)

      setProjectName(res.fileName.replace('.json', ''))
      if (restoredClasses.length > 0) {
        setSelectedClassId(restoredClasses[0].id)
      }
    } catch (err) {
      console.error('Failed to load audio project:', err)
      showNotice({
        tone: 'error',
        title: "Couldn't open that project",
        message: err instanceof Error ? err.message : String(err)
      })
    }
  }

  const handleExportToBlockly = useCallback(async () => {
    try {
      if (!classifier.isSavedToDisk) {
        await classifier.saveModel(projectName || 'audio-model')
      }
      // Simulate exporting blocks to blockly editor
      router.push('/blocks')
    } catch (err) {
      console.error('Failed to export audio model:', err)
    }
  }, [classifier, projectName, router])

  // Real-Time prediction sliding window loop
  useEffect(() => {
    if (!isTesting || testMode !== 'live' || !classifier.modelReady || !isMicReady) {
      setPrediction(null)
      return
    }

    const interval = setInterval(async () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      const bufferCopy = new Float32Array(rollingBufferRef.current)

      // Measure RMS to skip predictions during relative silence (VAD)
      const rms = calculateRMS(bufferCopy)

      if (rms < rmsThreshold) {
        setPrediction({
          classId: undefined,
          className: 'Unknown',
          confidence: 0,
          probabilities: [],
          isDetected: false
        })
        return
      }

      const spec = generateMelSpectrogram(bufferCopy)
      const res = await classifier.predict(spec)
      if (res) {
        setPrediction(res)
      }
    }, 250)

    return () => clearInterval(interval)
  }, [isTesting, testMode, classifier.modelReady, isMicReady, classifier.predict, rmsThreshold])

  const isTrained = classifier.trainingStatus === 'ready'
  const isTraining = classifier.trainingStatus === 'training'
  const [trainingPopup, setTrainingPopup] = useState(false)

  useEffect(() => {
    if (isTraining) setTrainingPopup(true)
  }, [isTraining])

  // The shared training panel renders `prediction` as a Live readout. Only feed it a
  // real detection — the VAD emits an "Unknown" placeholder every silent cycle.
  const livePrediction = isTesting && prediction?.isDetected ? prediction : null

  // While testing, the middle column lists what the model actually learned
  // (disabled classes were left out of training). Colours resolve against the full
  // list so a class keeps the colour it has on its training card.
  const showResults = isTrained && isTesting

  // Every START begins on the "Select microphone or upload" prompt, like the hand screen.
  useEffect(() => {
    if (!showResults) return
    setTestMode('idle'); setTestSpectrogram(null); setTestPrediction(null); setTestError(null)
  }, [showResults])

  async function handleTestFile(file: File) {
    setTestMode('upload')
    setTestSpectrogram(null)
    setTestPrediction(null)
    setTestError(null)
    if (!isAudioFile(file)) {
      setTestError('Please choose an audio file such as WAV, MP3, M4A, OGG, or AAC.')
      return
    }
    setTestProcessing(true)
    try {
      const spec = await fileToSpectrogram(file)
      setTestFileName(file.name)
      setTestSpectrogram(spectrogramToDataURL(spec))
      setTestPrediction(await classifier.predict(spec))
    } catch (err) {
      console.error('Failed to test audio file:', err)
      setTestError('This file could not be decoded. Try a different WAV or MP3 file.')
    } finally {
      setTestProcessing(false)
    }
  }
  const resultClasses = classifier.trainedClasses.length > 0 ? classifier.trainedClasses : classes
  const colorOf = (id: string, idx: number) => {
    const full = classes.findIndex((c) => c.id === id)
    return classColors[id] ?? DEFAULT_CLASS_COLORS[(full === -1 ? idx : full) % DEFAULT_CLASS_COLORS.length]
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AIToolbar
        backImage="audio"
        onBack={() => router.push('/')}
        onSave={() => classifier.saveModel(projectName || 'audio-model')}
        isTrained={classifier.modelReady}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onNewProject={() => setShowProjectPopup(true)}
        onOpenProject={handleOpenProject}
      />

      {/* Training feedback — gif → confetti → "Tap OK to see results" */}
      <TrainingStatusPopup
        open={trainingPopup}
        isTraining={isTraining}
        isTrained={isTrained}
        onClose={() => setTrainingPopup(false)}
        trainingGif={trainaudiogif.src}
        successGif={readyaudiogif.src}
        resultPng={audiopng.src}
      />

      <main
        className="flex-1 flex relative z-20 justify-center items-center gap-6 p-6 overflow-hidden bg-[#efefef] dark:bg-[#151515]"
        style={{
          backgroundImage: 'radial-gradient(circle, #c0c0c0 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Left: microphone panel — while testing, a live-microphone / upload-a-clip
            panel like the hand screen's predict view */}
        <div className="flex justify-center items-center w-[clamp(320px,30vw,480px)] shrink-0 mx-auto">
          {showResults ? (
            <TestInputPanel
              live="mic"
              mode={testMode}
              onModeChange={setTestMode}
              onFile={handleTestFile}
              accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.flac"
            >
              {testMode === 'live' ? (
                <div className="relative w-full h-full bg-[#0f172a] flex items-center justify-center">
                  <AudioVisualizer
                    key={analyserReady}
                    mode="waveform"
                    analyser={analyserRef.current}
                    accentColor="#F6EC24"
                    width={520}
                    height={292}
                  />
                  {(micError || !isMicReady) && (
                    <div className="absolute top-2 left-2 z-30 text-[10px] text-white font-bold bg-red-500/90 px-2.5 py-1 rounded-md">
                      {micError ? `⚠️ Mic Error — ${micError}` : 'Waiting for microphone…'}
                    </div>
                  )}
                </div>
              ) : (
                <UploadStage
                  processing={testProcessing}
                  processingLabel="Listening to the file…"
                  error={testError}
                  result={testSpectrogram ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
                      <img src={testSpectrogram} alt="spectrogram" className="max-w-full max-h-[80%] object-contain rounded" />
                      <span className="text-xs font-bold text-black truncate max-w-full">{testFileName}</span>
                    </div>
                  ) : null}
                  onFile={handleTestFile}
                  accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.flac"
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

              {/* Microphone Card */}
              <div className="w-full bg-white dark:bg-[#1f1f1f] border-2 border-black dark:border-black rounded-tr-xl rounded-br-xl rounded-bl-xl p-3">
                {/* Waveform stage */}
                <div className="relative w-full aspect-video mx-auto rounded-lg overflow-hidden bg-[#0f172a] flex items-center justify-center">
                  <AudioVisualizer
                    key={analyserReady}
                    mode="waveform"
                    analyser={analyserRef.current}
                    accentColor={selectedColor}
                    width={520}
                    height={292}
                  />

                  {micError && (
                    <div className="absolute top-2 left-2 z-30 text-[10px] text-white font-bold bg-red-500/90 px-2.5 py-1 rounded-md">
                      ⚠️ Mic Error — {micError}
                    </div>
                  )}

                  {/* Circular visual countdown while recording */}
                  {isCapturing && recordingRef.current.isRecording && (
                    <div className="absolute inset-0 bg-[#0f172ab0] flex flex-col items-center justify-center backdrop-blur-[2px] p-2 z-20">
                      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                        {/* viewBox-based ring → always renders fully, never clipped */}
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="44" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="50"
                            cy="50"
                            r="44"
                            stroke={selectedColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray={276.5}
                            strokeDashoffset={276.5 - (276.5 * recordProgress) / 100}
                            className="transition-all duration-75"
                          />
                        </svg>
                        <span className="text-white font-mono font-black text-lg z-10">
                          {recordTimeLeft.toFixed(1)}s
                        </span>
                      </div>
                      <span className="text-white font-black text-xs sm:text-sm uppercase tracking-widest mt-3 animate-pulse">
                        Speak Word Now...
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </>

            ) : (<>
              {/* Recording options — same card shell as the hand screen's settings */}
              <div className="w-full min-h-[19vw] max-h-[calc(100vh-220px)] overflow-y-auto bg-white border-2 border-black rounded-xl p-4 flex flex-col">
                <div className="sticky top-0 z-10 bg-white flex justify-between items-center border-b border-black pt-1 pb-1 mb-4">
                  <span className="text-m font-bold">Recording Options</span>
                  <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-red-500 text-lg font-bold">✕</button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-m">Hold to Record</span>
                    <button
                      onClick={() => setHold(!hold)}
                      className={`px-3 py-1.5 rounded-lg border-2 border-black font-bold transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${hold ? 'bg-green-400' : 'bg-red-400 text-white'}`}
                    >
                      {hold ? <HoldOnIcon width={50} height={16} /> : <HoldOffIcon width={50} height={16} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-m">Countdown Delay (seconds)</span>
                    <input
                      type="number"
                      value={delay}
                      onChange={(e) => setDelay(Math.max(0, Number(e.target.value) || 0))}
                      className="w-[60px] bg-yellow-300 border border-black text-center outline-none"
                      min={0}
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-3.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold">Confidence Threshold</span>
                      <span className="font-mono font-bold bg-[#F6EC24] px-2 py-0.5 rounded border border-black text-xs">
                        {classifier.confidenceThreshold.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.50}
                      max={0.98}
                      step={0.01}
                      value={classifier.confidenceThreshold}
                      onChange={(e) => classifier.setConfidenceThreshold(Number(e.target.value))}
                      className="w-full cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none accent-black"
                    />
                    <span className="text-[10px] font-semibold">
                      {classifier.confidenceThreshold < 0.75 ? (
                        <span className="text-red-500">⚠️ Very Low (Prone to false triggers)</span>
                      ) : classifier.confidenceThreshold <= 0.82 ? (
                        <span className="text-green-600">🏠 Quiet Room (High sensitivity)</span>
                      ) : classifier.confidenceThreshold <= 0.89 ? (
                        <span className="text-blue-600">✨ Normal (Recommended)</span>
                      ) : (
                        <span className="text-purple-600">🔊 Noisy Room (Highly strict)</span>
                      )}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold">RMS Silence Gate (VAD)</span>
                      <span className="font-mono font-bold bg-[#F6EC24] px-2 py-0.5 rounded border border-black text-xs">
                        {rmsThreshold.toFixed(3)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.002}
                      max={0.050}
                      step={0.001}
                      value={rmsThreshold}
                      onChange={(e) => setRmsThreshold(Number(e.target.value))}
                      className="w-full cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none accent-black"
                    />
                    <span className="text-[10px] font-semibold">
                      {rmsThreshold < 0.005 ? (
                        <span className="text-red-500">🔊 Ultra Sensitive (Triggers on subtle noise)</span>
                      ) : rmsThreshold <= 0.015 ? (
                        <span className="text-green-600">✨ Normal (Recommended silence filter)</span>
                      ) : (
                        <span className="text-purple-600">💨 High Noise Gate (Requires speaking louder)</span>
                      )}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold">Temporal Smoothing</span>
                      <span className="font-mono font-bold bg-[#F6EC24] px-2 py-0.5 rounded border border-black text-xs">
                        {classifier.smoothingWindow} Frames
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      step={1}
                      value={classifier.smoothingWindow}
                      onChange={(e) => classifier.setSmoothingWindow(Number(e.target.value))}
                      className="w-full cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none accent-black"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold leading-normal">
                      Must detect same word for <span className="font-bold font-mono text-black">{classifier.smoothingWindow}</span> consecutive cycles before triggering.
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold">Word Hold Cooldown</span>
                      <span className="font-mono font-bold bg-[#F6EC24] px-2 py-0.5 rounded border border-black text-xs">
                        {classifier.detectionCooldown > 0 ? `${classifier.detectionCooldown.toFixed(1)}s` : 'Disabled'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={5.0}
                      step={0.5}
                      value={classifier.detectionCooldown}
                      onChange={(e) => classifier.setDetectionCooldown(Number(e.target.value))}
                      className="w-full cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none accent-black"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold leading-normal">
                      Locks the detected word active for <span className="font-bold font-mono text-black">{classifier.detectionCooldown}s</span> before permitting a new command.
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3.5 flex items-center justify-between">
                    <span className="text-m">Show Unknown in Breakdown</span>
                    <button
                      onClick={() => setShowUnknownInBreakdown(!showUnknownInBreakdown)}
                      className={`w-[60px] h-[30px] rounded-full flex items-center p-1 transition-colors duration-200 ${showUnknownInBreakdown ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-[22px] h-[22px] bg-white rounded-full shadow-md transform transition-transform duration-200 ${showUnknownInBreakdown ? 'translate-x-[30px]' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => { setRmsThreshold(0.01); setDelay(0); setHold(false); setShowUnknownInBreakdown(false) }}
                  className="w-full mt-4 py-2 rounded-lg font-semibold transition text-m bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  Reset to Default
                </button>
              </div>
            </>
            )}

            {!showSettings && classes.length > 0 && !recordTargetId && (
              <p className="w-full text-center text-xs font-bold text-gray-500 mt-3">
                {allClassesDisabled
                  ? 'All classes are disabled — enable a class or add a new one to record'
                  : 'This class is disabled — enable it or select another class to record'}
              </p>
            )}

            <div className="w-full flex items-center justify-center mt-4">

              {!showSettings ? (
                <div className="flex items-center gap-4">
                  {hold ? (
                    <button
                      onMouseDown={(e) => { if (e.button === 0) startRecording() }}
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      onContextMenu={(e) => e.preventDefault()}
                      onTouchStart={(e) => { e.preventDefault(); startRecording() }}
                      onTouchEnd={(e) => { e.preventDefault(); stopRecording() }}
                      disabled={!recordTargetId || !isMicReady}
                      className={`h-[50px] px-8 rounded-lg font-black border-2 border-transparent hover:border-black transition-all duration-200 select-none disabled:opacity-50 ${isCapturing ? 'bg-red-500 text-white' : 'bg-[#F6EC24] text-black'}`}
                    >
                      {isCapturing ? 'RECORDING' : 'HOLD'}
                    </button>
                  ) : (
                    <button
                      onClick={() => (isCapturing ? stopRecording() : startRecording())}
                      disabled={!recordTargetId || !isMicReady}
                      className={`h-[50px] px-8 rounded-lg font-black border-2 border-transparent hover:border-black transition-all duration-200 disabled:opacity-50 ${isCapturing ? 'bg-red-500 text-white' : 'bg-[#F6EC24] text-black'}`}
                    >
                      {isCapturing ? '■ STOP' : '● Record 2s'}
                    </button>
                  )}

                  {/* 3 DOT MENU — holds the Hold|Click switch + Settings */}
                  <CaptureMenu
                    mode={hold ? 'hold' : 'auto'}
                    onModeChange={(m) => setHold(m === 'hold')}
                    showModeSwitch={!isCapturing}
                    onOpenSettings={() => setShowSettings(true)}
                  />
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
              prediction={testMode === 'upload' ? testPrediction : livePrediction}
              colorOf={colorOf}
              onViewLayers={() => setShowLayers(true)}
              layersTitle="Watch your sound travel through the model's layers"
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
            prediction={livePrediction}
            images={images}
            selectedClassId={selectedClassId}
            classColors={classColors}
            defaultColors={DEFAULT_CLASS_COLORS}
            showUpload={true}
            showLivePrediction={false}
            sourceLabel="Record into this class"
            emptyHint="Add your first word class below"
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onRenameClass={handleRenameClass}
            onClearSamples={handleClearSamples}
            onCaptureOne={(id) => { handleSelectClass(id); void startRecording(id) }}
            onDeleteSample={handleDeleteSample}
            onUploadImage={(id, file) => { handleSelectClass(id); void handleUploadAudio(id, file) }}
            onSelectClass={handleSelectClass}
            onDisabledChange={setDisabledIds}
            onChangeColor={handleChangeColor}
            onActivateCamera={(id) => {
              handleSelectClass(id)
              if (isCapturing) stopRecording()
            }}
            onActivateUpload={(id) => {
              handleSelectClass(id)
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'audio/*,.wav,.mp3,.m4a,.aac,.ogg,.flac'
              input.onchange = async (event) => {
                const file = (event.target as HTMLInputElement).files?.[0]
                if (file) {
                  await handleUploadAudio(id, file)
                }
              }
              input.click()
            }}
            onTrain={handleTrain}
            onSave={classifier.saveModel}
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

      <AudioLayersReveal
        open={showLayers}
        mode="test"
        classes={classes}
        colorOf={(id, idx) => classColors[id] || DEFAULT_CLASS_COLORS[idx % DEFAULT_CLASS_COLORS.length]}
        sampleCounts={classifier.sampleCounts}
        samples={classifier.samplesRef.current}
        isTraining={false}
        isTrained={true}
        trainProgress={100}
        trainAccuracy={classifier.trainAccuracy}
        analyser={analyserRef.current}
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
