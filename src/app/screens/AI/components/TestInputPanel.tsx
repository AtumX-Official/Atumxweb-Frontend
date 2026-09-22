import { useRef, type ReactNode } from 'react'
import MicIcon from '../icons/micIcon'
import CameraIcon from '../icons/cameraIcon'
import UploadIcon from '../icons/uploadIcon'

// Left column of a screen's test view: a live source (camera or microphone) or an
// uploaded file, picked with the two buttons under the stage — the same shell the
// hand screen's predict page uses. The caller renders the stage content.

export type TestInputMode = 'idle' | 'live' | 'upload'

interface TestInputPanelProps {
  mode: TestInputMode
  onModeChange: (mode: TestInputMode) => void
  /** Called with a file the user picked or dropped on the stage. */
  onFile: (file: File) => void
  /** `accept` for the file picker, e.g. "image/*" or "audio/*". */
  accept: string
  live: 'camera' | 'mic'
  children: ReactNode
}

export default function TestInputPanel({ mode, onModeChange, onFile, accept, live, children }: TestInputPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="w-[clamp(320px,30vw,480px)] flex flex-col">
      {/* Header */}
      <div className="w-[clamp(240px,21vw,340px)] h-[clamp(40px,3vw,56px)] bg-black border-t-2 border-l-2 border-r-2 border-black rounded-t-lg flex items-center pl-4 font-bold">
        <span className="text-white font-black text-[0.78rem] tracking-[0.2em]">UPLOAD</span>
      </div>

      <div className="w-full bg-white dark:bg-[#1f1f1f] border-2 border-black dark:border-black rounded-tr-xl rounded-br-xl rounded-bl-xl p-3">
        <div className="relative w-full aspect-video mx-auto rounded-lg overflow-hidden bg-black">
          {mode === 'idle' ? (
            <div className="w-full h-full flex items-center justify-center select-none bg-[#FFF000]">
              <p className="font-bold text-center text-black text-xl leading-tight">
                {live === 'camera' ? 'Select camera or' : 'Select microphone or'}<br />upload files.
              </p>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200" />

        {/* Mode buttons */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onModeChange('live')}
            className="flex items-center justify-center rounded-xl border-none cursor-pointer transition-colors"
            style={{ width: 52, height: 52 }}
            title={live === 'camera' ? 'Use camera' : 'Use microphone'}
          >
            {live === 'camera' ? <CameraIcon /> : <MicIcon />}
          </button>

          <button
            onClick={() => { onModeChange('upload'); fileInputRef.current?.click() }}
            className="flex items-center justify-center rounded-xl border-none cursor-pointer transition-colors"
            style={{ width: 52, height: 52 }}
            title={live === 'camera' ? 'Upload image' : 'Upload audio'}
          >
            <UploadIcon />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>
    </div>
  )
}

/** Yellow drop zone for the upload stage: spinner, the result, or the drop prompt. */
export function UploadStage({
  processing,
  processingLabel,
  error,
  result,
  onFile,
  accept,
}: {
  processing: boolean
  processingLabel: string
  error: string | null
  /** What to show once a file was tested (the photo, a waveform…). */
  result: ReactNode | null
  onFile: (file: File) => void
  accept: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer select-none bg-[#F6EC24]"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
    >
      {processing ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-black border-t-transparent animate-spin" />
          <span className="font-bold text-black text-sm">{processingLabel}</span>
        </div>
      ) : result ? (
        result
      ) : (
        <div className="flex flex-col items-center justify-center gap-3">
          <span className="font-black text-black leading-none" style={{ fontSize: '4rem', lineHeight: 1 }}>+</span>
          {error ? (
            <p className="font-bold text-black text-sm mt-2 text-center px-4">{error}</p>
          ) : (
            <p className="font-bold text-center text-black leading-tight">
              Add or Drop files<br />from your computer
            </p>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
