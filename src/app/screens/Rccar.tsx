import { useState, useEffect, useRef,useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch,useSelector } from 'react-redux'
import Back from './../components/ui/Controlback'
import Kits from '../assets/Kits';
import Settings from '../assets/Settings';
import SpeedController from './../components/ui/SpeedControl'
import JoystickController from './../components/ui/JoysticControl'
import { sendWebSocketData,getWebSocket,connectWebSocket ,setConnected,setConnectionMode,setDisconnected,setMode} from '../../../store/websocketSlice'
import type { RootState, AppDispatch  } from '../../../store';
import TopBarCenter from './Elements/Topbar/TopCenter'
import Models from './Models'
import Wirelessicon from '../assets/Wirelessicon';
import Wirelessconnected from '../assets/Wirelessconnected';
import { Tooltip } from '../components/Tooltip';
import { Connectivity } from '../components/supporting/Popups';
import { IO_MAP } from './Elements/ioconfig';
import { UnderdevelopmentPopup } from '../components/supporting/Popups';
import BackgroundImg from "../assets/Background.svg?url"
import Header from '../components/Header'
import SettingModal from '../components/supporting/SettingModal';


const Rccar = () => {
  const navigate = useNavigate()
  const { isConnected, mode,status } = useSelector((state: RootState) => state.websocketSlice);
  const dispatch = useDispatch<AppDispatch>()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [showUnderDev, setShowUnderDev] = useState(false)
  const [action, setAction] = useState('')
  const [clampedValue, setClampedValue] = useState(0) // State for clampedValue
  const [showConnectivity, setShowConnectivity] = useState(false);
  const [selectedValues, setSelectedValues] = useState(Array(4).fill(''))
  const selectedKit = useSelector((state: RootState) => state.kits.kit)
  const selectedCategory = useSelector((state: RootState) => state.kits.category)
  const hideDropdown = selectedKit === "subo" && selectedCategory === "gaadi"
  const [projectName, setProjectName] = useState('project 1')
  const [showKits, setShowKits] = useState(false)
  const kitsButtonRef = useRef<HTMLButtonElement>(null);
  const themeMode = useSelector((state: any) => state.theme.mode)
  const bgColor = themeMode === 'dark' ? '#4D4D4D' : 'white'
  const bgyellow = themeMode === 'dark' ? "bg-[#FFDE21]" : "bg-[#EAC90F]"
  const [showSettings, setShowSettings] = useState(false)
  const handleWirelessClick = () => {
    dispatch(setConnectionMode("Wireless"));
    const ws = getWebSocket();
  
    // CONNECT
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      dispatch(connectWebSocket());
      setTimeout(() => {
        setShowConnectivity(true); 
        console.log("Trying to connect WebSocket...");
      }, 1500);
      return;
    }
  
    // DISCONNECT
    ws.close();
    dispatch(setDisconnected());
    console.log("WebSocket disconnected manually.");
  };
  
useEffect(() => {
  if (showConnectivity) {
    // 3. The popup is shown for 3.5 seconds
    const timer = setTimeout(() => setShowConnectivity(false), 3500); 
    return () => clearTimeout(timer);
  }
}, [showConnectivity]);

const dropdownValues = useMemo(() => {
  return IO_MAP[selectedKit] ?? [];
}, [selectedKit]);

  const getLabelFromValue = (value: string) => {
    const found = dropdownValues.find(([, v]) => v === value)
    return found ? found[0] : ''
  }
  


  const handleSelectChange = (index : number, value : string) => {
    // Update the selected value for the corresponding dropdown
    const newSelectedValues = [...selectedValues]
    newSelectedValues[index] = value
    setSelectedValues(newSelectedValues)
  }
  useEffect(() => {
    if (!['forward', 'backward', 'left', 'right'].includes(action)) return
  
    const isSuboGaadi =
      selectedKit === "subo" && selectedCategory === "gaadi"
  
    // ✅ SPECIAL CASE → SUBO GAADI
    if (isSuboGaadi) {
      const dirMap : Record<string, string> = {
        forward: "F",
        backward: "B",
        left: "L",
        right: "R"
      }
  
      const jsonOutput = {
        mode: "Board",
        program: {
          setup: {
            0: {
              SubuMotorSetup: {
                SMS: "SMS"
              }
            }
          },
          loop: {
            0: {
              SubuMotorRun: {
                dir: dirMap[action] || "F",
                speed: String(clampedValue)
              }
            }
          }
        }
      }
  
      console.log("SUBO JSON:", JSON.stringify(jsonOutput, null, 2))
      sendWebSocketData(jsonOutput)
      return
    }
  
    // ✅ DEFAULT CASE → EXISTING PIN LOGIC
    if (selectedValues.length >= 4) {
      const jsonOutput: {
        mode: string
        program: {
          setup: Record<number, {
            pinsetup: {
              pinumber: string
              mode: string
            }
          }>
          loop: Record<number, {
            pinwrite: {
              pin: string
              type: string
              value: number
            }
          }>
        }
      } = {
        mode: 'Board',
        program: {
          setup: {},
          loop: {}
        }
      }
  
      const zeroMap: Record<string, number[]> = {
        forward: [1, 2],
        backward: [0, 3],
        right: [1, 3],
        left: [0, 2]
      }
  
      const zeroIndexes = zeroMap[action] || []
  
      selectedValues.forEach((pin, index) => {
        if (!pin) return
  
        jsonOutput.program.setup[index] = {
          pinsetup: {
            pinumber: pin,
            mode: 'OUTPUT'
          }
        }
  
        jsonOutput.program.loop[index] = {
          pinwrite: {
            pin: pin,
            type: 'analog',
            value: zeroIndexes.includes(index) ? 0 : clampedValue
          }
        }
      })
  
      console.log("DEFAULT JSON:", JSON.stringify(jsonOutput, null, 2))
      sendWebSocketData(jsonOutput)
    }
  
  }, [selectedValues, clampedValue, action, selectedKit, selectedCategory])
  useEffect(() => {
    if (action === "stop") {   // Only trigger when action is exactly "stop"
      const actionMessage = {
        msg: action
      };
  
      console.log(actionMessage);
      sendWebSocketData(actionMessage);
    }
  }, [action]);
  
 
  useEffect(() => {
    if (['forward', 'backward', 'left', 'right'].includes(action) && selectedValues.length >= 4) {

      const jsonOutput: {
        mode: string
        program: {
          setup: Record<number, {
            pinsetup: {
              pinumber: string
              mode: string
            }
          }>
          loop: Record<number, {
            pinwrite: {
              pin: string
              type: string
              value: string
            }
          }>
        }
      } = {
        mode: 'Board',
        program: {
          setup: {},
          loop: {}
        }
      }


      // Assign pin numbers dynamically from selectedValues
      const pinMappings : Record<string, string[]> = {
        forward: ['HIGH', 'LOW', 'HIGH', 'LOW'],
        backward: ['LOW', 'HIGH', 'LOW', 'HIGH'],
        left: ['LOW', 'HIGH', 'HIGH', 'LOW'],
        right: ['HIGH', 'LOW', 'LOW', 'HIGH']
      }

      selectedValues.forEach((pin, index) => {
        if (pin) {
          jsonOutput.program.setup[index] = {
            pinsetup: {
              pinumber: pin,
              mode: 'OUTPUT'
            }
          }

          jsonOutput.program.loop[index] = {
            pinwrite: {
              pin: pin,
              type: 'digital',
              value: pinMappings[action][index]
            }
          }
        }
      })

      if (mode === 'Wired') {
        // window.electron.ipcRenderer.sendSerialData(jsonOutput)
      } else if (mode === 'Wireless') {
        //console.log("Digital mode",JSON.stringify(jsonOutput, null, 2))
        //sendMessageToESP32(jsonOutput);
      }
    }
  }, [action, selectedValues])

  return (
    <>
    <Header/>
    <div className="h-screen w-screen relative"
    style={{
      backgroundColor: `${bgColor}`,
    }}
    >
    {/* Top Bar */}
    
      <div className={`fixed top-0 left-0 w-full h-25 bg-[#FFDE21] px-4 ${bgyellow}`}>
      <div className="absolute inset-0 z-10 animate-moving-bg bg-repeat bg-center bg-[length:700px] pointer-events-none opacity-30"
  style={{ backgroundImage: `url(${BackgroundImg})` }}
/>
<div className="relative z-10 flex items-center h-full mt-2">
    
    {/* LEFT */}
    <div className="flex items-center">
      <button onClick={() => navigate('/blocks')} className="group relative hover:scale-110 transition-transform duration-200">
        <Back className="w-[60px] h-[60px]" />
        <Tooltip text="Back" />
      </button>
    </div>

    {/* CENTER (ABSOLUTE CENTER) */}
    <div className="absolute left-1/2 -translate-x-1/2">
      <TopBarCenter
        selectedKit={selectedKit}
        setShowKits={setShowKits}
        kitsButtonRef={kitsButtonRef}
        projectName={projectName}
        setProjectName={setProjectName}
      />
    </div>

    {/* RIGHT */}
    <div className="ml-auto flex items-center gap-3">
      {/* Wireless */}
      <button
        onClick={handleWirelessClick}
        className="bg-black flex items-center justify-center rounded-lg
                   transition-transform duration-200 hover:scale-110
                   w-[45px] h-[45px]  mb-1"
      >
        {isConnected ? (
          <Wirelessconnected
            className="w-[30px] h-[30px]"
            status={status}
          />
        ) : (
          <Wirelessicon
            className="w-[30px] h-[30px]"
          />
        )}
        <Tooltip
          text={isConnected ? "Disconnect WIFI" : "Connect with WIFI"}
          marginTop="mt-2"
          py="py-1"
        />
      </button>

      {/* Kits */}
      {/* <button className="group relative hover:scale-110 transition-transform duration-200"onClick={() =>setShowUnderDev(true)}>
        <Kits className="lg:w-[50px] lg:h-[50px]  cursor-pointer" />
        <Tooltip text="Help" />
      </button> */}

      {/* Settings */}
      <button className="group relative hover:scale-110 transition-transform duration-200"   onClick={() => setShowSettings(true)}>
        <Settings className="lg:w-[50px] lg:h-[50px]  cursor-pointer" />
        <Tooltip text="Settings" />
      </button>
    </div>

  </div>
</div>

  {showConnectivity && <Connectivity />}
      {/* Main Content Container */}
      <div className="h-screen w-screen dot-grid overflow-hidden pt-22 flex items-center justify-center">
  
  <div
    className={`flex flex-row items-center justify-center 
      ${hideDropdown ? "gap-28 md:gap-45 2xl:gap-45" : "gap-18 md:gap-25 2xl:gap-30"} 
      w-full px-10`}
  >

    {/* 1. Joystick Section */}
    <div className="flex-shrink-0">
      <div className="bg-[#FFDE21] rounded-2xl p-2 w-[250px] h-[250px] md:w-[300px] md:h-[300px] flex items-center justify-center">
        <div className="bg-black rounded-xl w-full h-full flex items-center justify-center p-2">
          <JoystickController
            className="w-[200px] h-[200px] md:w-[220px] md:h-[220px]"
            action={action}
            setAction={setAction}
          />
        </div>
      </div>
    </div>

    {/* 2. Dropdown Section */}
    {!hideDropdown && (
      <div className="flex-shrink-0">
        <div className="bg-[#FFDE21] rounded-2xl p-2 w-[210px] h-[320px] md:w-[230px] flex items-center justify-center">
          <div className="bg-black rounded-xl w-full h-full p-3 flex items-center justify-center">
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="text-white text-sm md:text-base w-12 md:w-16 text-center font-medium">
                    {`IN${item}`}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenIndex(openIndex === index ? null : index)
                      }
                      className="w-[85px] bg-[#FFDE21] text-black font-bold p-2 rounded-md h-9 flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate text-xs md:text-sm">
                        {selectedValues[index]
                          ? getLabelFromValue(selectedValues[index])
                          : "----"}
                      </span>
                      <span className="text-[10px]">▼</span>
                    </button>

                    {openIndex === index && (
                      <div className="absolute mt-1 w-21 bg-white rounded-md shadow-lg z-20 max-h-[200px] overflow-y-auto left-0">
                        {dropdownValues.map(([display, value]) => (
                          <div
                            key={display}
                            onClick={() => {
                              handleSelectChange(index, value)
                              setOpenIndex(null)
                            }}
                            className="px-3 py-2 hover:bg-[#FFDE21] text-sm cursor-pointer"
                          >
                            {display}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* 3. Speed Controller Section */}
    <div className="flex-shrink-0">
      <SpeedController
        clampedValue={clampedValue}
        setClampedValue={setClampedValue}
      />
    </div>

  </div>
</div>
      {showKits && (
            <div onClick={() => setShowKits(false)}
              className="fixed top-0 left-0 w-full h-full flex items-start justify-center z-50 pt-[100px] bg-black/50 backdrop-blur-sm"
            >
            
                <Models />
            </div>
          )}
           {showUnderDev && (
                    <UnderdevelopmentPopup onNo={() => setShowUnderDev(false)} />
                  )}
           {showSettings && (
                    <SettingModal onClose={() => setShowSettings(false)} />
                  )}
          </div>
    </>
  );
  
}

export default Rccar
