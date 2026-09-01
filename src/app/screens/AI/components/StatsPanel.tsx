import type { HandStats } from './HandTracker'

interface StatsPanelProps {
  stats: HandStats | null
}

const FINGER_COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C77DFF']
const FINGER_NAMES  = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']
const TIP_INDICES   = [4, 8, 12, 16, 20]

function Coord({ label, lm }: { label: string; lm: { x: number; y: number } | undefined }) {
  if (!lm) return null
  return (
    <div className="flex justify-between text-[0.78rem] py-[3px]">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-cyan-400">
        ({lm.x.toFixed(3)}, {lm.y.toFixed(3)})
      </span>
    </div>
  )
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{ background: color + '22', color, border: `1px solid ${color}44` }}
      className="text-[0.65rem] px-[7px] py-[2px] rounded-full font-medium tracking-[0.03em]"
    >
      {children}
    </span>
  )
}

function HandCard({ hand, index }: { hand: HandStats['hands'][number]; index: number }) {
  return (
    <div className={`${index === 0 ? 'bg-indigo-500/[0.08]' : 'bg-indigo-400/[0.06]'} border border-indigo-500/20 rounded-xl px-3.5 py-3 mb-2.5`}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`${index === 0 ? 'bg-indigo-500' : 'bg-indigo-400'} text-white text-[0.7rem] font-semibold px-2 py-0.5 rounded-full tracking-wide`}>
          {hand.handedness.toUpperCase()}
        </span>
        <span className="text-slate-500 text-[0.75rem]">{(hand.score * 100).toFixed(0)}% conf.</span>
        <span className="ml-auto text-base">{hand.gesture}</span>
      </div>

      <div className="mb-2">
        {TIP_INDICES.map((tipIdx, fi) => (
          <div key={fi} className={`flex justify-between text-[0.75rem] py-0.5 ${fi < 4 ? 'border-b border-white/[0.04]' : ''}`}>
            <span style={{ color: FINGER_COLORS[fi] }} className="font-medium">{FINGER_NAMES[fi]}</span>
            <span className="font-mono text-slate-400">
              ({hand.landmarks[tipIdx].x.toFixed(3)}, {hand.landmarks[tipIdx].y.toFixed(3)})
            </span>
          </div>
        ))}
      </div>

      <Coord label="Wrist" lm={hand.wrist} />
    </div>
  )
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const { fps = 0, hands = [] } = stats ?? {}

  return (
    <div className="w-[280px] flex flex-col gap-3 flex-shrink-0">
      <div className="bg-app-surface border border-indigo-500/[0.18] rounded-xl p-4">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-[2.8rem] font-bold font-mono leading-none ${fps >= 25 ? 'text-green-400' : fps >= 15 ? 'text-orange-400' : 'text-red-400'}`}>
            {fps}
          </span>
          <span className="text-slate-500 text-[0.85rem]">fps</span>
        </div>
        <div className="mt-2 flex gap-1.5 flex-wrap">
          <Badge color="#6366f1">MediaPipe HandLandmarker</Badge>
          <Badge color="#0ea5e9">GPU Delegate</Badge>
          <Badge color="#10b981">float16</Badge>
        </div>
      </div>

      <div className="bg-app-surface border border-indigo-500/[0.18] rounded-xl p-3 flex items-center gap-3">
        <span className="text-[1.8rem]">🖐</span>
        <div>
          <div className="text-[1.5rem] font-bold font-mono text-slate-100 leading-none">
            {hands.length} <span className="text-[0.9rem] text-slate-500 font-normal">/ 2</span>
          </div>
          <div className="text-[0.75rem] text-slate-500 mt-0.5">hands detected</div>
        </div>
      </div>

      <div className="bg-app-surface border border-indigo-500/[0.18] rounded-xl p-4 flex-1 overflow-y-auto scrollbar-none">
        <p className="text-[0.72rem] text-slate-500 uppercase tracking-widest mb-2.5">Hand Data</p>
        {hands.length === 0 ? (
          <p className="text-slate-700 text-[0.85rem] text-center py-5">
            Show your hand(s) to the camera
          </p>
        ) : (
          hands.map((hand, i) => <HandCard key={i} hand={hand} index={i} />)
        )}
      </div>

      <div className="bg-app-surface border border-indigo-500/[0.18] rounded-xl p-3">
        <p className="text-[0.72rem] text-slate-500 uppercase tracking-widest mb-2">Skeleton Legend</p>
        <div className="flex flex-wrap gap-1.5">
          {FINGER_NAMES.map((name, i) => (
            <div key={i} className="flex items-center gap-1 text-[0.75rem]">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: FINGER_COLORS[i] }} />
              <span className="text-slate-400">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
