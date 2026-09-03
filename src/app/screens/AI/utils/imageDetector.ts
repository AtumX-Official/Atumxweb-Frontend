import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { normalizeLandmarks } from './normalizeLandmarks'

// Use BASE_URL so paths work both in dev (Vite server) and in the packaged
// `file://` build, where root-relative `/wasm` resolves to the filesystem root.
// const WASM_CDN  = `${import.meta.env.BASE_URL}wasm`
// const MODEL_URL = `${import.meta.env.BASE_URL}models/hand_landmarker.task`
const WASM_CDN  = `/wasm`
const MODEL_URL = `/models/hand_landmarker.task`


let detector: HandLandmarker | null = null

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

export async function detectHandInImage(
  file: File,
): Promise<{ vector: Float32Array; imageUrl: string } | null> {
  const imageUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = async () => {
      try {
        const det = await getDetector()
        const result = det.detect(img)
        if (!result.landmarks[0]) { resolve(null); return }
        resolve({ vector: normalizeLandmarks(result.landmarks[0]), imageUrl })
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = imageUrl
  })
}
