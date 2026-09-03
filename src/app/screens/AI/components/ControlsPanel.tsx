import { useState } from 'react'
import type { GestureClass } from '../hooks/useGestureClassifier'
import BlocksIcon from '../icons/blocksIcon'
import PythonIcon from '../icons/pythonIcon'
import CppIcon from '../icons/cppIcon'
import WheelsIcon from '../icons/wheelsIcon'
import PlaymoIcon from '../icons/playmoIcon'
import RekkaIcon from '../icons/rekkaIcon'
import PreviewIcon from '../icons/previewIcon'
import Preview from '../icons/preview'

import UpIcon from '../icons/upIcon'
import DownIcon from '../icons/downIcon'
import LeftIcon from '../icons/leftIcon'
import RightIcon from '../icons/rightIcon'
import GreetIcon from '../icons/greetIcon'
import HonkIcon from '../icons/honkIcon'
import DanceIcon from '../icons/danceIcon'


interface ControlsPanelProps {
  classes: GestureClass[]
  classColors: Record<string, string>
  defaultColors: string[]
  onStart?: () => void
  onExportToBlockly?: (mode: 'blocks' | 'python' | 'c++') => void
  trainingStatus: string
  currentPage: string
}

const CONTROL_OPTIONS = [
  { id: '', label: ' -----', Icon: null },
  { id: 'Up', label: 'Up', Icon: UpIcon },
  { id: 'Down', label: 'Down', Icon: DownIcon },
  { id: 'Left', label: 'Left', Icon: LeftIcon },
  { id: 'Right', label: 'Right', Icon: RightIcon },
  { id: 'Greet', label: 'Greet', Icon: GreetIcon },
  { id: 'Honk', label: 'Honk', Icon: HonkIcon },
  { id: 'Dance', label: 'Dance', Icon: DanceIcon },
]

type Tab = 'preview' | 'controls' 

const controlOptions = [
  { id: "gaadi", Icon: WheelsIcon },
  { id: "playmo",Icon: PlaymoIcon },
  { id: "rekka", Icon: RekkaIcon }
];

const previewOptions = [
  { id: "blocks", Icon: BlocksIcon },
  { id: "python",Icon: PythonIcon },
  { id: "c++", Icon: CppIcon }
]

export default function ControlsPanel({ classes, classColors, defaultColors, onStart, onExportToBlockly, trainingStatus, currentPage }: ControlsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('controls')
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [activeControl, setActiveControl] = useState('')
  const isTrained  = trainingStatus === 'ready'
  const inMainPage = currentPage === "main"

  const TABS: { key: Tab; label: React.ReactNode }[] = [
    {
      key: 'preview',
      label: activeTab === 'preview' ? <Preview /> : <PreviewIcon />,
    },
    {
      key: 'controls',
      label: (
        <svg width="18" height="18" viewBox="0 0 30 32" fill="none">
          <path d="M23.8471 4.12274V1.32477C23.8471 0.592184 23.255 0 22.5224 0C21.7898 0 21.1976 0.592184 21.1976 1.32477V4.10952C18.1784 4.73349 15.8984 7.44135 15.8984 10.6805C15.8984 13.8388 18.1784 16.4818 21.1976 17.0899V30.4703C21.1976 31.2029 21.7898 31.7951 22.5224 31.7951C23.255 31.7951 23.8471 31.2029 23.8471 30.4703V17.0886C26.8664 16.4725 29.1463 13.7965 29.1463 10.5984C29.1464 7.52084 26.7896 4.77591 23.8471 4.12274ZM23.8471 11.9232H21.1975C20.4649 11.9232 19.8728 11.331 19.8728 10.5984C19.8728 9.86579 20.4649 9.27361 21.1975 9.27361H23.8471C24.5797 9.27361 25.1719 9.86579 25.1719 10.5984C25.172 11.331 24.5798 11.9232 23.8471 11.9232Z" fill="currentColor" />
          <path d="M7.94871 14.7065V1.32477C7.94871 0.592184 7.35653 0 6.62393 0C5.89134 0 5.29916 0.592184 5.29916 1.32477V14.7065C2.27993 15.3226 0 17.9986 0 21.1967C0 24.3948 2.27999 27.0708 5.29916 27.6869V30.4703C5.29916 31.2028 5.89134 31.795 6.62393 31.795C7.35653 31.795 7.94871 31.2028 7.94871 30.4703V27.6869C10.9679 27.0708 13.2479 24.3948 13.2479 21.1967C13.2479 17.9987 10.9679 15.3226 7.94871 14.7065ZM7.94871 22.5215H5.2991C4.56651 22.5215 3.97432 21.9294 3.97432 21.1968C3.97432 20.4642 4.56651 19.872 5.2991 19.872H7.94871C8.6813 19.872 9.27348 20.4642 9.27348 21.1968C9.27355 21.9294 8.68136 22.5215 7.94871 22.5215Z" fill="currentColor" />
        </svg>
      ),
    },
  ]

  function getColor(id: string, idx: number) {
    return classColors[id] ?? defaultColors[idx % defaultColors.length]
  }

  return (
    <div className="flex flex-col items-start">
      {/* Toolbar */}
      <div className="w-[clamp(320px,30vw,480px)] flex justify-center">
        <div className="flex">
          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                id={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center h-[48px] w-[160px] px-3 gap-2 rounded-t-lg transition-all
                    ${i !== 0 ? "-ml-3" : ""}   
                    ${isActive
                    ? "bg-black text-[#F6EC24]"
                    : "bg-[#F6EC24] text-black"}
                `}
              >
                {tab.label}
                <span className="text-[13px] font-bold uppercase">
                  {tab.key}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-[clamp(320px,30vw,480px)] rounded-lg border-2 border-black bg-[#EDEDED] shadow-[2px_4px_4px_rgba(0,0,0,0.4)] overflow-visible">

        { !isTrained && <div
            className="flex flex-col h-[250px] text-lg justify-center items-center font-extrabold"
            style={{ maxHeight: 'calc(100vh - 240px)' }}
          >
            <span>You must train a model</span>
            <span>before previewing</span>
          </div>
        }

        { isTrained && (activeTab == "controls") && <div
            className="flex flex-col gap-3 p-3"
            style={{ maxHeight: 'calc(100vh - 240px)' }}
          >
          <span className='flex justify-center font-extrabold pl-2 -mb-3 mt-2'>
            Select your kit:
          </span>
            <div className="p-4 grid grid-cols-3 gap-3">
              {controlOptions.map(({ id, Icon }) => {
                const isActive = activeControl === id;

                return (
                  <div
                    key={id}
                    onClick={() => setActiveControl(id)}
                    className={`
                      cursor-pointer transition-all duration-200
                      rounded-xl px-1 pt-1
                      ${isActive
                        ? "bg-[#2EED08] border-[#2EED08]"
                        : "bg-black border-black"
                      }
                    `}
                  >
                    <div className="bg-white rounded-lg flex items-center justify-center h-[80px]">
                      <Icon  />
                    </div>
                    <div className="mt-1 text-center uppercase font-bold tracking-wide text-white text-sm">
                      {id}
                    </div>
                  </div>
                );
              })}
            </div>            
          </div>
        }

        { isTrained && (activeTab == "preview") && <div
            className="flex flex-col gap-3 p-3"
            style={{ maxHeight: 'calc(100vh - 240px)' }}
          >
          <span className='flex justify-center font-extrabold pl-2 -mb-3 mt-2'>
              Test or export your trained model as:
            </span>
            <div className="p-4 grid grid-cols-3 gap-3">
              {previewOptions.map(({ id, Icon }) => {
                const isActive = activeControl === id;

                return (
                  <div
                    key={id}
                    onClick={() => {
                      setActiveControl(id)
                      if (id === 'blocks') {
                        onExportToBlockly?.('blocks')
                      }
                    }}
                    className={`
                      cursor-pointer transition-all duration-200
                      rounded-xl px-1 pt-1
                      ${isActive
                        ? "bg-[#2EED08] border-[#2EED08]"
                        : "bg-black border-black"
                      }
                    `}
                  >
                    <div className="bg-white rounded-lg flex items-center justify-center h-[80px]">
                       <Icon />
                    </div>
                    <div className="text-center uppercase font-bold tracking-wide text-white text-sm">
                      {id}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        }

        {/* Class mappings */}
        { false && isTrained && !inMainPage && <div
          className="flex flex-col gap-3 p-3"
          style={{ maxHeight: 'calc(100vh - 240px)' }}
        >
          {classes.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">
              Add gesture classes to map controls
            </div>
          )}
          {classes.map((cls, i) => (
            <div
              key={cls.id}
              className={`relative bg-white  rounded-md  shadow-[2px_4px_4px_rgba(0,0,0,0.4)] overflow-visible
                ${openDropdown === cls.id ? "z-50" : "z-0"}`} >
              {/* Colored class header */}
              <div
                className="px-3 py-1 text-white font-bold text-[12px]"
                style={{ background: getColor(cls.id, i) }}
              >
                {cls.name}
              </div>

              {/* Dropdown row */}
              <div className="p-3 relative z-20">

                {/* Main Dropdown Button */}
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === cls.id ? null : cls.id)
                  }
                  className="w-full h-[52px] bg-[#D6D6D6] rounded-[4px] flex items-center justify-between px-3">

                  {/* Left Side */}
                  <div className="flex items-center gap-3">
                    {(() => {
                      const selected = CONTROL_OPTIONS.find(
                        (o) => o.id === mappings[cls.id]
                      )
                      return (
                        <>
                          {selected?.Icon && (
                            <selected.Icon className="w-6 h-6" />)}

                          <span className="text-[20px] text-black">
                            {selected?.label || "--------"}
                          </span>
                        </>
                      )
                    })()}

                  </div>

                  {/* Arrow */}
                  <div className={`
                      transition-transform duration-200
                      ${openDropdown === cls.id ? "rotate-180" : ""}`}>
                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-black" />
                  </div>
                </button>

              
                {/* Dropdown Menu */}
                {openDropdown === cls.id && (
                  <div
                    className="absolute left-0 top-[calc(100%+0.5rem)] w-full bg-white rounded-[clamp(6px,0.6vw,8px)] shadow-[2px_4px_10px_rgba(0,0,0,0.25)] flex flex-col
                                  p-[clamp(4px,0.5vw,8px)] gap-[clamp(4px,0.4vw,6px)] z-[999]" >
                    {CONTROL_OPTIONS.map(({ id, label, Icon }) => {
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setMappings((prev) => ({
                              ...prev,
                              [cls.id]: id,
                            }))

                            setOpenDropdown(null)
                          }}
                          className="w-full min-h-[clamp(30px,2.2vw,38px)] rounded-[clamp(4px,0.3vw,5px)] px-[clamp(4px,0.7vw,10px)] flex items-center gap-[clamp(6px,0.6vw,10px)]
                                      bg-[#FFDE21] hover:scale-[1.01] transition-all">
                          {/* ICON */}
                          {Icon && (
                            <div className="w-[clamp(14px,1vw,20px)] h-[clamp(14px,1vw,20px)] shrink-0 flex items-center justify-center">
                              <Icon />
                            </div>
                          )}

                          {/* LABEL */}
                          <span className="text-[clamp(12px,0.9vw,16px)] text-black font-normal">
                            {label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>}
        
      </div>

      {/* Start button */}
      <div className='w-full flex justify-center'>
      <button
        onClick={() => {
          if (!isTrained) return
          onStart?.()
        }}
        className={`${inMainPage ? "bg-[#39FF14]" : "bg-[#FF4945]" } mt-4 px-8 py-2 text-xl font-bold text-white rounded-md shadow-[2px_4px_4px_rgba(0,0,0,0.4)] hover:scale-105 transition`}
      >
        {inMainPage ? "START" : "STOP"}
      </button>
      </div>
    </div>
  )
}
