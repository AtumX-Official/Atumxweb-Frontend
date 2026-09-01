/**
 * Settings row for the AI vision backend. Auto picks GPU (JS/WASM) or CPU
 * (native Python) from detected hardware; Force GPU / Force CPU override it for
 * labs where auto-detection guesses wrong. Lives in the shared RecordingSettings
 * panel (passed as children) on every teachable screen.
 */
import type { BackendPreference, DeviceCapability } from '../utils/deviceCapability'

interface BackendSelectorProps {
  preference: BackendPreference
  onChange: (p: BackendPreference) => void
  capability: DeviceCapability
}

const OPTIONS: { value: BackendPreference; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'js', label: 'GPU' },
  { value: 'python', label: 'CPU' },
]

export default function BackendSelector({ preference, onChange, capability }: BackendSelectorProps) {
  const detected = capability.hasGpu
    ? `GPU detected${capability.renderer ? ` — ${capability.renderer}` : ''}`
    : 'No GPU detected — CPU recommended'

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <span className="text-m">Detection engine</span>
        <div className="inline-flex rounded-lg overflow-hidden border-2 border-black text-xs font-black">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`px-3 py-1.5 ${
                preference === o.value ? 'bg-black text-[#F6EC24]' : 'bg-white text-black hover:bg-slate-100'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[0.7rem] text-gray-500 mt-1 leading-tight" title={capability.renderer ?? undefined}>
        {detected}. Auto = {capability.recommendedBackend === 'python' ? 'CPU' : 'GPU'} on this machine.
      </p>
    </div>
  )
}
