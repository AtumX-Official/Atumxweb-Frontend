import { useEffect, useRef } from 'react'
import type { AudioClass, Prediction } from '../hooks/useAudioClassifier'
import { N_MELS, MEL_FRAMES } from '../utils/audioDSP'
import RevealShell from './RevealShell'

/**
 * "How your model learns" / "watch it classify" reveal for the AUDIO classifier.
 *
 * Honest mechanism: audio is a real CONVOLUTIONAL net on mel-spectrograms, so the
 * stages are SOUND → PICTURE (spectrogram) → COPIES (×6 augment) → FIND PATTERNS
 * (conv filters ×16/×32/×32) → DECIDE (dense) → ANSWER. A faithful port of
 * prototypes/ai-lab-audio.html driven off the real classifier: real classes/colors,
 * real recorded mel-spectrograms, real trainProgress / accuracy / epoch, and — in
 * test mode — the live mic + the real Prediction.
 */

const SCOLS = 30
const SROWS = 20
const DENSE_DOTS = 10
const DEFAULT_EPOCHS = 80
// While TF.js is training (heavy main-thread/GPU work), cap the reveal animation hard so
// it doesn't starve training. Test mode + the idle "done" screen run at full 60fps.
const TRAIN_FPS = 15

interface AudioLayersRevealProps {
  open: boolean
  mode: 'train' | 'test'
  classes: AudioClass[]
  colorOf: (classId: string, idx: number) => string
  sampleCounts: Record<string, number>
  /** classifier.samplesRef.current — real recorded mel-spectrograms per class */
  samples: Record<string, Float32Array[]>
  isTraining: boolean
  isTrained: boolean
  trainProgress: number
  trainAccuracy: number | null
  epochs?: number
  /** live mic analyser (test mode) */
  analyser?: AnalyserNode | null
  /** live prediction flowing through the net (test mode) */
  livePrediction?: Prediction | null
  onClose: () => void
  /** train mode: abandon training midway and close the reveal */
  onCancel?: () => void
}

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Downsample one real [64×130] mel-spectrogram into an SCOLS×SROWS grid in [0,1]. */
function buildGrid(spec: Float32Array | undefined, out: Float32Array): Float32Array {
  if (!spec) { out.fill(0); return out }
  for (let c = 0; c < SCOLS; c++) {
    const frame = Math.round((c / (SCOLS - 1)) * (MEL_FRAMES - 1))
    for (let r = 0; r < SROWS; r++) {
      const mel = Math.round((r / (SROWS - 1)) * (N_MELS - 1))
      const db = spec[mel * MEL_FRAMES + frame]
      out[c * SROWS + r] = Math.max(0, Math.min(1, (db + 40.0) / 40.0))
    }
  }
  return out
}

export default function AudioLayersReveal(props: AudioLayersRevealProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const propsRef = useRef(props)
  propsRef.current = props

  useEffect(() => {
    if (!props.open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 1000, H = 460
    // static background (solid + dotted grid) is identical every frame — render it once
    // into an offscreen canvas and blit it, instead of ~600 fillRects per frame.
    const bg = document.createElement('canvas')
    const bgCtx = bg.getContext('2d')!
    const buildBg = (): void => {
      bg.width = Math.max(1, W * dpr); bg.height = Math.max(1, H * dpr)
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bgCtx.fillStyle = '#04050d'; bgCtx.fillRect(0, 0, W, H)
      bgCtx.fillStyle = 'rgba(255,255,255,0.03)'
      for (let y = 20; y < H; y += 28) for (let x = 20; x < W; x += 28) bgCtx.fillRect(x, y, 1.2, 1.2)
    }
    const resize = (): void => {
      const r = canvas.getBoundingClientRect()
      W = r.width || 1000; H = r.height || 460
      canvas.width = W * dpr; canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildBg()
    }
    window.addEventListener('resize', resize)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    let activeClassIdx = 0
    let lastSwitch = 0

    // conv blocks mirror Conv(16) → Conv(32) → Conv(32)
    const convBlocks = [
      { cols: 2, rows: 2, sz: 30, filters: 16, act: 0 },
      { cols: 3, rows: 2, sz: 20, filters: 32, act: 0 },
      { cols: 3, rows: 3, sz: 13, filters: 32, act: 0 },
    ]
    let denseAct = 0
    // "lite" = drop the expensive glow/shadow passes while training so each frame is
    // cheap and yields the main thread back to TF.js quickly (set per-frame from isTraining)
    let lite = false
    const packets: { ci: number; p: number; sp: number }[] = []
    const acts: Record<string, number> = {}
    let t = 0, fc = 0, raf = 0

    const grid = new Float32Array(SCOLS * SROWS)   // the spectrogram currently flowing
    const liveGrid = new Float32Array(SCOLS * SROWS) // rolling live spectrogram (test)

    // live mic buffers (test mode)
    let timeData: Uint8Array<ArrayBuffer> | null = null
    let freqData: Uint8Array<ArrayBuffer> | null = null
    let level = 0
    if (props.analyser) {
      props.analyser.fftSize = 1024
      timeData = new Uint8Array(props.analyser.fftSize)
      freqData = new Uint8Array(props.analyser.frequencyBinCount)
    }

    const roundRect = (x: number, y: number, w: number, h: number, r: number): void => {
      ctx.beginPath()
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
    }
    const taughtClasses = (): { cls: AudioClass; idx: number; color: string }[] => {
      const p = propsRef.current
      return p.classes.map((cls, idx) => ({ cls, idx, color: p.colorOf(cls.id, idx) }))
        .filter((c) => (p.sampleCounts[c.cls.id] || 0) > 0)
    }
    const repSpec = (classId: string): Float32Array | undefined => {
      const list = propsRef.current.samples[classId]
      return list && list.length ? list[0] : undefined
    }
    const predIdx = (): number => {
      const p = propsRef.current
      if (p.mode !== 'test' || !p.livePrediction || !p.livePrediction.isDetected || !p.livePrediction.classId) return -1
      return p.classes.findIndex((c) => c.id === p.livePrediction!.classId)
    }

    const sv = (c: number, r: number): number => {
      c = Math.max(0, Math.min(SCOLS - 1, c)); r = Math.max(0, Math.min(SROWS - 1, r))
      return grid[c * SROWS + r]
    }
    const filt = (type: number, c: number, r: number): number => {
      switch (type) {
        case 0: return Math.abs(sv(c + 1, r) - sv(c - 1, r)) * 1.7
        case 1: return Math.abs(sv(c, r + 1) - sv(c, r - 1)) * 1.7
        case 2: { const v = sv(c, r); return v > 0.45 ? v : 0 }
        case 3: return (sv(c - 1, r) + sv(c + 1, r) + sv(c, r - 1) + sv(c, r + 1) + sv(c, r)) / 5
        case 4: return Math.abs(sv(c + 1, r + 1) - sv(c - 1, r - 1)) * 1.7
        default: return sv(c, r)
      }
    }
    function specColor(v: number, rgb: [number, number, number]): string {
      v = Math.max(0, Math.min(1, v)); const k = Math.pow(v, 0.8)
      let r = rgb[0] * k, g = rgb[1] * k, b = rgb[2] * k
      if (k > 0.75) { const u = ((k - 0.75) / 0.25) * 0.7; r += (255 - r) * u; g += (255 - g) * u; b += (255 - b) * u }
      return `rgb(${r | 0},${g | 0},${b | 0})`
    }
    function drawSpec(x: number, y: number, w: number, h: number, scaleV: number, rgb: [number, number, number]): void {
      const cw = w / SCOLS, ch = h / SROWS
      // while training, draw at 1/2 resolution (≈4× fewer rects) — it's a glance, not a study
      const step = lite ? 2 : 1
      for (let c = 0; c < SCOLS; c += step)
        for (let r = 0; r < SROWS; r += step) {
          ctx.fillStyle = specColor(grid[c * SROWS + r] * (scaleV || 1), rgb)
          ctx.fillRect(x + c * cw, y + (SROWS - r - step) * ch, cw * step + 0.6, ch * step + 0.6)
        }
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.55)`
      ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h)
    }
    function activeRGB(): [number, number, number] {
      const p = propsRef.current
      if (p.mode === 'test') {
        const pi = predIdx()
        if (pi >= 0) return hexToRgb(p.colorOf(p.classes[pi].id, pi))
        return [120, 200, 255]
      }
      const taught = taughtClasses()
      const c = taught[activeClassIdx % Math.max(1, taught.length)]
      return c ? hexToRgb(c.color) : [200, 140, 255]
    }
    function miniMap(x: number, y: number, s: number, type: number, hue: number, act: number): void {
      const mc = 9, mr = 6, cw = s / mc, ch = s / mr
      for (let ci = 0; ci < mc; ci++)
        for (let ri = 0; ri < mr; ri++) {
          const c = Math.round((ci / mc) * SCOLS), r = Math.round((ri / mr) * SROWS)
          const v = Math.max(0, Math.min(1, filt(type, c, r))) * (0.5 + act * 0.5)
          ctx.fillStyle = `hsl(${hue},90%,${(6 + v * 62) | 0}%)`
          ctx.fillRect(x + ci * cw, y + (mr - 1 - ri) * ch, cw + 0.5, ch + 0.5)
        }
      ctx.strokeStyle = `hsla(${hue},90%,70%,${0.25 + act * 0.5})`
      ctx.lineWidth = 1; ctx.strokeRect(x, y, s, s)
    }
    function layout(): {
      micBox: { x: number; y: number; w: number; h: number }
      xMic: number; xPic: number; xAug: number; xL: number[]; xDense: number; xOut: number; cy: number
    } {
      const cy = H * 0.46
      const bw = Math.max(96, W * 0.12), bx = 16, bh = 84, by = cy - bh / 2
      return {
        micBox: { x: bx, y: by, w: bw, h: bh }, xMic: bx + bw / 2,
        xPic: W * 0.205, xAug: W * 0.315, xL: [W * 0.43, W * 0.535, W * 0.64],
        xDense: W * 0.765, xOut: W * 0.885, cy,
      }
    }
    function label(x: number, y: number, txt: string, sub?: string): void {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = '800 12px Nunito, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(txt, x, y)
      if (sub) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '600 9px Nunito, sans-serif'; ctx.fillText(sub, x, y + 13) }
    }
    function drawStageLabels(L: ReturnType<typeof layout>): void {
      const top = 22
      label(L.xMic, top, 'SOUND', '2-second clip')
      label(L.xPic, top, 'PICTURE', 'spectrogram')
      label(L.xAug, top, '×6 COPIES', 'extra examples')
      label((L.xL[0] + L.xL[2]) / 2, top, 'FIND PATTERNS', 'filters find features')
      label(L.xDense, top, 'DECIDE', 'pick best match')
      label(L.xOut, top, 'PREDICTION', 'one per class')
    }
    function arrow(x1: number, x2: number, y: number): void {
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - 6, y - 4); ctx.lineTo(x2 - 6, y + 4); ctx.closePath(); ctx.fill()
    }
    function drawArrows(L: ReturnType<typeof layout>): void {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2
      const y = L.cy
      arrow(L.micBox.x + L.micBox.w + 2, L.xPic - 50, y); arrow(L.xPic + 50, L.xAug - 42, y)
      arrow(L.xAug + 42, L.xL[0] - 34, y); arrow(L.xL[0] + 34, L.xL[1] - 30, y)
      arrow(L.xL[1] + 30, L.xL[2] - 26, y); arrow(L.xL[2] + 26, L.xDense - 20, y)
    }
    function drawPicture(L: ReturnType<typeof layout>): void {
      const w = 92, h = 64, x = L.xPic - w / 2, y = L.cy - h / 2
      ctx.globalCompositeOperation = 'source-over'
      drawSpec(x, y, w, h, 1, activeRGB())
      const fs = 18, m = 4
      const fx = x + m + (Math.sin(t * 0.7) * 0.5 + 0.5) * (w - fs - m * 2)
      const fy = y + m + (Math.sin(t * 1.13 + 1) * 0.5 + 0.5) * (h - fs - m * 2)
      ctx.strokeStyle = 'rgba(120,230,255,0.95)'; ctx.lineWidth = 2
      ctx.shadowBlur = lite ? 0 : 10; ctx.shadowColor = 'rgba(120,230,255,0.9)'; ctx.strokeRect(fx, fy, fs, fs)
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(120,230,255,0.35)'; ctx.lineWidth = 1
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(fx + (i * fs) / 3, fy); ctx.lineTo(fx + (i * fs) / 3, fy + fs); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(fx, fy + (i * fs) / 3); ctx.lineTo(fx + fs, fy + (i * fs) / 3); ctx.stroke()
      }
      ctx.fillStyle = 'rgba(120,230,255,0.7)'; ctx.font = '600 8px Nunito, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('3×3 filter', L.xPic, y + h + 12)
    }
    function drawAugment(L: ReturnType<typeof layout>): void {
      ctx.globalCompositeOperation = 'source-over'
      const w = 46, h = 32, rgb = activeRGB()
      for (let k = lite ? 0 : 4; k >= 0; k--) {
        const off = k * 5, x = L.xAug - w / 2 + off - 8, y = L.cy - h / 2 - off + 4
        ctx.globalAlpha = 0.5 - k * 0.07 + 0.4
        drawSpec(x, y, w, h, 0.9 - k * 0.05, rgb)
      }
      ctx.globalAlpha = 1
    }
    function drawConvBlocks(L: ReturnType<typeof layout>): void {
      ctx.globalCompositeOperation = 'source-over'
      convBlocks.forEach((bl, li) => {
        const gap = 4, gw = bl.cols * bl.sz + (bl.cols - 1) * gap, gh = bl.rows * bl.sz + (bl.rows - 1) * gap
        const x0 = L.xL[li] - gw / 2, y0 = L.cy - gh / 2
        let idx = 0
        for (let ry = 0; ry < bl.rows; ry++)
          for (let cx2 = 0; cx2 < bl.cols; cx2++) {
            const x = x0 + cx2 * (bl.sz + gap), y = y0 + ry * (bl.sz + gap), hue = 200 + ((idx * 47) % 90)
            if (lite) {
              // training: one flat tile per filter instead of a 9×6 mini-map (≈54× fewer rects)
              ctx.fillStyle = `hsl(${hue},65%,40%)`
              ctx.fillRect(x, y, bl.sz, bl.sz)
              ctx.strokeStyle = `hsla(${hue},90%,72%,0.35)`; ctx.lineWidth = 1; ctx.strokeRect(x, y, bl.sz, bl.sz)
            } else {
              if (bl.act > 0.02) { ctx.shadowBlur = bl.act * 12; ctx.shadowColor = `hsla(${hue},90%,60%,0.8)` } else ctx.shadowBlur = 0
              miniMap(x, y, bl.sz, idx % 6, hue, bl.act)
            }
            idx++
          }
        ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.font = '700 9px Nunito, sans-serif'; ctx.textAlign = 'center'
        ctx.fillText('×' + bl.filters + ' filters', L.xL[li], y0 + gh + 13)
      })
    }
    function outYpos(L: ReturnType<typeof layout>, ci: number): number {
      const n = Math.max(1, propsRef.current.classes.length)
      const gap = Math.min(64, (H * 0.7) / n)
      return L.cy - ((n - 1) * gap) / 2 + ci * gap
    }
    function drawDense(L: ReturnType<typeof layout>): void {
      const p = propsRef.current
      const n = DENSE_DOTS, gap = Math.min(26, (H * 0.62) / n), top = L.cy - ((n - 1) * gap) / 2
      const dots: { x: number; y: number }[] = []
      for (let i = 0; i < n; i++) dots.push({ x: L.xDense, y: top + i * gap })
      if (lite) {
        // flat, allocation-free: one batched path for every line, flat dots
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = 'rgba(120,235,255,0.10)'; ctx.lineWidth = 0.6
        ctx.beginPath()
        dots.forEach((d) => p.classes.forEach((_, ci) => { ctx.moveTo(d.x, d.y); ctx.lineTo(L.xOut, outYpos(L, ci)) }))
        ctx.stroke()
        ctx.fillStyle = 'rgba(206,242,255,0.85)'
        dots.forEach((d) => { ctx.beginPath(); ctx.arc(d.x, d.y, 3, 0, 7); ctx.fill() })
        return
      }
      ctx.globalCompositeOperation = 'lighter'
      dots.forEach((d) => p.classes.forEach((_, ci) => {
        ctx.strokeStyle = `rgba(120,235,255,${0.03 + denseAct * 0.22})`
        ctx.lineWidth = 0.5 + denseAct * 1.3
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(L.xOut, outYpos(L, ci)); ctx.stroke()
      }))
      dots.forEach((d) => {
        const R = 4 + denseAct * 2
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, R * 2)
        g.addColorStop(0, `rgba(150,240,255,${0.5 + denseAct * 0.5})`); g.addColorStop(1, 'rgba(90,210,255,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, R * 2, 0, 7); ctx.fill()
        ctx.fillStyle = 'rgba(224,250,255,0.95)'; ctx.beginPath(); ctx.arc(d.x, d.y, R * 0.7, 0, 7); ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'
    }
    function drawPackets(L: ReturnType<typeof layout>): void {
      const p = propsRef.current
      ctx.globalCompositeOperation = lite ? 'source-over' : 'lighter'
      const segs = [L.xAug, L.xL[0], L.xL[1], L.xL[2], L.xDense, L.xOut]
      for (let i = packets.length - 1; i >= 0; i--) {
        const pk = packets[i]; pk.p += pk.sp
        const fpos = pk.p * (segs.length - 1), si = Math.min(segs.length - 2, Math.floor(fpos)), fr = fpos - si
        const x = segs[si] + (segs[si + 1] - segs[si]) * fr
        const outY = outYpos(L, pk.ci), y = si >= 4 ? L.cy + (outY - L.cy) * fr : L.cy
        if (si >= 1 && si <= 3 && convBlocks[si - 1]) convBlocks[si - 1].act = 1
        if (si >= 4) denseAct = 1
        const c = p.classes[pk.ci]
        if (!c) { packets.splice(i, 1); continue }
        const [r, g, b] = hexToRgb(p.colorOf(c.id, pk.ci))
        if (lite) {
          ctx.fillStyle = `rgba(${r},${g},${b},0.95)`
          ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill()
        } else {
          const gl = ctx.createRadialGradient(x, y, 0, x, y, 8)
          gl.addColorStop(0, 'rgba(255,255,255,0.95)'); gl.addColorStop(0.4, `rgba(${r},${g},${b},0.9)`); gl.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill()
        }
        if (pk.p >= 1) { if (!lite) acts[c.id] = 1; packets.splice(i, 1) }
      }
      ctx.globalCompositeOperation = 'source-over'
    }
    function drawOutputs(L: ReturnType<typeof layout>): void {
      const p = propsRef.current
      const pi = predIdx()
      p.classes.forEach((c, i) => {
        const x = L.xOut, y = outYpos(L, i)
        const [r, g, b] = hexToRgb(p.colorOf(c.id, i))
        const count = p.sampleCounts[c.id] || 0
        if (lite) {
          // static, allocation-free: flat disc + a fixed highlight, no halo / no grow
          const R = 16 + Math.min(8, count * 0.6)
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = count > 0 ? `rgb(${r},${g},${b})` : 'rgba(255,255,255,0.06)'
          ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill()
          if (count > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.3)'
            ctx.beginPath(); ctx.arc(x - R * 0.3, y - R * 0.3, R * 0.34, 0, 7); ctx.fill()
          }
          ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '800 10px Nunito, sans-serif'; ctx.textAlign = 'left'
          ctx.fillText(c.name, x + R + 8, y + 3)
          return
        }
        const act = acts[c.id] || 0
        const R = 12 + Math.min(8, count * 0.6) + act * 6
        ctx.globalCompositeOperation = 'lighter'
        const halo = ctx.createRadialGradient(x, y, 0, x, y, R * 2.4)
        halo.addColorStop(0, `rgba(${r},${g},${b},${0.4 + act * 0.5})`); halo.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, R * 2.4, 0, 7); ctx.fill()
        const core = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, 1, x, y, R)
        core.addColorStop(0, 'rgba(255,255,255,0.95)'); core.addColorStop(0.5, `rgba(${r},${g},${b},1)`)
        core.addColorStop(1, `rgba(${(r * 0.5) | 0},${(g * 0.5) | 0},${(b * 0.5) | 0},1)`)
        ctx.fillStyle = count > 0 ? core : 'rgba(255,255,255,0.06)'
        ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill()
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '800 10px Nunito, sans-serif'; ctx.textAlign = 'left'
        ctx.fillText(c.name, x + R + 8, y + 3)
        if (p.mode === 'test' && pi === i) {
          ctx.strokeStyle = 'rgba(55,226,154,0.9)'; ctx.lineWidth = 2
          ctx.beginPath(); ctx.arc(x, y, R + 7, 0, 7); ctx.stroke()
          ctx.fillStyle = '#37e29a'; ctx.font = '900 8px Nunito, sans-serif'; ctx.textAlign = 'center'
          ctx.fillText('PREDICTED', x, y + R + 18)
        }
      })
    }
    function drawMicBox(L: ReturnType<typeof layout>): void {
      const b = L.micBox, cyb = b.y + b.h / 2
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(2,3,10,0.65)'; roundRect(b.x, b.y, b.w, b.h, 9); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.save(); roundRect(b.x, b.y, b.w, b.h, 9); ctx.clip()
      ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'
      const live = propsRef.current.mode === 'test' && timeData
      const strands = lite ? 1 : 5
      for (let k = 0; k < strands; k++) {
        const kk = k / 4 - 0.5, ph = kk * 7
        ctx.beginPath()
        const MWP = 60
        for (let i = 0; i < MWP; i++) {
          const xn = i / (MWP - 1), x = b.x + xn * b.w
          const winE = Math.pow(Math.sin(Math.PI * xn), 0.7)
          let amp: number
          if (live) {
            const sample = (timeData![Math.floor(xn * (timeData!.length - 1))] - 128) / 128
            amp = sample * (0.6 + level * 1.2)
          } else {
            amp = Math.sin(xn * 9.4 - t * 1.25 + ph) * 0.6 + Math.sin(xn * 4.8 + t * 0.85 + ph * 1.4) * 0.4
          }
          const y = cyb + amp * 0.5 * (b.h * 0.4) * (1 - Math.abs(kk) * 0.35) * winE
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y)
        }
        const dist = Math.abs(kk) * 2, hue = 205 + dist * 70
        // Brighter + thicker strands so the SOUND clip wave reads clearly (it was
        // barely visible at the old 0.5 alpha, especially in lite/low-spec mode).
        ctx.strokeStyle = `hsla(${hue},${(40 + dist * 60) | 0}%,${(96 - dist * 40) | 0}%,${(0.95 - dist * 0.3).toFixed(2)})`
        ctx.lineWidth = (1 - dist) * 2.5 + 1.2; ctx.shadowBlur = lite ? 0 : 12; ctx.shadowColor = `hsla(${hue},100%,65%,0.9)`
        ctx.stroke()
      }
      ctx.restore(); ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over'
    }

    let lastDraw = -1
    let prevTs = -1
    function frame(now?: number): void {
      raf = requestAnimationFrame(frame)
      const ts = now ?? 0
      const p = propsRef.current
      // throttle the animation while training so TF.js gets the cycles back
      if (p.isTraining) {
        if (lastDraw >= 0 && ts - lastDraw < 1000 / TRAIN_FPS) return
        lastDraw = ts
      }
      // advance the clock by real elapsed time so animation speed stays constant
      // regardless of how many frames we skipped
      const dt = prevTs < 0 ? 0.016 : Math.min(0.05, (ts - prevTs) / 1000)
      prevTs = ts
      t += dt; fc++
      lite = p.isTraining
      const taught = taughtClasses()
      const testing = p.mode === 'test'

      // ── choose the spectrogram flowing through the net ──
      if (testing && p.analyser && timeData && freqData) {
        p.analyser.getByteTimeDomainData(timeData)
        p.analyser.getByteFrequencyData(freqData)
        let acc = 0
        for (let i = 0; i < timeData.length; i++) { const v = (timeData[i] - 128) / 128; acc += v * v }
        level += (Math.min(1, Math.sqrt(acc / timeData.length) * 3.4) - level) * 0.35
        // roll one live column in
        for (let c = 0; c < SCOLS - 1; c++) for (let r = 0; r < SROWS; r++) liveGrid[c * SROWS + r] = liveGrid[(c + 1) * SROWS + r]
        const u = (freqData.length * 0.6) | 0
        for (let r = 0; r < SROWS; r++) {
          const a0 = Math.floor(Math.pow(r / SROWS, 1.6) * u), b0 = Math.max(a0 + 1, Math.floor(Math.pow((r + 1) / SROWS, 1.6) * u))
          let m = 0; for (let j = a0; j < b0; j++) { const v = freqData[j] / 255; if (v > m) m = v }
          liveGrid[(SCOLS - 1) * SROWS + r] = m
        }
        grid.set(liveGrid)
      } else {
        if (taught.length && t - lastSwitch > 1.1) { activeClassIdx = (activeClassIdx + 1) % taught.length; lastSwitch = t }
        const active = taught[activeClassIdx % Math.max(1, taught.length)]
        buildGrid(active ? repSpec(active.cls.id) : undefined, grid)
      }

      // background (pre-rendered once into `bg`)
      ctx.drawImage(bg, 0, 0, W, H)

      const L = layout()

      convBlocks.forEach((l) => (l.act += (0 - l.act) * 0.06))
      denseAct += (0 - denseAct) * 0.06
      Object.keys(acts).forEach((k) => (acts[k] += (0 - acts[k]) * 0.06))

      // spawn flow: a single flat dot travels the pipeline so it reads as "working".
      // training → one at a time (cheap), colored by the class currently being learned.
      if (p.isTraining && taught.length && packets.length === 0) {
        const c = taught[activeClassIdx % taught.length]
        if (c) packets.push({ ci: c.idx, p: 0, sp: 0.03 })
      }
      if (testing) {
        const pi = predIdx()
        if (pi >= 0 && fc % 16 === 0) packets.push({ ci: pi, p: 0, sp: 0.03 })
      }

      drawStageLabels(L); drawArrows(L); drawMicBox(L); drawPicture(L)
      drawAugment(L); drawConvBlocks(L); drawDense(L); drawPackets(L); drawOutputs(L)
    }

    frame()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      ro.disconnect()
    }
  }, [props.open])

  // narrator
  const e = Math.max(0, Math.min(1, props.trainProgress / 100))
  let narr: string
  if (props.mode === 'test') {
    narr = props.livePrediction?.isDetected && props.livePrediction.className
      ? `I hear it — that's "${props.livePrediction.className}"!`
      : 'Make a sound and watch it land in the right group.'
  } else if (props.isTraining) {
    narr = e < 0.3 ? 'Listening to every sound you recorded…'
      : e < 0.6 ? 'Turning each one into a picture and making 12 copies…'
        : e < 0.85 ? 'Finding the patterns that tell them apart…'
          : 'Sharpening it so it tells your sounds apart…'
  } else {
    narr = '✓ Trained! Now make a sound and watch it land in the right group.'
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
