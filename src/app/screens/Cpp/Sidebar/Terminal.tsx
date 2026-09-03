import { useState, useEffect, useRef } from 'react'
import AutoScroll from "../../../assets/AutoScroll"
import Refreshicon from "../../../assets/Refresh"
import {  FiX } from "react-icons/fi";
import {FiAlertTriangle,FiTerminal} from "react-icons/fi"

interface TerminalLine {
  text: string
  type: 'out' | 'err'
}

interface TerminalProps {
  handleMouseDown: () => void
  terminalHeight: number
  terminalRef: React.RefObject<HTMLDivElement | null>
  setShowTerminal: React.Dispatch<React.SetStateAction<boolean>>
  onClear: () => void
  handleCopy: () => void
  terminalPath: string
  output: TerminalLine[]
  serialData: string
  activeTab: 'terminal' | 'errors'
  setActiveTab: React.Dispatch<React.SetStateAction<'terminal' | 'errors'>>
}

export default function({
    handleMouseDown,
    terminalPath,
    terminalHeight,
    terminalRef,
    output,
    setShowTerminal, 
    handleCopy,
    onClear,
    activeTab,
    setActiveTab,
} : TerminalProps){
    
    const [autoScroll, setAutoScroll] = useState<boolean>(() => {
    const saved = window.localStorage.getItem("serial_autoscroll");
    return saved !== null ? JSON.parse(saved) : true;
    });
    const scrollPosRef = useRef(0);
    const terminalOutput = output.filter(line => line.type !== 'err');
    const errorOutput = output.filter(line => line.type === 'err');
    useEffect(() => {
        const el = terminalRef.current;
        if (!el) return;
    
        if (autoScroll) {
        // ✅ always stick to bottom
        el.scrollTop = el.scrollHeight;
        } else {
        // ✅ restore previous position
        el.scrollTop = scrollPosRef.current;
        }
    }, [output, autoScroll]);
    useEffect(() => {
      const latestLine = output[output.length - 1];
    
      if (!latestLine) return;
    
      setActiveTab(
        latestLine.type === 'err'
          ? 'errors'
          : 'terminal'
      );
    }, [output, setActiveTab]);
    const handleScroll = () => {
        if (!autoScroll && terminalRef.current) {
        scrollPosRef.current = terminalRef.current.scrollTop;
        }
    };

    return (
      <>
        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="h-2 cursor-row-resize hover:bg-yellow-400 transition-colors duration-200 overflow-auto"
        />
    
        {/* Terminal */}
        <div
          style={{ height: terminalHeight }}
          className="text-white shadow-inner relative overflow-hidden"
        >
          <div className="h-full w-full flex flex-col">
    
            {/* Header */}
            <div className="flex items-end justify-between m-0 p-0 leading-none">
    
              {/* Tabs */}
              <div className="flex items-end flex-1">
    
                {/* Serial Monitor */}
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`
                    relative flex items-center gap-2
                    px-4 text-xs font-semibold
                    transition-all duration-150
                    min-w-[180px] -mr-2
                    ${
                      activeTab === 'terminal'
                        ? 'bg-black dark:bg-[#000000] text-white h-[36px] z-20 rounded-t-md'
                        : 'bg-[#FFDE21] text-black h-[31px] z-10 mt-[5px] rounded-t-md opacity-90 hover:opacity-100'
                    }
                  `}
                >
                  <FiTerminal className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-sm font-bold">
                    Terminal
                  </span>
                </button>
    
                {/* Error Logger */}
                <button
                  onClick={() => setActiveTab('errors')}
                  className={`
                    relative flex items-center gap-2
                    px-4 text-xs font-semibold
                    transition-all duration-150
                    min-w-[180px]
                    ${
                      activeTab === 'errors'
                        ? 'bg-black  dark:bg-[#000000]  text-white h-[36px] z-20 rounded-t-md'
                        : 'bg-[#FFDE21] text-black h-[31px] z-10 mt-[5px] rounded-t-md opacity-90 hover:opacity-100'
                    }
                  `}
                >
                  <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-sm font-bold">
                    Error Logger
                  </span>
                </button>
              </div>
    
              {/* Controls */}
              <div className="flex items-center gap-1.5 h-[36px] px-2 bg-black dark:bg-[#000000] rounded-tl-md">
    
                {/* Auto Scroll */}
                <button
                  onClick={() => setAutoScroll(prev => !prev)}
                  title={autoScroll ? "Autoscroll ON" : "Autoscroll OFF"}
                  className="p-1 rounded hover:bg-zinc-800 transition-colors"
                >
                  <AutoScroll
                    className="w-4 h-4"
                    isSelected={autoScroll}
                  />
                </button>
    
                {/* Clear */}
                <button
                  onClick={onClear}
                  title="Clear"
                  className="p-1 rounded hover:bg-zinc-800 transition-colors"
                >
                  <Refreshicon className="w-4 h-4" />
                </button>
    
                {/* Close */}
                <button
                  onClick={() => {
                    setShowTerminal(false);
                    window.localStorage.setItem('cpp_showTerminal', 'false');
                  }}
                  title="Close"
                  className="bg-red-600 w-5 h-5 rounded flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  <FiX className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
    
            {/* Divider */}
            <div className="w-full h-px shrink-0 bg-black" />
    
            {/* Output Area */}
            <div
              id="scrollbar"
              ref={terminalRef}
              onScroll={handleScroll}
              className="flex-1 overflow-auto px-3 pb-3 pt-3 bg-black dark:bg-[#000000] z-20"
            >
              <pre
                id="terminal-output"
                className="whitespace-pre-wrap font-mono text-sm select-text"
                onCopy={handleCopy}
              >
                <div className="text-zinc-400 mb-1">
                  {terminalPath}
                </div>
    
                {activeTab === 'terminal'
  ? terminalOutput.map((line, index) => (
      <span key={index} className="text-white">
        {line.text}
      </span>
    ))
  : errorOutput.map((line, index) => (
      <span key={index} className="text-red-500">
        {line.text}
      </span>
    ))}
              </pre>
            </div>
          </div>
        </div>
      </>
    )
}