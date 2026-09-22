import React, { useEffect, useRef, useState,useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../../store/index';
import Usb from '../../../assets/Usbicon';
import Wiredicon from '../../../assets/Wiredicon';
import Wirelessicon from '../../../assets/Wirelessicon';
import Wirelessconnected from '../../../assets/Wirelessconnected';
import Games from '../../../assets/Game';
import Kits from '../../../assets/Kits';
import Settings from '../../../assets/Settings';
import DroneSim from '../../../assets/DroneSim';
import ComPortSelector from '../../../components/Comportselector';
import { Connectivity } from '../../../components/supporting/Popups';
import { disconnectSerial,sendSerialMessage,connectSerial, setOpen } from '../../../../../store/serialSlice';
import { getWebSocket, connectWebSocket, setConnectionMode, clearMode, disconnectWebSocket } from '../../../../../store/websocketSlice';
import { useAppSelector } from '../../../../../store/hooks';
import { setSelectedComPort } from '../../../../../store/comPortSlice';
import { useRouter } from 'next/navigation';
import { Tooltip } from '../../../components/Tooltip';
import { UnderdevelopmentPopup } from '../../../components/supporting/Popups';
import SettingModal from '../../../components/supporting/SettingModal';

interface Serial extends EventTarget {
  addEventListener(
    type: "connect" | "disconnect",
    listener: (event: Event) => void
  ): void
  removeEventListener(
    type: "connect" | "disconnect",
    listener: (event: Event) => void
  ): void
}

interface TopBarRightProps {
  setShowKits: React.Dispatch<React.SetStateAction<boolean>>;
}

const TopBarRight: React.FC<TopBarRightProps> = ({ setShowKits }) => {
  const [activeIcon, setActiveIcon] = useState<'none' | 'usb' | 'wifi'>('none')
      const { isConnected, mode,status,lastMode } = useSelector((state: RootState) => state.websocketSlice);
      const selectedPort = useSelector((state: RootState) => state.comPort.selectedComPort);
      const isSerialOpen = useSelector((state: RootState) => state.serial.isOpen);
      const dispatch = useDispatch<AppDispatch>()
      const kitsButtonRef = useRef<HTMLButtonElement>(null);
      const [showConnectivity, setShowConnectivity] = useState(false);
      const router = useRouter(); 
      const [showUnderDev, setShowUnderDev] = useState(false)
      const [showSettings, setShowSettings] = useState(false)
      const selectedKit = useAppSelector((state) => state.kits.kit)
      // Drone boards get the Drone Simulator slot instead of Control space.
      const isDroneKit = selectedKit === 'wingz'
      console.log("isConnected : ",isConnected)
      console.log("activeIcon : ",activeIcon)
      const handleUsbClick = async () => {
        // Disconnect
        if (isConnected) {
          try {
            await dispatch(disconnectSerial());
      
            setShowConnectivity(true);
            setActiveIcon("none");
      
            console.log("Disconnected");
          } catch (error) {
            console.error("Failed to disconnect:", error);
          }
      
          return;
        }
      
        // Check Web Serial availability
        if (
          typeof navigator === "undefined" ||
          !("serial" in navigator)
        ) {
          console.error("Web Serial API is not available.");
      
          setActiveIcon("none");
          setShowConnectivity(false);
      
          // You can replace this with your own popup if you have one
          alert(
            "USB connection is not available. Please open this website using HTTPS or localhost in Chrome or Edge."
          );
      
          return;
        }
      
        try {
          dispatch(setConnectionMode("Wired"));
      
          await dispatch(connectSerial());      
          setActiveIcon("usb");
          setShowConnectivity(false);
      
          console.log("Connected");
      
          // Wait 2 seconds for the board to initialize
          setTimeout(async () => {
            try {
              await sendSerialMessage({ msg: "usbconn" });
      
              setShowConnectivity(true);
      
              console.log("usbconn message sent");
            } catch (err) {
              console.error("Failed to send usbconn:", err);
            }
          }, 2000);
      
        } catch (error) {
          console.error("Failed to connect:", error);
      
          setActiveIcon("none");
          setShowConnectivity(false);
        }
      };
      useEffect(() => {
        if (typeof navigator === "undefined" || !("serial" in navigator)) {
          return;
        }
      
        const handleSerialDisconnect = (event: Event) => {
          console.log("🔌 USB physically disconnected", event);
      
          setActiveIcon("none");
          setShowConnectivity(true);
      
          // Update Redux state
          dispatch(disconnectSerial());
        };
      
        (navigator.serial as any).addEventListener(
          "disconnect",
          handleSerialDisconnect
        );
      
        return () => {
          (navigator.serial as any).removeEventListener(
            "disconnect",
            handleSerialDisconnect
          );
        };
      }, [dispatch]);
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
  {/* Connection pill (desktop layout): USB | link | Wi-Fi. Collapses to the USB
      button once connected over USB, and is replaced by the Wi-Fi status icon
      while connected over Wi-Fi. */}
  {mode !== 'Wireless' && (
    <div
      className={`bg-black rounded-[8px] flex items-center justify-center transition-all duration-300
        border border-transparent hover:border-[#F6EC24]
        ${isConnected ? 'w-[50px] h-[50px]' : 'w-[175px] h-[45px]'}`}
    >
      <div className="pl-2 pr-2">
        <button
          onClick={handleUsbClick}
          onMouseDown={(e) => e.preventDefault()}
          className="group relative flex items-center justify-center hover:scale-110 transition-transform duration-200"
        >
          <Usb
            isConnected={isConnected}
            className={`w-[20px] h-[35px] cursor-pointer ${
              isConnected ? "text-green-400" : "text-white"
            }`}
          />
          <Tooltip
            text={isConnected ? "Disconnect USB" : "Connect with USB"}
            marginTop="mt-2"
          />
        </button>
      </div>
      {!isConnected && (
        <>
          <div className="ml-auto mr-auto">
            <Wiredicon className="w-[40px] h-[40px] cursor-pointer" />
          </div>
          <button
            onClick={handleWirelessClick}
            onMouseDown={(e) => e.preventDefault()}
            className="group relative pr-3 flex items-center justify-center hover:scale-110 transition-transform duration-200"
          >
            <Wirelessicon className="w-[35px] h-[25px]" />
            <Tooltip text="Connect with WIFI" marginTop='mt-2' py='py-1' />
          </button>
        </>
      )}
    </div>
  )}
</div>

{showConnectivity && <Connectivity />}  {/* Group 2: Wireless Connected (outside black box) */}
  {mode == "Wireless" && (
    <div className="group relative">
      <Wirelessconnected
        className="lg:w-[50px] lg:h-[46px]  cursor-pointer"
        status = {status}
        onClick={() => {
          // Properly disconnect — stops auto-reconnect too
          dispatch(disconnectWebSocket());
          dispatch(clearMode());
          setShowConnectivity(true);
          setActiveIcon('none');
          console.log("WebSocket disconnected manually.");
        }}
      />
      <Tooltip text="Disconnect"/>
    </div>
  )}
  {isDroneKit ? (
    // Drone Simulator is not implemented on the web yet — shown, but disabled.
    <button
      type="button"
      disabled
      aria-disabled="true"
      className="group relative opacity-50 cursor-not-allowed"
    >
      <DroneSim className="lg:w-[50px] lg:h-[50px] pointer-events-none" />
      <Tooltip text="Drone Simulator (coming soon)"/>
    </button>
  ) : (
<button
  onClick={() => router.push('/rccar')}
  className="group relative hover:scale-110 transition-transform duration-200"
>
  <Games className="lg:w-[50px] lg:h-[50px]  cusor-pointer" />
  <Tooltip text="Control space"/>
</button>
  )}
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