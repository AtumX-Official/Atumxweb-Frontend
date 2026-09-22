// Central sound-effects player. Every SFX in the app should go through playSfx()
// so the Settings > Sounds volume slider controls it.

export type SfxName = 'click' | 'success' | 'alert' | 'cheer'

const SFX_SRC: Record<SfxName, string> = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  alert: '/sounds/alert.mp3',
  cheer: '/sounds/cheer.mp3',
}

const STORAGE_KEY = 'sfxVolume'
export const DEFAULT_SFX_VOLUME = 50

const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)))

export function getStoredSfxVolume(): number {
  if (typeof window === 'undefined') return DEFAULT_SFX_VOLUME
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw === null ? NaN : Number(raw)
    return Number.isFinite(parsed) ? clamp(parsed) : DEFAULT_SFX_VOLUME
  } catch {
    return DEFAULT_SFX_VOLUME
  }
}

let volume = getStoredSfxVolume()
// Sounds currently playing, so a volume change applies to them immediately.
const active = new Set<HTMLAudioElement>()

/** Set the SFX volume (0–100), apply it to playing sounds and persist it. */
export function setSfxVolume(value: number) {
  volume = clamp(value)
  active.forEach((a) => { a.volume = volume / 100 })
  try {
    window.localStorage.setItem(STORAGE_KEY, String(volume))
  } catch {
    // Storage unavailable (private mode etc.) — volume still applies this session.
  }
}

export function getSfxVolume() {
  return volume
}

export function playSfx(name: SfxName) {
  if (typeof window === 'undefined' || volume === 0) return
  const audio = new Audio(SFX_SRC[name])
  audio.volume = volume / 100
  active.add(audio)
  const done = () => active.delete(audio)
  audio.addEventListener('ended', done, { once: true })
  audio.addEventListener('error', done, { once: true })
  // play() rejects if the browser blocks autoplay; nothing to do in that case.
  audio.play().catch(done)
}
