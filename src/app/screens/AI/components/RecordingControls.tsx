/**
 * Shared capture controls for every teachable modality (single-hand, two-hand,
 * pose). Two modes only — kept deliberately simple:
 *
 *  - Hold: press and hold the button to capture while held.
 *  - Auto: 3·2·1 hands-free countdown, then records N frames automatically.
 *
 * `variant="panel"` shows the Hold|Auto switch + primary button (normal view).
 * `variant="fullscreen"` shows only the big Auto record button — you're standing
 * back from the camera, so Hold isn't usable and Auto is the natural choice.
 */

type Mode = 'hold' | 'auto'

interface RecordingControlsProps {
  mode: Mode
  onModeChange: (m: Mode) => void
  isCapturing: boolean
  countdown: number | null
  disabled?: boolean
  onHoldStart: () => void
  onHoldStop: () => void
  onAutoStart: () => void
  onStop: () => void
  /** read whether the recorder is currently in hold mode (for onMouseLeave) */
  isHolding: () => boolean
  variant?: 'panel' | 'fullscreen'
  /** show the inline Hold|Auto switch (panel variant). Off when the switch lives
   *  in the three-dot menu and only the primary button stays under the camera. */
  showModeSwitch?: boolean
}

const BTN = 'rounded-lg font-black border-2 border-black select-none transition-all'

export default function RecordingControls({
  mode,
  onModeChange,
  isCapturing,
  countdown,
  disabled = false,
  onHoldStart,
  onHoldStop,
  onAutoStart,
  onStop,
  isHolding,
  variant = 'panel',
  showModeSwitch = true,
}: RecordingControlsProps) {
  // ── Fullscreen: Auto only (hands-free) ──────────────────────────────────
  if (variant === 'fullscreen') {
    const active = countdown !== null || isCapturing
    return (
      <button
        onClick={active ? onStop : onAutoStart}
        disabled={disabled}
        className={`${BTN} w-[240px] h-[64px] text-xl border-transparent hover:border-white disabled:opacity-50
          ${active ? 'bg-red-500 text-white' : 'bg-[#F6EC24] text-black'}`}
      >
        {countdown !== null ? countdown : isCapturing ? '■ STOP' : '● Record'}
      </button>
    )
  }

  // ── Panel: Hold | Auto switch + primary button ──────────────────────────
  const recording = isCapturing || countdown !== null

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Mode switch — hidden while recording (can't switch mid-capture), and
          optionally relocated into the three-dot menu via showModeSwitch={false} */}
      {!recording && showModeSwitch && (
        <div className="inline-flex rounded-full border-2 border-black overflow-hidden text-xs font-black shrink-0">
          <button
            onClick={() => onModeChange('hold')}
            className={`px-3 py-2 ${mode === 'hold' ? 'bg-black text-[#F6EC24]' : 'bg-white text-black hover:bg-slate-100'}`}
          >
            HOLD
          </button>
          <button
            onClick={() => onModeChange('auto')}
            className={`px-3 py-2 ${mode === 'auto' ? 'bg-black text-[#F6EC24]' : 'bg-white text-black hover:bg-slate-100'}`}
          >
            AUTO
          </button>
        </div>
      )}

      {/* Primary button */}
      {countdown !== null ? (
        <button onClick={onStop} disabled={disabled} className={`${BTN} h-[50px] px-8 bg-red-500 text-white border-transparent`}>
          {countdown}
        </button>
      ) : mode === 'hold' ? (
        <button
          onMouseDown={onHoldStart}
          onMouseUp={onHoldStop}
          onMouseLeave={() => { if (isHolding()) onHoldStop() }}
          onTouchStart={(e) => { e.preventDefault(); onHoldStart() }}
          onTouchEnd={(e) => { e.preventDefault(); onHoldStop() }}
          disabled={disabled}
          className={`${BTN} h-[50px] px-8 border-transparent hover:border-black ${isCapturing ? 'bg-red-500 text-white' : 'bg-[#F6EC24] text-black'}`}
        >
          {isCapturing ? 'RECORDING' : 'HOLD'}
        </button>
      ) : isCapturing ? (
        <button onClick={onStop} disabled={disabled} className={`${BTN} h-[50px] px-8 bg-red-500 text-white border-transparent`}>
          ■ STOP
        </button>
      ) : (
        <button onClick={onAutoStart} disabled={disabled} className={`${BTN} h-[50px] px-8 bg-[#F6EC24] text-black border-transparent hover:border-black`}>
          ● Auto Record
        </button>
      )}
    </div>
  )
}
