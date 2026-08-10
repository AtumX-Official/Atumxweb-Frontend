import { useState, useEffect, useRef } from 'react'
import AutoScroll from "../../../assets/AutoScroll"
import Refreshicon from "../../../assets/Refresh"
import { FiX } from "react-icons/fi"
export default function SerialMonitor({
    handleMouseDown,
    terminalHeight,
    terminalRef,
    setShowSerialTerminal,
    onClear,
    handleCopy,
    serialData
}
){
    const [autoScroll, setAutoScroll] = useState(() => {
        const saved = window.localStorage.getItem("serial_autoscroll");
        return saved !== null ? JSON.parse(saved) : true;
      });
      
      const scrollPosRef = useRef(0);
      
      useEffect(() => {
        const el = terminalRef.current;
        if (!el) return;
      
        if (autoScroll) {
          el.scrollTop = el.scrollHeight;
        } else {
          el.scrollTop = scrollPosRef.current;
        }
      }, [serialData, autoScroll]);
      
      const handleScroll = () => {
        if (!autoScroll && terminalRef.current) {
          scrollPosRef.current = terminalRef.current.scrollTop;
        }
      };
    return (
    <>
        <div
        onMouseDown={handleMouseDown}
        className="h-2 cursor-row-resize hover:bg-yellow-400 transition-colors duration-200 overflow-auto"
        />
        <div
        style={{ height: terminalHeight }}
        className="text-white py-1 shadow-inner rounded-t-md relative overflow-hidden"
        >
        
            {/* Sticky Header */}
            <div
  style={{ height: terminalHeight }}
  className="text-white shadow-inner relative overflow-hidden"
>
  <div
    id="scrollbar"
    ref={terminalRef}
    onScroll={handleScroll}
    className="h-full overflow-auto bg-black dark:bg-[#000000]"
  >
    {/* Sticky Header */}
    <div className="sticky top-2 z-20">
      <div className="flex items-end justify-between bg-black dark:bg-[#000000]">
        <div className="flex items-end flex-1">
          <div className="text-white h-[36px] px-4 flex items-center">
            <span className="text-sm font-bold">
              Serial Monitor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 h-[36px] px-2 mt-1">
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

          <button
            onClick={onClear}
            title="Clear"
            className="p-1 rounded hover:bg-zinc-800 transition-colors"
          >
            <Refreshicon className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setShowSerialTerminal(false);
              window.localStorage.setItem('cpp_showSerialTerminal', 'false');
            }}
            title="Close"
            className="bg-red-600 w-5 h-5 rounded flex items-center justify-center hover:bg-red-500 transition-colors"
          >
            <FiX className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

    </div>

    {/* Content */}
    <div className="px-3 py-3">
      <pre
        id="terminal-output"
        className="whitespace-pre-wrap font-mono text-sm select-text"
        onCopy={handleCopy}
      >
        {serialData}
      </pre>
    </div>
  </div>
</div>

            {/* Content */}
     
        
        </div>
    </>
    )
}