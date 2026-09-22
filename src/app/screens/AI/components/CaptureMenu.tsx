/**
 * Three-dot menu shown under the camera for the teachable screens. Holds the
 * capture-mode switch (Hold | Auto), the optional hand-count switch (1 | 2
 * hands) and the Settings entry, so the row under the camera can stay a single
 * yellow record button.
 */
import { useEffect, useRef, useState } from 'react'
import MenuIcon from '../icons/menuIcon'

type Mode = 'hold' | 'auto'
type HandMode = 1 | 2

interface CaptureMenuProps {
  mode: Mode
  onModeChange: (m: Mode) => void
  onOpenSettings: () => void
  /** hide the Hold|Auto switch (e.g. while recording) */
  showModeSwitch?: boolean
  /** hand-gesture screen only: current 1-hand / 2-hand selection */
  handMode?: HandMode
  /** hand-gesture screen only: shows the 1 HAND | 2 HANDS switch when set */
  onHandModeChange?: (m: HandMode) => void
  /** open the dropdown upward (default) — for buttons sitting at the bottom of a
   *  panel. Set false when the button is at the top (e.g. the pose camera header,
   *  whose card clips an upward menu via overflow-hidden). */
  dropUp?: boolean
}

const SEGMENT = 'inline-flex w-full rounded-full border-2 border-black dark:border-[#4c4c4c] overflow-hidden text-xs font-black'
const segBtn = (active: boolean) =>
  `flex-1 px-3 py-2 ${active
    ? 'bg-black text-[#F6EC24] dark:bg-[#F6EC24] dark:text-black'
    : 'bg-white text-black hover:bg-slate-100 dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333]'}`
const LABEL = 'text-[10px] font-black text-slate-500 dark:text-slate-400 px-1 mb-1 uppercase'

export default function CaptureMenu({
  mode, onModeChange, onOpenSettings, showModeSwitch = true, handMode, onHandModeChange, dropUp = true,
}: CaptureMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer bg-transparent border-none p-0 flex items-center justify-center h-[50px]"
        title="More options"
      >
        <div className="translate-y-[2px]">
          <MenuIcon />
        </div>
      </button>

      {open && (
        <div className={`absolute right-0 z-40 w-[200px] bg-white dark:bg-[#1f1f1f] text-black dark:text-white border-2 border-black dark:border-[#4c4c4c] rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-2 flex flex-col gap-2 ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
          {onHandModeChange && (
            <div>
              <div className={LABEL}>Hands</div>
              <div className={SEGMENT}>
                <button onClick={() => { onHandModeChange(1); setOpen(false) }} className={segBtn(handMode === 1)}>
                  ✋ 1 HAND
                </button>
                <button onClick={() => { onHandModeChange(2); setOpen(false) }} className={segBtn(handMode === 2)}>
                  🙌 2 HANDS
                </button>
              </div>
            </div>
          )}

          {showModeSwitch && (
            <div>
              <div className={LABEL}>Capture Mode</div>
              <div className={SEGMENT}>
                <button onClick={() => onModeChange('hold')} className={segBtn(mode === 'hold')}>
                  HOLD
                </button>
                <button onClick={() => onModeChange('auto')} className={segBtn(mode === 'auto')}>
                  AUTO
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => { setOpen(false); onOpenSettings() }}
            className="w-full text-left text-sm font-bold px-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-[#2a2a2a]"
          >
            Settings
          </button>
        </div>
      )}
    </div>
  )
}
