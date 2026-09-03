import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Shared sample-recording engine for ALL teachable modalities (single-hand,
 * two-hand, pose). It owns the capture state machine — the same one that used
 * to be copy-pasted into each screen — so the three recording modes behave
 * identically everywhere:
 *
 *  - hold:      capture while the user holds the button (interval-gated)
 *  - timed:     capture every `delaySec` until N frames or STOP
 *  - countdown: 3·2·1 hands-free, then records like `timed`
 *
 * The hook is modality-agnostic: it only decides *when* a sample is due. The
 * screen calls `tick(now)` each inferred frame and, when it returns capture,
 * supplies the actual sample (the screen knows which vector + snapshot to add).
 * Capture state lives in a ref so the per-frame tick never re-renders React.
 */

type Mode = 'timed' | 'hold' | null

interface TimedOpts {
  /** seconds between captures (0 = every frame) */
  delaySec?: number
  /** number of frames to capture, then auto-stop (<=0 = continuous) */
  durationN?: number
}

interface CountdownOpts extends TimedOpts {
  /** countdown start number (default 3) */
  countdownFrom?: number
  /** ms per countdown tick (default 800) */
  tickMs?: number
  /** fallbacks used when delaySec/durationN are unset for countdown recording */
  defaultDelaySec?: number
  defaultDurationN?: number
}

interface RecorderConfig {
  /** capture cadence for hold mode, in ms (default 300) */
  holdIntervalMs?: number
  /** only flash the "captured" pulse when the interval is at least this (ms) */
  flashMinIntervalMs?: number
}

export interface SampleRecorder {
  /** true while a hold/timed recording is active (not during the countdown) */
  isCapturing: boolean
  /** current countdown number, or null when not counting down */
  countdown: number | null
  /** brief pulse flag each time a sample is taken (slow cadences only) */
  captureFlash: boolean
  startHold: (classId: string) => void
  startTimed: (classId: string, opts?: TimedOpts) => void
  startCountdown: (classId: string, opts?: CountdownOpts) => void
  stop: () => void
  /** read the active mode without subscribing to re-renders */
  currentMode: () => Mode
  /** call once per inferred frame; returns whether a sample is due this frame */
  tick: (now: number) => { capture: boolean; classId: string }
}

export function useSampleRecorder(config: RecorderConfig = {}): SampleRecorder {
  const holdIntervalMs = config.holdIntervalMs ?? 300
  const flashMinIntervalMs = config.flashMinIntervalMs ?? 300

  const stateRef = useRef<{
    mode: Mode
    classId: string
    intervalMs: number
    remaining: number
    lastCaptureMs: number
  }>({ mode: null, classId: '', intervalMs: 0, remaining: 0, lastCaptureMs: 0 })

  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [captureFlash, setCaptureFlash] = useState(false)
  const countdownTimerRef = useRef<number | null>(null)
  const flashTimerRef = useRef<number | null>(null)

  const clearCountdownTimer = () => {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
  }

  const reset = () => {
    stateRef.current = { mode: null, classId: '', intervalMs: 0, remaining: 0, lastCaptureMs: 0 }
  }

  const stop = useCallback(() => {
    clearCountdownTimer()
    reset()
    setCountdown(null)
    setIsCapturing(false)
  }, [])

  const startHold = useCallback(
    (classId: string) => {
      if (!classId) return
      clearCountdownTimer()
      stateRef.current = { mode: 'hold', classId, intervalMs: holdIntervalMs, remaining: -1, lastCaptureMs: 0 }
      setIsCapturing(true)
    },
    [holdIntervalMs]
  )

  const startTimed = useCallback((classId: string, opts: TimedOpts = {}) => {
    if (!classId) return
    clearCountdownTimer()
    const delaySec = opts.delaySec && opts.delaySec > 0 ? opts.delaySec : 0
    const N = opts.durationN && opts.durationN > 0 ? opts.durationN : -1
    stateRef.current = { mode: 'timed', classId, intervalMs: delaySec * 1000, remaining: N, lastCaptureMs: 0 }
    setIsCapturing(true)
  }, [])

  const startCountdown = useCallback((classId: string, opts: CountdownOpts = {}) => {
    if (!classId || countdownTimerRef.current) return
    const from = opts.countdownFrom ?? 3
    const tickMs = opts.tickMs ?? 800
    let n = from
    setCountdown(from)
    countdownTimerRef.current = window.setInterval(() => {
      n -= 1
      if (n > 0) {
        setCountdown(n)
        return
      }
      clearCountdownTimer()
      setCountdown(null)
      // Honor the user's delay/duration so they can reposition between captures;
      // fall back to sensible hands-free defaults when unset.
      const delaySec = opts.delaySec && opts.delaySec > 0 ? opts.delaySec : opts.defaultDelaySec ?? 0.1
      const N = opts.durationN && opts.durationN > 0 ? opts.durationN : opts.defaultDurationN ?? 30
      stateRef.current = { mode: 'timed', classId, intervalMs: delaySec * 1000, remaining: N, lastCaptureMs: 0 }
      setIsCapturing(true)
    }, tickMs)
  }, [])

  const currentMode = useCallback(() => stateRef.current.mode, [])

  const tick = useCallback(
    (now: number): { capture: boolean; classId: string } => {
      const cs = stateRef.current
      if (!cs.mode) return { capture: false, classId: '' }
      if (now - cs.lastCaptureMs < cs.intervalMs) return { capture: false, classId: '' }
      cs.lastCaptureMs = now

      // Visual pulse so the user knows a sample was taken (slow cadences only —
      // a per-frame flash would just be a flicker).
      if (cs.intervalMs >= flashMinIntervalMs) {
        setCaptureFlash(true)
        if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
        flashTimerRef.current = window.setTimeout(() => setCaptureFlash(false), 150)
      }

      const classId = cs.classId
      if (cs.remaining > 0) {
        cs.remaining -= 1
        if (cs.remaining === 0) {
          reset()
          setIsCapturing(false)
        }
      }
      return { capture: true, classId }
    },
    [flashMinIntervalMs]
  )

  // Clean up timers if the screen unmounts mid-recording.
  useEffect(() => {
    return () => {
      clearCountdownTimer()
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
    }
  }, [])

  return { isCapturing, countdown, captureFlash, startHold, startTimed, startCountdown, stop, currentMode, tick }
}
