import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Tooltip } from '@renderer/components/Tooltip'
import EditIcon from '@renderer/assets/icons/common/EditIcon'
import SaveIcon from '@renderer/assets/icons/common/SaveIcon'
import Settings from '@renderer/assets/icons/common/Settings'
import BackgroundImg from "@renderer/assets/Background.svg?url"
import DownloadIcon from '@renderer/assets/icons/common/DownloadIcon'
import Savedtokit from '@renderer/assets/icons/common/Savetokit'
import BookIcon from '@renderer/assets/icons/common/BookIcon'
import BackIcon from '@renderer/assets/icons/common/Backicon'
import BlockBackIcon from '@renderer/assets/Blockback'
import gestureLight from '@renderer/assets/icons/misc/gesture_light.svg?url'
import gestureDark from '@renderer/assets/icons/misc/gesture_dark.svg?url'
import poseLight from '@renderer/assets/icons/misc/pose_light.svg?url'
import poseDark from '@renderer/assets/icons/misc/pose_dark.svg?url'
import audioLight from '@renderer/assets/icons/misc/audio_light.svg?url'
import audioDark from '@renderer/assets/icons/misc/audio_dark.svg?url'
import blocksLight from '@renderer/assets/icons/misc/blocks_light.svg?url'
import blocksDark from '@renderer/assets/icons/misc/blocks_dark.svg?url'
import SettingsModal from '@renderer/components/supporting/SettingModal'
import WifiIcon from '../icons/WifiIcon'
import { useAppSelector } from '../../../../../store/hooks'

interface AIToolbarProps {
  onSave: () => void
  onBack?: () => void
  isTrained: boolean
  projectName?: string
  onProjectNameChange?: (name: string) => void
  onNewProject?: () => void
  onOpenProject?: () => void
  /** Use the desktop app's book icon instead of the save-to-kit icon. */
  useBookIcon?: boolean
  /** Center the project name box horizontally in the toolbar. */
  centerProjectName?: boolean
  /** Image the back arrow cross-fades into on hover (e.g. the screen's mode icon). Ignored if backImage is set. */
  backIconSrc?: string
  /** Modality artwork for the back button, rendered via BlockBackIcon. Takes priority over backIconSrc. Omitted → falls back to backIconSrc, or the plain back arrow. */
  backImage?: 'gesture' | 'pose' | 'audio' | 'blocks'
}

export default function AIToolbar({
  onSave,
  onBack,
  isTrained,
  projectName = '',
  onProjectNameChange,
  onNewProject,
  onOpenProject,
  useBookIcon = false,
  centerProjectName = false,
  backIconSrc,
  backImage
}: AIToolbarProps) {
  // Settings was a dead decorative gear on the AI screens — they render their own
  // toolbar instead of the shared Navbar, so the modal wiring never came with it.
  // Mirror Navbar's self-contained pattern (state + click-outside + portal) here.
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const themeMode = useAppSelector((state) => state.theme.mode)
  const normalBackImage = !backImage
    ? undefined
    : themeMode === 'dark'
      ? { gesture: gestureDark, pose: poseDark, audio: audioDark, blocks: blocksDark }[backImage]
      : { gesture: gestureLight, pose: poseLight, audio: audioLight, blocks: blocksLight }[backImage]

  // The AI screens don't mount the home Navbar, which is what normally sets the
  // `dark` class on <html>. Sync it here so a direct load of /ai (or toggling the
  // theme from this toolbar's Settings) still drives the `dark:` styles.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark')
  }, [themeMode])

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

  const projectNameBox = (
    <div className={`flex bg-white px-10 py-3 rounded-xl ${centerProjectName ? 'w-[clamp(220px,26vw,400px)]' : 'justify-right max-w-[400px]'}`}>
      <span className='font-bold text-sm shrink-0'>
        Project
      </span>
      <input
        type="text"
        value={projectName}
        onChange={(e) => onProjectNameChange?.(e.target.value)}
        className={`px-3 font-semibold text-sm text-black bg-transparent border-black focus:outline-none ${centerProjectName ? 'flex-1 min-w-0' : ''}`}
        placeholder="Project Name"
      />
    </div>
  )

  return (
    <div className={`relative flex px-4 pt-6 pb-4 bg-[#36D3FF] w-screen items-end overflow-visible flex-shrink-0`}>
      {centerProjectName && (
        // Centered on the full toolbar width, level with the 60px icon row.
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 h-15 flex items-center z-[1000]">
          {projectNameBox}
        </div>
      )}
      <div
        // `fixed`, not `absolute`: the root is `relative` (to centre the project name),
        // and bg-contain would shrink the pattern to the toolbar's height. Viewport-sized
        // keeps the original tile scale; the page body (z-20) covers the rest.
        className="fixed inset-0 z-10 bg-repeat bg bg-center bg-contain pointer-events-none opacity-30"
        style={{ backgroundImage: `url(${BackgroundImg})` }}
      />
      <div
        onClick={onBack}
        className="group bg-black relative z-20 rounded flex items-center justify-center w-15 h-15 cursor-pointer hover:opacity-80 transition-opacity"
      >
        {normalBackImage ? (
          <BlockBackIcon className="w-10 h-10" normalImage={normalBackImage} />
        ) : (
          <>
            <BackIcon className={`w-10 h-10 transition-all duration-300 ease-in-out ${backIconSrc ? 'group-hover:opacity-0 group-hover:scale-75' : ''}`} />
            {backIconSrc && (
              // Cross-fades in over the arrow on hover.
              <img
                src={backIconSrc}
                alt=""
                aria-hidden
                draggable={false}
                className="absolute inset-0 m-auto w-12 h-12 object-contain select-none pointer-events-none opacity-0 scale-75 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-100"
              />
            )}
          </>
        )}
      </div>
      <div className="flex flex-col justify-center w-full">
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
              {useBookIcon ? (
                <BookIcon className="w-12 h-12 bg-[#F6EC24] p-2 rounded border-black hover:border-[3px] border-black transition-transform duration-200" />
              ) : (
                <Savedtokit className="w-12 h-12 bg-[#F6EC24] p-2 rounded border-black hover:border-[3px] border-black transition-transform duration-200" />
              )}
              <Tooltip text="Book" />
            </div>
          </div>

          {!centerProjectName && projectNameBox}

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