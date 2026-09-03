"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AIToolbar from './components/AIToolbar'
import ProjectPopup from './components/ProjectPopup'
import AudioVisualizer from './components/AudioVisualizer'
import AudioLayersReveal from './components/AudioLayersReveal'
import { useAudioClassifier, type AudioClass, type Prediction } from './hooks/useAudioClassifier'
import { generateMelSpectrogram } from './utils/audioDSP'
import { uniqueClassName } from './utils/uniqueClassName'
import MenuIcon from './icons/menuIcon'
import HoldOnIcon from './icons/holdOn'
import HoldOffIcon from './icons/holdOff'

const DEFAULT_CLASS_COLORS = ['#F6EC24', '#36D3FF', '#F6268B', '#a78bfa', '#60a5fa', '#fb923c', '#34d399', '#f87171']

// Voice Activity Detection (VAD) Energy Gate Utility
function calculateRMS(audioBuffer: Float32Array): number {
  let sum = 0
  for (let i = 0; i < audioBuffer.length; i++) {
    sum += audioBuffer[i] * audioBuffer[i]
  }
  return Math.sqrt(sum / audioBuffer.length)
}

interface FileOpenResult {
  success: boolean
  data: string
  fileName: string
}

export default function AudioApp() {
  const router = useRouter()
  const classifier = useAudioClassifier()

  const [classes, setClasses] = useState<AudioClass[]>(() => [
    { id: 'cls_1', name: 'Class 1' },
    { id: 'cls_2', name: 'Class 2' },
    { id: 'cls_3', name: 'Background Noise' },
  ])
  const [spectrograms, setSpectrograms] = useState<Record<string, Float32Array[]>>({})
  const [selectedClassId, setSelectedClassId] = useState<string | null>('cls_1')
  const [classColors, setClassColors] = useState<Record<string, string>>({})

  // Audio state
  const [isMicReady, setIsMicReady] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isActivelyRecording, setIsActivelyRecording] = useState(false)
  const [recordProgress, setRecordProgress] = useState(0)
  const [recordTimeLeft, setRecordTimeLeft] = useState(3.0)
  const [thumbOffset, setThumbOffset] = useState(0)

  // VAD Energy Threshold state
  const [rmsThreshold, setRmsThreshold] = useState(0.01)

  // Settings
  const [showSettings, setShowSettings] = useState(false)
  const [hold, setHold] = useState(false) // default to false (click to record 2s is much easier for voice commands)
  const [delay, setDelay] = useState<number>(0) // seconds delay before recording starts
  const [showUnknownInBreakdown, setShowUnknownInBreakdown] = useState(false)

  // Testing Workspace
  const [isTesting, setIsTesting] = useState(false)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [showLayers, setShowLayers] = useState(false)
  const [trainingPopup, setTrainingPopup] = useState(false)

  // Project details
  const [projectName, setProjectName] = useState('')
  const [, setProjectDesc] = useState('')
  const [showProjectPopup, setShowProjectPopup] = useState(false)

  // Audio nodes and state
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null)

  // Recording buffer state refs
  const recordingRef = useRef<{ isRecording: boolean }>({ isRecording: false })
  const recordingBufferRef = useRef<Float32Array>(new Float32Array(44100)) // 2 seconds @ 22050Hz
  const recordingIndexRef = useRef<number>(0)
  const rollingBufferRef = useRef<Float32Array>(new Float32Array(44100)) // sliding 2s window for testing

  const latestFinishedRef = useRef<(waveform: Float32Array) => void>(() => {})

  const classIdCounter = useRef(3)

  // Selected Class details
  const selectedIndex = selectedClassId ? classes.findIndex((c) => c.id === selectedClassId) : -1
  const selectedClass = selectedIndex >= 0 ? classes[selectedIndex] : null
  const selectedSpecs = selectedClassId ? (spectrograms[selectedClassId] ?? []) : []
  const selectedColor = selectedClassId
    ? (classColors[selectedClassId] ?? (selectedIndex >= 0 ? DEFAULT_CLASS_COLORS[selectedIndex % DEFAULT_CLASS_COLORS.length] : '#F6EC24'))
    : '#F6EC24'

  const handleRecordingFinished = useCallback((waveform: Float32Array) => {
    setSelectedClassId((currentSelectedId) => {
      if (!currentSelectedId) return currentSelectedId

      // Extract speech features
      const spec = generateMelSpectrogram(waveform)

      // Save to hook
      classifier.addSample(currentSelectedId, spec)

      // Save locally for UI thumbnails
      setSpectrograms((prev) => ({
        ...prev,
        [currentSelectedId]: [...(prev[currentSelectedId] ?? []), spec]
      }))

      return currentSelectedId
    })
  }, [classifier])

  useEffect(() => {
    latestFinishedRef.current = handleRecordingFinished
  }, [handleRecordingFinished])

  // Initialize audio streams
  const initAudio = useCallback(async () => {
    try {
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
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
        mediaStreamRef.current = null
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          await audioContextRef.current.close()
        } catch {
          /* already closing */
        }
      }
      audioContextRef.current = null

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

      if (!AudioContextClass) {
        throw new Error('AudioContext is not supported in this environment.')
      }

      // Request 22050Hz directly so the browser does hardware downsampling automatically
      const ctx = new AudioContextClass({ sampleRate: 22050 })
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      sourceNodeRef.current = source

      const analyserNode = ctx.createAnalyser()
      analyserNode.fftSize = 1024
      source.connect(analyserNode)

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
            setIsActivelyRecording(false)

            const finalWave = new Float32Array(recBuffer)
            // Trigger processing out of the audio thread
            setTimeout(() => {
              latestFinishedRef.current(finalWave)
            }, 10)
          }
        }
      }

      setAnalyser(analyserNode)
      setMicError(null)
      setIsMicReady(true)
    } catch (err) {
      console.error('Failed to initialize microphone:', err)
      setAnalyser(null)
      setIsMicReady(false)
      setMicError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  // Auto request mic on mount
  useEffect(() => {
    classifier.initClass('cls_1')
    classifier.initClass('cls_2')
    classifier.initClass('cls_3')

    const activeRecording = recordingRef.current
    let isCancelled = false

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        mediaStreamRef.current = stream

        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

        if (!AudioContextClass) {
          setMicError('AudioContext is not supported in this environment.')
          return
        }

        const ctx = new AudioContextClass({ sampleRate: 22050 })
        audioContextRef.current = ctx

        const source = ctx.createMediaStreamSource(stream)
        sourceNodeRef.current = source

        const analyserNode = ctx.createAnalyser()
        analyserNode.fftSize = 1024
        source.connect(analyserNode)

        const processor = ctx.createScriptProcessor(4096, 1, 1)
        processorNodeRef.current = processor
        source.connect(processor)
        processor.connect(ctx.destination)

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0)

          const roll = rollingBufferRef.current
          roll.copyWithin(0, inputData.length)
          roll.set(inputData, roll.length - inputData.length)

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
              setIsActivelyRecording(false)

              const finalWave = new Float32Array(recBuffer)
              setTimeout(() => {
                latestFinishedRef.current(finalWave)
              }, 10)
            }
          }
        }

        if (!isCancelled) {
          setAnalyser(analyserNode)
          setMicError(null)
          setIsMicReady(true)
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          console.error('Failed to initialize microphone:', err)
          setAnalyser(null)
          setIsMicReady(false)
          setMicError(err instanceof Error ? err.message : String(err))
        }
      })

    return () => {
      isCancelled = true
      if (activeRecording) {
        activeRecording.isRecording = false
      }
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
      if (audioContextRef.current) {
        void audioContextRef.current.close()
      }
    }
  }, [classifier])

  // Keep the mic responsive independently of the model.
  const ensureMicAlive = useCallback(async () => {
    const ctx = audioContextRef.current
    if (!ctx || ctx.state === 'closed') {
      await initAudio()
      return
    }
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        /* will retry on next user gesture */
      }
    }
  }, [initAudio])

  const handleAddClass = useCallback((name: string) => {
    const id = `cls_${++classIdCounter.current}`
    classifier.initClass(id)
    setClasses((prev) => {
      const unique = uniqueClassName(name, prev.map((c) => c.name))
      return [...prev, { id, name: unique }]
    })
    setSelectedClassId(id)
    setThumbOffset(0)
  }, [classifier])

  // Rename updates per keystroke (below); normalize on blur so the final name can't
  // duplicate another class (duplicate names corrupt the save/load bundle).
  const handleCommitClassName = useCallback((id: string) => {
    setClasses((prev) => {
      const cur = prev.find((c) => c.id === id)
      if (!cur) return prev
      const unique = uniqueClassName(cur.name, prev.filter((c) => c.id !== id).map((c) => c.name))
      return unique === cur.name ? prev : prev.map((c) => (c.id === id ? { ...c, name: unique } : c))
    })
  }, [])

  const handleDeleteClass = useCallback((id: string) => {
    classifier.removeClassData(id)
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setSpectrograms((prev) => {
      const n = { ...prev }
      delete n[id]
      return n
    })
    setClassColors((prev) => {
      const n = { ...prev }
      delete n[id]
      return n
    })
    setSelectedClassId((prev) => (prev === id ? null : prev))
    setThumbOffset(0)
  }, [classifier])

  const handleRenameClass = useCallback((id: string, name: string) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }, [])

  const handleClearSamples = useCallback((classId?: string) => {
    classifier.clearSamples(classId)
    if (classId) {
      setSpectrograms((prev) => ({ ...prev, [classId]: [] }))
    } else {
      setSpectrograms({})
    }
    setThumbOffset(0)
  }, [classifier])

  const handleDeleteSample = useCallback((classId: string, index: number) => {
    classifier.deleteSample(classId, index)
    setSpectrograms((prev) => {
      const arr = [...(prev[classId] ?? [])]
      arr.splice(index, 1)
      return { ...prev, [classId]: arr }
    })
    setThumbOffset((prev) => Math.max(0, prev - 1))
  }, [classifier])

  const handleSelectClass = useCallback((id: string) => {
    setSelectedClassId(id)
    setThumbOffset(0)
  }, [])

  const startActiveBuffer = useCallback(() => {
    recordingIndexRef.current = 0
    recordingBufferRef.current.fill(0.0)
    recordingRef.current.isRecording = true
    setIsCapturing(true)
    setIsActivelyRecording(true)
  }, [])

  const startRecording = useCallback(async () => {
    if (!selectedClassId || !isMicReady) return

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
  }, [selectedClassId, isMicReady, delay, startActiveBuffer])

  const stopRecording = useCallback(() => {
    if (!recordingRef.current.isRecording) {
      setIsCapturing(false)
      setIsActivelyRecording(false)
      return
    }
    recordingRef.current.isRecording = false
    setIsCapturing(false)
    setIsActivelyRecording(false)

    // Pad early released waveform and add it safely
    const written = recordingIndexRef.current
    const partialWave = new Float32Array(44100)
    partialWave.set(recordingBufferRef.current.subarray(0, Math.min(44100, written)))
    handleRecordingFinished(partialWave)
  }, [handleRecordingFinished])

  const handleTrain = useCallback(() => {
    setTrainingPopup(true)
    classifier.trainModel(classes)
  }, [classes, classifier])

  const handleReset = useCallback(() => {
    classifier.resetModel()
    setPrediction(null)
    setIsTesting(false)
    // Reset clears the model only — keep the microphone working so the user can
    // immediately re-record without closing and reopening the Audio Classifier.
    void ensureMicAlive()
  }, [classifier, ensureMicAlive])

  const handleCreateProject = useCallback((name: string, desc: string) => {
    setProjectName(name)
    setProjectDesc(desc)
    setShowProjectPopup(false)
    handleReset()
    setClasses([])
    setSpectrograms({})
    setClassColors({})
    setSelectedClassId(null)
    classIdCounter.current = 0
  }, [handleReset])

  const handleOpenProject = useCallback(async () => {
    try {
      const apiWindow = window as unknown as {
        api?: {
          file?: {
            open: (type: string) => Promise<FileOpenResult>
          }
        }
      }
      const res = await apiWindow.api?.file?.open('audioClassifier')
      if (!res || !res.success) return
      const bundle = JSON.parse(res.data)
      const restoredClasses: AudioClass[] = await classifier.loadModel(bundle)
      setClasses(restoredClasses)

      // Rebuild local spectrogram states for carousels
      const loadedSpecs: Record<string, Float32Array[]> = {}
      restoredClasses.forEach((c: AudioClass) => {
        loadedSpecs[c.id] = classifier.samplesRef.current[c.id] || []
      })
      setSpectrograms(loadedSpecs)

      setProjectName(res.fileName.replace('.json', ''))
      if (restoredClasses.length > 0) {
        setSelectedClassId(restoredClasses[0].id)
      }
    } catch (err) {
      console.error('Failed to load audio project:', err)
      alert('Failed to load project: ' + (err instanceof Error ? err.message : String(err)))
    }
  }, [classifier])

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
    if (!isTesting || !classifier.modelReady || !isMicReady) {
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
  }, [isTesting, classifier.modelReady, isMicReady, classifier, rmsThreshold])

  const isTrained = classifier.trainingStatus === 'ready'
  const isTraining = classifier.trainingStatus === 'training'

  const maxThumb = Math.max(0, selectedSpecs.length - 5)
  const clampedOffset = Math.min(thumbOffset, maxThumb)

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-800 bg-[#f3f4f6]">
      <AIToolbar
        onBack={() => router.push('/')}
        onSave={() => classifier.saveModel(projectName || 'audio-model')}
        isTrained={classifier.modelReady}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onNewProject={() => setShowProjectPopup(true)}
        onOpenProject={handleOpenProject}
      />

      {/* Full-width "How It Learns" training pipeline */}
      <AudioLayersReveal
        open={trainingPopup}
        mode="train"
        classes={classes}
        colorOf={(id, idx) => classColors[id] || DEFAULT_CLASS_COLORS[idx % DEFAULT_CLASS_COLORS.length]}
        sampleCounts={classifier.sampleCounts}
        samples={spectrograms}
        isTraining={isTraining}
        isTrained={isTrained}
        trainProgress={classifier.trainProgress}
        trainAccuracy={classifier.trainAccuracy}
        onClose={() => setTrainingPopup(false)}
        onCancel={() => {
          classifier.cancelTraining()
          setTrainingPopup(false)
        }}
      />

      {/* Main 3-Column Content Layout */}
      <main
        className="flex-1 flex relative z-20 justify-center items-stretch gap-6 p-6 overflow-hidden"
        style={{
          backgroundColor: '#efefef',
          backgroundImage: 'radial-gradient(circle, #d0d0d0 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* COLUMN 1: Audio Classes Panel (Left) */}
        <div className="flex flex-col w-[320px] shrink-0 gap-4 min-h-0">
          <div className="flex-1 min-h-0 bg-white rounded-2xl border-2 border-black p-5 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black border-b-2 border-slate-100 pb-3 mb-4 tracking-wider flex items-center justify-between">
              <span>WORD CLASSES</span>
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
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected ? 'border-black bg-slate-50' : 'border-slate-200 hover:border-slate-400 bg-white'
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
                          className="font-bold text-sm bg-transparent outline-none border-b border-transparent focus:border-slate-500 w-36"
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
                      <span className="font-mono">{count} Voice Samples</span>
                      {count > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClearSamples(cls.id)
                          }}
                          className="text-xs hover:underline text-red-400 font-bold"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectClass(cls.id)
                          setIsTesting(false)
                          setPrediction(null)
                          void startRecording()
                        }}
                        className="bg-[#F6EC24] hover:bg-yellow-300 text-[0.7rem] font-bold py-1.5 rounded-md border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1"
                      >
                        🎙️ Record Sample
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Audio Preview & Record Bay (Center) */}
        <div className="w-[clamp(340px,42vw,36rem)] shrink-0 min-h-0 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Waveform/Microphone Stream Card */}
          <div className="bg-white rounded-2xl border-2 border-black p-4 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden shrink-0">
            <div className="flex items-center justify-between mb-3.5">
              <span
                className="px-4 py-1 rounded-full text-xs font-black border border-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                style={{ backgroundColor: selectedClass ? selectedColor : '#e2e8f0' }}
              >
                {selectedClass ? `${selectedClass.name} Feed` : 'Microphone Stream'}
              </span>

              <div className="flex items-center gap-2">
                {micError && (
                  <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                    ⚠️ Mic Error
                  </span>
                )}
                {selectedClassId && (
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 p-1.5 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <MenuIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Visualizer and settings container */}
            <div className="relative aspect-video rounded-xl bg-[#0f172a] overflow-hidden border border-black shadow-[inset_0px_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0">
              {!showSettings ? (
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* Dynamic waveform painting */}
                  <AudioVisualizer
                    mode="waveform"
                    analyser={analyser}
                    accentColor={selectedColor}
                    width={520}
                    height={260}
                  />

                  {/* Circular visual countdown indicator when recording is running */}
                  {isActivelyRecording && (
                    <div className="absolute inset-0 bg-[#0f172ab0] flex flex-col items-center justify-center backdrop-blur-[2px] p-2">
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
              ) : (
                /* Capture settings inside center card */
                <div className="absolute inset-0 bg-white p-5 flex flex-col overflow-y-auto z-30">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                    <span className="font-black text-sm uppercase tracking-wider text-slate-600">Recording Options</span>
                    <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-black font-black">✕</button>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Hold to Record</span>
                      <button
                        onClick={() => setHold(!hold)}
                        className={`px-3 py-1.5 rounded-lg border-2 border-black font-bold transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                          hold ? 'bg-green-400' : 'bg-red-400 text-white'
                        }`}
                      >
                        {hold ? <HoldOnIcon width={50} height={16} /> : <HoldOffIcon width={50} height={16} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Countdown Delay (seconds)</span>
                      <input
                        type="number"
                        value={delay}
                        onChange={(e) => setDelay(Math.max(0, Number(e.target.value) || 0))}
                        className="w-16 bg-[#F6EC24] border-2 border-black text-center font-bold outline-none rounded"
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
                      <span className="text-sm font-bold text-slate-800">Show Unknown in Breakdown</span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showUnknownInBreakdown}
                          onChange={(e) => setShowUnknownInBreakdown(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full border-2 border-black peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-2 after:border-black after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F6EC24] peer-checked:after:bg-black"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full bg-[#2EED08] text-white font-bold py-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-xs tracking-widest mt-4"
                  >
                    Apply Options
                  </button>
                </div>
              )}
            </div>

            {/* Mel Spectrogram Thermal Thumbnails Strip */}
            {selectedSpecs.length > 0 && (
              <div className="mt-3">
                <div className="text-[0.62rem] font-black tracking-[0.18em] text-slate-400 uppercase mb-1.5">
                  ▾ What the model hears
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxThumb}
                  value={clampedOffset}
                  onChange={(e) => setThumbOffset(Number(e.target.value))}
                  disabled={maxThumb === 0}
                  className="thumb-slider block w-full h-[8px] my-1"
                />

                <div className="flex gap-2 justify-between mt-2 overflow-x-auto">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const spec = selectedSpecs[clampedOffset + idx]
                    return (
                      <div
                        key={idx}
                        className="relative w-[88px] h-[52px] rounded-lg overflow-hidden border-2 border-black bg-slate-900 shrink-0 group shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                      >
                        {spec ? (
                          <>
                            <AudioVisualizer mode="spectrogram" spectrogramData={spec} width={88} height={52} />
                            <button
                              onClick={() => {
                                if (selectedClassId) {
                                  handleDeleteSample(selectedClassId, clampedOffset + idx)
                                }
                              }}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity border border-black shadow"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full bg-slate-950" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recording Controls Triggers */}
            {!showSettings && !isTesting && selectedClassId && (
              <div className="flex justify-center mt-4">
                {hold ? (
                  <button
                    onMouseDown={() => void startRecording()}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={(e) => { e.preventDefault(); void startRecording() }}
                    onTouchEnd={(e) => { e.preventDefault(); stopRecording() }}
                    className={`w-full py-3 rounded-xl font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-sm tracking-wider select-none transition-all ${
                      isCapturing ? 'bg-red-500 text-white animate-pulse' : 'bg-[#F6EC24] text-black hover:bg-yellow-300'
                    }`}
                  >
                    {isCapturing ? 'RELEASE TO FINISH' : 'Hold to Record Voice Sample'}
                  </button>
                ) : (
                  <button
                    onClick={isCapturing ? stopRecording : () => void startRecording()}
                    className={`w-full py-3 rounded-xl font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-sm tracking-wider transition-all ${
                      isCapturing ? 'bg-red-500 text-white animate-pulse' : 'bg-[#F6EC24] text-black hover:bg-yellow-300'
                    }`}
                  >
                    {isCapturing ? 'STOP CAPTURE' : 'Record 2s Voice Sample'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Model controls & trainer details */}
          <div className="bg-white rounded-2xl border-2 border-black p-5 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-4 shrink-0">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3.5">
              <span className="font-black text-sm uppercase tracking-wider text-slate-600">Model Engine Mode</span>
              <span className="text-xs font-black bg-yellow-100 text-yellow-800 border border-yellow-300 px-3 py-1 rounded-full uppercase tracking-wider">
                TensorFlow.js (WebGL) ⚡
              </span>
            </div>

            {classifier.trainError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl leading-relaxed">
                ⚠️ {classifier.trainError}
              </div>
            )}

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
                className={`font-black py-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs tracking-widest uppercase transition-all ${
                  isTrained ? 'bg-[#2EED08] text-white hover:bg-green-600' : 'bg-[#F6EC24] text-black hover:bg-yellow-300'
                }`}
              >
                {isTraining ? 'TRAINING...' : isTrained ? 'RETRAIN MODEL' : 'TRAIN MODEL'}
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Testing Panel (Right Column Card) */}
        <div className="flex flex-col w-[320px] shrink-0 gap-4 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto bg-white rounded-2xl border-2 border-black p-5 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black border-b-2 border-slate-100 pb-3 mb-4 tracking-wider uppercase">
              Testing Workspace
            </h2>

            {!isTrained ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl mb-4">🎙️</span>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  You must collect speech spectrograms and **Train a Model** on the left before you can test it here.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <p className="text-xs text-slate-400 font-bold leading-normal">
                  Model successfully trained! Turn on real-time testing to run rolling audio spectrograms through the neural network.
                </p>

                <button
                  onClick={() => {
                    setIsTesting((prev) => {
                      if (prev) {
                        setPrediction(null)
                      }
                      return !prev
                    })
                  }}
                  className={`w-full py-3 rounded-xl font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-xs tracking-wider transition-all ${
                    isTesting ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#2EED08] text-white hover:bg-green-600'
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
                  onClick={() => {
                    setIsTesting(true)
                    setShowLayers(true)
                  }}
                  className="w-full py-3 rounded-xl font-black border-2 border-black bg-[#04050d] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-xs tracking-wider transition-all hover:scale-[1.02]"
                  title="Watch your sound travel through the model's layers"
                >
                  🔬 View in Layers
                </button>

                {/* Real-Time Predictions Gauges */}
                {isTesting && (
                  <div className="mt-4 border-2 border-black rounded-xl p-4 bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[0.62rem] text-slate-400 font-bold uppercase tracking-widest">Active Output Class</span>
                    <div className="text-lg font-black text-slate-800 mb-4">
                      {prediction?.className || 'Analyzing Voice... 🎙️'}
                    </div>

                    <span className="text-[0.62rem] text-slate-400 font-bold uppercase tracking-widest">Prediction Confidence</span>
                    <div className="flex items-center gap-3 mt-1.5 mb-5">
                      <div className="flex-1 h-3.5 bg-slate-200 rounded-full border border-slate-300 overflow-hidden">
                        <div
                          className={`h-full transition-[width] duration-150 border-r border-black ${
                            prediction && prediction.isDetected ? '' : 'bg-slate-300'
                          }`}
                          style={{
                            width: `${prediction && prediction.isDetected ? Math.round(prediction.confidence * 100) : 0}%`,
                            // Colour the confidence bar to match the detected class
                            backgroundColor:
                              prediction && prediction.isDetected && prediction.classId
                                ? classColors[prediction.classId] ||
                                  DEFAULT_CLASS_COLORS[
                                    Math.max(0, classes.findIndex((c) => c.id === prediction.classId)) %
                                      DEFAULT_CLASS_COLORS.length
                                  ]
                                : undefined,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold">
                        {prediction && prediction.isDetected ? `${Math.round(prediction.confidence * 100)}%` : '--'}
                      </span>
                    </div>

                    {/* Breakdown of other classes */}
                    <span className="text-[0.62rem] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-200 block pt-3 mb-2">
                      Class Breakdown
                    </span>
                    <div className="space-y-2">
                      {/* Explicitly display the Unknown class in the breakdown list if configured */}
                      {showUnknownInBreakdown && (
                        <div className="text-xs">
                          <div className="flex justify-between font-bold mb-1">
                            <span>Unknown</span>
                            <span className="font-mono">
                              {prediction && !prediction.isDetected ? '100%' : '0%'}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                            <div
                              className="h-full transition-[width] duration-150 bg-slate-400"
                              style={{ width: `${prediction && !prediction.isDetected ? 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {classes.map((c, idx) => {
                        const probEntry = prediction?.probabilities?.find((p) => p.name === c.name)
                        const probValue =
                          prediction && prediction.isDetected && probEntry
                            ? Math.round(probEntry.prob * 100)
                            : 0
                        const color =
                          classColors[c.id] ||
                          DEFAULT_CLASS_COLORS[idx % DEFAULT_CLASS_COLORS.length]

                        return (
                          <div key={c.id} className="text-xs">
                            <div className="flex justify-between font-bold mb-1">
                              <span>{c.name}</span>
                              <span className="font-mono">{probValue}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                              <div
                                className="h-full transition-[width] duration-150"
                                style={{ width: `${probValue}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <AudioLayersReveal
        open={showLayers}
        mode="test"
        classes={classes}
        colorOf={(id, idx) => classColors[id] || DEFAULT_CLASS_COLORS[idx % DEFAULT_CLASS_COLORS.length]}
        sampleCounts={classifier.sampleCounts}
        samples={spectrograms}
        isTraining={false}
        isTrained={true}
        trainProgress={100}
        trainAccuracy={classifier.trainAccuracy}
        analyser={analyser}
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

