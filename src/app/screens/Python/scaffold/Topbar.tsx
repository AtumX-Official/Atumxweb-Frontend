import Backicon from "../../../assets/icons/common/Backicon"
import PythonLogo from '../../../assets/icons/python/PythonLogo'
import { Tooltip } from '../../../components/Tooltip'
import BookmarkIcon from '../../../assets/icons/common/BookmarkIcon'
import DownloadIcon from '../../../assets/icons/common/DownloadIcon'
import EditIcon from '../../../assets/icons/common/EditIcon'
import SaveIcon from '../../../assets/icons/common/SaveIcon'
import Savedtokit from '../../../assets/icons/common/Savetokit'
import { FaPlay, FaStop } from 'react-icons/fa'
import { useState } from "react"
import { IoReloadOutline } from 'react-icons/io5'
import SettingModal from '../../../components/supporting/SettingModal';

export default function Topbar({
    ports,
    setPorts,
    onExit,
    setOpen,
    open,
    onNewFile,
    onOpenFolder,
    menuItemClass,
    setActiveItem,
    onSave,
    refresh,
    setShowTerminal,
    onRun,
    projectName,
    setProjectName,
    setShowUnderDev,
    items,
    bgColor,
    onSaveToKit,
    onOpenpdf,
    selectedkit,
    handlePortRefreshWithPromise
}){
  const [logoHovered, setLogoHovered] = useState(false)
  const [runStatus, setRunStatus] = useState<'running' | 'stopped'>('stopped')
  const [showSettings, setShowSettings] = useState(false)

    return (
        <div className="flex px-4 pt-6 pb-4 bg-[#722CF0] w-screen items-end overflow-visible">
                  <div
                    className="bg-black rounded flex items-center justify-center w-[60px] h-[60px] cursor-pointer z-[10]"
                    onMouseEnter={() => setLogoHovered(true)}
                    onMouseLeave={() => setLogoHovered(false)}            
                    onClick={async () => {
                      setLogoHovered(false);
                      await onExit();
                    }}
                    
                  >
                    {logoHovered ? (
                      <Backicon className="text-white w-10 h-10" />
                      
                    ) : (
                      <PythonLogo className="w-10 h-10 transition-transform duration-200 hover:scale-110" />
                    )}
                   <Tooltip text="Back"/>
                  </div>
        
                  <div className="flex flex-col justify-center w-full bg-[#722CF0]">
                    <div className="flex items-center justify-between w-full relative z-[20]">
                      <div className="flex items-center gap-4 px-4 relative">
                      <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onNewFile}>
                          <EditIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                          <Tooltip  text='New' marginTop="" />
                        </div>
                        <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onOpenFolder}>
                          <DownloadIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                          <Tooltip text='Open' />
                        </div>
                        <div
                          className="group relative inline-block hover:scale-110 transition-transform duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(open === "save" ? null : "save");
                          }}
                        >
                        <SaveIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                        <Tooltip text="Save" />
        
                          {open === "save" && (
                            <div
                              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 rounded-lg ${bgColor} shadow-lg z-50`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                className={menuItemClass("save")}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setActiveItem("save");
                                  setOpen(null);
                                  setActiveItem(null);
                                  try {
                                    const success = await onSave("save");
                                    if (success) {
                                      await refresh();  // only refresh if save actually succeeded
                                    }
                                  } catch (err) {
                                    console.error("Save failed:", err);
                                  }
                                }}
                                                              >
                                SAVE
                              </div>
        
                              <div
                                className={menuItemClass("saveAs")}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setActiveItem("saveAs");
                                  setOpen(null);
                                  setActiveItem(null);
                                  try {
                                    const success = await onSave("saveAs");
                                    if (success) {
                                      await refresh();  // only refresh if save actually succeeded
                                    }
                                  } catch (err) {
                                    console.error("Save failed:", err);
                                  }
                                }}
                              >
                                SAVE AS
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onSaveToKit}>
                          <Savedtokit className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                          <Tooltip text='Save to kit' />
                        </div>
                        <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onOpenpdf}>
                          <BookmarkIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                          <Tooltip text='Book' />
                        </div>
                        {/* RUN or STOP */}
                        <div className="flex items-center gap-3">
                          {runStatus === 'stopped' ? (
                            <div
                              className="group relative w-12 h-12 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
                              onClick={() => {
                                setShowTerminal(true);
                                localStorage.setItem("py_showTerminal", "true");
                                onRun();
                                setRunStatus('running');
                              }}
                            >
                              <FaPlay size={20} className="text-green-500" />
                              <Tooltip text="Run" />
                            </div>
                          ) : (
                            <div
                              className="group relative w-12 h-12 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
                              onClick={async () => {
                                const result = await window.api.mpRemote.stop();
                                console.log(result);
                                setRunStatus('stopped');
                              }}
                            >
                              <FaStop size={26} className="text-red-500" />
                              <Tooltip text='Stop' />
                            </div>
                          )
                          }
                        </div>
        
                      </div>
        {/* //                      <div className="absolute left-[53%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">                        <div className=" relative w-[300px] max-w-[90vw] sm:w-[280px] md:w-[320px] lg:w-[300px] h-[50px] bg-white rounded-xl flex items-center justify-between px-3 transition-all duration-300 ease-in-out border-1 border-transparent hover:border-black"> */}

                      <div className="absolute left-[53%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                        <div className=" relative w-[300px] max-w-[90vw] sm:w-[280px] md:w-[320px] lg:w-[300px] h-[50px] bg-white rounded-xl flex items-center justify-between px-3 transition-all duration-300 ease-in-out border-1 border-transparent hover:border-black">
                          <div className="relative group flex-1">
                            <input
                              type="text"
                              value={`Project ${projectName}`}
                              onChange={(e) =>
                                setProjectName(e.target.value.replace(/^Project\s*/i, ""))
                              }
                              className="h-10 px-3 font-semibold text-sm text-black bg-transparent border-black focus:outline-none w-full"
                              placeholder="Project Name"
                            />
                            <span className="absolute top-[100%] left-2 mt-2 px-2 py-1 text-black bg-white rounded font-bold border-black text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              Project Name
                            </span>
                          </div>
                          <div className=" absolute top-1 right-1 w-[100px] h-[40px]  bg-black border-[2px] border-white shadow-[0_0_6px_rgba(255,255,255,0.6)] flex items-center justify-center cursor-pointer rounded-xl"
                          >
                            <span className="text-white text-xs font-bold tracking-wide uppercase whitespace-nowrap overflow-hidden text-ellipsis px-1">
                              {selectedkit || "No Kit"}
                            </span>
                          </div>
                        </div>
                      </div>
        
                    <div className="flex items-end gap-2">
                        {/* USB Port Dropdown + Reload inside it */}
                        <div className="flex items-center bg-black rounded border-2 border-black hover:border-[#FFFFFF] transition-all duration-200">
                          <select
                            name="ports"
                            className="bg-black text-white focus:outline-none min-w-[120px] h-12 rounded-l px-2 cursor-pointer"
                          >
                            {ports.map((port, idx) => (
                              <option key={idx} value={port}>
                                {port}
                              </option>
                            ))}
                          </select>
        
                           {/* Reload button INSIDE the port div */}
                          <button
                            className="h-12 w-12 flex items-center justify-center text-white border-l-2 border-black hover:text-[#F6EC24] transition-all duration-200"
                            onClick={() => {
                              handlePortRefreshWithPromise({ setPorts })
                            }}
                          >
                            <IoReloadOutline className="w-6 h-6" />
                          </button>
                        </div>
        
                        {/* Remaining Icons (USB, Star, Settings) */}
                        {items.map(({ Icon, label }, i) => (
                       <div key={i} className="group relative w-12 h-13 bg-black rounded border-2 border-black hover:border-[#FFFFFF] transition-all duration-200 cursor-pointer flex items-center justify-center"
                            onClick={() =>  setShowSettings(true)}
                            >
                            <Icon className="w-8 h-8" />
                            <Tooltip text={label} />
                            </div>
                            ))}
                        </div>
                    </div>
                  </div>
                    {showSettings && (
                            <SettingModal onClose={() => setShowSettings(false)} />
                          )}
                </div>         
    )
}