import type { ReactNode } from 'react'

/**
 * Shared "More Settings" panel for every teachable modality (single-hand,
 * two-hand, pose). Renders the common capture settings — FPS, delay between
 * captures, number of images — so the recording UI is uniform across screens.
 * (Hold vs Auto is a visible switch next to the record button, not a setting.)
 * Screen-specific rows (e.g. Focus Box for hands) are passed in as `children`
 * and rendered above the Reset button.
 */

type NumOrEmpty = number | ''

interface RecordingSettingsProps {
  fps: NumOrEmpty
  onFps: (v: NumOrEmpty) => void
  delay: NumOrEmpty
  onDelay: (v: NumOrEmpty) => void
  duration: NumOrEmpty
  onDuration: (v: NumOrEmpty) => void
  onReset: () => void
  onClose?: () => void
  /** screen-specific extra rows, rendered just above Reset */
  children?: ReactNode
}

export default function RecordingSettings({
  fps,
  onFps,
  delay,
  onDelay,
  duration,
  onDuration,
  onReset,
  onClose,
  children,
}: RecordingSettingsProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-black pb-1 mb-4">
          <span className="text-m font-bold">More Settings</span>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-lg font-bold">
              ✕
            </button>
          )}
        </div>

        {/* FPS */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-m">FPS</span>
          <input
            type="number"
            value={fps}
            onFocus={() => { if (fps === 0) onFps('') }}
            onChange={(e) => onFps(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-[60px] bg-yellow-300 border border-black text-center outline-none"
            min={1}
            max={60}
          />
        </div>

        {/* DELAY BETWEEN CAPTURES */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-m">Delay between frames</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={delay}
              onFocus={() => { if (delay === 0) onDelay('') }}
              onChange={(e) => onDelay(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-[60px] bg-yellow-300 border border-black text-center outline-none"
              min={0}
              step={0.5}
            />
            <span className="text-m">seconds</span>
          </div>
        </div>

        {/* NUMBER OF IMAGES */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-m">Number of images</span>
          <input
            type="number"
            value={duration}
            onFocus={() => { if (duration === 0) onDuration('') }}
            onChange={(e) => onDuration(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-[60px] bg-yellow-300 border border-black text-center outline-none"
            min={0}
            placeholder="30"
          />
        </div>

        {/* SCREEN-SPECIFIC EXTRA ROWS (e.g. Focus Box) */}
        {children}
      </div>

      {/* RESET */}
      <div className="flex justify-center mt-4">
        <button
          onClick={onReset}
          className="w-full mt-4 py-2 rounded-lg font-semibold transition text-m bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black"
        >
          Reset to Default
        </button>
      </div>
    </div>
  )
}
