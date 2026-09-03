/* ------------------------------------------------------------------ *
 *  RainbowFX — the hand visuals from RainbowMode (neon skeleton,
 *  glowing fingertips, two-hand rainbow connecting lines + electric
 *  arcs). Driven by the app's MediaPipe landmarks. No matrix
 *  background, no stats HUD, no audio. Pure overlay rendering —
 *  never touches detection/classification.
 * ------------------------------------------------------------------ */

interface Pt { x: number; y: number; z?: number }

const FINGER_TIPS = [4, 8, 12, 16, 20]
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
]

const rainbow = (t: number, index = 0, total = 1) =>
  `hsl(${(t * 100 + index * (360 / total)) % 360}, 100%, 60%)`

// Electric-arc lifecycle thresholds, measured in NORMALIZED units (fraction of
// the frame, 0..1) so the feel is identical fullscreen and windowed — unlike the
// old fixed 150px gap, which needed much closer hands on a bigger canvas.
// Ignite when the hands come within ARC_NEAR, keep it lit (and let it stretch)
// until they're pulled past ARC_FAR.
const ARC_NEAR = 0.14
const ARC_FAR = 0.5

export class RainbowFX {
  // Whether the two-hand electric arc is currently lit. Hysteresis state: turns
  // on when hands come close (ARC_NEAR), stays on while they stretch apart, and
  // turns off only once they pass ARC_FAR (then needs a fresh close to re-ignite).
  private arcLit = false

  /**
   * Render one frame onto the effects canvas. `hands` are landmark arrays with
   * x/y in 0..1. The caller must NOT clear the canvas — this keeps a motion-blur
   * trail and uses additive blending for the neon bloom (like RainbowMode).
   */
  render(ctx: CanvasRenderingContext2D, W: number, H: number, hands: Pt[][], t: number): void {
    // short motion-blur trail, then additive neon bloom. Erase ~45% of the
    // previous frame each tick (was 20%) so the trail fades in a few frames
    // instead of lingering ~0.5s — fast hand movement no longer smears/ghosts.
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'screen'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Arc needs two hands; drop it if one leaves so it re-ignites cleanly.
    if (hands.length < 2) this.arcLit = false

    if (hands.length > 0) {
      // 1. per-hand rainbow skeleton + glowing fingertips.
      //    Neon glow is faked with a wide faint pass + a crisp core pass instead
      //    of ctx.shadowBlur (a per-stroke CPU Gaussian blur — the single most
      //    expensive Canvas2D op and the reason "effects on" used to tank FPS).
      hands.forEach((hand, handIndex) => {
        const glow = rainbow(t, handIndex, 2)
        // wide faint glow pass
        ctx.strokeStyle = glow
        ctx.globalAlpha = 0.22
        ctx.lineWidth = 7
        for (const [a, b] of HAND_CONNECTIONS) {
          const pa = hand[a], pb = hand[b]
          if (!pa || !pb) continue
          ctx.beginPath(); ctx.moveTo(pa.x * W, pa.y * H); ctx.lineTo(pb.x * W, pb.y * H); ctx.stroke()
        }
        // crisp core pass
        ctx.globalAlpha = 1
        ctx.lineWidth = 2
        for (const [a, b] of HAND_CONNECTIONS) {
          const pa = hand[a], pb = hand[b]
          if (!pa || !pb) continue
          ctx.beginPath(); ctx.moveTo(pa.x * W, pa.y * H); ctx.lineTo(pb.x * W, pb.y * H); ctx.stroke()
        }
        // fingertips: faint halo + white core (replaces shadowBlur)
        FINGER_TIPS.forEach((tipIdx) => {
          const p = hand[tipIdx]; if (!p) return
          const x = p.x * W, y = p.y * H
          ctx.globalAlpha = 0.3; ctx.fillStyle = glow
          ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill()
          ctx.globalAlpha = 1; ctx.fillStyle = '#fff'
          ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill()
        })
      })

      // 2. rainbow lines connecting the two hands' matching fingertips + arcs
      if (hands.length >= 2) {
        const h1 = hands[0], h2 = hands[1]

        // Overall hand closeness in NORMALIZED units (avg matching-fingertip gap)
        // → same trigger fullscreen and windowed. Hysteresis: ignite when close,
        // stay lit while the hands stretch apart, extinguish once past ARC_FAR.
        let gapSum = 0
        for (const tip of FINGER_TIPS) {
          gapSum += Math.hypot(h1[tip].x - h2[tip].x, h1[tip].y - h2[tip].y)
        }
        const avgGap = gapSum / FINGER_TIPS.length
        if (!this.arcLit && avgGap < ARC_NEAR) this.arcLit = true
        else if (this.arcLit && avgGap > ARC_FAR) this.arcLit = false

        FINGER_TIPS.forEach((tipIdx, idx) => {
          const a = { x: h1[tipIdx].x * W, y: h1[tipIdx].y * H }
          const b = { x: h2[tipIdx].x * W, y: h2[tipIdx].y * H }
          const col = rainbow(t, idx, FINGER_TIPS.length)

          // Bolt crackles whenever the arc is lit — it spans a→b, so it naturally
          // stretches as the hands pull apart (jitter scaled to canvas width so it
          // looks the same at any size).
          if (this.arcLit && Math.random() > 0.4) {
            const mx = (a.x + b.x) / 2 + (Math.random() - 0.5) * W * 0.04
            const my = (a.y + b.y) / 2 + (Math.random() - 0.5) * W * 0.04
            // faint glow pass + white core
            ctx.globalAlpha = 0.3; ctx.strokeStyle = col; ctx.lineWidth = 8
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.lineTo(b.x, b.y); ctx.stroke()
            ctx.globalAlpha = 1; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.lineTo(b.x, b.y); ctx.stroke()
          }

          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
          grad.addColorStop(0,   rainbow(t, idx,     5))
          grad.addColorStop(0.5, rainbow(t, idx + 1, 5))
          grad.addColorStop(1,   rainbow(t, idx + 2, 5))
          // faint wide glow pass + gradient core
          ctx.globalAlpha = 0.22; ctx.strokeStyle = col; ctx.lineWidth = 9
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          ctx.globalAlpha = 1; ctx.strokeStyle = grad; ctx.lineWidth = 4
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        })
      }
    }

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
}
