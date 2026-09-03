/**
 * Device capability detection for the AI teachable screens.
 *
 * The vision pipeline has two backends with very different hardware profiles:
 *
 *  - 'js'     → MediaPipe tasks-vision WASM, in-process. Fast WHEN a real GPU is
 *               present (WebGL2 GPU delegate). With no GPU it falls back to
 *               single-threaded WASM on the main UI thread → freezes weak laptops.
 *  - 'python' → native MediaPipe in a separate process. Multi-threaded C++, never
 *               blocks the UI → the right choice for GPU-less school laptops.
 *
 * We pick automatically by probing for a usable GPU, with a manual override so a
 * lab can force the safe path if auto-detection guesses wrong on their fleet.
 */

export type Backend = 'js' | 'python'
export type BackendPreference = 'auto' | 'js' | 'python'

export interface DeviceCapability {
  /** a real (non-software) WebGL2 GPU is available */
  hasGpu: boolean
  /** unmasked GPU renderer string, when readable (for the on-screen readout) */
  renderer: string | null
  /** logical CPU cores (navigator.hardwareConcurrency), 0 if unknown */
  cores: number
  /** approximate device memory in GB (navigator.deviceMemory), 0 if unknown */
  memoryGb: number
  /** backend the app should use when preference is 'auto' */
  recommendedBackend: Backend
  /** prefer the lighter pose model (lite) on this machine */
  preferLitePose: boolean
}

// Software renderers reported by WebGL when there is no usable GPU. These mean
// "CPU-only" even though a WebGL context was created.
const SOFTWARE_RENDERER_RE =
  /swiftshader|llvmpipe|software|microsoft basic render|mesa offscreen|reference rasterizer|generic/i

/** Read the unmasked GPU renderer string, or null if unavailable/blocked. */
function readRenderer(): { renderer: string | null; gotContext: boolean } {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null)
    if (!gl) return { renderer: null, gotContext: false }

    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = dbg
      ? (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string)
      : (gl.getParameter(gl.RENDERER) as string)

    // Release the probe context promptly.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return { renderer: renderer || null, gotContext: true }
  } catch {
    return { renderer: null, gotContext: false }
  }
}

let cached: DeviceCapability | null = null

/** Detect device capability (cached after first call). */
export function detectCapability(): DeviceCapability {
  if (cached) return cached

  const { renderer, gotContext } = readRenderer()
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 0 : 0
  // navigator.deviceMemory is non-standard (Chromium only) — present in Electron.
  const memoryGb =
    typeof navigator !== 'undefined' && 'deviceMemory' in navigator
      ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0)
      : 0

  const isSoftware = renderer ? SOFTWARE_RENDERER_RE.test(renderer) : true
  // A usable GPU = we got a WebGL context AND it isn't a software rasterizer.
  // If we couldn't read the renderer name but did get a context, give the
  // benefit of the doubt only when the machine also looks reasonably capable.
  const hasGpu = gotContext && !isSoftware

  // Treat low-core / low-memory machines as "lite preferred" even if a weak GPU
  // is present — the full pose model is the heaviest per-frame cost.
  const weakCpu = (cores > 0 && cores <= 4) || (memoryGb > 0 && memoryGb <= 4)

  const capability: DeviceCapability = {
    hasGpu,
    renderer,
    cores,
    memoryGb,
    recommendedBackend: hasGpu ? 'js' : 'python',
    preferLitePose: !hasGpu || weakCpu,
  }
  cached = capability
  return capability
}

/** Resolve the effective backend from a user preference + detected capability. */
export function resolveBackend(pref: BackendPreference, cap = detectCapability()): Backend {
  if (pref === 'js' || pref === 'python') return pref
  return cap.recommendedBackend
}

/** Short human label for the on-screen readout chip. */
export function backendLabelFor(backend: Backend, cap = detectCapability()): string {
  if (backend === 'python') return 'Native CPU'
  return cap.hasGpu ? 'GPU' : 'WASM CPU'
}
