import { useState, useEffect, useRef } from 'react'
import AutoScroll from "../../../assets/AutoScroll"
import Refreshicon from "../../../assets/Refresh";
import {  FiX } from "react-icons/fi";
import {FiAlertTriangle,FiTerminal} from "react-icons/fi"

export default function({
    handleMouseDown,
    terminalPath,
    terminalHeight,
    terminalRef,
    output,
    serialData,
    setShowTerminal, 
    handleCopy,
    onClear
}){
    
    const [activeTab, setActiveTab] = useState<'serial' | 'errors'>('serial') 
    const [autoScroll, setAutoScroll] = useState(() => {
    const saved = localStorage.getItem("serial_autoscroll");
    return saved !== null ? JSON.parse(saved) : true;
    });
    const scrollPosRef = useRef(0);
    useEffect(() => {
      if (!output.length) return;
    
      const latestLine = output[output.length - 1];
    
      if (latestLine.type === 'err') {
        setActiveTab('errors');
      } else {
        setActiveTab('serial');
      }
    }, [output]);
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
    }, [output, serialData, autoScroll]);

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
  className="text-white shadow-inner relative overflow-hidden"
>
  <div className=" h-full w-full flex flex-col">

    {/* Header — full black bar */}
    <div className="flex items-end justify-between m-0 p-0 leading-none">

      {/* Tabs strip + filler */}
      <div className="flex items-end flex-1">

        {/* Serial Monitor */}
        <button
          onClick={() => setActiveTab('serial')}
          className={`
            relative flex items-center gap-2
            px-4 text-xs font-semibold
            transition-all duration-150
            min-w-[180px] -mr-2
            ${activeTab === 'serial'
              ? 'bg-black text-white h-[36px] z-20 rounded-t-md'
              : 'bg-[#FFDE21] text-black h-[32px] z-10 mt-[6px] rounded-t-md'
            }
          `}
        >
          <FiTerminal className="w-3.5 h-3.5 shrink-0" />
          <span className="text-md font-bold">Serial Monitor</span>
        </button>

        {/* Error Logger */}
        <button
          onClick={() => setActiveTab('errors')}
          className={`
            relative flex items-center gap-2
            px-4 text-xs font-semibold
            transition-all duration-150
            min-w-[180px]
            ${activeTab === 'errors'
              ? 'bg-black font-bold text-white h-[36px] z-20 rounded-t-md'
              : 'bg-[#FFDE21] font-black text-black h-[31px] z-10 mt-[6px] rounded-t-md'
            }
          `}
        >
          <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="text-md font-bold">Error Logger</span>
        </button>

        {/* Filler — black, fills rest of header, blends seamlessly */}
        {/* <div className="flex-1 h-[36px] bg-black pointer-events-none -ml-1" /> */}

      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 h-[36px] px-2 bg-black rounded-tl-md">
        <button
          onClick={() => setAutoScroll(prev => !prev)}
          title={autoScroll ? "Autoscroll ON" : "Autoscroll OFF"}
          className="p-1 rounded hover:bg-zinc-800 transition-colors z-10"
        >
          <AutoScroll className="w-4 h-4" isSelected={autoScroll} />
        </button>

        <button
          onClick={onClear}
          title="Clear"
          className="p-1 rounded hover:bg-zinc-800 transition-colors z-10"
        >
          <Refreshicon className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            setShowTerminal(false)
            localStorage.setItem('py_showTerminal', 'false')
          }}
          className="bg-red-600 w-5 h-5 rounded flex items-center justify-center hover:bg-red-500 transition-colors z-10"
        >
          <FiX className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>

    {/* Divider */}
    <div className="w-full h-px shrink-0 bg-black" />

    {/* Output area */}
    <div
      id="scrollbar"
      ref={terminalRef}
      onScroll={handleScroll}
      className="flex-1 overflow-auto px-3 pb-3 pt-3 bg-black"
    >
      <pre
        id="terminal-output"
        className="whitespace-pre-wrap font-mono text-sm select-text"
        onCopy={handleCopy}
      >
        <div>{terminalPath}</div>
        <>
          <div style={{ display: activeTab === 'serial' ? 'block' : 'none' }}>
            {output
              .filter(line => line.type !== 'err')
              .map((line, index) => (
                <span key={index} className="text-white">{line.text}</span>
              ))}
            {serialData}
          </div>

          <div style={{ display: activeTab === 'errors' ? 'block' : 'none' }}>
            {output
              .filter(line => line.type === 'err')
              .map((line, index) => (
                <span key={index} className="text-red-500">{line.text}</span>
              ))}
          </div>
        </>
      </pre>
    </div>

  </div>
</div>
        </>
      )
}