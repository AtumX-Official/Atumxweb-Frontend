import { useState, useRef, useEffect } from 'react'
import type { GestureClass, Prediction, TrainingStatus } from '../hooks/useGestureClassifier'
import { createPortal } from 'react-dom'
import DeleteIcon from '../icons/deleteicon'
import MenuIcon from '../icons/menuIcon'
import CameraIcon from '../icons/cameraIcon'
import UploadIcon from '../icons/uploadIcon'
import ClearAllIcon from '../icons/clearAllIcon'
import RenameIcon from '../icons/renameIcon'
import DisabledIcon from '../icons/disabledIcon'
import EnabledIcon from '../icons/enabledIcon'
import AddIcon from '../icons/addIcon'
import NextIcon from '../icons/nextIcon'
import PreviousIcon from '../icons/previousIcon'
import BinIcon from '../icons/binIcon'
import Delete from '../icons/delete'

export interface TrainingPanelProps {
  classes: GestureClass[]
  sampleCounts: Record<string, number>
  minSamples: number
  trainingStatus: TrainingStatus
  trainProgress: number
  trainAccuracy: number | null
  trainError: string | null
  prediction: Prediction | null
  images: Record<string, string[]>
  selectedClassId: string | null
  classColors: Record<string, string>
  defaultColors: string[]
  onAddClass: (name: string) => void
  onDeleteClass: (id: string) => void
  onRenameClass: (id: string, name: string) => void
  onClearSamples: (classId?: string) => void
  onCaptureOne: (classId: string) => void
  onDeleteSample: (classId: string, index: number) => void
  onUploadImage: (classId: string, file: File) => void
  onSelectClass: (id: string) => void
  onActivateCamera: (classId: string) => void
  onActivateUpload: (classId: string) => void
  onChangeColor: (classId: string, color: string) => void
  onTrain: () => void
  onSave: () => void
  onReset: () => void
}

// ── Image Popup ───────────────────────────────────────────────────────────────

interface ImagePopupProps {
  images: string[]
  initialIndex: number
  className: string
  color: string
  onDelete: (index: number) => void
  onClose: () => void
}

function ImagePopup({ images, initialIndex, className, color, onDelete, onClose }: ImagePopupProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft')   setIndex((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight')  setIndex((i) => Math.min(images.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  const img = images[index]
  const [prevHover, setPrevHover] = useState(false)
  const [nextHover, setNextHover] = useState(false)
  const [binHover, setBinHover] = useState(false)

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl shadow-2xl border border-black bg-white p-3"
        style={{ width: "clamp(320px, 40vw, 420px)", background: '#fff' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-8 right-0 z-10 rounded-full text-black-900 hover:text-red-500 flex items-center justify-center cursor-pointer border-none transition-colors duration-200"
        >
          <Delete />
        </button>
        <div className="w-full bg-white rounded-xl">
          <div
            className="w-full flex items-center justify-center rounded-lg overflow-hidden"
            style={{ height: "clamp(225px, 35vh, 280px)" }}
          >
          {img ? (
              <img src={img} alt="" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
          ) : (
            <span className="text-slate-600 text-sm">No image</span>
          )}
        </div>
        </div>
        <div className="flex items-center px-3 py-2.5">

          {/* CLASS LABEL */}
          <div
            className="min-w-[110px] max-w-[200px] px-8 py-3 rounded-lg text-[1rem] font-bold text-black whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ background: color }}
          >
            {className}
          </div>

          {/* RIGHT CONTROLS */}
          <div className="ml-auto flex items-center gap-2">

            <button
              onMouseEnter={() => setPrevHover(true)}
              onMouseLeave={() => setPrevHover(false)}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none disabled:opacity-30 transition-transform duration-200 hover:scale-125"
            >
              <PreviousIcon active={prevHover} />
            </button>

            <span className="text-[1rem] font-mono text-black">
              {index + 1}/{images.length}
            </span>

            <button
              onMouseEnter={() => setNextHover(true)}
              onMouseLeave={() => setNextHover(false)}
              onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))}
              disabled={index === images.length - 1}
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none disabled:opacity-30 transition-transform duration-200 hover:scale-125"
            >
              <NextIcon active={nextHover} />
            </button>

            <button
              onMouseEnter={() => setBinHover(true)}
              onMouseLeave={() => setBinHover(false)}
              onClick={() => {
                onDelete(index)
                if (images.length <= 1) onClose()
                else setIndex((i) => Math.min(i, images.length - 2))
              }}
              className="ml-1 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-transform duration-200 hover:scale-125"
              title="Delete this sample"
            >
              <BinIcon active={binHover} />
            </button>

          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Class Card ────────────────────────────────────────────────────────────────

interface ClassCardProps {
  cls: GestureClass
  index: number
  count: number
  minSamples: number
  images: string[]
  color: string
  isSelected: boolean
  onSelect: () => void
  onCapture: () => void
  onUpload: (file: File) => void
  onClear: () => void
  onDelete: () => void
  onRename: (name: string) => void
  onDeleteSample: (i: number) => void
  onChangeColor: (color: string) => void
  onActivateCamera: () => void
  onActivateUpload: () => void
}

function ClassCard({
  cls, count, minSamples, images, color, isSelected,
  onSelect, onCapture, onUpload, onClear, onDelete, onRename, onDeleteSample, onChangeColor,
  onActivateCamera, onActivateUpload,
}: ClassCardProps) {
  const fileRef    = useRef<HTMLInputElement>(null)
  const colorRef   = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [nameVal,  setNameVal]  = useState(cls.name)
  const [popup,    setPopup]    = useState<number | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)

  function commitRename() {
    const v = nameVal.trim()
    if (v && v !== cls.name) onRename(v)
    else setNameVal(cls.name)
    setEditing(false)
  }

  const GRID = 16

  return (
    <>
      {popup !== null && (
        <ImagePopup
          images={images}
          initialIndex={popup}
          className={cls.name}
          color={color}
          onDelete={(i) => { onDeleteSample(i); if (images.length <= 1) setPopup(null) }}
          onClose={() => setPopup(null)}
        />
      )}

      <div
        onClick={onSelect}
        className="rounded-2xl border-2 bg-white shadow-sm flex cursor-pointer transition-all p-2"
        style={{ borderColor: '#000' }}>

        {/* Left: 4×4 image grid */}
        <div
          className="grid flex-shrink-0 bg-gray-100 p-2 gap-1 rounded-md"
          style={{ gridTemplateColumns: 'repeat(4,1fr)', width: 140 }}
        >
          {Array.from({ length: GRID }).map((_, j) => (
            <button
              key={j}
              onClick={(e) => { e.stopPropagation(); images[j] !== undefined && setPopup(j) }}
              className="aspect-square bg-black rounded-sm overflow-hidden border-none p-0 cursor-pointer"
            >
              {images[j] && (
                <img src={images[j]} alt="" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
              )}
            </button>
          ))}
        </div>

        {/* Right: info + controls */}
        <div className="flex-1 flex flex-col justify-between p-2 min-w-0 relative">
          {/* Color picker triangle (bottom-right corner) */}
          <label
            className="absolute bottom-2 right-2 cursor-pointer"
            title="Pick color"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={colorRef}
              type="color"
              value={color}
              onChange={(e) => onChangeColor(e.target.value)}
              className="absolute opacity-0 w-px h-px"
              style={{ bottom: 0, right: 0 }}
            />
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '44px solid transparent',
                borderBottom: `44px solid ${color}`,
              }}
            />
          </label>

          {/* Top row: count badge + action buttons */}
          <div className="flex items-start justify-between gap-1">
            <span className="text-[0.72rem] font-mono font-bold text-white rounded-md px-2 py-0.5" style={{ background: '#111' }}>
              {count}
            </span>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>

              {/* Enable / Disable Button */}
              <button
                onClick={() => setIsEnabled(!isEnabled)}
                className="
                    w-6 h-6 flex items-center justify-center
                    cursor-pointer
                    text-gray-400
                    transition-all duration-200
                    hover:text-black
                  "
                title={isEnabled ? 'Enabled' : 'Disabled'}
              >
                {isEnabled ? <EnabledIcon /> : <DisabledIcon />}
              </button>

              <button
                onClick={onClear}
                className="w-6 h-6 flex items-center justify-center cursor-pointer text-gray-400 transition-all duration-200 hover:text-black"
                title="Clear all samples">
                <ClearAllIcon/>
              </button>

              <button
                onClick={onDelete}
                className="w-6 h-6 flex items-center justify-center cursor-pointer text-gray-400 transition-all duration-200 hover:text-black"
                title="Delete class">
                <DeleteIcon />
              </button>
            </div>
          </div>

          {/* Class name + rename */}
          <div className="flex items-end gap-1 border-b border-black-200 pb-1 mt-1" onClick={(e) => e.stopPropagation()}>
            {editing ? (
              <input
                autoFocus value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') { setNameVal(cls.name); setEditing(false) }
                }}
                className="flex-1 text-[1rem] font-bold text-black outline-none border-none bg-transparent"
              />
            ) : (
              <span className="flex-1 text-[1rem] font-bold text-black truncate">{cls.name}</span>
            )}
            <button
              onClick={() => { setEditing(true); setNameVal(cls.name) }}
              className="flex-shrink-0 bg-transparent border-none cursor-pointer text-black-500 hover:text-black text-[0.9rem] pb-0.5"
              title="Rename"
            >
              <RenameIcon />
            </button>
          </div>

          {/* Bottom: camera + upload */}
          <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onActivateCamera}
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center cursor-pointer border-none hover:text-black transition-colors flex-shrink-0"
              title="Show camera">
              <CameraIcon />
            </button>

            <button
              onClick={() => { onActivateUpload() }}
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center cursor-pointer border-none hover:text-white transition-colors flex-shrink-0"
              title="Show upload zone & pick file">
              <UploadIcon />
            </button>
            {count > 0 && (
              <span className={`text-[0.65rem] font-mono ml-auto pr-8 ${count >= minSamples ? 'text-green-500' : 'text-gray-400'}`}>
                {count >= minSamples ? '✓ ready' : `${count}/${minSamples}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function TrainingPanel({
  classes, sampleCounts, minSamples,
  trainingStatus, trainProgress, trainAccuracy, trainError,
  prediction, images, selectedClassId, classColors, defaultColors,
  onAddClass, onDeleteClass, onRenameClass, onClearSamples,
  onCaptureOne, onDeleteSample, onUploadImage,
  onSelectClass, onChangeColor,
  onActivateCamera, onActivateUpload,
  onTrain, onSave, onReset,
}: TrainingPanelProps) {
  const canTrain   = classes.length >= 2 && classes.every((c) => (sampleCounts[c.id] ?? 0) >= minSamples)
  const isTraining = trainingStatus === 'training'
  const isTrained  = trainingStatus === 'ready'
  const MAX_CLASSES = 5
  const canAddMoreClasses = classes.length < MAX_CLASSES
  const [addingClass,   setAddingClass]   = useState(false)
  const [newClassName,  setNewClassName]  = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)
  const [addHovered, setAddHovered] = useState(false)

  function openAddClass() {
    if (!canAddMoreClasses) return
  
    setAddingClass(true)
    setNewClassName('')
  
    setTimeout(() => {
      addInputRef.current?.focus()
    }, 0)
  }
  function commitAddClass() { const n = newClassName.trim(); if (n) onAddClass(n); setAddingClass(false); setNewClassName('') }
  function cancelAddClass() { setAddingClass(false); setNewClassName('') }

  function getColor(id: string, idx: number) {
    return classColors[id] ?? defaultColors[idx % defaultColors.length]
  }

  return (
    <div className="w-full flex flex-col gap-3" style={{ maxWidth: 450 }}>

        {/* Live prediction */}
        {isTrained && prediction && (
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-1">Live</p>
            <p className="text-lg font-bold text-black mb-1.5">{prediction.className}</p>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-[width] duration-100"
                style={{ width: `${Math.round(prediction.confidence * 100)}%`, background: prediction.confidence > 0.9 ? '#22c55e' : '#eab308' }} />
            </div>
            <p className="text-[0.68rem] font-mono text-gray-400 mt-1">{Math.round(prediction.confidence * 100)}% confidence</p>
          </div>
        )}

        {/* Class cards */}
        <div className="flex flex-col gap-2.5 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 320px)' }}>
          {classes.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl py-8 text-center text-gray-400 text-sm">
              Add your first gesture class below
            </div>
          )}
          {classes.map((cls, i) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              index={i}
              count={sampleCounts[cls.id] ?? 0}
              minSamples={minSamples}
              images={images[cls.id] ?? []}
              color={getColor(cls.id, i)}
              isSelected={selectedClassId === cls.id}
              onSelect={() => onSelectClass(cls.id)}
              onCapture={() => onCaptureOne(cls.id)}
              onUpload={(f) => onUploadImage(cls.id, f)}
              onClear={() => onClearSamples(cls.id)}
              onDelete={() => onDeleteClass(cls.id)}
              onRename={(name) => onRenameClass(cls.id, name)}
              onDeleteSample={(idx) => onDeleteSample(cls.id, idx)}
              onChangeColor={(c) => onChangeColor(cls.id, c)}
              onActivateCamera={() => onActivateCamera(cls.id)}
              onActivateUpload={() => onActivateUpload(cls.id)}
            />
          ))}
        </div>

        {/* Training feedback */}
        {trainError && (
          <p className="text-red-500 text-[0.75rem] bg-red-50 rounded-xl px-3 py-2 border border-red-100">⚠ {trainError}</p>
        )}
        {isTraining && (
          <div>
            <div className="flex justify-between text-[0.72rem] text-gray-500 mb-1">
              <span>Training model…</span><span className="font-mono">{trainProgress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${trainProgress}%`, background: '#F6EC24', boxShadow: '0 0 6px #F6EC24aa' }} />
            </div>
          </div>
        )}
        {isTrained && trainAccuracy != null && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200 text-[0.78rem] font-semibold text-green-600">
            ✓ Trained · val accuracy {trainAccuracy}%
          </div>
        )}

        {/* Add class input */}
        {addingClass && (
          <div className="flex gap-2">
            <input
              ref={addInputRef}
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitAddClass(); if (e.key === 'Escape') cancelAddClass() }}
              placeholder="Gesture name…"
              className="flex-1 border border-gray-300 rounded-xl text-black px-3 py-2 text-[0.85rem] outline-none"
            />
            <button onClick={commitAddClass} disabled={!newClassName.trim()}
              className={`border rounded-xl px-4 py-2 text-[0.85rem] font-bold transition-all ${newClassName.trim() ? 'bg-[#F6EC24] border-[#F6EC24] text-black cursor-pointer' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}>
              Add
            </button>
            <button onClick={cancelAddClass}
              className="border border-gray-200 rounded-xl px-3 py-2 text-gray-400 text-[0.85rem] cursor-pointer hover:text-gray-600">
              ✕
            </button>
          </div>
        )}
        

        {/* Bottom action bar */}
        <div className="flex items-center gap-2 h-12">
          <button
              onMouseEnter={() => setAddHovered(true)}
              onMouseLeave={() => setAddHovered(false)}
              onClick={openAddClass}
              title={canAddMoreClasses ? "Add class" : "Maximum 5 classes allowed"}
              disabled={!canAddMoreClasses}
              className={!canAddMoreClasses ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          >
            <AddIcon active={addHovered} />
          </button>

          <button
            onClick={onTrain}
            disabled={!canTrain || isTraining}
            className="flex-1 h-12 rounded-xl text-[0.95rem] font-black tracking-widest border-none transition-all"
            style={canTrain && !isTraining
              ? { background: '#F6EC24', color: '#000', cursor: 'pointer' }
              : { background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
          >
            {isTraining ? `${trainProgress}%` : isTrained ? 'RETRAIN' : 'TRAIN'}
          </button>

          <ThreeDotMenu onSave={onSave} onReset={onReset} isTrained={isTrained} />
        </div>

        {!canTrain && !isTraining && classes.length > 0 && (
          <p className="text-center text-[0.72rem] text-gray-400">
            {classes.length < 2 ? 'Add at least 2 classes' : `Each class needs ${minSamples}+ samples`}
          </p>
        )}
      </div>
    
  )
}

// ── 3-dot menu ────────────────────────────────────────────────────────────────

function ThreeDotMenu({ onSave, onReset, isTrained }: { onSave: () => void; onReset: () => void; isTrained: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex flex-col items-center justify-center gap-1 rounded-xl border-none cursor-pointer"
        title="More options">
        <MenuIcon />   
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 rounded-xl overflow-hidden shadow-xl z-[9999] flex flex-col"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.10)', minWidth: 140 }}>
          <button
            onClick={() => { onSave(); setOpen(false) }} disabled={!isTrained}
            className="px-4 py-2.5 text-[0.82rem] text-left border-none cursor-pointer transition-colors"
            style={isTrained ? { background: 'transparent', color: '#e2e8f0' } : { background: 'transparent', color: '#334155', cursor: 'not-allowed' }}
            onMouseEnter={(e) => isTrained && ((e.target as HTMLElement).style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
          >💾 Save model</button>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <button
            onClick={() => { onReset(); setOpen(false) }}
            className="px-4 py-2.5 text-[0.82rem] text-left border-none cursor-pointer"
            style={{ background: 'transparent', color: '#f87171' }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(248,113,113,0.08)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
          >↺ Reset model</button>
        </div>
      )}
    </div>
  )
}
