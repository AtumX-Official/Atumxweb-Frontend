import type { ReactNode } from 'react'

/**
 * Shared full-screen "reveal" shell used by every modality's how-it-learns /
 * watch-it-classify view (hand, pose, audio). Dark glass chrome modelled exactly on
 * prototypes/ai-lab-audio.html: white caps title + cyan subtitle, a cyan narrator
 * line that changes as training progresses, the pipeline inside a curved glass box,
 * and a footer that shows the % with bouncing yellow/cyan/pink dots while training
 * and a glowing green "LET'S GO!" pill when done. App font (Nunito) throughout.
 */

const CYAN = '#36D3FF'
const YELLOW = '#F6EC24'
const PINK = '#F6268B'

interface RevealShellProps {
  open: boolean
  mode: 'train' | 'test'
  isTraining: boolean
  trainProgress: number          // 0..100
  trainAccuracy: number | null   // 0..100
  epochs: number
  narrator: string
  onClose: () => void
  /** when training, abandon it midway and close the reveal (optional) */
  onCancel?: () => void
  children: ReactNode            // the viz canvas / stage content
}

const dot = (bg: string, delay: string): React.CSSProperties => ({
  width: 9, height: 9, borderRadius: '50%', background: bg, display: 'inline-block', animationDelay: delay,
})
const statLabel: React.CSSProperties = {
  fontSize: 10, letterSpacing: 2, color: '#6f7d96', fontWeight: 800, textTransform: 'uppercase', marginTop: 3,
}

export default function RevealShell({
  open, mode, isTraining, trainProgress, trainAccuracy, epochs, narrator, onClose, onCancel, children,
}: RevealShellProps): React.JSX.Element | null {
  if (!open) return null

  const e = Math.max(0, Math.min(1, trainProgress / 100))
  const epoch = Math.round(e * epochs)
  const acc = trainAccuracy ?? 0

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: 'rgba(3,5,12,0.88)', backdropFilter: 'blur(8px)', padding: 22 }}
    >
      <div className="flex flex-col" style={{ width: '97vw', maxWidth: 1280, height: '92vh', gap: 14 }}>
        {/* header */}
        <div className="flex items-center justify-between" style={{ gap: 18 }}>
          <div>
            <div className="font-black" style={{ fontSize: 20, letterSpacing: 1, color: '#fff' }}>
              {mode === 'test' ? 'LAYERS VIEW · ' : 'TRAINING · '}
              <span style={{ color: CYAN }}>
                {mode === 'test' ? 'watch it classify' : 'how your model learns'}
              </span>
            </div>
            <div className="font-bold" style={{ color: CYAN, fontSize: 13, minHeight: 18, marginTop: 2 }}>
              {narrator}
            </div>
          </div>
          <div className="flex items-center" style={{ gap: 22 }}>
            <div className="text-right">
              <div className="font-black" style={{ fontSize: 22, color: '#fff', lineHeight: 1 }}>
                {epoch}<span style={{ color: '#5d6a82' }}>/{epochs}</span>
              </div>
              <div style={statLabel}>EPOCH</div>
            </div>
            <div className="text-right">
              <div className="font-black" style={{ fontSize: 22, color: '#37e29a', lineHeight: 1 }}>{acc}%</div>
              <div style={statLabel}>ACCURACY</div>
            </div>
            {/* Hide the overlay — training KEEPS running in the background so the model
                still finishes and stays saveable. Only shown while training. */}
            {mode === 'train' && isTraining && onCancel && (
              <button
                onClick={onCancel}
                className="font-black cursor-pointer transition-transform hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#aeb9cc',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 10, padding: '9px 18px',
                  fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
                }}
                title="Hide this view — training keeps running"
              >
                ✕ Hide
              </button>
            )}
          </div>
        </div>

        {/* stage — curved glass box holding the pipeline */}
        <div
          className="flex-1 overflow-hidden"
          style={{
            minHeight: 0,
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(7,10,18,0.97)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {children}
        </div>

        {/* footer */}
        <div className="flex items-center justify-center" style={{ gap: 14, minHeight: 48 }}>
          {isTraining ? (
            <div className="flex items-center" style={{ gap: 8 }}>
              <span className="font-black" style={{ color: '#cdd6e6' }}>{trainProgress}%</span>
              <i className="animate-bounce" style={dot(YELLOW, '0s')} />
              <i className="animate-bounce" style={dot(CYAN, '0.15s')} />
              <i className="animate-bounce" style={dot(PINK, '0.3s')} />
            </div>
          ) : (
            <button
              onClick={onClose}
              className="font-black cursor-pointer transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(120deg,#37e29a,#6bf3bd)',
                color: '#04140d', letterSpacing: 1, textTransform: 'uppercase',
                border: 'none', borderRadius: 12, padding: '12px 42px',
                boxShadow: '0 0 22px rgba(55,226,154,0.5)',
              }}
            >
              {mode === 'test' ? 'Close' : "Let's go!"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
