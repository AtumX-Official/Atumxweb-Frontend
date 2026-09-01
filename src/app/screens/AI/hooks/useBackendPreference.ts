import { useCallback, useState } from 'react'
import {
  detectCapability,
  resolveBackend,
  backendLabelFor,
  type Backend,
  type BackendPreference,
  type DeviceCapability,
} from '../utils/deviceCapability'

const STORAGE_KEY = 'atumx.ai.backendPreference'

function readStoredPreference(): BackendPreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'auto' || v === 'js' || v === 'python') return v
  } catch {
    /* localStorage unavailable — fall through to default */
  }
  return 'auto'
}

export interface BackendPreferenceState {
  /** detected hardware capability (cached process-wide) */
  capability: DeviceCapability
  /** the user's stored choice (auto / force-js / force-python) */
  preference: BackendPreference
  setPreference: (p: BackendPreference) => void
  /** the effective backend for the AI screens, given preference + capability */
  backend: Backend
  /** short label for the given backend (e.g. 'GPU', 'Native CPU') */
  labelFor: (backend: Backend) => string
}

/**
 * Shared backend-routing state for the teachable AI screens. Picks JS/WASM on
 * GPU machines and the native Python worker on CPU-only machines, with a manual
 * override persisted in localStorage so a lab can force the safe path.
 */
export function useBackendPreference(): BackendPreferenceState {
  const capability = detectCapability()
  const [preference, setPref] = useState<BackendPreference>(readStoredPreference)

  const setPreference = useCallback((p: BackendPreference) => {
    setPref(p)
    try {
      localStorage.setItem(STORAGE_KEY, p)
    } catch {
      /* ignore persistence failure */
    }
  }, [])

  const backend = resolveBackend(preference, capability)
  const labelFor = useCallback((b: Backend) => backendLabelFor(b, capability), [capability])

  return { capability, preference, setPreference, backend, labelFor }
}
