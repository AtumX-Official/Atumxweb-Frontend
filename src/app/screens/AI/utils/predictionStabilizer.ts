/**
 * Unified prediction stabilizer — the single source of temporal stability for every
 * classifier (hand, two-hand, pose, audio). It turns a per-frame smoothed probability
 * vector into a steady displayed prediction, killing the confidence-bar flicker testers
 * reported across all modules. Three mechanisms:
 *
 *  1. Hysteresis — a class only BECOMES active once the caller accepts it (i.e. it
 *     cleared the caller's confidence/margin/reject gates). It then stays active until
 *     its smoothed probability falls below a lower EXIT floor. The gap between "accepted"
 *     (~the confidence threshold) and EXIT stops a frame hovering at the threshold from
 *     blinking the class on and off.
 *  2. Switch debounce — replacing the active class with a DIFFERENT one requires the
 *     challenger to be accepted for `switchFrames` consecutive frames, so the prediction
 *     won't flip-flop between two neighbouring / similar classes.
 *  3. Confidence EMA — the displayed confidence glides toward its target instead of
 *     jittering, so the bar moves smoothly.
 *
 * It is deliberately UI-agnostic: it returns a class index + smoothed confidence, and
 * each classifier maps that back to its own Prediction shape.
 */

export interface StabilizerConfig {
  /** Release the active class when its smoothed probability drops below this (hysteresis floor). */
  exit: number
  /** Consecutive accepted frames a NEW class needs before it takes over the active one. */
  switchFrames: number
  /** EMA weight for the displayed confidence (higher = more responsive, lower = smoother). */
  emaAlpha: number
}

export interface StabilizerResult {
  /** The stable active class index, or null when nothing is confidently held. */
  classIdx: number | null
  /** EMA-smoothed confidence to display. */
  confidence: number
  isDetected: boolean
}

// Tuned for ~30fps. exit sits well below the classifiers' ~0.70 accept threshold, giving
// a wide hysteresis band; switchFrames debounces neighbour flip-flop without feeling slow.
const DEFAULT_CONFIG: StabilizerConfig = { exit: 0.5, switchFrames: 3, emaAlpha: 0.55 }

export function createPredictionStabilizer(config: Partial<StabilizerConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  let activeIdx: number | null = null
  let candidateIdx: number | null = null
  let candidateCount = 0
  let displayConf = 0

  function reset(): void {
    activeIdx = null
    candidateIdx = null
    candidateCount = 0
    displayConf = 0
  }

  /**
   * @param smoothed    per-class smoothed probabilities for this frame
   * @param acceptedIdx the class the caller accepted this frame (passed all its gates),
   *                    or null if nothing was accepted
   */
  function update(smoothed: number[], acceptedIdx: number | null): StabilizerResult {
    // Track a "challenger": an accepted class that isn't the one currently shown.
    if (acceptedIdx !== null && acceptedIdx !== activeIdx) {
      if (candidateIdx === acceptedIdx) candidateCount++
      else {
        candidateIdx = acceptedIdx
        candidateCount = 1
      }
    } else {
      // Active class reaffirmed, or nothing accepted → cancel any pending switch.
      candidateIdx = null
      candidateCount = 0
    }

    if (activeIdx === null) {
      // Nothing shown: adopt a challenger once it has persisted long enough.
      if (candidateIdx !== null && candidateCount >= cfg.switchFrames) {
        activeIdx = candidateIdx
        candidateIdx = null
        candidateCount = 0
      }
    } else {
      // Release the active class if its own probability has collapsed (hysteresis EXIT)…
      if ((smoothed[activeIdx] ?? 0) < cfg.exit) {
        activeIdx = null
      }
      // …or hand over to a challenger that has persisted long enough.
      if (candidateIdx !== null && candidateCount >= cfg.switchFrames) {
        activeIdx = candidateIdx
        candidateIdx = null
        candidateCount = 0
      }
    }

    const target = activeIdx !== null ? (smoothed[activeIdx] ?? 0) : 0
    displayConf += cfg.emaAlpha * (target - displayConf)

    return {
      classIdx: activeIdx,
      confidence: displayConf,
      isDetected: activeIdx !== null,
    }
  }

  return { update, reset }
}

export type PredictionStabilizer = ReturnType<typeof createPredictionStabilizer>
