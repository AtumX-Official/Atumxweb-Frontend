import React, { useEffect, useRef, useState,useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../../../store/index';
import Usb from '../../../assets/Usbicon';
import Wiredicon from '../../../assets/Wiredicon';
import Wirelessicon from '../../../assets/Wirelessicon';
import Wirelessconnected from '../../../assets/Wirelessconnected';
import Games from '../../../assets/Game';
import Kits from '../../../assets/Kits';
import Settings from '../../../assets/Settings';
import ComPortSelector from '../../../components/Comportselector';
import { Connectivity } from '../../../components/supporting/Popups';
import { disconnectSerial,sendSerialMessage,connectSerial, setOpen } from '../../../../../store/serialSlice';
import { setConnected, setDisconnected, getWebSocket, connectWebSocket, sendWebSocketData,addWSMessageListener,removeWSMessageListener,setMode,setConnectionMode } from '../../../../../store/websocketSlice';
import { setSelectedComPort } from '../../../../../store/comPortSlice';
import { useRouter } from 'next/navigation';
import { Tooltip } from '../../../components/Tooltip';
import { UnderdevelopmentPopup } from '../../../components/supporting/Popups';
import SettingModal from '../../../components/supporting/SettingModal';
interface TopBarRightProps {
  setShowKits: React.Dispatch<React.SetStateAction<boolean>>;
}

const TopBarRight: React.FC<TopBarRightProps> = ({ setShowKits }) => {
  const [activeIcon, setActiveIcon] = useState<'none' | 'usb' | 'wifi'>('none')
      const { isConnected, mode,status,lastMode } = useSelector((state: RootState) => state.websocketSlice);
      const selectedPort = useSelector((state: RootState) => state.comPort.selectedComPort);
      const isSerialOpen = useSelector((state: RootState) => state.serial.isOpen);
      const dispatch = useDispatch()
      const kitsButtonRef = useRef<HTMLDivElement>(null);
      const [showConnectivity, setShowConnectivity] = useState(false);
      const router = useRouter(); 
      const [showUnderDev, setShowUnderDev] = useState(false)
      const [showSettings, setShowSettings] = useState(false)
      console.log("isConnected : ",isConnected)
      console.log("activeIcon : ",activeIcon)
      const handleUsbClick = () => {
  if (isConnected) {
    dispatch(disconnectSerial());
    setShowConnectivity(true);
    setActiveIcon("none");
    dispatch(setSelectedComPort(null));
    console.log("Disconnected from serial");
  }  else if (activeIcon === "usb") {
    setActiveIcon("none");
  } else {
    dispatch(setConnectionMode("Wired"));
    setActiveIcon("usb");
  }
};

const handlePortSelected = (port: string) => {
  dispatch(setSelectedComPort(port));
  let timeoutId: NodeJS.Timeout;
  if (port) {
    dispatch(connectSerial(port))
      .then(() => {
        console.log("Connected to serial successfully");
        dispatch(setConnectionMode("Wired"));
        timeoutId = setTimeout(() => {
          sendSerialMessage({ msg: "usbconn" });
          setShowConnectivity(true);
          console.log("usbconn message sent after 2 seconds");
        }, 2000);
      })
      .catch((err) => {
        console.error("Serial connection failed:", err);
        dispatch(disconnectSerial());
      });
  }
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
};

const handleWirelessClick = () => {
  dispatch(setConnectionMode("Wireless"));
  const ws = getWebSocket();
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    dispatch(connectWebSocket());
    setTimeout(() => {
      setShowConnectivity(true); 
      console.log("Trying to connect WebSocket...");
    }, 1500);
  }
};

useEffect(() => {
  if (showConnectivity) {
    // 3. The popup is shown for 3.5 seconds
    const timer = setTimeout(() => setShowConnectivity(false), 3500); 
    return () => clearTimeout(timer);
  }
}, [showConnectivity]);


      // useEffect(() => {
      //   window.api.serial.onClosed(() => {
      //     console.log("Serial port closed — showing disconnected popup");
      //     dispatch(setOpen(false));
      //     dispatch(setDisconnected());
      //     setShowConnectivity(true);
      //     dispatch(setSelectedComPort(null));
      //     setActiveIcon("none");
      //   });
      
      //   window.api.serial.onError((err: string) => {
      //     if (err === 'Serial port is not open') return;
      //     console.error("Serial error:", err);
      //     dispatch(setOpen(false));
      //     dispatch(setDisconnected());
      //     setShowConnectivity(true);
      //   });
      // }, [dispatch]);
      
            
return(
<div className="flex items-center gap-2">
<div className=" relative flex items-center space-x-2">
  {activeIcon !== 'usb' && mode !== 'Wireless' && (
    <div
      className={`bg-black rounded-[8px] flex items-center justify-center transition-all duration-300 
        border-[1px] border-transparent
    hover:border-[#F6EC24] mb-1
        ${
        isConnected ? 'lg:w-[50px] lg:h-[50px] ' : 'lg:w-[175px] lg:h-[45px]'
      }`}
    >
      <div className="pl-2 pr-2">
  <button 
    onClick={handleUsbClick}
    className="group relative flex items-center justify-center hover:scale-110 transition-transform duration-200"
  >
    <Usb
      isConnected={isConnected}
      className={`lg:w-[20px] lg:h-[35px]  cursor-pointer ${
        isSerialOpen ? 'text-green-400' : ''
      }`}
    />
    <Tooltip text="Connect with USB" marginTop="mt-2" />
  </button>
</div>
      {!isConnected && (
        <>
          <div className="ml-auto mr-auto">
            <Wiredicon className="lg:w-[40px] lg:h-[40px]  cursor-pointer" />
          </div>
          <button 
  onClick={handleWirelessClick}
  className="group relative pr-3 flex items-center justify-center hover:scale-110 transition-transform duration-200"
>
  <Wirelessicon className="lg:w-[35px] lg:h-[25px]" />
  
  {/* Reusable Tooltip component replaces the span */}
  <Tooltip text="Connect with WIFI" marginTop='mt-2' py='py-1' />
</button>
        </>
      )}
    </div>
  )}
  {activeIcon === 'usb' && (
    <div className="bg-black rounded-[8px] w-[50px] h-[50px] flex items-center justify-center" onClick={handleUsbClick}>
      <Usb
        isConnected={isConnected}
        className={`lg:w-[20px] lg:h-[35px] cursor-pointer ${
          isSerialOpen ? 'text-green-400' : ''
        }`}      />
    </div>
  )}
  {(activeIcon === 'usb' && mode === 'Wired') && (
    <ComPortSelector isConnected={isConnected} onPortSelected={handlePortSelected} />
  )}
</div>

{showConnectivity && <Connectivity />}  {/* Group 2: Wireless Connected (outside black box) */}
  {mode == "Wireless" && (
    <div className="group relative">
      <Wirelessconnected
        className="lg:w-[50px] lg:h-[46px]  cursor-pointer"
        status = {status}
        onClick={() => {
          dispatch(setConnectionMode('Wireless')); // user clicked → sets mode
          const ws = getWebSocket()
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close(); // closes the websocket connection
            dispatch(setDisconnected());
            setShowConnectivity(true)  
            console.log("WebSocket disconnected manually.");
          }
          dispatch(setMode());
          //dispatch(setConnectionMode('Wireless'))
          dispatch(setDisconnected());     // Redux: isConnected = false, mode reset
          setActiveIcon('none');           // UI: go back to default black bg with icons
        }
        }
      />
      <Tooltip text="Disconnect"/>
    </div>
  )}

<button 
  onClick={() => router.push('/rccar')}
  className="group relative hover:scale-110 transition-transform duration-200"
>
  <Games className="lg:w-[50px] lg:h-[50px]  cusor-pointer" />
  <Tooltip text="Control space"/>
</button>
{/* <button 
  className="group relative hover:scale-110 transition-transform duration-200"
  onClick={() =>  navigate('/Mainlayout')}
>
  <Kits className="lg:w-[50px] lg:h-[50px]  cusor-pointer" />
  <Tooltip text="Help" />
</button> */}
<button className="group relative hover:scale-110 transition-transform duration-200"
  onClick={() =>     setShowSettings(true)}
>
  <Settings className="lg:w-[50px] lg:h-[50px]  cusor-pointer" />
  <Tooltip text="Settings" />
</button>
 {showUnderDev && (
          <UnderdevelopmentPopup onNo={() => setShowUnderDev(false)} />
        )}
         {showSettings && (
          <SettingModal onClose={() => setShowSettings(false)} />
        )}

</div>

)
}

export default TopBarRight