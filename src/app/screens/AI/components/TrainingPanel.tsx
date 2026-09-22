import { useState, useRef, useEffect } from 'react'
import { Mic } from 'lucide-react'
import type { GestureClass, Prediction, TrainingStatus } from '../hooks/useGestureClassifier'
import { createPortal } from 'react-dom'
import DeleteIcon from '../icons/deleteicon'
import MenuIcon from '../icons/menuIcon'
import CameraIcon from '../icons/cameraIcon'
import UploadIcon from '../icons/uploadIcon'
import ClearAllIcon from '../icons/clearAllIcon'
import RenameIcon from '../icons/renameIcon'
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
  disabledClassIds: Set<string>
  onToggleClassEnabled: (id: string) => void
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
  /** Receives only the classes still enabled in the panel. */
  onTrain: (enabledClasses: GestureClass[]) => void
  onSave: () => void
  onReset: () => void
  onViewLayers?: () => void
  /** Hide the per-class upload button on modalities with no file input (audio). */
  showUpload?: boolean
  /** Hide the Live prediction card (audio renders its own under the mic panel). */
  showLivePrediction?: boolean
  /** Wording for the empty state and the per-class camera button's tooltip. */
  sourceLabel?: string
  emptyHint?: string
  /** Told the ids of the classes switched off, so the screen can stop recording into them. */
  onDisabledChange?: (disabledIds: string[]) => void
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

function ImagePopup({
  images,
  initialIndex,
  className,
  color,
  onDelete,
  onClose
}: ImagePopupProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1))
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
        style={{ width: 'clamp(320px, 40vw, 420px)', background: '#fff' }}
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
            style={{ height: 'clamp(225px, 35vh, 280px)' }}
          >
            {img ? (
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
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

// ── Enable toggle icons ───────────────────────────────────────────────────────

function ClassEnabledIcon() {
  return (
    <svg width="21" height="22" viewBox="0 0 32 27" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13.5" cy="13.5" r="12" stroke="currentColor" strokeWidth="3" />
    </svg>
  )
}

function ClassDisabledIcon() {
  return (
    <svg width="21" height="22" viewBox="0 0 32 27" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13.5" cy="13.5" r="12" stroke="currentColor" strokeWidth="3" />
      <path d="M5 22L22 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ── Can't-train notice ────────────────────────────────────────────────────────

/** Explains why TRAIN did nothing, instead of leaving a dead greyed-out button. */
function TrainBlockedPopup({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl shadow-2xl border-2 border-black dark:border-white/20 bg-white dark:bg-[#1f1f1f] px-6 py-5 text-center"
        style={{ width: 'clamp(300px, 34vw, 400px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[1.05rem] font-bold text-black dark:text-white mb-2">
          Nothing to train yet
        </p>
        <p className="text-[0.85rem] text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 rounded-xl px-6 py-2 text-[0.9rem] font-bold text-black border-none cursor-pointer"
          style={{ background: '#F6EC24' }}
        >
          OK
        </button>
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
  isEnabled: boolean
  onToggleEnabled: () => void
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
  showUpload: boolean
  sourceLabel: string
}

function ClassCard({
  cls,
  count,
  minSamples,
  images,
  color,
  isSelected,
  isEnabled,
  onToggleEnabled,
  onSelect,
  onCapture,
  onUpload,
  onClear,
  onDelete,
  onRename,
  onDeleteSample,
  onChangeColor,
  onActivateCamera,
  onActivateUpload,
  showUpload,
  sourceLabel
}: ClassCardProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const colorRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(cls.name)
  const [popup, setPopup] = useState<number | null>(null)
  // Faded parts of a disabled card; the enable toggle stays fully visible.
  const disabledFade = isEnabled ? '' : 'opacity-40 grayscale pointer-events-none'

  function commitRename() {
    const v = nameVal.trim()
    if (v && v !== cls.name) onRename(v)
    else setNameVal(cls.name)
    setEditing(false)
  }

  // 5 columns × 4 rows: twenty thumbnails at the old cell size, so the card keeps
  // its height. Past twenty the badge reads "20+" (the grid can't show more).
  const GRID_COLS = 5
  const GRID = 20
  const CaptureIcon = sourceLabel === 'Record into this class' ? Mic : CameraIcon

  return (
    <>
      {popup !== null && (
        <ImagePopup
          images={images}
          initialIndex={popup}
          className={cls.name}
          color={color}
          onDelete={(i) => {
            onDeleteSample(i)
            if (images.length <= 1) setPopup(null)
          }}
          onClose={() => setPopup(null)}
        />
      )}

      <div
        onClick={isEnabled ? onSelect : undefined}
        data-class-card
        className={`rounded-2xl border-2 shadow-sm flex transition-all p-2 text-black dark:text-white ${
          isEnabled
            ? 'border-black dark:border-[#4c4c4c] bg-white dark:bg-[#1f1f1f] cursor-pointer'
            : 'border-gray-300 dark:border-[#333333] bg-slate-100/80 dark:bg-[#252525]/80 opacity-75 cursor-default'
        }`}
        style={{ scrollSnapAlign: 'start' }}
      >
        {/* Left: 5×4 image grid */}
        <div
          className={`grid flex-shrink-0 content-center bg-gray-100 dark:bg-[#2a2a2a] p-2 gap-1 rounded-md ${disabledFade}`}
          style={{ gridTemplateColumns: `repeat(${GRID_COLS},1fr)`, width: 175 }}
        >
          {Array.from({ length: GRID }).map((_, j) => (
            <button
              key={j}
              disabled={!isEnabled}
              onClick={(e) => {
                e.stopPropagation()
                images[j] !== undefined && setPopup(j)
              }}
              className={`aspect-square bg-black rounded-sm overflow-hidden border-none p-0 ${isEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              {images[j] && (
                <img
                  src={images[j]}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: info + controls */}
        <div className="flex-1 flex flex-col justify-between p-2 min-w-0 relative">
          {/* Color picker triangle (bottom-right corner) */}
          <label
            className={`absolute bottom-2 right-2 ${isEnabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${disabledFade}`}
            title={isEnabled ? 'Pick color' : 'Class is disabled'}
            onClick={(e) => {
              e.stopPropagation()
              if (!isEnabled) e.preventDefault()
            }}
          >
            <input
              ref={colorRef}
              type="color"
              value={color}
              disabled={!isEnabled}
              onChange={(e) => onChangeColor(e.target.value)}
              className="absolute opacity-0 w-px h-px"
              style={{ bottom: 0, right: 0 }}
            />
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '44px solid transparent',
                borderBottom: `44px solid ${color}`
              }}
            />
          </label>

          {/* Top row: count badge + action buttons */}
          <div className="flex items-start justify-between gap-1">
            <span
              className={`text-[0.72rem] font-mono font-bold text-white rounded-md px-2 py-0.5 ${disabledFade}`}
              style={{ background: '#111' }}
            >
              {count > GRID ? `${GRID}+` : count}
            </span>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {/* Enable / Disable Button — empty circle = enabled (default) */}
              <button
                onClick={onToggleEnabled}
                className={`w-6 h-6 flex items-center justify-center cursor-pointer transition-all duration-200 ${isEnabled ? 'text-gray-500 hover:text-black dark:hover:text-white' : 'text-red-500 hover:text-red-600'}`}
                title={
                  isEnabled
                    ? 'Enabled — click to exclude from training'
                    : 'Disabled — click to include in training'
                }
              >
                {isEnabled ? <ClassEnabledIcon /> : <ClassDisabledIcon />}
              </button>

              <button
                onClick={onClear}
                disabled={!isEnabled}
                className={`w-6 h-6 flex items-center justify-center text-gray-400 transition-all duration-200 ${isEnabled ? 'cursor-pointer hover:text-black' : 'cursor-not-allowed opacity-40'}`}
                title={isEnabled ? 'Clear all samples' : 'Class is disabled'}
              >
                <ClearAllIcon />
              </button>

              <button
                onClick={onDelete}
                disabled={!isEnabled}
                className={`w-6 h-6 flex items-center justify-center text-gray-400 transition-all duration-200 ${isEnabled ? 'cursor-pointer hover:text-black' : 'cursor-not-allowed opacity-40'}`}
                title={isEnabled ? 'Delete class' : 'Class is disabled'}
              >
                <DeleteIcon />
              </button>
            </div>
          </div>

          {/* Class name + rename */}
          <div
            className={`flex items-end gap-1 border-b border-black dark:border-[#626363] pb-1 mt-1 ${disabledFade}`}
            onClick={(e) => e.stopPropagation()}
          >
            {editing ? (
              <input
                autoFocus
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') {
                    setNameVal(cls.name)
                    setEditing(false)
                  }
                }}
                className="flex-1 text-[1rem] font-bold text-black dark:text-white outline-none border-none bg-transparent"
              />
            ) : (
              <span className="flex-1 text-[1rem] font-bold text-black dark:text-white truncate">
                {cls.name}
              </span>
            )}
            <button
              onClick={() => {
                setEditing(true)
                setNameVal(cls.name)
              }}
              disabled={!isEnabled}
              className={`flex-shrink-0 bg-transparent border-none text-gray-500 dark:text-gray-300 text-[0.9rem] pb-0.5 ${isEnabled ? 'cursor-pointer hover:text-black dark:hover:text-white' : 'cursor-not-allowed opacity-40'}`}
              title={isEnabled ? 'Rename' : 'Class is disabled'}
            >
              <RenameIcon />
            </button>
          </div>

          {/* Bottom: camera + upload */}
          <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onActivateCamera}
              disabled={!isEnabled}
              className={`w-10 h-10 rounded-xl bg-white dark:bg-[#2d2d2d] flex items-center justify-center border-none transition-colors flex-shrink-0 ${isEnabled ? 'cursor-pointer hover:text-black dark:hover:text-white' : 'cursor-not-allowed opacity-40'}`}
              title={isEnabled ? sourceLabel : 'Class is disabled'}
            >
              {sourceLabel === 'Record into this class' ? (
                <span className="w-8 h-8 rounded bg-black flex items-center justify-center">
                  <CaptureIcon size={18} color="white" />
                </span>
              ) : (
                <CaptureIcon />
              )}
            </button>

            {showUpload && (
              <button
                onClick={() => {
                  onActivateUpload()
                }}
                disabled={!isEnabled}
                className={`w-10 h-10 rounded-xl bg-white dark:bg-[#2d2d2d] flex items-center justify-center border-none transition-colors flex-shrink-0 ${isEnabled ? 'cursor-pointer hover:text-white' : 'cursor-not-allowed opacity-40'}`}
                title={isEnabled ? 'Show upload zone & pick file' : 'Class is disabled'}
              >
                <UploadIcon />
              </button>
            )}
            {count > 0 && (
              <span
                className={`text-[0.65rem] font-mono ml-auto pr-8 ${count >= minSamples ? 'text-green-500' : 'text-gray-400'}`}
              >
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
  classes,
  sampleCounts,
  minSamples,
  trainingStatus,
  trainProgress,
  trainAccuracy,
  trainError,
  prediction,
  images,
  selectedClassId,
  classColors,
  defaultColors,
  disabledClassIds,
  onToggleClassEnabled,
  onAddClass,
  onDeleteClass,
  onRenameClass,
  onClearSamples,
  onCaptureOne,
  onDeleteSample,
  onUploadImage,
  onSelectClass,
  onChangeColor,
  onActivateCamera,
  onActivateUpload,
  onTrain,
  onSave,
  onReset,
  onViewLayers,
  showUpload = true,
  showLivePrediction = true,
  sourceLabel = 'Show camera',
  emptyHint = 'Add your first gesture class below',
  onDisabledChange
}: TrainingPanelProps) {
  // Disabled classes are owned by the parent (controlled via disabledClassIds /
  // onToggleClassEnabled) and left out of training and the sample-count check.
  const enabledClasses = classes.filter((c) => !disabledClassIds.has(c.id))

  // Courtesy notification for any caller still listening on onDisabledChange,
  // now that the disabled set itself lives in the parent.
  useEffect(() => {
    onDisabledChange?.([...disabledClassIds])
  }, [disabledClassIds, onDisabledChange])

  // One enabled class is enough to train — the reject gate handles "not this one".
  const canTrain =
    enabledClasses.length >= 1 &&
    enabledClasses.every((c) => (sampleCounts[c.id] ?? 0) >= minSamples)
  const isTraining = trainingStatus === 'training'
  const isTrained = trainingStatus === 'ready'
  const MAX_CLASSES = 5
  const canAddMoreClasses = classes.length < MAX_CLASSES
  const [addingClass, setAddingClass] = useState(false)
  const [newClassName, setNewClassName] = useState('')
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
  function commitAddClass() {
    const n = newClassName.trim()
    if (n) onAddClass(n)
    setAddingClass(false)
    setNewClassName('')
  }
  function cancelAddClass() {
    setAddingClass(false)
    setNewClassName('')
  }

  const [trainBlocked, setTrainBlocked] = useState<string | null>(null)

  function handleTrainClick() {
    if (isTraining) return

    if (classes.length === 0) {
      setTrainBlocked('Add a class, record some samples for it, and then train.')
      return
    }
    if (enabledClasses.length === 0) {
      setTrainBlocked(
        'Every class is disabled, so there is nothing to learn from. Enable at least one class with the icon on its card, or add a new class, then train.'
      )
      return
    }
    const short = enabledClasses.filter((c) => (sampleCounts[c.id] ?? 0) < minSamples)
    if (short.length > 0) {
      setTrainBlocked(
        `${short.map((c) => `"${c.name}"`).join(', ')} ${short.length === 1 ? 'needs' : 'need'} at least ${minSamples} samples before training.`
      )
      return
    }

    onTrain(enabledClasses)
  }

  function toggleClassEnabled(id: string) {
    const currentlyDisabled = disabledClassIds.has(id)
    onToggleClassEnabled(id)
    // A disabled class must not keep receiving captures from a running camera,
    // so hand the selection to the first class that is still enabled.
    if (!currentlyDisabled && selectedClassId === id) {
      const fallback = classes.find((c) => c.id !== id && !disabledClassIds.has(c.id))
      if (fallback) onSelectClass(fallback.id)
    }
    // Switching a class back on while nothing usable is selected makes it the
    // recording target, so the camera works again without an extra click.
    if (currentlyDisabled && (!selectedClassId || disabledClassIds.has(selectedClassId))) {
      onSelectClass(id)
    }
  }

  function getColor(id: string, idx: number) {
    return classColors[id] ?? defaultColors[idx % defaultColors.length]
  }

  // ── Whole-card scrolling ───────────────────────────────────────────────────
  // The list is clipped by its own height, so an arbitrary height slices the
  // card sitting on the boundary straight through its black border. Sizing the
  // viewport to an exact multiple of (card + gap) and snapping to card starts
  // means the list always rests on complete cards — including at the very end,
  // where max scroll then lands exactly on a snap point.
  const CARD_GAP = 10 // gap-2.5
  const HEIGHT_BUDGET = 320 // first-paint fallback only — the real room is measured below
  const BOTTOM_GUTTER = 16 // breathing room under the panel
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)
  // True when cards sit past the bottom edge. The scrollbar is hidden by design,
  // so without a marker a class below the fold looks like it isn't there at all.
  const [moreBelow, setMoreBelow] = useState(false)

  useEffect(() => {
    const list = listRef.current
    if (!list) return

    function syncMoreBelow() {
      const l = listRef.current
      if (!l) return
      setMoreBelow(l.scrollHeight - l.scrollTop - l.clientHeight > 2)
    }

    function recalc() {
      const l = listRef.current
      if (!l) return
      const card = l.querySelector<HTMLElement>('[data-class-card]')
      if (!card) {
        setViewportHeight(null) // empty state — nothing to slice
        setMoreBelow(false)
        return
      }
      const step = card.getBoundingClientRect().height + CARD_GAP
      // Measure what's actually left under the list rather than assuming a fixed
      // chrome height: the old 320px guess hid the audio screen's third class on
      // shorter windows even though there was room for it. Everything below the
      // list is whatever sits between its bottom edge and the panel's, a distance
      // that doesn't change when the list itself grows or shrinks.
      const listRect = l.getBoundingClientRect()
      const panelBottom = panelRef.current?.getBoundingClientRect().bottom ?? listRect.bottom
      const below = panelBottom - listRect.bottom
      const available = window.innerHeight - listRect.top - below - BOTTOM_GUTTER
      const wholeCards = Math.max(1, Math.floor((available + CARD_GAP) / step))
      // Never reserve space for cards that don't exist.
      setViewportHeight(Math.min(classes.length, wholeCards) * step - CARD_GAP)
      requestAnimationFrame(syncMoreBelow)
    }

    recalc()

    // Cards resize with the window (the grid is sized in vw-ish units) and the
    // list itself changes as classes come and go. The block underneath grows and
    // shrinks too (training progress, the add-class row), which moves the fold.
    // Observing the panel catches both without a second wrapper element.
    const card = list.querySelector('[data-class-card]')
    const observer = new ResizeObserver(recalc)
    if (card) observer.observe(card)
    if (panelRef.current) observer.observe(panelRef.current)
    window.addEventListener('resize', recalc)
    list.addEventListener('scroll', syncMoreBelow, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', recalc)
      list.removeEventListener('scroll', syncMoreBelow)
    }
  }, [classes.length])

  function scrollDownOneCard() {
    const list = listRef.current
    const card = list?.querySelector<HTMLElement>('[data-class-card]')
    if (!list || !card) return
    list.scrollBy({ top: card.getBoundingClientRect().height + CARD_GAP, behavior: 'smooth' })
  }

  return (
    <div ref={panelRef} className="w-full flex flex-col gap-3" style={{ maxWidth: 450 }}>
      {/* Live prediction */}
      {showLivePrediction && isTrained && prediction && (
        <div className="bg-white dark:bg-[#1f1f1f] text-black dark:text-white border border-gray-200 dark:border-white/20 rounded-2xl px-4 py-3 shadow-sm">
          <p className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-1">Live</p>
          <p className="text-lg font-bold text-black dark:text-white mb-1.5">
            {prediction.className}
          </p>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{
                width: `${Math.round(prediction.confidence * 100)}%`,
                background: prediction.confidence > 0.9 ? '#22c55e' : '#eab308'
              }}
            />
          </div>
          <p className="text-[0.68rem] font-mono text-gray-400 mt-1">
            {Math.round(prediction.confidence * 100)}% confidence
          </p>
        </div>
      )}

      {/* Class cards */}
      <div className="relative">
        <div
          ref={listRef}
          className="flex flex-col gap-2.5 overflow-y-auto no-scrollbar"
          style={{
            maxHeight: viewportHeight ?? `calc(100vh - ${HEIGHT_BUDGET}px)`,
            scrollSnapType: 'y mandatory'
          }}
        >
          {classes.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl py-8 text-center text-gray-400 text-sm">
              {emptyHint}
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
              isEnabled={!disabledClassIds.has(cls.id)}
              onToggleEnabled={() => toggleClassEnabled(cls.id)}
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
              showUpload={showUpload}
              sourceLabel={sourceLabel}
            />
          ))}
        </div>

        {/* Sits in the gap under the list, so a class below the fold is visible */}
        {moreBelow && (
          <button
            onClick={scrollDownOneCard}
            title="Scroll down for more classes"
            className="absolute left-1/2 -translate-x-1/2 -bottom-2.5 z-10 flex items-center gap-1 rounded-full border-2 border-black bg-[#F6EC24] px-3 py-0.5 text-[0.68rem] font-black tracking-wide text-black cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          >
            MORE
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            >
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Training feedback */}
      {trainError && (
        <p className="text-red-500 text-[0.75rem] bg-red-50 rounded-xl px-3 py-2 border border-red-100">
          ⚠ {trainError}
        </p>
      )}
      {isTraining && (
        <div>
          <div className="flex justify-between text-[0.72rem] text-gray-500 mb-1">
            <span>Training model…</span>
            <span className="font-mono">{trainProgress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${trainProgress}%`,
                background: '#F6EC24',
                boxShadow: '0 0 6px #F6EC24aa'
              }}
            />
          </div>
        </div>
      )}
      {isTrained && trainAccuracy != null && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-500/15 rounded-xl border border-green-200 dark:border-green-400/40 text-[0.78rem] font-semibold text-green-600 dark:text-green-400">
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitAddClass()
              if (e.key === 'Escape') cancelAddClass()
            }}
            placeholder="Gesture name…"
            className="flex-1 border border-gray-300 dark:border-white/30 rounded-xl text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-white px-3 py-2 text-[0.85rem] outline-none bg-white dark:bg-[#2d2d2d]"
          />
          <button
            onClick={commitAddClass}
            disabled={!newClassName.trim()}
            className={`border rounded-xl px-4 py-2 text-[0.85rem] font-bold transition-all ${newClassName.trim() ? 'bg-[#F6EC24] border-[#F6EC24] text-black cursor-pointer' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            Add
          </button>
          <button
            onClick={cancelAddClass}
            className="border border-gray-200 rounded-xl px-3 py-2 text-gray-400 text-[0.85rem] cursor-pointer hover:text-gray-600"
          >
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
          title={canAddMoreClasses ? 'Add class' : 'Maximum 5 classes allowed'}
          disabled={!canAddMoreClasses}
          className={!canAddMoreClasses ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        >
          <AddIcon active={addHovered} />
        </button>

        <button
          onClick={handleTrainClick}
          disabled={isTraining}
          className="flex-1 h-12 rounded-xl text-[0.95rem] font-black tracking-widest border-none transition-all"
          style={
            canTrain && !isTraining
              ? { background: '#F6EC24', color: '#000', cursor: 'pointer' }
              : {
                  background: '#f3f4f6',
                  color: '#9ca3af',
                  cursor: isTraining ? 'not-allowed' : 'pointer'
                }
          }
        >
          {isTraining ? `${trainProgress}%` : isTrained ? 'RETRAIN' : 'TRAIN'}
        </button>

        <ThreeDotMenu onSave={onSave} onReset={onReset} onViewLayers={onViewLayers} isTrained={isTrained} />
      </div>

      {!canTrain && !isTraining && classes.length > 0 && (
        <p className="text-center text-[0.72rem] text-gray-400 dark:text-gray-300">
          {enabledClasses.length < 1
            ? 'All classes are disabled — enable one or add a new class'
            : `Each enabled class needs ${minSamples}+ samples`}
        </p>
      )}

      {trainBlocked && <TrainBlockedPopup message={trainBlocked} onClose={() => setTrainBlocked(null)} />}
    </div>
  )
}

// ── 3-dot menu ────────────────────────────────────────────────────────────────

function ThreeDotMenu({
  onSave,
  onReset,
  onViewLayers,
  isTrained
}: {
  onSave: () => void
  onReset: () => void
  onViewLayers?: () => void
  isTrained: boolean
}) {
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
        title="More options"
      >
        <MenuIcon />
      </button>
      {open && (
        <div
          className="absolute bottom-full right-0 mb-2 rounded-xl overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.35)] z-[9999] flex flex-col"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', minWidth: 170 }}
        >
          <button
            onClick={() => {
              onSave()
              setOpen(false)
            }}
            disabled={!isTrained}
            className="px-4 py-2.5 text-[0.82rem] text-left border-none transition-colors"
            style={
              isTrained
                ? { background: 'transparent', color: '#e5e7eb', cursor: 'pointer' }
                : { background: 'transparent', color: '#64748b', cursor: 'not-allowed' }
            }
            onMouseEnter={(e) => {
              if (isTrained) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
            }}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
          >
            💾 Save model
          </button>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

          <button
            onClick={() => {
              if (onViewLayers) {
                onViewLayers()
              }
              setOpen(false)
            }}
            disabled={!onViewLayers || !isTrained}
            className="px-4 py-2.5 text-[0.82rem] text-left border-none transition-colors"
            style={
              onViewLayers && isTrained
                ? { background: 'transparent', color: '#e5e7eb', cursor: 'pointer' }
                : { background: 'transparent', color: '#64748b', cursor: 'not-allowed' }
            }
            onMouseEnter={(e) => {
              if (onViewLayers && isTrained) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
            }}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
          >
            🔬 View layers
          </button>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

          <button
            onClick={() => {
              onReset()
              setOpen(false)
            }}
            className="px-4 py-2.5 text-[0.82rem] text-left border-none"
            style={{ background: 'transparent', color: '#fca5a5' }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'rgba(248,113,113,0.12)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'transparent')}
          >
            ↺ Reset model
          </button>
        </div>
      )}
    </div>
  )
}