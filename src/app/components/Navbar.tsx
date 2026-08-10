/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState, useEffect, useRef } from 'react'
import Settings from '../assets/icons/common/Settings'
import ProjectIcon from '../assets/icons/common/ProjectIcon'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { useRouter } from "next/navigation";
import SettingsModal from '../components/supporting/SettingModal'
import { Tooltip } from './Tooltip'
import { UnderdevelopmentPopup } from '../components/supporting/Popups'
import { createPortal } from "react-dom";
type AppMode = 'code' | 'ai box' | 'games' | null

export default function Navbar({ mode }: { mode: AppMode }) {
  const dispatch = useAppDispatch()
  const router = useRouter();
  const theme = useAppSelector((state) => state.theme)
  const [activeIcon, setActiveIcon] = useState<'folder' | 'settings' | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const [showUnderDev, setShowUnderDev] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.mode === 'dark')
  }, [theme.mode])

  useEffect(() => {
    if (!showSettings) return

    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings])

  const darkBgColor =
    mode === 'code' ? 'bg-[#02e519]' : mode === 'ai box' ? 'bg-[#36d3ff]' : 'bg-orange-400'

  return (
    <nav className="flex justify-between items-center p-4 w-full text-black dark:text-white mt-3 ">
      <h1 className="text-3xl font-black">{mode}</h1>

      <div className="flex gap-3 z-10">
        <button
                    onClick={() => {
                      setShowUnderDev(true)
                    }}
          
          className={`cursor-pointer group flex items-center justify-center p-2 rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 ${theme.mode === 'light' ? 'bg-black' : darkBgColor} hover:border-white`}

        >
          <ProjectIcon className="w-6 h-6 fill-none transition-colors duration-200 z-20" />
          <Tooltip text="Projects" marginTop="mt-1" positionClasses="top-[100%]" />
        </button>

        <button
          onClick={() => setShowSettings((prev) => !prev)}
          className={`cursor-pointer group flex items-center justify-center p-2 rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 ${theme.mode === 'light' ? 'bg-black' : darkBgColor} hover:border-white`}
        >
          <Settings className="w-6 h-6 fill-none transition-colors duration-200 stroke-black" />
        </button>

        {showSettings &&
  createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div ref={settingsRef}>
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>,
    document.body
  )
}

        {showUnderDev && 
          createPortal(
        <UnderdevelopmentPopup onNo={() => setShowUnderDev(false)} />,
        document.body
          )
      }
      </div>
    </nav>
  )
}
