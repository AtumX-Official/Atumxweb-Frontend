// Sample-grid thumbnails for saved AI projects.
//
// The model file stores each sample as a landmark vector, which is all training
// needs. The pictures in the class cards are separate: they are shrunk and saved
// alongside the vectors so an opened project shows them again. Files saved before
// that have no pictures, so for those a skeleton is drawn from the vector itself.

const THUMB_WIDTH = 200
const THUMB_QUALITY = 0.7

/** Downscale one data-URL image to a small JPEG. Returns '' if it can't be read. */
function shrinkDataUrl(url: string): Promise<string> {
  return new Promise((resolve) => {
    if (!url) return resolve('')
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, THUMB_WIDTH / (img.naturalWidth || THUMB_WIDTH))
      const c = document.createElement('canvas')
      c.width = Math.max(1, Math.round(img.naturalWidth * scale))
      c.height = Math.max(1, Math.round(img.naturalHeight * scale))
      const ctx = c.getContext('2d')
      if (!ctx) return resolve('')
      ctx.drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', THUMB_QUALITY))
    }
    img.onerror = () => resolve('')
    img.src = url
  })
}

export function shrinkImages(urls: string[]): Promise<string[]> {
  return Promise.all(urls.map(shrinkDataUrl))
}

// MediaPipe hand (21 points) and body (33 points) connections.
const HAND_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
]
const POSE_EDGES: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [0, 11], [0, 12],
]

/**
 * Draw a landmark vector (x,y,z triples) as a skeleton. 63 floats = one hand,
 * 126 = two hands (drawn side by side, since each is centred on its own wrist),
 * 99 = a body pose. Anything else gets its points only.
 */
export function sketchLandmarks(vec: ArrayLike<number>): string {
  const n = Math.floor(vec.length / 3)
  const groups: { start: number; count: number; edges: [number, number][] }[] =
    n === 21 ? [{ start: 0, count: 21, edges: HAND_EDGES }]
    : n === 42 ? [{ start: 0, count: 21, edges: HAND_EDGES }, { start: 21, count: 21, edges: HAND_EDGES }]
    : n === 33 ? [{ start: 0, count: 33, edges: POSE_EDGES }]
    : [{ start: 0, count: n, edges: [] }]

  const W = 160, H = 120, PAD = 12
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  if (!ctx) return ''
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, W, H)

  const slotW = W / groups.length
  groups.forEach((g, gi) => {
    const pts: [number, number][] = []
    for (let i = 0; i < g.count; i++) pts.push([vec[(g.start + i) * 3], vec[(g.start + i) * 3 + 1]])
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const s = Math.min((slotW - 2 * PAD) / (maxX - minX || 1), (H - 2 * PAD) / (maxY - minY || 1))
    const ox = gi * slotW + (slotW - (maxX - minX) * s) / 2
    const oy = (H - (maxY - minY) * s) / 2
    const at = (i: number): [number, number] => [ox + (pts[i][0] - minX) * s, oy + (pts[i][1] - minY) * s]

    ctx.strokeStyle = '#F6EC24'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (const [a, b] of g.edges) {
      if (a >= g.count || b >= g.count) continue
      const [ax, ay] = at(a), [bx, by] = at(b)
      ctx.moveTo(ax, ay); ctx.lineTo(bx, by)
    }
    ctx.stroke()
    ctx.fillStyle = '#fff'
    for (let i = 0; i < g.count; i++) {
      const [x, y] = at(i)
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill()
    }
  })
  return c.toDataURL('image/png')
}
