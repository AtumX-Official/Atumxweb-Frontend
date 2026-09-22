import type { KitAction, KitControlsProps } from './types'

interface KitControlMapperProps extends KitControlsProps {
  /** Heading above the list, e.g. "Map each class to GAADI:" */
  title: string
  /** The selected kit's action set */
  actions: KitAction[]
}

/** Shared layout behind every kit's controls: one action dropdown per trained
 *  class. Kits differ only in the action set they hand in. */
export default function KitControlMapper({
  title,
  actions,
  classes,
  mappings,
  onMappingChange,
  openDropdown,
  setOpenDropdown,
  getColor
}: KitControlMapperProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      <span className="flex justify-center font-extrabold text-sm">{title}</span>

      {classes.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-6">Add classes to map controls</div>
      )}

      {classes.map((cls, i) => (
        <div
          key={cls.id}
          className={`relative bg-white rounded-md shadow-[2px_4px_4px_rgba(0,0,0,0.4)] overflow-visible
            ${openDropdown === cls.id ? 'z-50' : 'z-0'}`}
        >
          {/* Colored class header */}
          <div
            className="px-3 py-1 text-white font-bold text-[12px] rounded-t-md"
            style={{ background: getColor(cls.id, i) }}
          >
            {cls.name}
          </div>

          {/* Action dropdown */}
          <div className="p-2 relative z-20">
            <button
              onClick={() => setOpenDropdown(openDropdown === cls.id ? null : cls.id)}
              className="w-full h-[44px] bg-[#D6D6D6] rounded-[4px] flex items-center justify-between px-3"
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const selected = actions.find((o) => o.id === mappings[cls.id])
                  return (
                    <>
                      {selected?.Icon && <selected.Icon className="w-5 h-5" />}
                      <span className="text-[18px] text-black">
                        {selected?.label || '--------'}
                      </span>
                    </>
                  )
                })()}
              </div>

              {/* Arrow */}
              <div
                className={`transition-transform duration-200 ${openDropdown === cls.id ? 'rotate-180' : ''}`}
              >
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-black" />
              </div>
            </button>

            {openDropdown === cls.id && (
              <div
                className="absolute left-0 top-[calc(100%+0.25rem)] w-full bg-white rounded-[clamp(6px,0.6vw,8px)] shadow-[2px_4px_10px_rgba(0,0,0,0.25)] flex flex-col
                  p-[clamp(4px,0.5vw,8px)] gap-[clamp(4px,0.4vw,6px)] z-[999]"
              >
                {actions.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      onMappingChange(cls.id, id)
                      setOpenDropdown(null)
                    }}
                    className="w-full min-h-[clamp(30px,2.2vw,38px)] rounded-[clamp(4px,0.3vw,5px)] px-[clamp(4px,0.7vw,10px)] flex items-center gap-[clamp(6px,0.6vw,10px)]
                      bg-[#FFDE21] hover:scale-[1.01] transition-all"
                  >
                    {Icon && (
                      <div className="w-[clamp(14px,1vw,20px)] h-[clamp(14px,1vw,20px)] shrink-0 flex items-center justify-center">
                        <Icon className="w-full h-full" />
                      </div>
                    )}
                    <span className="text-[clamp(12px,0.9vw,16px)] text-black font-normal">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
