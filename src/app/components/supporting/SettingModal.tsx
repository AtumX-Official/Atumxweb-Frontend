/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import MusicSwitch from '../misc/MusicSwitch'
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from 'react-redux';
import Sound from './assets/Sound';
import Theme from './assets/Theme';
import About from './assets/About';
import Board from './assets/Board';
import Themebg from './assets/Themebg';
import Soundbg from './assets/Soundbg';
import Aboutbg from './assets/Aboutbg';
import Boardbg from './assets/Boardbg';
import BoardInfo from './Boardcomp';
import Aboutinfo from './Aboutcomp';
import ThemeSelector from './Themecomp'
import SoundControl from './Soundcomp';
import Settingsbg from './assets/Settingsbg';
import Close from './assets/Wrong.svg'
export default function SettingModal({  onClose }) {
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'checking' | 'available' | 'not_available' | 'downloading' | 'downloaded'
  >('idle')
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [boardName, setBoardName] = useState('Atumx board')
  const [firmWareVersion, setFirmwareVersion] = useState('1.2')
  const [music, setMusic] = useState(true)
  const [sfx, setSfx] = useState(true)
  const [appVersion, setAppVersion] = useState('')
  const [section, setSection] = useState<'theme' | 'about' | 'sound' | 'board'>('sound')
  const themeMode = useSelector((state: any) => state.theme.mode)
  const bgcolor = themeMode === "dark" ? "bg-[#272727]" : "bg-[#EAEAEA]"
  const sidebg = themeMode  ===  "dark" ? 'bg-[#3A3A3A]' : "bg-[#D6D6D6]"
  const rightsidebg = themeMode === "dark" ? 'bg-black' : 'bg-white'
  const clickbg = themeMode === "dark" ? 'bg-black' : 'bg-white'
  const textcolor = themeMode === "dark" ? 'text-white' : 'text-black'
  const bgOpacity = themeMode === "dark" ? "opacity-10" : "opacity-5";
  const modecard = localStorage.getItem("modecard");
  const isCpp = modecard === "cpp";
  const handleAppUpdate = () => {
    setUpdateStatus('checking')
    window.api.checkForUpdates()
  }
  const bgMap = {
    theme: Themebg,
    sound: Soundbg,
    board: Boardbg,
    about: Aboutbg,
  };
  
  const BgComponent = bgMap[section];
  
  useEffect(() => {
    window.api.onUpdateStatus((data) => {
      setUpdateStatus(data.status as
        | "idle"
        | "checking"
        | "available"
        | "not_available"
        | "downloading"
        | "downloaded"
      )            
      if (data.status === 'downloading' && data.progress) {
        setDownloadProgress(data.progress)
      }
    })
  }, [])

  useEffect(() => {
    window.api.getAppVersion().then((version) => {
      setAppVersion(version)
    })
  }, [])

  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.96 }}
          transition={{ type: "spring", damping: 20, stiffness: 120 }}
          className={`w-[752px] h-[583px] ${bgcolor} rounded-xl shadow-2xl p-4 flex flex-col relative overflow-hidden`}
        >
          {/* Header - Just the Close Button */}
<div className="flex items-center justify-end mb-4">
  <button
    onClick={onClose}
    className="flex items-center justify-center rounded-md cursor-pointer  active:scale-95"
    style={{
      backgroundColor: "#EA221F",
      width: "30px",
      height: "30px",
    }}
  >
   <img src={Close} className='w-10 h-10'/>
  </button>
</div>
  
          {/* Body */}
          <div className="flex flex-1 gap-4">
            {/* Left Sidebar */}
            <div className="w-[200px] rounded-lg relative">
              
              {/* SETTINGS - Positioned absolutely so it doesn't push menu items */}
              <div className={`absolute -top-10 left-4 ${textcolor}`}>
                <h2 className={`text-4xl font-bold uppercase ${textcolor}`}>
                  SETTINGS
                </h2>
              </div>
  
              {/* Background Image Layer */}
              <div className="absolute -bottom-4 -left-4 pointer-events-none">
                <Settingsbg className="w-[200px]" />
              </div>
  
              {/* Menu Items - These will now stay at the top of the sidebar div */}
              <div className="p-3 space-y-2 relative z-10">
                {[
                  { key: "sound", label: "SOUNDS", icon: Sound },
                  { key: "theme", label: "THEME", icon: Theme },
                  ...(!isCpp
                    ? [{ key: "board", label: "BOARD", icon: Board }]
                    : []),
                  { key: "about", label: "ABOUT", icon: About },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => setSection(item.key)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer font-bold transition ${textcolor}
                      ${
                        section === item.key
                          ? `${clickbg}`
                          : `${sidebg}`
                      }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="leading-none">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Right Content */}
            <div className={`flex-1 ${rightsidebg} rounded-lg p-5 mt-2 overflow-hidden relative`}>
              {/* Background Image Layer */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {BgComponent && <BgComponent className={`w-[240px] ${bgOpacity}`} />}
              </div>
  
              {/* Foreground Content */}
              <div className="relative z-10 w-full">
                {section === "sound" && (
                  <div className="space-y-4">
                    <SoundControl />
                  </div>
                )}
  
                {section === "theme" && <ThemeSelector />}
  
                {!isCpp && section === "board" && <BoardInfo />}  
                {section === "about" && <Aboutinfo />}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
   
}
