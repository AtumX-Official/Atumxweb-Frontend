import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import type * as Blockly from 'blockly'
import type { RunStatus } from '../hooks/useBlocklyActions'

import Run from '../../../assets/Run'
import Stop from '../../../assets/Stop'
import Zoominicon from '../../../assets/Zoomin'
import Zoomouticon from '../../../assets/Zoomout'
import Redoicon from '../../../assets/Redo'
import Undoicon from '../../../assets/Undo'
import Clearall from '../../../assets/Deleteall'
import SerialiconLight from '../../../assets/Serialicon'
import SerialiconDark from '../../../assets/SerialiconDark'
import SerialMonitor from '../../CommonHelper/SerialMonitor'
import { Tooltip } from '../../../components/Tooltip'

interface BlocklyControlsProps {
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>
  runstatus: RunStatus
  zoomPercent: number
  themeMode: 'light' | 'dark'
  onRunStop: () => void
  onZoom: (direction: 1 | -1) => void
}

export default function BlocklyControls({
  workspaceRef,
  runstatus,
  zoomPercent,
  themeMode,
  onRunStop,
  onZoom,
}: BlocklyControlsProps) {
  const iconRef = useRef(null)
  const [showSerial, setShowSerial] = useState(false)

  const Serialicon = themeMode === 'dark' ? SerialiconDark : SerialiconLight

  return (
    <>
      {/* Right-side floating action buttons */}
      <div className="absolute top-2 right-4 z-10 flex flex-col items-center gap-4">
        {/* Run / Stop */}
        <button
          className="group relative flex items-center justify-center hover:scale-105 transition-transform duration-200"
          onClick={onRunStop}
        >
          {runstatus === 'Start' ? (
            <Run className="w-[90px] h-[90px]" />
          ) : (
            <Stop className="w-[90px] h-[90px]" />
          )}
          <Tooltip
            text={runstatus === 'Start' ? 'Run' : 'Stop'}
            positionClasses="right-full mr-2 top-1/2 -translate-y-1/2"
          />
        </button>

        {/* Serial Monitor */}
        <div className="relative">
          <button
            className="group relative flex items-center justify-center hover:scale-110 transition-transform duration-200"
            onClick={() => setShowSerial((prev) => !prev)}
          >
            <Serialicon ref={iconRef} className="w-[60px] h-[60px]" />
            <Tooltip
              text="Serial Monitor"
              positionClasses="right-full mr-[-1px] top-1/2 -translate-y-1/2"
            />
          </button>
          {showSerial && <SerialMonitor onClose={() => setShowSerial(false)} iconRef={iconRef} />}
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="absolute bg-[#969696]/20 w-70 h-14 bottom-4 left-1/2 -translate-x-1/2 flex flex-row items-center rounded-2xl justify-center space-x-4 z-50">
        {/* Undo / Redo */}
        <div className="flex flex-row items-center space-x-2">
          <button
            className="group relative flex items-center justify-center hover:scale-110 transition-transform duration-200"
            onClick={() => workspaceRef.current?.undo(false)}
          >
            <Undoicon className="w-[30px] h-[30px]" />
            <Tooltip text="Undo" positionClasses="bottom-full left-1/2 -translate-x-1/2 mb-2" />
          </button>

          <button
            className="group relative flex items-center justify-center hover:scale-110 transition-transform duration-200"
            onClick={() => workspaceRef.current?.undo(true)}
          >
            <Redoicon className="w-[30px] h-[30px]" />
            <Tooltip text="Redo" positionClasses="bottom-full left-1/2 -translate-x-1/2 mb-2" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex flex-row items-center space-x-2">
          <button
            className="group relative flex items-center justify-center hover:scale-110 transition-transform duration-200"
            onClick={() => onZoom(1)}
          >
            <Zoominicon className="w-[30px] h-[30px]" themeMode={themeMode} />
            <Tooltip text="Zoom In" positionClasses="bottom-full left-1/2 -translate-x-1/2 mb-2" />
          </button>

          <div className="w-12 h-7 bg-white text-black rounded-lg flex items-center justify-center text-sm font-medium shadow">
            {zoomPercent}%
          </div>

          <button
            className="group relative flex items-center justify-center hover:scale-110 transition-transform duration-200"
            onClick={() => onZoom(-1)}
          >
            <Zoomouticon className="w-[30px] h-[30px]" themeMode={themeMode} />
            <Tooltip text="Zoom Out" positionClasses="bottom-full left-1/2 -translate-x-1/2 mb-2" />
          </button>
        </div>

        {/* Clear All */}
        <button
          className="group relative flex items-center justify-center hover:scale-110 transition-transform duration-200"
          onClick={() => workspaceRef.current?.clear()}
        >
          <Clearall className="w-[30px] h-[30px]" />
          <Tooltip text="Clear All" positionClasses="bottom-full left-1/2 -translate-x-1/2 mb-2" />
        </button>
      </div>
    </>
  )
}
