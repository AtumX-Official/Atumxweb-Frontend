// Lighting quality monitor for the camera-based AI screens (gesture + pose).
//
// Poor lighting is the #1 cause of bad landmark detection, so we sample the live
// camera feed and surface a red corner banner when the scene is too dark, blown
// out, or back-lit (a bright background behind a dark subject — the classic
// "light directly behind" case). All analysis is done on a tiny downscaled copy
// of the frame, throttled and debounced, so it costs almost nothing per frame.

export type LightingStatus = 'ok' | 'dark' | 'bright' | 'backlit'

/** User-facing message for each problem state (null = no warning). */
export const LIGHTING_MESSAGES: Record<LightingStatus, string | null> = {
  ok: null,
  dark: 'Too dark — add light',
  bright: 'Too bright — less light',
  backlit: 'Backlit — face the light',
}

// Tunable thresholds (luminance is 0..1, ITU-R BT.601). These flag lighting that
// is bad ENOUGH to hurt detection. They're only ever surfaced when detection is
// already struggling (gated in the trackers), so they can be fairly sensitive
// without nagging during normal use — loosened from the old near-pitch-black /
// near-white values, which almost never triggered.
const DARK_MEAN = 0.32 // whole-frame mean below this → too dark
const BRIGHT_MEAN = 0.70 // whole-frame mean above this → too bright
const BRIGHT_FRACTION = 0.28 // …or this fraction of near-white pixels → blown out
const BACKLIT_DELTA = 0.20 // border brighter than center by this much → backlit
const BACKLIT_CENTER_MAX = 0.45 // …and the (subject) center is itself dim

// Timing: sample a few times a second, and require a state to persist before we
// show/hide it so the banner never flickers on a momentary shadow.
const SAMPLE_INTERVAL_MS = 350
const ONSET_HOLD_MS = 700 // a problem must persist this long before warning
const CLEAR_HOLD_MS = 600 // …and clear this long before the warning disappears

export class LightingMonitor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private lastSampleTs = 0
  private current: LightingStatus = 'ok'
  private candidate: LightingStatus = 'ok'
  private candidateSince = 0

  constructor() {
    // 96×54 (16:9) is plenty to judge overall lighting and is ~5k pixels to scan.
    this.canvas = document.createElement('canvas')
    this.canvas.width = 96
    this.canvas.height = 54
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!
  }

  /**
   * Call every frame with the live video and the rAF timestamp. Returns the
   * current debounced lighting status (cheap on frames between samples).
   */
  update(video: HTMLVideoElement | null, now: number): LightingStatus {
    if (video && now - this.lastSampleTs >= SAMPLE_INTERVAL_MS) {
      this.lastSampleTs = now
      const raw = this.analyze(video)
      if (raw !== this.candidate) {
        this.candidate = raw
        this.candidateSince = now
      }
      if (this.candidate !== this.current) {
        const hold = this.candidate === 'ok' ? CLEAR_HOLD_MS : ONSET_HOLD_MS
        if (now - this.candidateSince >= hold) this.current = this.candidate
      }
    }
    return this.current
  }

  private analyze(video: HTMLVideoElement): LightingStatus {
    const W = this.canvas.width
    const H = this.canvas.height
    let data: Uint8ClampedArray
    try {
      this.ctx.drawImage(video, 0, 0, W, H)
      data = this.ctx.getImageData(0, 0, W, H).data
    } catch {
      // Frame not ready / tainted canvas — treat as ok, don't false-warn.
      return 'ok'
    }

    const cx0 = W * 0.25
    const cx1 = W * 0.75
    const cy0 = H * 0.25
    const cy1 = H * 0.75

    let sum = 0
    let brightCount = 0
    let centerSum = 0
    let centerCount = 0
    let borderSum = 0
    let borderCount = 0

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4
        const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
        sum += lum
        if (lum > 0.94) brightCount++
        if (x >= cx0 && x < cx1 && y >= cy0 && y < cy1) {
          centerSum += lum
          centerCount++
        } else {
          borderSum += lum
          borderCount++
        }
      }
    }

    const total = W * H
    const mean = sum / total
    const center = centerSum / centerCount
    const border = borderSum / borderCount
    const brightFraction = brightCount / total

    if (mean < DARK_MEAN) return 'dark'
    if (mean > BRIGHT_MEAN || brightFraction > BRIGHT_FRACTION) return 'bright'
    if (border - center > BACKLIT_DELTA && center < BACKLIT_CENTER_MAX) return 'backlit'
    return 'ok'
  }
}
