/**
 * Mel-spectrogram painting, shared by the live AudioVisualizer and the class-card
 * thumbnails in the training panel. Kept in one place so a recorded sample looks
 * identical wherever it is shown.
 */

export const N_MELS = 64
export const MEL_FRAMES = 130
export const SPECTROGRAM_LENGTH = N_MELS * MEL_FRAMES

/** Hot cyber thermal scale: slate → violet → cyan → neon yellow. `norm` is 0..1. */
export function melColor(norm: number): string {
  if (norm < 0.1) return '#0f172a'
  if (norm < 0.4) {
    const ratio = (norm - 0.1) / 0.3
    return `rgb(${Math.round(15 + ratio * 30)}, ${Math.round(23 + ratio * 150)}, ${Math.round(42 + ratio * 200)})`
  }
  if (norm < 0.8) {
    const ratio = (norm - 0.4) / 0.4
    return `rgb(${Math.round(45 + ratio * 201)}, ${Math.round(173 + ratio * 63)}, ${Math.round(242 - ratio * 206)})`
  }
  const ratio = (norm - 0.8) / 0.2
  return `rgb(246, 236, ${Math.round(36 + ratio * 219)})`
}

/** Paint a [64 mels × 130 frames] log-mel spectrogram into a 2D context. */
export function paintSpectrogram(
  ctx: CanvasRenderingContext2D,
  spec: Float32Array,
  width: number,
  height: number,
): void {
  const cellWidth = width / MEL_FRAMES
  const cellHeight = height / N_MELS

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, width, height)

  for (let mel = 0; mel < N_MELS; mel++) {
    // Mel band 0 is the lowest frequency and belongs at the bottom (y is inverted).
    const y = height - (mel + 1) * cellHeight
    for (let frame = 0; frame < MEL_FRAMES; frame++) {
      const db = spec[mel * MEL_FRAMES + frame] // negative, peaking at 0
      const norm = Math.max(0, Math.min(1, (db + 60) / 60))
      ctx.fillStyle = melColor(norm)
      // Slight overlap avoids hairline seams between cells.
      ctx.fillRect(frame * cellWidth, y, cellWidth + 0.5, cellHeight + 0.5)
    }
  }
}

/**
 * Render a spectrogram to a PNG data URL. The training panel's class cards take
 * plain image URLs (they were built for camera snapshots), so audio samples are
 * converted once at capture time rather than re-painting a canvas per thumbnail.
 */
export function spectrogramToDataURL(spec: Float32Array, width = 130, height = 96): string {
  if (!spec || spec.length !== SPECTROGRAM_LENGTH) return ''
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  paintSpectrogram(ctx, spec, width, height)
  return canvas.toDataURL('image/png')
}
