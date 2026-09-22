import { useAppSelector } from '../../../store/hooks'

type AppMode = 'code' | 'ai box' | 'games'

interface ModeSwitchProps {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

const MODES: { key: AppMode; label: string; color: string; darkColor: string }[] = [
  { key: 'code', label: 'Code', color: '#5AD231', darkColor: '#78E64D' },
  { key: 'ai box', label: 'AI box', color: '#36D3FF', darkColor: '#78D1FA' },
  { key: 'games', label: 'Games', color: '#F48301', darkColor: '#FB923C' }
]

export default function ModeSwitch({ mode, setMode }: ModeSwitchProps) {
  const themeMode = useAppSelector((state) => state.theme.mode)
  const isDark = themeMode === 'dark'
  const activeIndex = MODES.findIndex((m) => m.key === mode)
  // In dark mode the switch border and pill take the active mode's accent colour
  const accent = isDark ? MODES[activeIndex]?.darkColor ?? '#fff' : '#000'

  return (
    <div
      className={`text-nowrap rounded-2xl py-2 px-2 lg:py-3 lg:px-4 select-none border-[5px] backdrop-blur-md shadow-lg transition-colors duration-300 ${
        isDark ? 'bg-black/80' : 'bg-white/20'
      }`}
      style={{ borderColor: accent }}
      role="radiogroup"
      aria-label="Mode switch"
    >
      {/* Track — relative so the sliding pill can be absolutely positioned */}
      <div className="relative flex">

        {/* Sliding highlight pill */}
        <div
          className="absolute inset-y-0 rounded-lg pointer-events-none"
          style={{
            width: `${100 / MODES.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
            backgroundColor: accent,
            transition: 'transform 0.40s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
          }}
        />

        {MODES.map((item) => (
          <label
            key={item.key}
            htmlFor={`mode-${item.key}`}
            className="flex-1 flex items-center justify-center cursor-pointer relative z-10 "
          >
            <input
              id={`mode-${item.key}`}
              type="radio"
              name="radio"
              value={item.key}
              className="peer hidden "
              checked={mode === item.key}
              onChange={() => setMode(item.key)}
            />
            <span
              className={`font-black text-3xl uppercase tracking-widest px-20 py-4 rounded-lg transition-all duration-150 ease-in-out hover:scale-[1.03] peer-checked:scale-[1.05] ${
                mode === item.key
                  ? isDark
                    ? 'text-black'
                    : 'text-white'
                  : 'text-black dark:text-white'
              }`}
              tabIndex={0}
              role="radio"
              aria-checked={mode === item.key}
              onKeyDown={(e) => e.key === 'Enter' && setMode(item.key)}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
