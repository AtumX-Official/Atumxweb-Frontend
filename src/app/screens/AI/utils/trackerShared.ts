/**
 * Shared engine helpers for HandTracker and PoseTracker. Both trackers ran their
 * own copies of these — identical logic, two maintenance points. Centralised here
 * so the per-frame loop, smoothing, and canvas sizing behave the same everywhere
 * and the backend/perf fixes only have to land once.
 */

export interface SmoothablePoint {
  x: number
  y: number
  z: number
  // Always populated by smoothLandmarks (defaults to 1.0) so the result is
  // assignable to both the hand (optional) and pose (required) landmark types.
  visibility: number
}

/**
 * Exponential-moving-average smoothing between the previous and next landmark
 * frames. `alpha` is the weight of the NEW frame (0.45 ≈ responsive but stable).
 * Returns `next` unchanged when there is no comparable previous frame.
 */
export function smoothLandmarks<T extends { x: number; y: number; z?: number; visibility?: number }>(
  prev: T[] | null | undefined,
  next: T[],
  alpha = 0.45
): SmoothablePoint[] {
  if (!prev || prev.length !== next.length) {
    return next.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z ?? 0, visibility: lm.visibility ?? 1.0 }))
  }
  return next.map((lm, idx) => {
    const p = prev[idx]
    return {
      x: p.x + alpha * (lm.x - p.x),
      y: p.y + alpha * (lm.y - p.y),
      z: (p.z ?? 0) + alpha * ((lm.z ?? 0) - (p.z ?? 0)),
      // EMA the visibility too. Drawing hides landmarks below a 0.5 threshold, and
      // MediaPipe's raw visibility jitters right around that value for a limb at the
      // frame edge — smoothing it makes the limb cross the threshold ONCE and fade
      // out cleanly instead of flickering / "searching".
      visibility: (p.visibility ?? 1.0) + alpha * ((lm.visibility ?? 1.0) - (p.visibility ?? 1.0)),
    }
  })
}

/**
 * Right-size a canvas backing store to its displayed size, capping the device
 * pixel ratio (default 1.5) so low-spec machines don't clear/draw millions of
 * off-screen pixels each frame. Drawing is normalized (0..1 × W/H), so resizing
 * the backing store never distorts the overlay. No-op when already correct.
 */
export function sizeCanvasBacking(
  canvas: HTMLCanvasElement,
  fallbackW: number,
  fallbackH: number,
  maxDpr = 1.5
): void {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
  const cw = Math.round((canvas.clientWidth || fallbackW) * dpr)
  const ch = Math.round((canvas.clientHeight || fallbackH) * dpr)
  if (cw > 0 && ch > 0 && (canvas.width !== cw || canvas.height !== ch)) {
    canvas.width = cw
    canvas.height = ch
  }
}

/**
 * Rolling FPS meter — averages the instantaneous rate over the last `window`
 * frames so the on-screen number doesn't jitter. Call `tick(ts)` once per rAF.
 */
export class FpsMeter {
  private last = 0
  private samples: number[] = []
  constructor(private readonly window = 30) {}

  tick(ts: number): number {
    const delta = ts - this.last
    this.last = ts
    if (delta > 0 && delta < 1000) {
      this.samples.push(1000 / delta)
      if (this.samples.length > this.window) this.samples.shift()
    }
    if (this.samples.length === 0) return 0
    return Math.round(this.samples.reduce((a, b) => a + b, 0) / this.samples.length)
  }
}
