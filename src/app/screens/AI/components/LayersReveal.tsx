import { useEffect, useRef } from 'react'
import type { GestureClass, Prediction } from '../hooks/useGestureClassifier'
import { normalizeLandmarks } from '../utils/normalizeLandmarks'
import RevealShell from './RevealShell'

/**
 * "How your model learns" / "watch it classify" reveal — shared by every teachable
 * modality (1-hand, 2-hand, pose). A faithful port of prototypes/ai-lab-hand.html's
 * dense-net mechanism, driven off the REAL app classifier: real classes/colors,
 * real recorded sample counts, real trainProgress / accuracy / epoch, and — in test
 * mode — the real live Prediction.
 *
 * Honest mechanism: both hand gestures and poses are a DENSE MLP on landmark
 * coordinates (NOT convolution), so the stages are POINTS → COORDINATES → ×N COPIES
 * (augment) → NEURAL NET ×256/×128/×64 → DECIDE (softmax) → PREDICTION. The only
 * per-modality differences (point count, coord count, augment count, how the
 * skeleton is drawn, how coordinates are extracted) live in a LayersConfig.
 */

export interface Landmark {
  x: number
  y: number
  z?: number
  visibility?: number
}

export interface LayersConfig {
  pointsLabel: string      // 'HAND POINTS' | 'POSE POINTS'
  pointsSub: string        // '21 landmarks' | '33 landmarks'
  coordsSub: string        // '63 x·y·z values' | '99 x·y·z values'
  copiesLabel: string      // '×8 COPIES' | '×4 COPIES'
  featCount: number        // 63 | 99
  pointCount: number       // 21 | 33  (featCount / 3)
  /** raw landmarks → the coordinate vector shown in the NUMBERS column */
  featureOf: (lm: Landmark[]) => Float32Array
  /** draw the tracked skeleton; P(i) maps landmark i into the (mirrored) box */
  drawSkeleton: (ctx: CanvasRenderingContext2D, lm: Landmark[], P: (i: number) => { x: number; y: number }, s: number) => void
  /** colour of the joint a landmark belongs to (finger / body part) — tints its coords */
  partColor: (landmarkIndex: number) => string
  /** canonical reference skeleton (open hand / standing body) drawn while training */
  canonical: { x: number; y: number }[]
  /** train-mode narrator line for a 0..1 progress */
  narrator: (e: number) => string
  /** test-mode prompt shown until something is detected */
  testIdlePrompt: string
}

export interface LayersRevealProps {
  open: boolean
  mode: 'train' | 'test'
  config: LayersConfig
  classes: GestureClass[]
  /** resolve a class color from its id + index */
  colorOf: (classId: string, idx: number) => string
  sampleCounts: Record<string, number>
  isTraining: boolean
  isTrained: boolean
  trainProgress: number          // 0..100
  trainAccuracy: number | null   // 0..100 (null until first epoch)
  epochs?: number
  /** latest raw landmarks of the primary subject (first hand / the pose), or null */
  getSubject: () => Landmark[] | null
  /** live camera feed for the SKELETON panel */
  getVideo?: () => HTMLVideoElement | null
  /** how many subjects the canonical training skeleton shows (1 hand / 2 hands / 1 body) */
  subjectCount?: number
  /** test mode: the real live prediction flowing through the network */
  livePrediction?: Prediction | null
  onClose: () => void
  /** train mode: abandon training midway and close the reveal */
  onCancel?: () => void
}

const DEFAULT_EPOCHS = 120

function hex(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** fit a point cloud (any space) into [pad, 1-pad] preserving aspect, centred */
function fitPoints(pts: { x: number; y: number }[], pad = 0.12): { x: number; y: number }[] {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of pts) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y) }
  const w = maxX - minX || 1, h = maxY - minY || 1
  const sc = Math.min((1 - 2 * pad) / w, (1 - 2 * pad) / h)
  const ox = (1 - w * sc) / 2 - minX * sc
  const oy = (1 - h * sc) / 2 - minY * sc
  return pts.map((p) => ({ x: p.x * sc + ox, y: p.y * sc + oy }))
}

// ── HAND skeleton (ported verbatim from HandTracker.tsx drawHand) ──────────────
const FINGER_COLORS: Record<string, string> = {
  thumb: '#FF6B6B', index: '#FFD93D', middle: '#6BCB77',
  ring: '#4D96FF', pinky: '#C77DFF', palm: 'rgba(255,255,255,0.35)',
}
const HAND_CONNECTIONS: [number, number, string][] = [
  [0, 1, 'thumb'], [1, 2, 'thumb'], [2, 3, 'thumb'], [3, 4, 'thumb'],
  [0, 5, 'index'], [5, 6, 'index'], [6, 7, 'index'], [7, 8, 'index'],
  [0, 9, 'middle'], [9, 10, 'middle'], [10, 11, 'middle'], [11, 12, 'middle'],
  [0, 13, 'ring'], [13, 14, 'ring'], [14, 15, 'ring'], [15, 16, 'ring'],
  [0, 17, 'pinky'], [17, 18, 'pinky'], [18, 19, 'pinky'], [19, 20, 'pinky'],
  [5, 9, 'palm'], [9, 13, 'palm'], [13, 17, 'palm'],
]
const HAND_TIPS = [4, 8, 12, 16, 20]
// canonical open right hand — 21 normalized landmarks (wrist at bottom, fingers up).
// Modelled on a real MediaPipe open-hand result: an arced knuckle row, fingers
// fanned wide with clear gaps, and a thumb that CURVES out (its segments change
// direction — down → out → up — rather than a straight diagonal).
const HAND_TEMPLATE: { x: number; y: number }[] = [
  { x: 0.500, y: 0.93 },                                                                       // 0 wrist
  { x: 0.430, y: 0.85 }, { x: 0.330, y: 0.79 }, { x: 0.240, y: 0.71 }, { x: 0.180, y: 0.62 }, // 1-4 thumb (curved)
  { x: 0.420, y: 0.52 }, { x: 0.390, y: 0.39 }, { x: 0.375, y: 0.30 }, { x: 0.365, y: 0.22 }, // 5-8 index
  { x: 0.510, y: 0.50 }, { x: 0.510, y: 0.36 }, { x: 0.512, y: 0.26 }, { x: 0.515, y: 0.17 }, // 9-12 middle
  { x: 0.600, y: 0.51 }, { x: 0.635, y: 0.38 }, { x: 0.655, y: 0.29 }, { x: 0.670, y: 0.21 }, // 13-16 ring
  { x: 0.670, y: 0.55 }, { x: 0.720, y: 0.44 }, { x: 0.750, y: 0.37 }, { x: 0.775, y: 0.31 }, // 17-20 pinky
]
function handLandmarkColor(i: number): string {
  if (i === 0) return '#ffffff'
  if (i <= 4) return FINGER_COLORS.thumb
  if (i <= 8) return FINGER_COLORS.index
  if (i <= 12) return FINGER_COLORS.middle
  if (i <= 16) return FINGER_COLORS.ring
  return FINGER_COLORS.pinky
}

export const HAND_LAYERS: LayersConfig = {
  pointsLabel: 'HAND POINTS',
  pointsSub: '21 landmarks',
  coordsSub: '63 x·y·z values',
  copiesLabel: '×8 COPIES',
  featCount: 63,
  pointCount: 21,
  partColor: (i) => handLandmarkColor(i),
  canonical: HAND_TEMPLATE,
  featureOf: (lm) => normalizeLandmarks(lm),
  drawSkeleton: (ctx, lm, P, s) => {
    for (const [a, b, finger] of HAND_CONNECTIONS) {
      if (!lm[a] || !lm[b]) continue
      const pa = P(a), pb = P(b)
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y)
      ctx.strokeStyle = FINGER_COLORS[finger]
      ctx.lineWidth = (finger === 'palm' ? 1.5 : 2.5) * s
      ctx.lineCap = 'round'
      ctx.globalAlpha = finger === 'palm' ? 0.5 : 1
      ctx.stroke(); ctx.globalAlpha = 1
    }
    for (let i = 0; i < lm.length; i++) {
      const p = P(i)
      const isTip = HAND_TIPS.includes(i), isWrist = i === 0
      ctx.beginPath(); ctx.arc(p.x, p.y, (isWrist ? 8 : isTip ? 7 : 4) * s, 0, Math.PI * 2)
      ctx.fillStyle = handLandmarkColor(i); ctx.fill()
    }
  },
  narrator: (e) =>
    e < 0.3 ? 'Tracking the points on every hand you showed me…'
      : e < 0.6 ? 'Turning each hand into 63 coordinates…'
        : e < 0.85 ? 'Feeding them through the network to spot patterns…'
          : 'Sharpening it so it tells your gestures apart…',
  testIdlePrompt: 'Show a gesture to the camera and watch it get classified.',
}

// ── POSE skeleton (ported from PoseTracker.tsx drawPose) ───────────────────────
const POSE_COLORS: Record<string, string> = {
  face: '#FFD93D', shoulders: '#6BCB77', torso: '#4D96FF', hips: '#4D96FF',
  leftArm: '#FF6B6B', rightArm: '#C77DFF', leftLeg: '#FF6B6B', rightLeg: '#C77DFF',
}
const vis = (l?: Landmark): number => (l?.visibility ?? 1)
// canonical standing body — 33 normalized MediaPipe pose landmarks
const POSE_TEMPLATE: { x: number; y: number }[] = [
  { x: 0.50, y: 0.12 },                                                       // 0 nose
  { x: 0.475, y: 0.105 }, { x: 0.47, y: 0.105 }, { x: 0.465, y: 0.105 },      // 1-3 L eye
  { x: 0.525, y: 0.105 }, { x: 0.53, y: 0.105 }, { x: 0.535, y: 0.105 },      // 4-6 R eye
  { x: 0.44, y: 0.12 }, { x: 0.56, y: 0.12 },                                 // 7-8 ears
  { x: 0.48, y: 0.155 }, { x: 0.52, y: 0.155 },                               // 9-10 mouth
  { x: 0.40, y: 0.27 }, { x: 0.60, y: 0.27 },                                 // 11-12 shoulders
  { x: 0.34, y: 0.40 }, { x: 0.66, y: 0.40 },                                 // 13-14 elbows
  { x: 0.30, y: 0.52 }, { x: 0.70, y: 0.52 },                                 // 15-16 wrists
  { x: 0.285, y: 0.555 }, { x: 0.295, y: 0.565 }, { x: 0.315, y: 0.55 },      // 17-19 L hand
  { x: 0.715, y: 0.555 }, { x: 0.705, y: 0.565 }, { x: 0.685, y: 0.55 },      // 20-22 R hand
  { x: 0.44, y: 0.55 }, { x: 0.56, y: 0.55 },                                 // 23-24 hips
  { x: 0.43, y: 0.74 }, { x: 0.57, y: 0.74 },                                 // 25-26 knees
  { x: 0.43, y: 0.92 }, { x: 0.57, y: 0.92 },                                 // 27-28 ankles
  { x: 0.42, y: 0.95 }, { x: 0.58, y: 0.95 }, { x: 0.45, y: 0.965 }, { x: 0.55, y: 0.965 }, // 29-32 feet
]
function poseJointColor(i: number): string {
  if (i < 11) return POSE_COLORS.face
  return i % 2 === 0 ? POSE_COLORS.rightArm : POSE_COLORS.leftArm
}

export const POSE_LAYERS: LayersConfig = {
  pointsLabel: 'POSE POINTS',
  pointsSub: '33 landmarks',
  coordsSub: '99 x·y·z values',
  copiesLabel: '×4 COPIES',
  featCount: 99,
  pointCount: 33,
  partColor: (i) => poseJointColor(i),
  canonical: POSE_TEMPLATE,
  featureOf: (lm) => {
    const v = new Float32Array(99)
    for (let i = 0; i < 33; i++) {
      v[i * 3] = lm[i]?.x ?? 0
      v[i * 3 + 1] = lm[i]?.y ?? 0
      v[i * 3 + 2] = lm[i]?.z ?? 0
    }
    return v
  },
  // Same neck/pelvis rig as PoseTracker.drawPose (the live detection skeleton).
  drawSkeleton: (ctx, lm, P, s) => {
    type Pt = { x: number; y: number } | null
    const pt = (i: number): Pt => (lm[i] && vis(lm[i]) >= 0.5 ? P(i) : null)
    const mid = (a: Pt, b: Pt): Pt => (a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : null)
    const Ls = pt(11), Rs = pt(12), Lh = pt(23), Rh = pt(24)
    const neck = mid(Ls, Rs), pelvis = mid(Lh, Rh)
    const Le = pt(13), Re = pt(14), Lw = pt(15), Rw = pt(16)
    const Lk = pt(25), Rk = pt(26), La = pt(27), Ra = pt(28)

    const bones: [Pt, Pt, string][] = [
      [neck, pelvis, 'torso'],
      [neck, Ls, 'shoulders'], [Ls, Le, 'leftArm'], [Le, Lw, 'leftArm'],
      [neck, Rs, 'shoulders'], [Rs, Re, 'rightArm'], [Re, Rw, 'rightArm'],
      [pelvis, Lh, 'hips'], [Lh, Lk, 'leftLeg'], [Lk, La, 'leftLeg'],
      [pelvis, Rh, 'hips'], [Rh, Rk, 'rightLeg'], [Rk, Ra, 'rightLeg'],
      [pt(0), pt(2), 'face'], [pt(2), pt(7), 'face'], [pt(0), pt(5), 'face'], [pt(5), pt(8), 'face'],
    ]
    ctx.lineCap = 'round'
    for (const [a, b, group] of bones) {
      if (!a || !b) continue
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
      ctx.strokeStyle = POSE_COLORS[group] || '#ffffff'
      ctx.lineWidth = 3 * s
      ctx.stroke()
    }
    const joints: [Pt, string, boolean][] = [
      [neck, POSE_COLORS.torso, false], [pelvis, POSE_COLORS.hips, false],
      [Ls, POSE_COLORS.leftArm, false], [Rs, POSE_COLORS.rightArm, false],
      [Le, POSE_COLORS.leftArm, false], [Re, POSE_COLORS.rightArm, false],
      [Lw, POSE_COLORS.leftArm, true], [Rw, POSE_COLORS.rightArm, true],
      [Lh, POSE_COLORS.leftLeg, false], [Rh, POSE_COLORS.rightLeg, false],
      [Lk, POSE_COLORS.leftLeg, false], [Rk, POSE_COLORS.rightLeg, false],
      [La, POSE_COLORS.leftLeg, true], [Ra, POSE_COLORS.rightLeg, true],
      [pt(0), POSE_COLORS.face, false], [pt(2), POSE_COLORS.face, false],
      [pt(5), POSE_COLORS.face, false], [pt(7), POSE_COLORS.face, false], [pt(8), POSE_COLORS.face, false],
    ]
    for (const [p, color, special] of joints) {
      if (!p) continue
      ctx.beginPath(); ctx.arc(p.x, p.y, (special ? 7 : 4) * s, 0, Math.PI * 2)
      ctx.fillStyle = color; ctx.fill()
      if (special) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * s; ctx.stroke() }
    }
  },
  narrator: (e) =>
    e < 0.3 ? 'Reading the joints of every pose you struck…'
      : e < 0.6 ? 'Turning each body into 99 coordinates…'
        : e < 0.85 ? 'Feeding them through the network to spot patterns…'
          : 'Sharpening it so it tells your poses apart…',
  testIdlePrompt: 'Strike a pose for the camera and watch it get classified.',
}

export default function LayersReveal(props: LayersRevealProps): React.JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const propsRef = useRef(props)
  propsRef.current = props

  useEffect(() => {
    if (!props.open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0
    const resize = (): void => {
      const r = canvas.getBoundingClientRect()
      W = r.width; H = r.height
      canvas.width = W * dpr; canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    window.addEventListener('resize', resize)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    // network draw sizes mirror Dense 256 → 128 → 64 (drawn small, labelled real)
    const denseDraw = [14, 11, 8]
    const denseReal = [256, 128, 64]
    const acts = denseDraw.map((n) => new Float32Array(n))
    const packets: { ci: number; p: number; sp: number }[] = []
    let t = 0, fc = 0, raf = 0
    let feat: Float32Array = new Float32Array(props.config.featCount)

    const subject = (): Landmark[] | null => propsRef.current.getSubject()
    /** canonical reference landmarks with a gentle idle sway (so it feels alive) */
    const canonicalLm = (): Landmark[] => {
      const cano = propsRef.current.config.canonical
      const sway = Math.sin(t * 0.9) * 0.01
      const bob = Math.sin(t * 0.7) * 0.004
      return cano.map((p) => ({ x: p.x + sway, y: p.y + bob, z: 0, visibility: 1 }))
    }
    const taughtClasses = (): { cls: GestureClass; idx: number; color: string; count: number }[] => {
      const p = propsRef.current
      return p.classes
        .map((cls, idx) => ({ cls, idx, color: p.colorOf(cls.id, idx), count: p.sampleCounts[cls.id] || 0 }))
        .filter((c) => c.count > 0)
    }
    const liveProbs = (): number[] | null => {
      const p = propsRef.current
      if (p.mode !== 'test' || !p.livePrediction || !p.livePrediction.className) return null
      return p.classes.map((c) =>
        p.livePrediction!.probabilities.find((pr) => pr.name === c.name)?.prob ?? 0
      )
    }
    const livePredIdx = (): number => {
      const p = propsRef.current
      if (p.mode !== 'test' || !p.livePrediction || !p.livePrediction.classId) return -1
      return p.classes.findIndex((c) => c.id === p.livePrediction!.classId)
    }

    const rr = (x: number, y: number, w: number, h: number, r: number): void => {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()
    }
    const L = (): { xSk: number; xNum: number; xAug: number; xL: number[]; xD: number; xO: number; cy: number } => {
      if (propsRef.current.mode === 'test') {
        return {
          xSk: W * 0.22, xNum: W * 0.45, xAug: W * 0.53,
          xL: [W * 0.62, W * 0.7, W * 0.78], xD: W * 0.86, xO: W * 0.93, cy: H * 0.5,
        }
      }
      return {
        xSk: W * 0.1, xNum: W * 0.235, xAug: W * 0.335,
        xL: [W * 0.45, W * 0.555, W * 0.66], xD: W * 0.775, xO: W * 0.885, cy: H * 0.5,
      }
    }
    const lab = (x: number, y: number, tx: string, sub?: string): void => {
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = '800 12px Nunito, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(tx, x, y)
      if (sub) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.font = '600 9px Nunito, sans-serif'
        ctx.fillText(sub, x, y + 13)
      }
    }
    const nodeY = (l: ReturnType<typeof L>, i: number, n: number): number => {
      const gap = Math.min(22, (H * 0.6) / n)
      return l.cy - ((n - 1) * gap) / 2 + i * gap
    }
    const oY = (l: ReturnType<typeof L>, ci: number): number => {
      const n = Math.max(1, propsRef.current.classes.length)
      const gap = Math.min(50, (H * 0.62) / n)
      return l.cy - ((n - 1) * gap) / 2 + ci * gap
    }

    // SKELETON panel. Training → draw a clean canonical reference skeleton (one open
    // hand / two hands / a standing body), immune to the training freeze. Otherwise →
    // live camera feed (mirrored, cover-fit) + the tracked skeleton on top.
    const drawSkeletonBox = (bx: number, by: number, bw: number, bh: number, training: boolean): void => {
      const cfg = propsRef.current.config

      if (training) {
        // Free-floating canonical skeleton — no inner box / border (the stage is
        // already the dark surface). Hands: 1 or 2 side-by-side; body: one figure.
        const isHand = cfg.featCount === 63
        const count = isHand ? Math.max(1, Math.min(2, propsRef.current.subjectCount ?? 1)) : 1
        const gap = count === 2 ? bw * 0.12 : 0
        const regionW = (bw - gap * (count - 1)) / count
        const base = canonicalLm()
        for (let h = 0; h < count; h++) {
          const rx = bx + h * (regionW + gap)
          const mirror = count === 2 && h === 1
          const raw = base.map((p) => ({ x: mirror ? 1 - p.x : p.x, y: p.y }))
          const fitted = fitPoints(raw, isHand ? 0.1 : 0.04)
          const lm: Landmark[] = fitted.map((p) => ({ x: p.x, y: p.y, visibility: 1 }))
          const s = Math.max(regionW / 1000, 0.55)
          const P = (i: number): { x: number; y: number } => ({ x: rx + fitted[i].x * regionW, y: by + fitted[i].y * bh })
          cfg.drawSkeleton(ctx, lm, P, s)
        }
        return
      }

      ctx.save()
      ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip()
      ctx.fillStyle = '#05070f'; ctx.fillRect(bx, by, bw, bh)

      // cover-fit the camera frame; track offsets so the skeleton lines up with it
      let dispW = bw, dispH = bh, offX = 0, offY = 0
      const video = propsRef.current.getVideo?.() ?? null
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        const vw = video.videoWidth, vh = video.videoHeight
        const sc = Math.max(bw / vw, bh / vh)
        dispW = vw * sc; dispH = vh * sc
        offX = (bw - dispW) / 2; offY = (bh - dispH) / 2
        ctx.save()
        ctx.translate(bx + bw, by); ctx.scale(-1, 1)
        ctx.drawImage(video, offX, offY, dispW, dispH)
        ctx.restore()
        ctx.fillStyle = 'rgba(5,7,15,0.22)'; ctx.fillRect(bx, by, bw, bh)
      }

      const lm = subject()
      if (lm && lm.length) {
        const s = Math.max(bw / 1100, 0.42)
        const P = (i: number): { x: number; y: number } => ({
          x: bx + (bw - (offX + lm[i].x * dispW)),
          y: by + (offY + lm[i].y * dispH),
        })
        cfg.drawSkeleton(ctx, lm, P, s)
      }
      ctx.restore()
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'
      ctx.lineWidth = 1
      ctx.strokeRect(bx, by, bw, bh)
    }

    // the coordinate vector as a column of bars — one per value, tinted by the
    // finger / body-part of the joint it belongs to (so numbers map back to joints).
    const drawNumbers = (cx: number, cy: number, alpha: number): void => {
      const cfg = propsRef.current.config
      const n = cfg.featCount, colH = H * 0.52, top = cy - colH / 2, rh = colH / n
      for (let i = 0; i < n; i++) {
        const v = Math.max(-1.2, Math.min(1.2, feat[i] || 0))
        const w = 6 + Math.abs(v) * 24
        const [r, g, b] = hex(cfg.partColor(Math.floor(i / 3)))
        ctx.fillStyle = `rgba(${r},${g},${b},${(0.32 + Math.min(1, Math.abs(v)) * 0.6) * (alpha || 1)})`
        rr(cx - w / 2, top + i * rh + 0.4, w, Math.max(1, rh - 0.8), 1.5)
        ctx.fill()
      }
    }

    const frame = (): void => {
      raf = requestAnimationFrame(frame)
      t += 0.016; fc++
      const p = propsRef.current
      const cfg = p.config
      if (!W) return
      ctx.clearRect(0, 0, W, H)
      const l = L()

      // SKELETON panel geometry
      let skBw: number, skBh: number, skCx: number
      if (p.mode === 'test') {
        // Match the prediction-screen camera EXACTLY: card = clamp(320,30vw,480),
        // video = card − border(4) − padding(24) = card − 28, at 16:9.
        const vw = (typeof window !== 'undefined' ? window.innerWidth : W)
        skBw = Math.min(480, Math.max(320, vw * 0.3)) - 28
        skBh = skBw * 9 / 16
        const maxBw = l.xNum - W * 0.09
        if (skBw > maxBw) { skBw = maxBw; skBh = skBw * 9 / 16 }
        skCx = W * 0.045 + skBw / 2
      } else if (cfg.featCount === 63) {
        skBw = Math.min(W * 0.19, 230); skBh = skBw * 0.62; skCx = l.xSk    // hand(s)
      } else {
        skBw = Math.min(W * 0.18, 210); skBh = H * 0.54; skCx = l.xSk        // tall body figure
      }

      // decay activations
      acts.forEach((a) => { for (let i = 0; i < a.length; i++) a[i] += (0 - a[i]) * 0.05 })

      // Train mode always shows the canonical reference skeleton (never the camera —
      // that belongs to the layers/test view); its coordinates drive the numbers.
      const training = p.mode === 'train'
      if (training) {
        feat = cfg.featureOf(canonicalLm())
      } else {
        const lm = subject()
        if (lm && lm.length) feat = cfg.featureOf(lm)
        else for (let i = 0; i < feat.length; i++) feat[i] *= 0.96
      }

      const taught = taughtClasses()
      const probs = liveProbs()
      const predIdx = livePredIdx()

      if (p.isTraining && fc % 4 === 0 && taught.length) {
        const c = taught[((fc / 4) | 0) % taught.length]
        if (c) packets.push({ ci: c.idx, p: 0, sp: 0.016 + Math.random() * 0.006 })
      }
      if (p.mode === 'test' && p.isTrained && predIdx >= 0 && fc % 14 === 0) {
        packets.push({ ci: predIdx, p: 0, sp: 0.03 })
      }

      // labels
      lab(skCx, 24, cfg.pointsLabel, cfg.pointsSub)
      lab(l.xNum, 24, 'COORDINATES', cfg.coordsSub)
      lab(l.xAug, 24, cfg.copiesLabel, 'extra examples')
      lab((l.xL[0] + l.xL[2]) / 2, 24, 'NEURAL NET', 'the model learns')
      lab(l.xD, 24, 'DECIDE', 'pick best match')
      lab(l.xO, 24, 'PREDICTION', 'one per class')

      // arrows
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1.5
      const arrows = [
        [skCx + skBw / 2 + 6, l.xNum - 26],
        [l.xNum + 26, l.xAug - 22],
        [l.xAug + 22, l.xL[0] - 16],
        [l.xL[2] + 16, l.xD - 12],
        [l.xD + 12, l.xO - 16],
      ]
      arrows.forEach((a) => {
        ctx.beginPath(); ctx.moveTo(a[0], l.cy); ctx.lineTo(a[1], l.cy); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(a[1], l.cy); ctx.lineTo(a[1] - 5, l.cy - 3); ctx.lineTo(a[1] - 5, l.cy + 3); ctx.closePath(); ctx.fill()
      })

      // SKELETON box
      drawSkeletonBox(skCx - skBw / 2, l.cy - skBh / 2, skBw, skBh, training)

      // NUMBERS + ×N COPIES
      drawNumbers(l.xNum, l.cy, 1)
      for (let k = 4; k >= 0; k--) {
        ctx.save()
        ctx.globalAlpha = 0.5 - k * 0.08 + 0.45
        ctx.translate(k * 4 - 6, -k * 4 + 4)
        drawNumbers(l.xAug, l.cy, 0.9 - k * 0.05)
        ctx.restore()
      }
      ctx.globalAlpha = 1

      // DENSE fully-connected wires
      ctx.globalCompositeOperation = 'lighter'
      for (let li = 0; li < denseDraw.length - 1; li++) {
        const n1 = denseDraw[li], n2 = denseDraw[li + 1]
        for (let i = 0; i < n1; i++)
          for (let j = 0; j < n2; j++) {
            const a = acts[li][i]
            ctx.strokeStyle = `rgba(120,235,255,${0.025 + a * 0.18})`
            ctx.lineWidth = 0.4 + a
            ctx.beginPath(); ctx.moveTo(l.xL[li], nodeY(l, i, n1)); ctx.lineTo(l.xL[li + 1], nodeY(l, j, n2)); ctx.stroke()
          }
      }
      {
        const li = denseDraw.length - 1, n1 = denseDraw[li]
        for (let i = 0; i < n1; i++)
          p.classes.forEach((_, ci) => {
            ctx.strokeStyle = `rgba(120,235,255,${0.025 + acts[li][i] * 0.18})`
            ctx.lineWidth = 0.4 + acts[li][i]
            ctx.beginPath(); ctx.moveTo(l.xL[li], nodeY(l, i, n1)); ctx.lineTo(l.xO, oY(l, ci)); ctx.stroke()
          })
      }
      ctx.globalCompositeOperation = 'source-over'

      // dense nodes + real-size labels (256 / 128 / 64 neurons)
      denseDraw.forEach((n, li) => {
        for (let i = 0; i < n; i++) {
          const x = l.xL[li], y = nodeY(l, i, n), a = acts[li][i]
          ctx.globalCompositeOperation = 'lighter'
          const g = ctx.createRadialGradient(x, y, 0, x, y, 6 + a * 6)
          g.addColorStop(0, `rgba(150,240,255,${0.5 + a * 0.5})`)
          g.addColorStop(1, 'rgba(90,210,255,0)')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(x, y, 6 + a * 6, 0, 7); ctx.fill()
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = `rgba(224,250,255,${0.65 + a * 0.35})`
          ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill()
        }
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = '800 13px Nunito, sans-serif'
        ctx.fillText(String(denseReal[li]), l.xL[li], l.cy + H * 0.31)
        ctx.fillStyle = 'rgba(255,255,255,0.42)'
        ctx.font = '600 9px Nunito, sans-serif'
        ctx.fillText('neurons', l.xL[li], l.cy + H * 0.31 + 13)
      })

      // DECIDE: softmax probability bars (real confidences when predicting)
      {
        const n = p.classes.length, bh2 = Math.min(40, (H * 0.5) / n), top = l.cy - (n * bh2) / 2
        for (let i = 0; i < n; i++) {
          const c = p.classes[i]
          const [r, g, b] = hex(p.colorOf(c.id, i))
          const pr = probs && probs[i] != null ? probs[i] : 0
          const y = top + i * bh2 + bh2 / 2, bw2 = 10 + pr * 34
          ctx.fillStyle = `rgba(${r},${g},${b},${0.28 + pr * 0.65})`
          rr(l.xD - bw2 / 2, y - 4, bw2, 8, 3)
          ctx.fill()
        }
      }

      // packets travelling through the net
      ctx.globalCompositeOperation = 'lighter'
      const segs = [l.xNum, l.xAug, l.xL[0], l.xL[1], l.xL[2], l.xD, l.xO]
      for (let i = packets.length - 1; i >= 0; i--) {
        const pk = packets[i]
        pk.p += pk.sp
        const fp = pk.p * (segs.length - 1)
        const si = Math.min(segs.length - 2, Math.floor(fp))
        const fr = fp - si
        const x = segs[si] + (segs[si + 1] - segs[si]) * fr
        const outY = oY(l, pk.ci)
        const y = si >= 5 ? l.cy + (outY - l.cy) * fr : l.cy
        if (si >= 2 && si <= 4 && acts[si - 2]) {
          const k = (fc + i) % acts[si - 2].length
          acts[si - 2][k] = 1
        }
        const c = p.classes[pk.ci]
        if (!c) { packets.splice(i, 1); continue }
        const [r, g, b] = hex(p.colorOf(c.id, pk.ci))
        const gl = ctx.createRadialGradient(x, y, 0, x, y, 7)
        gl.addColorStop(0, 'rgba(255,255,255,0.95)')
        gl.addColorStop(0.4, `rgba(${r},${g},${b},0.9)`)
        gl.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = gl
        ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill()
        if (pk.p >= 1) packets.splice(i, 1)
      }
      ctx.globalCompositeOperation = 'source-over'

      // PREDICTION orbs (one per class), sized by sample count
      p.classes.forEach((c, i) => {
        const x = l.xO, y = oY(l, i)
        const [r, g, b] = hex(p.colorOf(c.id, i))
        const count = p.sampleCounts[c.id] || 0
        const lit = (p.mode === 'test' && predIdx === i) ? 1 : 0
        const R = 9 + Math.min(7, count * 0.4) + lit * 6
        ctx.globalCompositeOperation = 'lighter'
        const halo = ctx.createRadialGradient(x, y, 0, x, y, R * 2.4)
        halo.addColorStop(0, `rgba(${r},${g},${b},${0.4 + lit * 0.5})`)
        halo.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = halo
        ctx.beginPath(); ctx.arc(x, y, R * 2.4, 0, 7); ctx.fill()
        const core = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, 1, x, y, R)
        core.addColorStop(0, 'rgba(255,255,255,0.95)')
        core.addColorStop(0.5, `rgba(${r},${g},${b},1)`)
        core.addColorStop(1, `rgba(${(r * 0.5) | 0},${(g * 0.5) | 0},${(b * 0.5) | 0},1)`)
        ctx.fillStyle = count > 0 ? core : 'rgba(255,255,255,0.06)'
        ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill()
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.font = '800 9px Nunito, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(c.name, x + R + 7, y + 3)
      })
      if (p.mode === 'test' && predIdx >= 0 && p.classes[predIdx]) {
        const x = l.xO, y = oY(l, predIdx)
        ctx.strokeStyle = 'rgba(55,226,154,0.9)'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.stroke()
        ctx.fillStyle = '#37e29a'
        ctx.font = '900 8px Nunito, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('PREDICTED', x, y + 30)
      }
    }

    frame()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      ro.disconnect()
    }
  }, [props.open])

  const e = Math.max(0, Math.min(1, props.trainProgress / 100))
  let narr: string
  if (props.mode === 'test') {
    narr = props.livePrediction?.className
      ? `That's "${props.livePrediction.className}" · ${Math.round((props.livePrediction.confidence || 0) * 100)}%`
      : props.config.testIdlePrompt
  } else if (props.isTraining) {
    narr = props.config.narrator(e)
  } else {
    narr = '✓ All done — your model is ready!'
  }

  return (
    <RevealShell
      open={props.open}
      mode={props.mode}
      isTraining={props.isTraining}
      trainProgress={props.trainProgress}
      trainAccuracy={props.trainAccuracy}
      epochs={props.epochs ?? DEFAULT_EPOCHS}
      narrator={narr}
      onClose={props.onClose}
      onCancel={props.onCancel}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </RevealShell>
  )
}
