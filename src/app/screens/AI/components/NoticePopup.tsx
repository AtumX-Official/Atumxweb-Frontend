import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Notice, NoticeTone } from '../hooks/useNotice'

/** Per-tone accent: the icon badge fill and the confirm button. */
const TONES: Record<NoticeTone, { accent: string; text: string; glyph: ReactNode }> = {
  info: {
    accent: '#F6EC24',
    text: '#000',
    glyph: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v7" strokeLinecap="round" />
        <circle cx="12" cy="7" r="1.1" fill="currentColor" stroke="none" />
      </>
    )
  },
  success: {
    accent: '#2EED08',
    text: '#000',
    glyph: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.5 2.8 2.8L16.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )
  },
  warning: {
    accent: '#F6EC24',
    text: '#000',
    glyph: (
      <>
        <path d="M12 4.5 21 19.5H3z" strokeLinejoin="round" />
        <path d="M12 10v4" strokeLinecap="round" />
        <circle cx="12" cy="16.8" r="1.1" fill="currentColor" stroke="none" />
      </>
    )
  },
  error: {
    accent: '#FF5A5A',
    text: '#fff',
    glyph: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round" />
      </>
    )
  }
}

/**
 * The app's own replacement for `window.alert` on the AI screens — the native
 * dialog is chrome-coloured, says "Trix", and can't be themed.
 */
export default function NoticePopup({
  notice,
  onClose
}: {
  notice: Notice | null
  onClose: () => void
}): ReactNode {
  useEffect(() => {
    if (!notice) return
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape' || e.key === 'Enter') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [notice, onClose])

  if (!notice) return null

  const tone = TONES[notice.tone]

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-[420px] max-w-full rounded-2xl border-2 border-black bg-white dark:bg-[#1f1f1f] dark:border-white/25 p-6 pt-8 shadow-2xl flex flex-col items-center text-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge straddling the top edge, so the dialog reads at a glance */}
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-2 border-black flex items-center justify-center shadow-[2px_3px_0px_rgba(0,0,0,1)]"
          style={{ background: tone.accent, color: tone.text }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {tone.glyph}
          </svg>
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-3 bg-transparent border-none text-2xl leading-none text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
        >
          ×
        </button>

        <h2 className="text-xl font-black text-black dark:text-white mt-2">{notice.title}</h2>
        <p className="text-[0.9rem] font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
          {notice.message}
        </p>

        <button
          autoFocus
          onClick={onClose}
          className="mt-2 px-7 py-2.5 rounded-xl font-black tracking-wide text-black border-2 border-black cursor-pointer transition-colors shadow-[2px_3px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          style={{ background: tone.accent, color: tone.text }}
        >
          {notice.confirmLabel ?? 'GOT IT'}
        </button>
      </div>
    </div>,
    document.body
  )
}
