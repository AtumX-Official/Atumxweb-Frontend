import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { smoothLandmarks, sizeCanvasBacking, FpsMeter } from '../utils/trackerShared'
import { normalizePose } from '../utils/normalizeLandmarks'
import type { Prediction } from '../hooks/usePoseClassifier'
import { LightingMonitor, LIGHTING_MESSAGES, type LightingStatus } from '../utils/lightingCheck'

// const WASM_CDN  = `${import.meta.env.BASE_URL}wasm`
// const MODEL_URL = `${import.meta.env.BASE_URL}models/pose_landmarker.task`
const WASM_CDN  = `/wasm`
const MODEL_URL = `/models/pose_landmarker.task`

const CONNECTION_COLORS: Record<string, string> = {
  face: '#FFD93D',      // Yellow
  shoulders: '#6BCB77', // Green
  torso: '#4D96FF',     // Blue
  hips: '#4D96FF',
  leftArm: '#FF6B6B',   // Red
  rightArm: '#C77DFF',  // Purple
  leftLeg: '#FF6B6B',
  rightLeg: '#C77DFF'
}

export interface Landmark {
  x: number
  y: number
  z: number
  visibility: number
}

type FxPt = { x: number; y: number } | null

interface PoseTrackerProps {
  onStats?: (stats: { fps: number; landmarks: Landmark[] }) => void
  onLandmarks?: (vector: Float32Array) => void
  prediction: Prediction | null
  isCapturing: boolean
  targetFps?: number
  backendMode?: 'python' | 'js'
  /** when true (not capturing/predicting), inference runs at a reduced rate to save CPU */
  idle?: boolean
  /** cosmetic neon-skeleton + motion-streak effect (does not affect detection) */
  effectsEnabled?: boolean
  /** short engine label shown in the on-screen readout chip (e.g. 'GPU', 'Native CPU') */
  backendLabel?: string
}

export interface PoseTrackerHandle {
  snapshot: () => string | null
  /** live camera <video> element — used by the layers reveal to show the feed */
  getVideo: () => HTMLVideoElement | null
}

function drawPose(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  landmarks: Landmark[]
): void {
  // Same bone structure & joints as the neon effects rig (computed NECK = midpoint
  // of shoulders, PELVIS = midpoint of hips, central spine, trimmed nose→eye→ear
  // face, simplified arms & legs) — only the original per-part colours are kept.
  const P = (i: number): FxPt => {
    const l = landmarks[i]
    return l && l.visibility >= 0.3 ? { x: l.x * W, y: l.y * H } : null
  }
  const mid = (a: FxPt, b: FxPt): FxPt => (a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : null)
  const Ls = P(11), Rs = P(12), Lh = P(23), Rh = P(24)
  const neck = mid(Ls, Rs), pelvis = mid(Lh, Rh)
  const Le = P(13), Re = P(14), Lw = P(15), Rw = P(16)
  const Lk = P(25), Rk = P(26), La = P(27), Ra = P(28)
  // Index-finger tips (19/20) — a short wrist→finger segment so the hand's
  // direction reads, instead of the arm just stopping at the wrist.
  const Lf = P(19), Rf = P(20)

  const bones: [FxPt, FxPt, string][] = [
    [neck, pelvis, 'torso'],
    [neck, Ls, 'shoulders'], [Ls, Le, 'leftArm'], [Le, Lw, 'leftArm'], [Lw, Lf, 'leftArm'],
    [neck, Rs, 'shoulders'], [Rs, Re, 'rightArm'], [Re, Rw, 'rightArm'], [Rw, Rf, 'rightArm'],
    [pelvis, Lh, 'hips'], [Lh, Lk, 'leftLeg'], [Lk, La, 'leftLeg'],
    [pelvis, Rh, 'hips'], [Rh, Rk, 'rightLeg'], [Rk, Ra, 'rightLeg'],
    [P(0), P(2), 'face'], [P(2), P(7), 'face'], [P(0), P(5), 'face'], [P(5), P(8), 'face'],
  ]
  ctx.lineCap = 'round'
  for (const [a, b, group] of bones) {
    if (!a || !b) continue
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.strokeStyle = CONNECTION_COLORS[group] || '#ffffff'
    ctx.lineWidth = 3
    ctx.stroke()
  }

  // Joints — the same set the effects rig draws (wrists & ankles highlighted).
  const joints: [FxPt, string, boolean][] = [
    [neck, CONNECTION_COLORS.torso, false], [pelvis, CONNECTION_COLORS.hips, false],
    [Ls, CONNECTION_COLORS.leftArm, false], [Rs, CONNECTION_COLORS.rightArm, false],
    [Le, CONNECTION_COLORS.leftArm, false], [Re, CONNECTION_COLORS.rightArm, false],
    [Lw, CONNECTION_COLORS.leftArm, true], [Rw, CONNECTION_COLORS.rightArm, true],
    [Lf, CONNECTION_COLORS.leftArm, false], [Rf, CONNECTION_COLORS.rightArm, false],
    [Lh, CONNECTION_COLORS.leftLeg, false], [Rh, CONNECTION_COLORS.rightLeg, false],
    [Lk, CONNECTION_COLORS.leftLeg, false], [Rk, CONNECTION_COLORS.rightLeg, false],
    [La, CONNECTION_COLORS.leftLeg, true], [Ra, CONNECTION_COLORS.rightLeg, true],
    [P(0), CONNECTION_COLORS.face, false], [P(2), CONNECTION_COLORS.face, false],
    [P(5), CONNECTION_COLORS.face, false], [P(7), CONNECTION_COLORS.face, false],
    [P(8), CONNECTION_COLORS.face, false],
  ]
  for (const [p, color, special] of joints) {
    if (!p) continue
    ctx.beginPath()
    ctx.arc(p.x, p.y, special ? 7 : 4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    if (special) {
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
}

// ── Neon skeleton effect (Effects toggle) ──────────────────────────────────
//    Blacks out the screen and draws a simplified neon stick-figure: pink bones
//    (#FF2191) + yellow joints (#FFDE21), flat (no glow). Two computed midpoints
//    drive it — NECK = midpoint of shoulders, PELVIS = midpoint of hips — joined
//    by a central spine, with a trimmed nose→eye→ear face. Ported verbatim from
//    the pose-neon-skeleton standalone. Purely cosmetic. ──────────────────────
const BONE_FX = '#FF2191'    // pink
const JOINT_FX = '#FFDE21'   // yellow
// Trimmed face links — nose → eye → ear per side (no dense eye points).
const FACE_CONN_FX: [number, number][] = [[0, 2], [2, 7], [0, 5], [5, 8]]
const FACE_PTS_FX = [0, 2, 5, 7, 8]

/** Resolve the stick-figure geometry (real landmarks + computed neck/pelvis).
 *  Points are null when the underlying landmark(s) aren't confident. */
function neonRigFx(lm: Landmark[], W: number, H: number): { bones: [FxPt, FxPt][]; joints: FxPt[] } {
  const P = (i: number): FxPt => {
    const l = lm[i]
    return l && l.visibility >= 0.3 ? { x: l.x * W, y: l.y * H } : null
  }
  const mid = (a: FxPt, b: FxPt): FxPt => (a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : null)
  const Ls = P(11), Rs = P(12), Lh = P(23), Rh = P(24)
  const neck = mid(Ls, Rs), pelvis = mid(Lh, Rh)
  const Le = P(13), Re = P(14), Lw = P(15), Rw = P(16), Lk = P(25), Rk = P(26), La = P(27), Ra = P(28)
  const Lf = P(19), Rf = P(20) // index-finger tips — short wrist→finger segment
  const bones: [FxPt, FxPt][] = [
    [neck, pelvis],
    [neck, Ls], [Ls, Le], [Le, Lw], [Lw, Lf],
    [neck, Rs], [Rs, Re], [Re, Rw], [Rw, Rf],
    [pelvis, Lh], [Lh, Lk], [Lk, La],
    [pelvis, Rh], [Rh, Rk], [Rk, Ra],
    ...FACE_CONN_FX.map(([a, b]) => [P(a), P(b)] as [FxPt, FxPt]),
  ]
  const joints: FxPt[] = [neck, pelvis, Ls, Rs, Le, Re, Lw, Rw, Lf, Rf, Lh, Rh, Lk, Rk, La, Ra, ...FACE_PTS_FX.map(P)]
  return { bones, joints }
}

/** Flat neon stick-figure — pink bones, yellow joints, uniform thickness. */
function drawNeonSkeletonFx(ctx: CanvasRenderingContext2D, W: number, H: number, lm: Landmark[]): void {
  const s = Math.max(W / 1280, 0.6)
  const { bones, joints } = neonRigFx(lm, W, H)

  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.strokeStyle = BONE_FX
  ctx.lineWidth = 13 * s
  for (const [a, b] of bones) {
    if (!a || !b) continue
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
  }

  ctx.fillStyle = JOINT_FX
  for (const p of joints) {
    if (!p) continue
    ctx.beginPath(); ctx.arc(p.x, p.y, 6 * s, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

const PoseTracker = forwardRef<PoseTrackerHandle, PoseTrackerProps>(function PoseTracker(
  { onStats, onLandmarks, prediction, isCapturing, targetFps = 30, backendMode = 'js', idle = false, effectsEnabled = false, backendLabel }, ref
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectorRef = useRef<PoseLandmarker | null>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastSendTimeRef = useRef(0)
  const isProcessingRef = useRef(false)
  const prevLandmarksRef = useRef<Landmark[] | null>(null)
  const pythonLandmarksRef = useRef<{ landmarks: Landmark[] } | null>(null)

  const lightingMonitorRef = useRef<LightingMonitor>(new LightingMonitor())
  const lightingStatusRef = useRef<LightingStatus>('ok')

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [statusMsg, setMsg] = useState('Loading Model…')
  const [lighting, setLighting] = useState<LightingStatus>('ok')
  // The lighting warning is gated on detection: it only appears when lighting is
  // bad AND no pose has been detected for a moment. If landmarks are coming
  // through, the lighting is clearly good enough, so we never nag the user.
  const [showLightingWarn, setShowLightingWarn] = useState(false)
  const showLightingWarnRef = useRef(false)
  const detectionRateRef = useRef(1) // EMA of "did this frame have a pose?" (1 = healthy)
  const strugglingRef = useRef(false)
  // Throttled FPS shown in the readout chip (updated ~2×/sec, not every frame).
  const [uiFps, setUiFps] = useState(0)
  const lastFpsUiTsRef = useRef(0)

  const fpsMeterRef = useRef(new FpsMeter())
  const pythonLandmarksLastTsRef = useRef(0)
  const lastInferTsRef = useRef(0)
  // Read fresh inside the render loop without re-creating it on every toggle.
  const idleRef = useRef(idle)
  idleRef.current = idle
  const effectsRef = useRef(effectsEnabled)
  effectsRef.current = effectsEnabled

  useImperativeHandle(ref, () => ({
    snapshot: () => {
      const video = videoRef.current
      if (!video || video.readyState < 2 || video.videoWidth === 0) return null
      // Display-only snapshot for the sample-preview gallery. The model trains on
      // landmark vectors, not this image, so we can capture it at a crisp 16:9 size
      // (matching the 1280x720 feed) without affecting training. Cost is only memory.
      const c = document.createElement('canvas')
      c.width = 640
      c.height = 360
      c.getContext('2d')!.drawImage(video, 0, 0, 640, 360)
      return c.toDataURL('image/jpeg', 0.85)
    },
    getVideo: () => videoRef.current,
  }), [])

  // Dark cinematic dim on the live video while the neon effect is on, so the
  // pink/yellow skeleton reads against a near-black screen. (CSS filter affects
  // display only — snapshots drawImage the raw frame, so training stays bright.)
  useEffect(() => {
    const v = videoRef.current
    if (v) v.style.filter = effectsEnabled ? 'brightness(0.28) saturate(1.1) contrast(1.05)' : ''
    return () => { if (v) v.style.filter = '' }
  }, [effectsEnabled])

  useEffect(() => {
    let cancelled = false

    // Initialize temporary sending canvas for streaming frames to Python worker
    // Frame sent to the Python worker. Bumped from 256×192 → 384×288 so the pose
    // detector resolves limbs reliably at normal distance on the CPU route.
    const sendCanvas = document.createElement('canvas')
    sendCanvas.width = 384
    sendCanvas.height = 288
    const sendCtx = sendCanvas.getContext('2d')!

    async function init() {
      try {
        // Re-init (switching backends respawns the worker). Reset the Python
        // in-flight gate + send timer so a frame mid-flight when the old worker was
        // killed can't leave the gate stuck "busy" and starve the new worker.
        isProcessingRef.current = false
        lastSendTimeRef.current = 0
        pythonLandmarksRef.current = null
        prevLandmarksRef.current = null
        if (backendMode === 'js') {
          setMsg('Loading MediaPipe WASM…')
          const vision = await FilesetResolver.forVisionTasks(WASM_CDN)

          setMsg('Loading pose landmark model…')
          const landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence:  0.5,
            minTrackingConfidence:      0.5,
          })

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
          if (window.api?.pose) {
            const res = await window.api.pose.start()
            if (!res.success) {
              throw new Error(res.error || 'Failed to start python pose engine.')
            }

            window.api.pose.onPoseData((dataStr: string) => {
              if (cancelled) return
              isProcessingRef.current = false
              if (!dataStr.trim().startsWith('{')) {
                console.log('[Python Pose Engine Log]:', dataStr)
                return
              }
              try {
                const res = JSON.parse(dataStr)
                if (res.success && res.landmarks) {
                  const activeLandmarks: Landmark[] = res.landmarks.map((lm: { x: number; y: number; z?: number; visibility?: number }) => ({
                    x: lm.x,
                    y: lm.y,
                    z: lm.z ?? 0,
                    visibility: lm.visibility ?? 1.0
                  }))
                  pythonLandmarksRef.current = { landmarks: activeLandmarks }
                  pythonLandmarksLastTsRef.current = performance.now()
                } else {
                  pythonLandmarksRef.current = null
                }
              } catch (err) {
                console.error('[PoseTracker] Error parsing python pose data:', err)
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
          console.warn('[PoseTracker] Webcam access blocked or unavailable, creating animated simulation background:', camErr)
          isMockStream = true

          const mockCamCanvas = document.createElement('canvas')
          mockCamCanvas.width = 640
          mockCamCanvas.height = 480
          const mockCamCtx = mockCamCanvas.getContext('2d')!

          let mockAnimId: number
          const drawMockFeed = () => {
            if (cancelled) return
            mockCamCtx.fillStyle = '#0f172a'
            mockCamCtx.fillRect(0, 0, 640, 480)

            mockCamCtx.strokeStyle = 'rgba(6, 182, 212, 0.08)'
            mockCamCtx.lineWidth = 1.5
            for (let x = 0; x < 640; x += 40) {
              mockCamCtx.beginPath(); mockCamCtx.moveTo(x, 0); mockCamCtx.lineTo(x, 480); mockCamCtx.stroke()
            }
            for (let y = 0; y < 480; y += 40) {
              mockCamCtx.beginPath(); mockCamCtx.moveTo(0, y); mockCamCtx.lineTo(640, y); mockCamCtx.stroke()
            }

            const angle = (performance.now() / 1500) % (2 * Math.PI)
            mockCamCtx.strokeStyle = 'rgba(6, 182, 212, 0.15)'
            mockCamCtx.lineWidth = 2
            mockCamCtx.beginPath()
            mockCamCtx.moveTo(320, 240)
            mockCamCtx.lineTo(320 + Math.cos(angle) * 300, 240 + Math.sin(angle) * 300)
            mockCamCtx.stroke()

            mockCamCtx.strokeStyle = 'rgba(6, 182, 212, 0.25)'
            mockCamCtx.beginPath()
            mockCamCtx.arc(320, 240, 120 + Math.sin(performance.now() / 300) * 5, 0, 2 * Math.PI)
            mockCamCtx.stroke()

            mockCamCtx.fillStyle = '#94a3b8'
            mockCamCtx.font = 'bold 15px monospace'
            mockCamCtx.textAlign = 'center'
            mockCamCtx.fillText('CAMERA IS IN USE / LOCKED BY ANOTHER SCREEN', 320, 40)
            mockCamCtx.fillStyle = '#22d3ee'
            mockCamCtx.font = '12px monospace'
            mockCamCtx.fillText('RUNNING IN HIGH-TECH SIMULATION MODE', 320, 60)

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
              // Only one frame is ever in flight (the gate above), so when active we
              // send as soon as the worker answers instead of capping at targetFps —
              // that cap was needlessly limiting how fresh the CPU skeleton is. Idle
              // still throttles to 15 fps to save power.
              const sendInterval = idleRef.current ? (1000 / 15) : 0
              if (now - lastSendTimeRef.current >= sendInterval) {
                isProcessingRef.current = true
                lastSendTimeRef.current = now
                sendCtx.drawImage(video, 0, 0, 384, 288)
                sendCanvas.toBlob((blob) => {
                  if (blob) {
                    blob.arrayBuffer().then((buf) => {
                      if (window.api?.pose) {
                        window.api.pose.sendFrame(buf)
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
          // don't clear/draw millions of off-screen pixels every frame on low-spec
          // machines. Drawing is normalized (0..1 × W/H), so this is safe.
          sizeCanvasBacking(canvas, 960, 540)
          // Always just clear the canvas. When effects are on, the dark backdrop is
          // a static CSS overlay (below) instead of a per-frame full-canvas alpha
          // fill — that fill was stealing main-thread time from JS inference and is
          // the reason detection felt slower with effects on.
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          let activeLandmarks: Landmark[] = []
          let didInfer = true

          if (backendMode === 'js' && detectorRef.current) {
            // 2. Client-side JS WebAssembly mode.
            // With capability routing, the JS path only runs on machines WITH a GPU
            // (no-GPU pose goes to the native Python engine), so we infer at display
            // rate when active for a snappy, low-latency skeleton — and only throttle
            // to 15 fps while idle to save power. On skipped frames the last pose is
            // redrawn so the overlay stays steady.
            const jsInferInterval = idleRef.current ? (1000 / 15) : 0
            if (ts - lastInferTsRef.current >= jsInferInterval) {
              lastInferTsRef.current = ts
              const result = detectorRef.current.detectForVideo(video, ts)
              const rawLms = result.landmarks[0]
                ? result.landmarks[0].map((lm) => ({
                    x: lm.x,
                    y: lm.y,
                    z: lm.z ?? 0,
                    visibility: lm.visibility ?? 1.0,
                  }))
                : []

              if (rawLms.length > 0) {
                const smoothed = smoothLandmarks(prevLandmarksRef.current, rawLms, 0.45)
                prevLandmarksRef.current = smoothed
                activeLandmarks = smoothed
              } else {
                prevLandmarksRef.current = null
              }
            } else if (prevLandmarksRef.current) {
              // Skipped inference this frame: keep the last pose, but don't
              // re-emit it as a fresh sample/prediction.
              didInfer = false
              activeLandmarks = prevLandmarksRef.current
            } else {
              didInfer = false
            }
          } else if (backendMode === 'python' && !isMockStream) {
            // 3. Python backend mode with temporal smoothing & render-loop sync.
            // Staleness cull raised 250→550ms so one slow IPC round-trip on a weak
            // CPU doesn't blink the skeleton off.
            if (performance.now() - pythonLandmarksLastTsRef.current > 550) {
              pythonLandmarksRef.current = null
            }
            const data = pythonLandmarksRef.current
            if (data && data.landmarks.length > 0) {
              const smoothed = smoothLandmarks(prevLandmarksRef.current, data.landmarks, 0.45)
              prevLandmarksRef.current = smoothed
              activeLandmarks = smoothed
            } else {
              prevLandmarksRef.current = null
            }
          } else if (isMockStream) {
            // 4. Mock simulation mode
            const rawMock: Landmark[] = []
            const time = performance.now() / 1000
            for (let i = 0; i < 33; i++) {
              let baseX = 0.5
              let baseY = 0.5
              let baseZ = 0.0
              
              if (i === 0) { baseX = 0.5; baseY = 0.2 }
              else if (i >= 1 && i <= 10) {
                baseX = 0.5 + Math.sin(i + time) * 0.05
                baseY = 0.2 + Math.cos(i + time) * 0.04
              } else if (i === 11 || i === 12) {
                baseX = i === 11 ? 0.45 : 0.55
                baseY = 0.35
              } else if (i === 13 || i === 14) {
                baseX = i === 13 ? 0.38 + Math.sin(time) * 0.05 : 0.62 + Math.cos(time) * 0.05
                baseY = 0.5
              } else if (i === 15 || i === 16) {
                baseX = i === 15 ? 0.35 + Math.sin(time * 1.5) * 0.08 : 0.65 + Math.cos(time * 1.5) * 0.08
                baseY = 0.6 + Math.sin(time * 2) * 0.05
              } else if (i === 23 || i === 24) {
                baseX = i === 23 ? 0.45 : 0.55
                baseY = 0.65
              } else if (i === 25 || i === 26) {
                baseX = i === 25 ? 0.42 : 0.58
                baseY = 0.8
              } else if (i === 27 || i === 28) {
                baseX = i === 27 ? 0.4 : 0.6
                baseY = 0.95
              } else {
                baseX = 0.5 + Math.sin(i * time) * 0.1
                baseY = 0.5 + Math.cos(i * time) * 0.1
              }
              
              rawMock.push({
                x: baseX,
                y: baseY,
                z: baseZ,
                visibility: 0.9
              })
            }

            const smoothed = smoothLandmarks(prevLandmarksRef.current, rawMock, 0.45)
            prevLandmarksRef.current = smoothed
            activeLandmarks = smoothed
          }

          // Draw the skeleton — neon stick-figure (blackout) when effects on, else flat.
          if (activeLandmarks.length > 0) {
            if (effectsRef.current) {
              drawNeonSkeletonFx(ctx, canvas.width, canvas.height, activeLandmarks)
            } else {
              drawPose(ctx, canvas.width, canvas.height, activeLandmarks)
            }
          }

          if (activeLandmarks.length > 0 && didInfer) {
            if (onLandmarks) {
              // Position/scale-invariant feature (hip-centered, torso-scaled) so the
              // classifier judges pose SHAPE, not screen position. Same 99-float layout.
              onLandmarks(normalizePose(activeLandmarks))
            }
          }

          onStats?.({ fps, landmarks: activeLandmarks })

          // Detection-health gated lighting warning. Track a rolling rate of frames
          // that produced a pose; when it drops (absent OR glitching on/off) AND the
          // lighting is bad, surface the message. Hysteresis (trigger <0.5, clear
          // >0.7) keeps it from flickering around the boundary.
          detectionRateRef.current = detectionRateRef.current * 0.97 + (activeLandmarks.length > 0 ? 0.03 : 0)
          const rate = detectionRateRef.current
          strugglingRef.current = strugglingRef.current ? rate < 0.7 : rate < 0.5
          const warn = strugglingRef.current && lightingStatusRef.current !== 'ok'
          if (warn !== showLightingWarnRef.current) {
            showLightingWarnRef.current = warn
            setShowLightingWarn(warn)
          }
        }
        rafRef.current = requestAnimationFrame(loop)
      } catch (err: any) {
        if (!cancelled) {
          setStatus('error')
          setMsg(err.message || 'Failed initializing pose tracker.')
          console.error('[PoseTracker] init failed:', err)
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
      
      if (window.api?.pose) {
        window.api.pose.stop()
        window.api.pose.removeListeners()
      }
    }
  }, [targetFps, backendMode])

  return (
    <div className="relative inline-block leading-none w-full">
      <video
        ref={videoRef}
        width={960}
        height={540}
        muted
        playsInline
        className="block w-full h-full object-cover mirror rounded-xl"
      />
      {/* Static dark backdrop for the neon effect — replaces the old per-frame
          canvas blackout so it costs nothing on the render/inference thread. */}
      {effectsEnabled && (
        <div className="absolute inset-0 bg-black/80 pointer-events-none rounded-xl" />
      )}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="absolute inset-0 w-full h-full object-cover mirror pointer-events-none rounded-xl"
      />

      {isCapturing && status === 'ready' && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-md text-white text-[0.72rem] font-semibold font-mono px-3 py-1 rounded-full animate-rec-pulse">
          <span className="w-2 h-2 rounded-full bg-white" />
          RECORDING SAMPLES
        </div>
      )}

      {/* Compact top-center pill, high z so it's never hidden behind the corner
          controls. Only shown when detection is actually failing. */}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 rounded-xl gap-4">
          {status === 'loading' && <Spinner />}
          {status === 'error' && <span className="text-3xl">⚠️</span>}
          <p className={`font-mono text-sm max-w-xs text-center px-4 ${status === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
            {statusMsg}
          </p>
        </div>
      )}
    </div>
  )
})

export default PoseTracker

function Spinner() {
  return <div className="w-10 h-10 rounded-full border-[3px] border-cyan-500/20 border-t-cyan-500 animate-spin" />
}
