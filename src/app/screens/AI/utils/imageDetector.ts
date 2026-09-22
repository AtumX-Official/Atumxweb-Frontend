import { HandLandmarker, PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { normalizeLandmarks, normalizePose } from './normalizeLandmarks'

// Served straight out of /public on the web build.
const WASM_CDN  = `/wasm`
const MODEL_URL = `/models/hand_landmarker.task`
const POSE_MODEL_URL = `/models/pose_landmarker.task`

let detector: HandLandmarker | null = null
let poseDetector: PoseLandmarker | null = null

async function getDetector(): Promise<HandLandmarker> {
  if (detector) return detector
  const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
  detector = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
    runningMode: 'IMAGE',
    numHands: 1,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })
  return detector
}

async function getPoseDetector(): Promise<PoseLandmarker> {
  if (poseDetector) return poseDetector
  const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
  poseDetector = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: 'CPU' },
    runningMode: 'IMAGE',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })
  return poseDetector
}

function readAsImage(file: File): Promise<{ img: HTMLImageElement; imageUrl: string } | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const imageUrl = reader.result as string
      const img = new Image()
      img.onload = () => resolve({ img, imageUrl })
      img.onerror = () => resolve(null)
      img.src = imageUrl
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export async function detectHandInImage(
  file: File,
): Promise<{ vector: Float32Array; imageUrl: string } | null> {
  const loaded = await readAsImage(file)
  if (!loaded) return null
  try {
    const det = await getDetector()
    const result = det.detect(loaded.img)
    if (!result.landmarks[0]) return null
    return { vector: normalizeLandmarks(result.landmarks[0]), imageUrl: loaded.imageUrl }
  } catch {
    return null
  }
}

/**
 * Pose equivalent of detectHandInImage. Returns null when no body is found, so
 * the caller can skip the file instead of storing a meaningless sample — the
 * previous upload path pushed an all-zero vector, which trained the model on noise.
 */
export async function detectPoseInImage(
  file: File,
): Promise<{ vector: Float32Array; imageUrl: string } | null> {
  const loaded = await readAsImage(file)
  if (!loaded) return null
  try {
    const det = await getPoseDetector()
    const result = det.detect(loaded.img)
    if (!result.landmarks[0]) return null
    // MediaPipe image results omit `visibility` on some builds; normalizePose
    // gates on it, so default anything missing to fully visible.
    const landmarks = result.landmarks[0].map((l) => ({
      x: l.x, y: l.y, z: l.z, visibility: l.visibility ?? 1,
    }))
    return { vector: normalizePose(landmarks), imageUrl: loaded.imageUrl }
  } catch {
    return null
  }
}
