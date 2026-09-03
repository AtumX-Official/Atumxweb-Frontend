/**
 * Three-dot menu shown under the camera for the teachable screens. Holds the
 * capture-mode switch (Hold | Auto) and the Settings entry, so the row under the
 * camera can stay a single yellow record button.
 */
import { useEffect, useRef, useState } from 'react'
import MenuIcon from '../icons/menuIcon'

type Mode = 'hold' | 'auto'

interface CaptureMenuProps {
  mode: Mode
  onModeChange: (m: Mode) => void
  onOpenSettings: () => void
  /** hide the Hold|Auto switch (e.g. while recording) */
  showModeSwitch?: boolean
  /** open the dropdown upward (default) — for buttons sitting at the bottom of a
   *  panel. Set false when the button is at the top (e.g. the pose camera header,
   *  whose card clips an upward menu via overflow-hidden). */
  dropUp?: boolean
}

export default function CaptureMenu({ mode, onModeChange, onOpenSettings, showModeSwitch = true, dropUp = true }: CaptureMenuProps) {
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
        <div className={`absolute right-0 z-40 w-[180px] bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-2 flex flex-col gap-2 ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
          {showModeSwitch && (
            <div>
              <div className="text-[10px] font-black text-slate-500 px-1 mb-1 uppercase">Capture Mode</div>
              <div className="inline-flex w-full rounded-full border-2 border-black overflow-hidden text-xs font-black">
                <button
                  onClick={() => onModeChange('hold')}
                  className={`flex-1 px-3 py-2 ${mode === 'hold' ? 'bg-black text-[#F6EC24]' : 'bg-white text-black hover:bg-slate-100'}`}
                >
                  HOLD
                </button>
                <button
                  onClick={() => onModeChange('auto')}
                  className={`flex-1 px-3 py-2 ${mode === 'auto' ? 'bg-black text-[#F6EC24]' : 'bg-white text-black hover:bg-slate-100'}`}
                >
                  AUTO
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => { setOpen(false); onOpenSettings() }}
            className="w-full text-left text-sm font-bold px-2 py-2 rounded-md hover:bg-slate-100"
          >
            Settings
          </button>
        </div>
      )}
    </div>
  )
}
