import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Tooltip } from '@renderer/components/Tooltip'
import EditIcon from '@renderer/assets/icons/common/EditIcon'
import SaveIcon from '@renderer/assets/icons/common/SaveIcon'
import Settings from '@renderer/assets/icons/common/Settings'
import BackgroundImg from "@renderer/assets/Background.svg?url"
import DownloadIcon from '@renderer/assets/icons/common/DownloadIcon'
import Savedtokit from '@renderer/assets/icons/common/Savetokit'
import BackIcon from '@renderer/assets/icons/common/Backicon'
import SettingsModal from '@renderer/components/supporting/SettingModal'
import WifiIcon from '../icons/WifiIcon'

interface AIToolbarProps {
  onSave: () => void
  onBack?: () => void
  isTrained: boolean
  projectName?: string
  onProjectNameChange?: (name: string) => void
  onNewProject?: () => void
  onOpenProject?: () => void
}

export default function AIToolbar({ onSave, onBack, isTrained, projectName = '', onProjectNameChange, onNewProject, onOpenProject }: AIToolbarProps) {
  // Settings was a dead decorative gear on the AI screens — they render their own
  // toolbar instead of the shared Navbar, so the modal wiring never came with it.
  // Mirror Navbar's self-contained pattern (state + click-outside + portal) here.
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="flex px-4 pt-6 pb-4 bg-[#36D3FF] w-screen items-end overflow-visible flex-shrink-0">
      <div
        className="absolute inset-0 z-10 animate-moving-bg bg-repeat bg bg-center bg-contain pointer-events-none opacity-30"
        style={{ backgroundImage: `url(${BackgroundImg})` }}
      />
      <div
        onClick={onBack}
        className="bg-black relative z-20 rounded flex items-center justify-center w-15 h-15 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <BackIcon className="w-10 h-10" />
      </div>
      <div className="flex flex-col justify-center w-full bg-[#36D3FF]">
        <div className="flex items-center justify-between w-full relative z-[999]">
          <div className="flex items-center gap-4 px-4 relative z-[999]">
            <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onNewProject}>
              <EditIcon className="w-12 h-12 cursor-pointer bg-[#F6EC24] p-2 rounded hover:border-[3px] border-black transition-transform duration-200" />
              <Tooltip text="New Project" />
            </div>
            <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onOpenProject}>
              <DownloadIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
              <Tooltip text='Open' />
            </div>
            <div className="group relative cursor-pointer hover:scale-110 transition-transform duration-200" onClick={onSave}>
              <SaveIcon className="w-12 h-12 bg-[#F6EC24] p-2 rounded border-black hover:border-[3px] border-black transition-transform duration-200" />
              <Tooltip text="Save" />
            </div>
            <div className="group relative cursor-pointer hover:scale-110 transition-transform duration-200">
              <Savedtokit className="w-12 h-12 bg-[#F6EC24] p-2 rounded border-black hover:border-[3px] border-black transition-transform duration-200" />
              <Tooltip text="Book" />
            </div>
          </div>
          
          <div className='flex justify-right bg-white px-10 py-3 max-w-[400px] rounded-xl'>
            <span className='font-bold text-sm'>
              Project
            </span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => onProjectNameChange?.(e.target.value)}
              className="px-3 font-semibold text-sm text-black bg-transparent border-black focus:outline-none"
              placeholder="Project Name"
            />
          </div>

          <div className="flex items-end gap-2">
            { isTrained && <div className="w-12 bg-black rounded border-2 flex items-center justify-center" style={{ height: 52 }}>
              <WifiIcon className="w-8 h-8 stroke-white" />
            </div>}
            <div
              onClick={() => setShowSettings((prev) => !prev)}
              className="w-12 bg-black rounded border-2 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative z-20"
              style={{ height: 52 }}
            >
              <Settings className="w-8 h-8 stroke-white" />
            </div>
          </div>
        </div>
      </div>

      {showSettings &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div ref={settingsRef}>
              <SettingsModal onClose={() => setShowSettings(false)} />
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
