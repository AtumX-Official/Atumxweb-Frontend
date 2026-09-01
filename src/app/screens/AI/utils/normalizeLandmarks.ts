interface Landmark {
  x: number
  y: number
  z?: number
  // MediaPipe per-landmark confidence (pose only). Absent = treat as fully visible.
  visibility?: number
}

// Pose joints below this confidence are masked out of the feature (see normalizePose).
// Matches MediaPipe's own draw threshold and the visibility EMA in trackerShared.
const POSE_VIS_THRESHOLD = 0.5

// Pose feature = 33 landmarks × 3 (99) + 10 joint angles (109). Exported so the
// classifier, runner, and UI all agree on the dimension instead of hardcoding it.
export const POSE_FEATURE_DIM = 109
export const POSE_ANGLE_COUNT = 10

// Joint angles measured at the MIDDLE index, between the two outer joints. Angles are
// translation/scale/rotation-invariant, so they capture pose SHAPE far more sharply
// than raw coordinates — this is what separates similar poses the coords alone blur.
// Ordered as left/right pairs (see mirrorX in usePoseClassifier, which swaps them).
const POSE_ANGLE_TRIPLETS: [number, number, number][] = [
  [11, 13, 15], // left elbow  (shoulder-elbow-wrist)
  [12, 14, 16], // right elbow
  [13, 11, 23], // left shoulder (elbow-shoulder-hip)
  [14, 12, 24], // right shoulder
  [23, 25, 27], // left knee  (hip-knee-ankle)
  [24, 26, 28], // right knee
  [11, 23, 25], // left hip   (shoulder-hip-knee)
  [12, 24, 26], // right hip
  [13, 15, 19], // left wrist  (elbow-wrist-index) — hand/forearm direction, helps crossed-arm poses
  [14, 16, 20], // right wrist (elbow-wrist-index)
]

// 2D angle at joint b (in [0,1] = radians/π). Uses x,y only — MediaPipe's screen z is
// a noisy depth estimate. Returns 0 (a consistent "unknown") if any joint is occluded.
function jointAngle(landmarks: Landmark[], a: number, b: number, c: number): number {
  if (
    (landmarks[a].visibility ?? 1) < POSE_VIS_THRESHOLD ||
    (landmarks[b].visibility ?? 1) < POSE_VIS_THRESHOLD ||
    (landmarks[c].visibility ?? 1) < POSE_VIS_THRESHOLD
  ) {
    return 0
  }
  const v1x = landmarks[a].x - landmarks[b].x
  const v1y = landmarks[a].y - landmarks[b].y
  const v2x = landmarks[c].x - landmarks[b].x
  const v2y = landmarks[c].y - landmarks[b].y
  const dot = v1x * v2x + v1y * v2y
  const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y)
  if (mag < 1e-9) return 0
  // clamp for float error before acos
  const cos = Math.max(-1, Math.min(1, dot / mag))
  return Math.acos(cos) / Math.PI
}

/**
 * Converts 21 raw MediaPipe landmarks into a 63-float position+scale-invariant vector.
 * Centers at wrist (lm[0]), scales by wrist→middle-MCP (lm[9]) distance.
 */
export function normalizeLandmarks(landmarks: Landmark[]): Float32Array {
  const ox = landmarks[0].x
  const oy = landmarks[0].y
  const oz = landmarks[0].z ?? 0

  const scale =
    Math.hypot(
      landmarks[9].x - ox,
      landmarks[9].y - oy,
      (landmarks[9].z ?? 0) - oz
    ) || 1

  const out = new Float32Array(63)
  for (let i = 0; i < 21; i++) {
    out[i * 3]     = (landmarks[i].x - ox) / scale
    out[i * 3 + 1] = (landmarks[i].y - oy) / scale
    out[i * 3 + 2] = ((landmarks[i].z ?? 0) - oz) / scale
  }
  return out
}

/**
 * Position/scale-invariant POSE feature → 99 floats (33 body landmarks × 3).
 *
 * Pose was previously trained on raw screen coordinates, so the model learned
 * WHERE the person stood rather than the pose shape — two poses recorded at
 * different spots became separable by position, and at test time only one would
 * win (the "only one class is ever detected" collapse). This re-centers every
 * landmark at the hip midpoint and scales by torso length (shoulder-mid → hip-mid),
 * so the same pose reads the same anywhere in frame and at any distance, while the
 * pose's actual shape (and left/right asymmetry) is preserved.
 *
 * Landmark indices: 11/12 = shoulders, 23/24 = hips (MediaPipe Pose 33-point model).
 */
export function normalizePose(landmarks: Landmark[]): Float32Array {
  const out = new Float32Array(POSE_FEATURE_DIM)
  if (landmarks.length < 33) return out

  const hx = (landmarks[23].x + landmarks[24].x) / 2
  const hy = (landmarks[23].y + landmarks[24].y) / 2
  const hz = ((landmarks[23].z ?? 0) + (landmarks[24].z ?? 0)) / 2
  const sx = (landmarks[11].x + landmarks[12].x) / 2
  const sy = (landmarks[11].y + landmarks[12].y) / 2
  const sz = ((landmarks[11].z ?? 0) + (landmarks[12].z ?? 0)) / 2

  // Torso length is a stable per-person scale that's robust to limb movement.
  const scale = Math.hypot(sx - hx, sy - hy, sz - hz) || 1e-6

  for (let i = 0; i < 33; i++) {
    // Off-frame / occluded joints: MediaPipe still emits a noisy EXTRAPOLATED
    // position with low visibility. Feeding that jitter (esp. when one arm leaves
    // frame) is what made the left side unstable and blurred similar poses. Collapse
    // low-confidence joints to the origin — a consistent "unknown" signal. When enough
    // joints drop, the feature moves far from every class centroid and the reject gate
    // declines to guess rather than emitting a confident wrong pose.
    if ((landmarks[i].visibility ?? 1) < POSE_VIS_THRESHOLD) {
      out[i * 3] = 0
      out[i * 3 + 1] = 0
      out[i * 3 + 2] = 0
      continue
    }
    out[i * 3]     = (landmarks[i].x - hx) / scale
    out[i * 3 + 1] = (landmarks[i].y - hy) / scale
    out[i * 3 + 2] = ((landmarks[i].z ?? 0) - hz) / scale
  }

  // Append joint angles after the 99 coords. These are the shape-discriminative part
  // of the feature; the coords keep position/orientation context.
  for (let k = 0; k < POSE_ANGLE_TRIPLETS.length; k++) {
    const [a, b, c] = POSE_ANGLE_TRIPLETS[k]
    out[99 + k] = jointAngle(landmarks, a, b, c)
  }
  return out
}

/**
 * Fuses TWO hands into one 126-float vector for combined two-hand poses.
 * Both hands share a single frame — origin = midpoint of the two wrists,
 * scale = average hand size — so each hand's shape AND rotation/tilt AND the
 * hands' relative position/angle/distance are all preserved. (Hands must be
 * passed in a stable order, e.g. leftmost-on-screen first.)
 */
export function normalizeCombined(handA: Landmark[], handB: Landmark[]): Float32Array {
  const wax = handA[0].x, way = handA[0].y, waz = handA[0].z ?? 0
  const wbx = handB[0].x, wby = handB[0].y, wbz = handB[0].z ?? 0

  const sizeA = Math.hypot(handA[9].x - wax, handA[9].y - way, (handA[9].z ?? 0) - waz) || 1e-6
  const sizeB = Math.hypot(handB[9].x - wbx, handB[9].y - wby, (handB[9].z ?? 0) - wbz) || 1e-6
  const scale = ((sizeA + sizeB) / 2) || 1e-6

  const ox = (wax + wbx) / 2
  const oy = (way + wby) / 2
  const oz = (waz + wbz) / 2

  const out = new Float32Array(126)
  let k = 0
  for (const lm of [handA, handB]) {
    for (let i = 0; i < 21; i++) {
      out[k++] = (lm[i].x - ox) / scale
      out[k++] = (lm[i].y - oy) / scale
      out[k++] = ((lm[i].z ?? 0) - oz) / scale
    }
  }
  return out
}

/** Center+scale one hand's landmarks into a canonical 63-float shape (origin =
 *  wrist, scale = wrist→middle-MCP). Used per-hand for the world-landmark feature. */
function canonicalHand(lm: Landmark[], out: Float32Array, offset: number): void {
  const ox = lm[0].x, oy = lm[0].y, oz = lm[0].z ?? 0
  const scale = Math.hypot(lm[9].x - ox, lm[9].y - oy, (lm[9].z ?? 0) - oz) || 1e-6
  let k = offset
  for (let i = 0; i < 21; i++) {
    out[k++] = (lm[i].x - ox) / scale
    out[k++] = (lm[i].y - oy) / scale
    out[k++] = ((lm[i].z ?? 0) - oz) / scale
  }
}

/**
 * Position/perspective-invariant ONE-hand feature → 63 floats.
 *
 * The single-hand analogue of normalizeCombinedWorld: canonicalizes one hand's
 * MediaPipe **world landmarks** (metric 3D, origin re-centered at the wrist,
 * scaled by hand size) so a model trained in one spot works anywhere in the
 * frame, while tilt/rotation are preserved. Same 63-float layout as the
 * screen-landmark normalizeLandmarks, so the model architecture is unchanged.
 */
export function normalizeWorldHand(world: Landmark[]): Float32Array {
  const out = new Float32Array(63)
  canonicalHand(world, out, 0)
  return out
}

/**
 * Position/perspective-invariant TWO-hand feature → 126 floats.
 *
 * Uses MediaPipe's **world landmarks** — a metric 3D estimate of each hand that
 * barely changes with screen position, while still preserving the hand's
 * tilt/rotation — so a model trained in one spot works anywhere in the frame.
 *
 *  - [0..62]   hand A canonical 3D shape (world landmarks)
 *  - [63..125] hand B canonical 3D shape (world landmarks)
 *
 * Each hand is canonicalized independently (re-centered at its own wrist), so the
 * distance and relative placement BETWEEN the two hands are intentionally NOT
 * encoded — the gesture is judged on each hand's pose alone.
 */
export function normalizeCombinedWorld(
  worldA: Landmark[], worldB: Landmark[]
): Float32Array {
  const out = new Float32Array(126)
  canonicalHand(worldA, out, 0)
  canonicalHand(worldB, out, 63)
  return out
}
