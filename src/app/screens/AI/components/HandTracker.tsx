import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { HandLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision'
import { normalizeLandmarks, normalizeWorldHand, normalizeCombinedWorld } from '../utils/normalizeLandmarks'
import { smoothLandmarks, sizeCanvasBacking, FpsMeter } from '../utils/trackerShared'
import { RainbowFX } from '../utils/rainbowEffects'
import { LightingMonitor, LIGHTING_MESSAGES, type LightingStatus } from '../utils/lightingCheck'
import type { Prediction } from '../hooks/useGestureClassifier'

// Prefix with BASE_URL so the path is `/wasm` in dev (Vite serves from public/)
// and `./wasm` in production (resolved relative to index.html inside app.asar).
// const WASM_CDN  = `${import.meta.env.BASE_URL}wasm`
// const MODEL_URL = `${import.meta.env.BASE_URL}models/hand_landmarker.task`
const WASM_CDN  = `/wasm`
const MODEL_URL = `/models/hand_landmarker.task`

const FINGER_COLORS: Record<string, string> = {
  thumb:  '#FF6B6B',
  index:  '#FFD93D',
  middle: '#6BCB77',
  ring:   '#4D96FF',
  pinky:  '#C77DFF',
  palm:   'rgba(255,255,255,0.35)',
}

const CONNECTIONS: [number, number, string][] = [
  [0,1,'thumb'],[1,2,'thumb'],[2,3,'thumb'],[3,4,'thumb'],
  [0,5,'index'],[5,6,'index'],[6,7,'index'],[7,8,'index'],
  [0,9,'middle'],[9,10,'middle'],[10,11,'middle'],[11,12,'middle'],
  [0,13,'ring'],[13,14,'ring'],[14,15,'ring'],[15,16,'ring'],
  [0,17,'pinky'],[17,18,'pinky'],[18,19,'pinky'],[19,20,'pinky'],
  [5,9,'palm'],[9,13,'palm'],[13,17,'palm'],
]

const TIPS = [4, 8, 12, 16, 20]

export interface HandData {
  handedness: string
  score: number
  gesture: string
  wrist: NormalizedLandmark
  indexTip: NormalizedLandmark
  thumbTip: NormalizedLandmark
  landmarks: NormalizedLandmark[]
  // metric 3D landmarks (JS/2-hand path only) — used for the position-invariant
  // two-hand feature; undefined for the Python/single-hand/mock paths.
  worldLandmarks?: NormalizedLandmark[]
}

export interface HandStats {
  fps: number
  hands: HandData[]
}

interface HandTrackerProps {
  onStats?: (stats: HandStats) => void
  onLandmarks?: (vector: Float32Array, isValidHand?: boolean) => void
  prediction: Prediction | null
  isCapturing: boolean
  targetFps?: number
  backendMode?: 'python' | 'js'
  focusBoxEnabled?: boolean
  handMode?: 1 | 2
  effectsEnabled?: boolean
  /** when true (not capturing/predicting), inference runs at a reduced rate to save CPU */
  idle?: boolean
  /** short engine label shown in the on-screen readout chip (e.g. 'GPU', 'Native CPU') */
  backendLabel?: string
  /** fired when the lighting warning shows/hides, so the parent can avoid stacking
   *  its own top-center overlays (e.g. the 2-hand "show both hands" indicator) */
  onLightingWarn?: (active: boolean) => void
}

export interface HandTrackerHandle {
  snapshot: () => string | null
  /** live camera <video> element — used by the layers reveal to show the feed */
  getVideo: () => HTMLVideoElement | null
}

function getLandmarkColor(i: number): string {
  if (i === 0)  return '#ffffff'
  if (i <= 4)   return FINGER_COLORS.thumb
  if (i <= 8)   return FINGER_COLORS.index
  if (i <= 12)  return FINGER_COLORS.middle
  if (i <= 16)  return FINGER_COLORS.ring
  return FINGER_COLORS.pinky
}

function isExtended(lm: NormalizedLandmark[], tipIdx: number, pipIdx: number): boolean {
  const wrist = lm[0], tip = lm[tipIdx], pip = lm[pipIdx]
  if (!wrist || !tip || !pip) return false
  return (
    Math.hypot(tip.x - wrist.x, tip.y - wrist.y) >
    Math.hypot(pip.x - wrist.x, pip.y - wrist.y) * 1.1
  )
}

function detectGesture(lm: NormalizedLandmark[]): string {
  if (!lm || lm.length < 21) return '🖐 Custom'
  if (Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y) < 0.06) return '🤌 Pinch'
  const i = isExtended(lm, 8, 6), m = isExtended(lm, 12, 10)
  const r = isExtended(lm, 16, 14), p = isExtended(lm, 20, 18)
  const c = [i, m, r, p].filter(Boolean).length
  if (c === 0)             return '✊ Fist'
  if (c === 4)             return '🖐 Open'
  if (i && !m && !r && !p) return '☝️ Point'
  if (i && m && !r && !p)  return '✌️ Peace'
  if (!i && !m && !r && p) return '🤙 Pinky'
  if (i && m && r && !p)   return '🤟 Three'
  return '🖐 Custom'
}

function drawHand(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  landmarks: NormalizedLandmark[]
): void {
  const px = (lm: NormalizedLandmark) => ({ x: lm.x * W, y: lm.y * H })
  // Scale stroke/dot sizes relative to the original 1280-wide canvas so the
  // skeleton looks identical (thin & clean) at any backing-store size — the big
  // AI screen, the two-hand view, and the small blocks card alike — instead of
  // turning chunky on smaller canvases.
  const s = W / 1280

  for (const [start, end, finger] of CONNECTIONS) {
    const lmS = landmarks[start]
    const lmE = landmarks[end]
    if (!lmS || !lmE) continue

    const a = px(lmS), b = px(lmE)
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
    ctx.strokeStyle = FINGER_COLORS[finger]
    ctx.lineWidth   = (finger === 'palm' ? 1.5 : 2.5) * s
    ctx.lineCap     = 'round'
    ctx.globalAlpha = finger === 'palm' ? 0.5 : 1
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  for (const tipIdx of TIPS) {
    const lmT = landmarks[tipIdx]
    if (!lmT) continue
    const { x, y } = px(lmT)
    const color = getLandmarkColor(tipIdx)
    const grd = ctx.createRadialGradient(x, y, 1, x, y, 22 * s)
    grd.addColorStop(0, color + 'cc'); grd.addColorStop(1, 'transparent')
    ctx.beginPath(); ctx.arc(x, y, 22 * s, 0, Math.PI * 2)
    ctx.fillStyle = grd; ctx.fill()
  }

  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i]
    if (!lm) continue
    const { x, y } = px(lm)
    const isTip = TIPS.includes(i), isWrist = i === 0
    ctx.beginPath(); ctx.arc(x, y, (isWrist ? 8 : isTip ? 7 : 4) * s, 0, Math.PI * 2)
    ctx.fillStyle = getLandmarkColor(i); ctx.fill()
    if (isTip || isWrist) {
      ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2 * s; ctx.stroke()
    }
  }
}

function HandTrackerRender(
  { onStats, onLandmarks, prediction, isCapturing, targetFps = 30, backendMode = 'python', focusBoxEnabled = false, handMode = 1, effectsEnabled = false, idle = false, backendLabel, onLightingWarn }: HandTrackerProps,
  ref: React.Ref<HandTrackerHandle>
) {
  const handModeRef = useRef<1 | 2>(handMode)
  handModeRef.current = handMode
  // Read fresh inside the render loop without re-creating it on every toggle.
  const idleRef = useRef(idle)
  idleRef.current = idle
  const effectsRef = useRef(effectsEnabled)
  effectsRef.current = effectsEnabled
  const fxRef = useRef<RainbowFX>(new RainbowFX())
  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const detectorRef = useRef<HandLandmarker | null>(null)
  const rafRef      = useRef<number | null>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const lastSendTimeRef = useRef(0)
  const isProcessingRef = useRef(false)
  const prevLandmarksRef = useRef<Record<number, NormalizedLandmark[]>>({})
  const prevWorldLandmarksRef = useRef<Record<number, NormalizedLandmark[]>>({})
  const pythonLandmarksRef = useRef<{ hands: HandData[]; rawLandmarks?: Float32Array } | null>(null)
  const fpsMeterRef = useRef(new FpsMeter())
  const pythonLandmarksLastTsRef = useRef(0)
  // JS/WASM mode: cache the last detection result and the time of the last
  // detection so we can run inference at targetFps while still rendering at
  // display rate (keeps the heavy work from saturating the main thread).
  const jsResultRef = useRef<{
    landmarks: NormalizedLandmark[][]
    worldLandmarks?: NormalizedLandmark[][]
    handednesses: { score: number; displayName: string }[][]
  } | null>(null)
  const lastDetectTimeRef = useRef(0)

  const lightingMonitorRef = useRef<LightingMonitor>(new LightingMonitor())
  const lightingStatusRef = useRef<LightingStatus>('ok')

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [statusMsg, setMsg] = useState('Loading Model…')
  const [lighting, setLighting] = useState<LightingStatus>('ok')
  // The lighting warning is gated on detection HEALTH — a rolling rate of how
  // often we're getting landmarks. It surfaces only when detection is struggling
  // (fully absent OR glitching on/off), never while tracking is solid, so it reads
  // as "why isn't it detecting?" rather than nagging during normal use.
  const [showLightingWarn, setShowLightingWarn] = useState(false)
  const showLightingWarnRef = useRef(false)
  const detectionRateRef = useRef(1) // EMA of "did this frame have a hand?" (1 = healthy)
  const strugglingRef = useRef(false)
  // Throttled FPS shown in the readout chip (updated ~2×/sec, not every frame).
  const [uiFps, setUiFps] = useState(0)
  const lastFpsUiTsRef = useRef(0)

  useImperativeHandle(ref, () => ({
    snapshot: () => {
      const video = videoRef.current
      if (!video || video.readyState < 2 || video.videoWidth === 0) return null
      // Display-only snapshot for the sample-preview gallery. The model trains on
      // landmark vectors, not this image, so we can capture it at a crisp size
      // without affecting training or the Python worker. Cost is only memory.
      const c = document.createElement('canvas')
      c.width = 640; c.height = 360
      c.getContext('2d')!.drawImage(video, 0, 0, 640, 360)
      return c.toDataURL('image/jpeg', 0.85)
    },
    getVideo: () => videoRef.current,
  }), [])

  useEffect(() => {
    let cancelled = false

    // Frame sent to the Python worker. 384×216 finds a single hand reliably at
    // normal distance; two hands are each smaller in frame, so 2-hand mode needs
    // a bigger frame (640×360) or the palm detector keeps dropping the 2nd hand.
    const sendW = handMode === 2 ? 640 : 384
    const sendH = handMode === 2 ? 360 : 216
    const sendCanvas = document.createElement('canvas')
    sendCanvas.width = sendW
    sendCanvas.height = sendH
    const sendCtx = sendCanvas.getContext('2d')!

    async function init() {
      try {
        // Re-init (switching hand modes / backends respawns the worker). Reset the
        // Python in-flight gate + send timer so a frame that was mid-flight when the
        // old worker was killed can't leave the gate stuck "busy" and starve the new
        // worker of frames. Also drop stale landmarks from the previous mode.
        isProcessingRef.current = false
        lastSendTimeRef.current = 0
        pythonLandmarksRef.current = null
        prevLandmarksRef.current = {}
        prevWorldLandmarksRef.current = {}
        if (backendMode === 'js') {
          setMsg('Loading MediaPipe WASM…')
          const vision = await FilesetResolver.forVisionTasks(WASM_CDN)

          setMsg('Loading hand landmark model…')
          // Try the GPU (WebGL) delegate first for speed, fall back to CPU if the
          // machine/driver can't provide it — same strategy as the Python worker.
          const makeLandmarker = (delegate: 'GPU' | 'CPU') =>
            HandLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetPath: MODEL_URL, delegate },
              runningMode: 'VIDEO',
              // Single-hand mode only needs to track one hand — half the work.
              numHands: handMode === 2 ? 2 : 1,
              // Keep DETECTION + PRESENCE strict (0.5) so it never hallucinates a hand on
              // the chin/face. Loosen only TRACKING in 2-hand mode (0.3) so a real hand
              // that's already found is held through joins/fast motion instead of being
              // dropped. (Lowering detection to 0.3 caused the reported false hands.)
              minHandDetectionConfidence: 0.5,
              minHandPresenceConfidence:  0.5,
              minTrackingConfidence:      handMode === 2 ? 0.3 : 0.5,
            })

          let landmarker: HandLandmarker
          try {
            landmarker = await makeLandmarker('GPU')
          } catch (gpuErr) {
            console.warn('[HandTracker] GPU delegate unavailable, falling back to CPU:', gpuErr)
            landmarker = await makeLandmarker('CPU')
          }

          if (cancelled) { landmarker.close(); return }
          // Warm-up: one throwaway inference on a blank frame so the FIRST real frame
          // doesn't pay the WebGL shader-compile cost (the "slow to acquire" lag). It
          // runs behind the loading spinner and is best-effort — never blocks startup.
          try {
            const warm = document.createElement('canvas')
            warm.width = 256; warm.height = 256
            landmarker.detectForVideo(warm, 0)
          } catch { /* warm-up is optional */ }
          detectorRef.current = landmarker
        } else {
          setMsg('Spawning Python background engine…')
          if (window.api?.hand) {
            // Tell the worker how many hands to track (matches the JS detector).
            const res = await window.api.hand.start(handMode === 2 ? 2 : 1)
            if (!res.success) {
              throw new Error(res.error || 'Failed to start python hand engine.')
            }

            window.api.hand.onHandData((dataStr: string) => {
              if (cancelled) return
              isProcessingRef.current = false
              if (!dataStr.trim().startsWith('{')) {
                console.log('[Python Hand Engine Log]:', dataStr)
                return
              }
              try {
                const res = JSON.parse(dataStr)
                if (res.success && res.hands_landmarks) {
                  const rawHands = res.hands_landmarks
                  const rawWorld = res.hands_world_landmarks ?? []
                  const rawHandednesses = res.handednesses ?? []

                  pythonLandmarksRef.current = {
                    hands: rawHands.map((lm: NormalizedLandmark[], idx: number) => ({
                      handedness: rawHandednesses[idx]?.handedness ?? 'Unknown',
                      score:      rawHandednesses[idx]?.score ?? 0,
                      gesture:    detectGesture(lm),
                      wrist:      lm[0],
                      indexTip:   lm[8],
                      thumbTip:   lm[4],
                      landmarks:  lm,
                      // metric 3D world landmarks for the position-invariant feature
                      worldLandmarks: rawWorld[idx]?.length ? rawWorld[idx] : undefined,
                    })),
                    rawLandmarks: rawHands[0] ? normalizeLandmarks(rawHands[0]) : undefined
                  }
                  pythonLandmarksLastTsRef.current = performance.now()
                } else {
                  pythonLandmarksRef.current = null
                }
              } catch (err) {
                console.error('[HandTracker] Error parsing python hand data:', err)
              }
            })
          }
        }

        setMsg('Starting camera…')
        const initialFps = targetFps
        let stream: MediaStream | null = null
        let isMockStream = false

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: 960,
              height: 540,
              facingMode: 'user',
              ...(initialFps ? { frameRate: { ideal: initialFps } } : {}),
            },
          })
        } catch (camErr: unknown) {
          console.warn('[HandTracker] Webcam access blocked or unavailable, creating animated simulation background:', camErr)
          isMockStream = true

          const mockCamCanvas = document.createElement('canvas')
          mockCamCanvas.width = 1280
          mockCamCanvas.height = 720
          const mockCamCtx = mockCamCanvas.getContext('2d')!

          let mockAnimId: number
          const drawMockFeed = () => {
            if (cancelled) return
            mockCamCtx.fillStyle = '#050507'
            mockCamCtx.fillRect(0, 0, 1280, 720)

            mockCamCtx.strokeStyle = 'rgba(99, 102, 241, 0.08)'
            mockCamCtx.lineWidth = 1.5
            for (let x = 0; x < 1280; x += 60) {
              mockCamCtx.beginPath(); mockCamCtx.moveTo(x, 0); mockCamCtx.lineTo(x, 720); mockCamCtx.stroke()
            }
            for (let y = 0; y < 720; y += 60) {
              mockCamCtx.beginPath(); mockCamCtx.moveTo(0, y); mockCamCtx.lineTo(1280, y); mockCamCtx.stroke()
            }

            const angle = (performance.now() / 1500) % (2 * Math.PI)
            mockCamCtx.strokeStyle = 'rgba(99, 102, 241, 0.15)'
            mockCamCtx.lineWidth = 2
            mockCamCtx.beginPath()
            mockCamCtx.moveTo(640, 360)
            mockCamCtx.lineTo(640 + Math.cos(angle) * 450, 360 + Math.sin(angle) * 450)
            mockCamCtx.stroke()

            mockCamCtx.strokeStyle = 'rgba(99, 102, 241, 0.25)'
            mockCamCtx.beginPath()
            mockCamCtx.arc(640, 360, 200 + Math.sin(performance.now() / 300) * 8, 0, 2 * Math.PI)
            mockCamCtx.stroke()

            mockCamCtx.fillStyle = '#64748b'
            mockCamCtx.font = 'bold 22px monospace'
            mockCamCtx.textAlign = 'center'
            mockCamCtx.fillText('CAMERA IS IN USE / LOCKED BY ANOTHER SCREEN', 640, 60)
            mockCamCtx.fillStyle = '#6366f1'
            mockCamCtx.font = '16px monospace'
            mockCamCtx.fillText('RUNNING IN HIGH-TECH SIMULATION MODE', 640, 95)

            mockAnimId = requestAnimationFrame(drawMockFeed)
          }
          drawMockFeed()

          const mockCamCanvasTyped = mockCamCanvas as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream }
          stream = mockCamCanvasTyped.captureStream ? mockCamCanvasTyped.captureStream(targetFps) : null
        }

        if (cancelled || !stream) {
          if (stream) stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream

        const video = videoRef.current
        if (!video) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        video.srcObject = stream
        await video.play()

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        setStatus('ready')
        setMsg('')

        function loop(ts: number) {
          if (cancelled) return
          rafRef.current = requestAnimationFrame(loop)
          if (!video || video.readyState < 2 || video.paused || video.videoWidth === 0) return

          const fps = fpsMeterRef.current.tick(ts)
          // Surface FPS to the readout chip at ~2 Hz (avoid a per-frame re-render).
          if (ts - lastFpsUiTsRef.current > 500) {
            lastFpsUiTsRef.current = ts
            setUiFps(fps)
          }

          // Idle (not capturing/predicting) → cap inference at a low rate to save CPU.
          const fpsCap = idleRef.current ? 15 : targetFps

          // Lighting check (real camera only) — flag dim / blown-out / back-lit scenes.
          if (!isMockStream) {
            const ls = lightingMonitorRef.current.update(video, ts)
            if (ls !== lightingStatusRef.current) {
              lightingStatusRef.current = ls
              setLighting(ls)
            }
          }

          // 1. If we are running in Python mode, and it is NOT a simulated mock camera, capture a JPEG frame and send it to Python!
          if (backendMode === 'python' && !isMockStream) {
            // Watchdog: if a sent frame has gone unanswered for >1s (worker hiccup,
            // crash, or respawn), clear the in-flight gate so we self-heal instead
            // of stalling forever.
            if (isProcessingRef.current && performance.now() - lastSendTimeRef.current > 1000) {
              isProcessingRef.current = false
            }
            if (!isProcessingRef.current) {
              const now = performance.now()
              if (now - lastSendTimeRef.current >= (1000 / fpsCap)) {
                isProcessingRef.current = true
                lastSendTimeRef.current = now
                sendCtx.drawImage(video, 0, 0, sendW, sendH)
                sendCanvas.toBlob((blob) => {
                  if (blob) {
                    blob.arrayBuffer().then((buf) => {
                      if (window.api?.hand) {
                        window.api.hand.sendFrame(buf)
                      } else {
                        isProcessingRef.current = false
                      }
                    }).catch(() => {
                      isProcessingRef.current = false
                    })
                  } else {
                    isProcessingRef.current = false
                  }
                }, 'image/jpeg', 0.65)
              }
            }
          }

          const canvas = canvasRef.current!
          const ctx = canvas.getContext('2d')!
          // Right-size the backing store to the displayed size (DPR capped) so we
          // don't clear/draw/blur millions of off-screen pixels every frame on
          // low-spec machines. Drawing is normalized (0..1 × W/H), so this is safe.
          sizeCanvasBacking(canvas, 1280, 720)
          // RainbowMode hand effects run only in 2-hand mode with effects on.
          const effectsMode = handModeRef.current === 2 && effectsRef.current
          if (!effectsMode) {
            // normal path: clear each frame (effects mode keeps a motion trail)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }

          let handsData: HandData[] = []

          if (backendMode === 'js' && detectorRef.current) {
            // 2. Client-side JS WebAssembly mode — throttle the heavy inference to
            //    targetFps and reuse the cached result on intermediate frames, so
            //    we render at display rate without saturating the main thread.
            //    The per-frame EMA smoothing below doubles as the interpolator.
            const now = performance.now()
            const detectInterval = 1000 / (fpsCap || 30)
            if (now - lastDetectTimeRef.current >= detectInterval) {
              lastDetectTimeRef.current = now
              jsResultRef.current = detectorRef.current.detectForVideo(video, ts)
            }
            const result = jsResultRef.current
            if (result) {
              // Order detections leftmost-on-screen first BEFORE smoothing, so a given
              // screen-side always maps to the same smoothing slot. MediaPipe's array
              // order isn't stable frame-to-frame, and smoothing by raw array index
              // blends a hand against whatever happened to be at that index last frame.
              const order = result.landmarks
                .map((lm: NormalizedLandmark[], i: number) => ({ i, key: 1 - lm[0].x }))
                .sort((a, b) => a.key - b.key)
                .map((e) => e.i)
              // If the hand COUNT changed since last frame, drop the smoothing cache.
              // Otherwise a surviving hand gets EMA-blended against the other (now
              // absent) hand's stale landmarks → an anatomically invalid pose that
              // makes the detector lose tracking. That's the "both hands visible but
              // it only sees one and asks to show both" 2-hand bug.
              if (Object.keys(prevLandmarksRef.current).length !== result.landmarks.length) {
                prevLandmarksRef.current = {}
                prevWorldLandmarksRef.current = {}
              }
              handsData = order.map((srcIdx, slot) => {
                const lm = result.landmarks[srcIdx]
                const smoothed = smoothLandmarks(prevLandmarksRef.current[slot], lm, 0.45)
                prevLandmarksRef.current[slot] = smoothed
                if (!effectsMode) drawHand(ctx, canvas.width, canvas.height, smoothed)
                // metric 3D landmarks for the position-invariant 2-hand feature
                const world = result.worldLandmarks?.[srcIdx]
                let worldSmoothed: NormalizedLandmark[] | undefined
                if (world) {
                  worldSmoothed = smoothLandmarks(prevWorldLandmarksRef.current[slot], world, 0.45)
                  prevWorldLandmarksRef.current[slot] = worldSmoothed
                }
                return {
                  handedness: result.handednesses[srcIdx]?.[0]?.displayName ?? 'Unknown',
                  score:      result.handednesses[srcIdx]?.[0]?.score ?? 0,
                  gesture:    detectGesture(smoothed),
                  wrist:      smoothed[0],
                  indexTip:   smoothed[8],
                  thumbTip:   smoothed[4],
                  landmarks:  smoothed,
                  worldLandmarks: worldSmoothed,
                }
              })
            }
          } else if (backendMode === 'python' && !isMockStream) {
            // 3. Python backend mode with temporal smoothing & render-loop sync.
            // Staleness cull raised 250→550ms so a single slow IPC round-trip on a
            // weak CPU doesn't blink the skeleton off (the reported glitch).
            if (performance.now() - pythonLandmarksLastTsRef.current > 550) {
              pythonLandmarksRef.current = null
            }
            const data = pythonLandmarksRef.current
            if (data) {
              // Same stable-slot ordering + count-change cache reset as the JS path,
              // so a briefly-dropped hand never blends against the other hand's stale
              // landmarks (the 2-hand "show both hands" false negative).
              const order = data.hands
                .map((hand, i) => ({ i, key: 1 - hand.landmarks[0].x }))
                .sort((a, b) => a.key - b.key)
                .map((e) => e.i)
              if (Object.keys(prevLandmarksRef.current).length !== data.hands.length) {
                prevLandmarksRef.current = {}
                prevWorldLandmarksRef.current = {}
              }
              handsData = order.map((srcIdx, slot) => {
                const hand = data.hands[srcIdx]
                const smoothed = smoothLandmarks(prevLandmarksRef.current[slot], hand.landmarks, 0.45)
                prevLandmarksRef.current[slot] = smoothed
                if (!effectsMode) drawHand(ctx, canvas.width, canvas.height, smoothed)
                // Smooth world landmarks the same way so the world-landmark feature
                // is as stable as the on-screen one.
                let worldSmoothed = hand.worldLandmarks
                if (worldSmoothed) {
                  worldSmoothed = smoothLandmarks(prevWorldLandmarksRef.current[slot], worldSmoothed, 0.45)
                  prevWorldLandmarksRef.current[slot] = worldSmoothed
                }
                return {
                  ...hand,
                  gesture: detectGesture(smoothed),
                  wrist:   smoothed[0],
                  indexTip: smoothed[8],
                  thumbTip: smoothed[4],
                  landmarks: smoothed,
                  worldLandmarks: worldSmoothed,
                }
              })
            } else {
              prevLandmarksRef.current = {}
              prevWorldLandmarksRef.current = {}
            }
          } else if (isMockStream) {
            // 4. Mock simulation mode
            const time = performance.now() / 1000
            const wrist: NormalizedLandmark = { x: 0.5 + Math.sin(time) * 0.05, y: 0.7 + Math.cos(time) * 0.02, z: 0, visibility: 1 }
            const simLms: NormalizedLandmark[] = [
              wrist, // wrist (0)
              // Thumb (1-4)
              { x: wrist.x - 0.08, y: wrist.y - 0.06, z: 0, visibility: 1 },
              { x: wrist.x - 0.12, y: wrist.y - 0.12, z: 0, visibility: 1 },
              { x: wrist.x - 0.15, y: wrist.y - 0.16, z: 0, visibility: 1 },
              { x: wrist.x - 0.18 + Math.sin(time * 2) * 0.02, y: wrist.y - 0.18, z: 0, visibility: 1 },
              // Index (5-8)
              { x: wrist.x - 0.04, y: wrist.y - 0.12, z: 0, visibility: 1 },
              { x: wrist.x - 0.05, y: wrist.y - 0.20, z: 0, visibility: 1 },
              { x: wrist.x - 0.06, y: wrist.y - 0.26, z: 0, visibility: 1 },
              { x: wrist.x - 0.07 + Math.cos(time * 3) * 0.02, y: wrist.y - 0.32, z: 0, visibility: 1 },
              // Middle (9-12)
              { x: wrist.x, y: wrist.y - 0.14, z: 0, visibility: 1 },
              { x: wrist.x, y: wrist.y - 0.23, z: 0, visibility: 1 },
              { x: wrist.x, y: wrist.y - 0.30, z: 0, visibility: 1 },
              { x: wrist.x + Math.sin(time * 3.5) * 0.02, y: wrist.y - 0.36, z: 0, visibility: 1 },
              // Ring (13-16)
              { x: wrist.x + 0.04, y: wrist.y - 0.12, z: 0, visibility: 1 },
              { x: wrist.x + 0.05, y: wrist.y - 0.20, z: 0, visibility: 1 },
              { x: wrist.x + 0.06, y: wrist.y - 0.26, z: 0, visibility: 1 },
              { x: wrist.x + 0.07 + Math.cos(time * 4) * 0.02, y: wrist.y - 0.31, z: 0, visibility: 1 },
              // Pinky (17-20)
              { x: wrist.x + 0.08, y: wrist.y - 0.09, z: 0, visibility: 1 },
              { x: wrist.x + 0.10, y: wrist.y - 0.15, z: 0, visibility: 1 },
              { x: wrist.x + 0.11, y: wrist.y - 0.20, z: 0, visibility: 1 },
              { x: wrist.x + 0.12 + Math.sin(time * 4.5) * 0.02, y: wrist.y - 0.24, z: 0, visibility: 1 },
            ]

            const smoothed = smoothLandmarks(prevLandmarksRef.current[0], simLms, 0.45)
            prevLandmarksRef.current[0] = smoothed
            if (!effectsMode) drawHand(ctx, canvas.width, canvas.height, smoothed)
            handsData = [{
              handedness: 'Right',
              score: 0.98,
              gesture: detectGesture(smoothed),
              wrist: smoothed[0],
              indexTip: smoothed[8],
              thumbTip: smoothed[4],
              landmarks: smoothed,
            }]
          }

          onStats?.({ fps, hands: handsData })

          // Detection-health gated lighting warning. Track a rolling rate of frames
          // that produced a hand; when it drops (absent OR glitching on/off) AND the
          // lighting is bad, surface the message. Hysteresis (trigger <0.5, clear
          // >0.7) keeps it from flickering around the boundary.
          detectionRateRef.current = detectionRateRef.current * 0.97 + (handsData.length > 0 ? 0.03 : 0)
          const rate = detectionRateRef.current
          strugglingRef.current = strugglingRef.current ? rate < 0.7 : rate < 0.5
          const warn = strugglingRef.current && lightingStatusRef.current !== 'ok'
          if (warn !== showLightingWarnRef.current) {
            showLightingWarnRef.current = warn
            setShowLightingWarn(warn)
            onLightingWarn?.(warn)
          }

          const isValidHand = (landmarks: NormalizedLandmark[]) => {
            if (!focusBoxEnabled) return true
            const checkPoints = [0, 4, 8, 12, 16, 20]
            for (const idx of checkPoints) {
              const lm = landmarks[idx]
              if (!lm) continue
              if (lm.x < 0.25 || lm.x > 0.75 || lm.y < 0.15 || lm.y > 0.85) {
                return false
              }
            }
            return true
          }

          if (handModeRef.current === 2) {
            // Two-hand combined pose (additive — single-hand path below is
            // your colleague's original, untouched). Needs both hands; assign
            // by screen position (leftmost-on-screen = hand A) for stability.
            if (handsData.length >= 2) {
              // Still assign hand A/B by screen position (leftmost = A) for a stable
              // ordering into the feature vector.
              const sorted = [...handsData].sort(
                (a, b) => (1 - a.landmarks[0].x) - (1 - b.landmarks[0].x)
              )
              const w1 = sorted[0].worldLandmarks, w2 = sorted[1].worldLandmarks
              // No wrist connector is drawn and no inter-hand term is encoded: each
              // hand is judged on its own 3D pose, so the distance/placement between
              // the two hands is ignored. World landmarks make a model trained in one
              // spot work across the whole frame; skip the frame if a hand's world
              // landmarks are momentarily missing.
              if (w1 && w2) onLandmarks?.(normalizeCombinedWorld(w1, w2), true)
            }
          } else if (handsData[0]) {
            const isValid = isValidHand(handsData[0].landmarks)
            // Prefer metric 3D world landmarks (position/perspective-invariant) when
            // present — the Python worker now emits them and JS always has them —
            // falling back to screen-landmark normalization only if momentarily
            // missing. Both produce the same 63-float layout, so the model is unchanged.
            const wh = handsData[0].worldLandmarks
            onLandmarks?.(
              wh ? normalizeWorldHand(wh) : normalizeLandmarks(handsData[0].landmarks),
              isValid
            )
          }

          // RainbowMode hand effects (2-hand + effects on): neon skeleton,
          // glowing tips, two-hand rainbow links/arcs, hum.
          if (effectsMode) {
            fxRef.current.render(ctx, canvas.width, canvas.height, handsData.map(h => h.landmarks), ts / 1000)
          }
        }
        rafRef.current = requestAnimationFrame(loop)
      } catch (err: unknown) {
        if (!cancelled) {
          setStatus('error')
          const msg =
            err instanceof Error ? err.message
              : err instanceof Event ? `${err.type} (target: ${(err.target as { src?: string })?.src ?? 'unknown'})`
              : typeof err === 'string' ? err
              : 'Failed to initialize hand tracker'
          setMsg(msg)
          console.error('[HandTracker] init failed:', err)
        }
      }
    }

    init()
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      detectorRef.current?.close()

      if (window.api?.hand) {
        window.api.hand.stop()
        window.api.hand.removeListeners()
      }
    }
    // `handMode` is a dep because the JS detector bakes in numHands (1 vs 2) at
    // creation — switching 1↔2 hands must re-create it, or 2-hand only ever
    // tracks a single hand.
  }, [targetFps, backendMode, handMode])

  return (
    <div className="relative inline-block leading-none w-full">
      <video
        ref={videoRef}
        width={960} height={540}
        muted playsInline
        className="block w-full h-full object-cover mirror"
        style={effectsEnabled && handMode === 2 ? { filter: 'brightness(0.6) contrast(1.1)' } : undefined}
      />

      {focusBoxEnabled && status === 'ready' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[15%] backdrop-blur-sm bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-[15%] backdrop-blur-sm bg-black/40" />
          <div className="absolute top-[15%] bottom-[15%] left-0 w-[25%] backdrop-blur-sm bg-black/40" />
          <div className="absolute top-[15%] bottom-[15%] right-0 w-[25%] backdrop-blur-sm bg-black/40" />
          <div className="absolute left-[25%] top-[15%] w-[50%] h-[70%] border-2 border-dashed border-green-400/80 shadow-[inset_0_0_20px_rgba(74,222,128,0.2)]" />
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={960} height={540}
        className="absolute inset-0 w-full h-full object-cover mirror pointer-events-none"
      />

      {isCapturing && status === 'ready' && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-md text-white text-[0.72rem] font-semibold font-mono px-3 py-1 rounded-full animate-rec-pulse">
          <span className="w-2 h-2 rounded-full bg-white" />
          RECORDING
        </div>
      )}

      {/* Compact top-center pill, high z so it's never hidden behind the corner
          buttons. Only shown when detection is actually failing. */}
      {status === 'ready' && showLightingWarn && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-md text-white text-[0.68rem] font-semibold px-2.5 py-1 rounded-full border border-red-300/60 shadow-lg whitespace-nowrap pointer-events-none">
          <span className="text-xs leading-none">⚠️</span>
          <span>{LIGHTING_MESSAGES[lighting]}</span>
        </div>
      )}

      {/* Engine + FPS readout — verifies which backend a machine actually picked */}
      {status === 'ready' && backendLabel && (
        <div className="absolute bottom-2 left-2 z-30 bg-black/55 text-white text-[0.62rem] font-mono px-2 py-0.5 rounded-md pointer-events-none">
          {backendLabel} · {uiFps} FPS
        </div>
      )}

      {status !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-[14px] gap-4 animate-fade-in">
          {status === 'loading' && <Spinner />}
          {status === 'error'   && <span className="text-3xl">⚠️</span>}
          <p className={`font-mono text-sm max-w-xs text-center ${status === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
            {statusMsg}
          </p>
        </div>
      )}
    </div>
  )
}

export const HandTracker = forwardRef(HandTrackerRender)
export default HandTracker

function Spinner() {
  return <div className="w-10 h-10 rounded-full border-[3px] border-indigo-500/20 border-t-indigo-500 animate-spin" />
}
