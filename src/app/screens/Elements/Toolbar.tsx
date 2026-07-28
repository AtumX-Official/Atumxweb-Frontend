import React, { useEffect, useRef, useState,useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import Games from '../../assets/Game';
import Kits from '../../assets/Kits';
import Settings from '../../assets/Settings';
import Back from '../../assets/Blockback';
import New from '../../assets/Edit';
import Import from '../../assets/Import';
import Save from '../../assets/Save';
import SavetoKit from '../../assets/Savetokit';
import ConvertToLanguagePopup,{Connectivity} from '@renderer/components/supporting/Popups';
interface TopBarProps {
    projectName: string;
    setProjectName: (name: string) => void;
    handleNewFileCreation: () => void;
    handleImport: () => void;
    handleSave: () => void;
    saveToKit: () => void;
    selectedKit: string;
    setShowKits: React.Dispatch<React.SetStateAction<boolean>>;
    kitsButtonRef: React.RefObject<HTMLDivElement>;
    showPopup: boolean;
    onPopupClose: () => void;
    selectedLanguage: string;
  }

  const navigate = useNavigate();

  const loadsamples = () => {
    navigate("/samples"); // navigate to SamplePage
  };
  const TopBar: React.FC<TopBarProps> = ({
    projectName,
    setProjectName,
    handleNewFileCreation,
    handleImport,
    handleSave,
    saveToKit,
    selectedKit,
    setShowKits,
    kitsButtonRef,
    showPopup,
    onPopupClose,
    selectedLanguage,
  }) => {
      

    return (
      <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col flex-shrink-0 min-w-0">
            {/* Project Name box ABOVE icons */}
          <div className="w-[120px] h-[25px] bg-white border border-black rounded-[4px] mb-[1px] flex items-center justify-center ml-[68px]">
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full h-full  text-black font-semibold text-sm bg-transparent outline-none"/>
          </div>
              <div className="flex items-center gap-2 flex-wrap  max-w-full">
                <Back className="w-[60px] h-[60px] cursor-pointer" onClick={() => navigate('/')} />
                <button onClick={handleNewFileCreation} className="group relative flex items-center">
                  <New className="w-[50px] h-[50px] cursor-pointer" />
                  <span className="absolute top-[90%] left-4 mt-2 px-2 py-1 text-xs text-black bg-white rounded font-bold border-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    New
                  </span>
                </button>
      
                <button onClick={handleImport} className="group relative">
                  <Import className="w-[50px] h-[50px] cursor-pointer" />
                  <span className="absolute  top-[90%] left-4  mt-2  px-2 py-1 text-xs text-black bg-white rounded font-bold border-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Import
                  </span>
                </button>
                <button onClick={handleSave} className="group relative">
                  <Save className="w-[50px] h-[50px] cursor-pointer" />
                  <span className="absolute  top-[90%] left-4  mt-2  px-2 py-1 text-xs text-black bg-white rounded font-bold border-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Save
                  </span>
                </button>
                <button  className="group relative" onClick={saveToKit}>
                  <SavetoKit className="w-[50px] h-[50px] cursor-pointer"/>
                  <span className="absolute  top-[90%] left-4  mt-2  px-2 py-1 text-xs text-black bg-white rounded font-bold border-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Save to Kit
                  </span>
                  </button>
                  <Book className="w-[50px] h-[50px] cursor-pointer" />
                  <span className="absolute  top-[90%] left-4  mt-2  px-2 py-1 text-xs text-black bg-white rounded font-bold border-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Book
                  </span>
                <button  className="group relative" onClick={loadsamples}>
                  <SavetoKit className="w-[50px] h-[50px] cursor-pointer"/>
                  <span className="absolute  top-[90%] left-4  mt-2  px-2 py-1 text-xs text-black bg-white rounded font-bold border-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Samples
                  </span>
                </button>
                </div>
              </div>
                        {/* Center black box showing selected kit */}
                        <div className="flex-shrink-0 flex items-center justify-center w-[180px] h-[45px] bg-black  border-[2px] border-white shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                                    ref={kitsButtonRef}
                                    onClick={() => setShowKits((prev) => !prev)}                  
                        >
                        <span className="text-white text-lg font-bold tracking-wide uppercase">
          {selectedKit || "No Kit"}
        </span>
      </div>
              <ConvertToLanguagePopup show={showPopup} onClose={() => setShowPopup(false)} language={selectedLanguage}/>
              <div className="flex items-center gap-2 flex-shrink-0">
              <div className="group relative flex items-center space-x-2">
        {mode !== 'Wireless' && (
          <div
            className={`bg-black rounded-[8px] flex items-center justify-center transition-all duration-300 ${
              activeIcon === 'usb' || isConnected ? 'w-[50px] h-[50px]' : 'w-[175px] h-[48px]'
            }`}
          >
            {/* USB Icon */}
            <div className="pl-2 pr-2">
              <Usb
                isConnected={isConnected}
                className={`w-[20px] h-[35px] cursor-pointer ${
                  isSerialOpen ? 'text-green-400' : ''
                }`}
                onClick={() => {
                  if (isConnected) {
                    // Case 1: If connected → disconnect and expand
                    dispatch(disconnectSerial());
                    //dispatch(setMode());
                    setActiveIcon('none');
                    dispatch(setSelectedComPort(null)); // <-- ADD THIS LINE
                    console.log('Disconnected from serial');
                    console.log("Mode : ",mode)
                    console.log("Connection status :" ,isConnected)
                    console.log("Last Mode : ",lastMode)
                  
                  } 
                  else if (!isConnected && selectedPort) {
                    // Case 2: If disconnected but port exists → connect again
                    dispatch(connectSerial(selectedPort))
                      .then(() => {
                        dispatch(setConnected()); // Set isConnected = true
                          dispatch(setConnectionMode('Wired')); // Confirm mode and lastMode
                        console.log('Reconnected to serial');
                        setActiveIcon('usb'); // shrink and show comport selector
                        setTimeout(() => {
                          sendSerialMessage({ msg: 'usbconn' });
                          console.log('usbconn message sent after reconnect');
                        }, 2000);
                      })
                      .catch(err => console.error('Reconnect failed:', err));
                  } 
                  else if (activeIcon === 'usb') {
                    // Case 3: If selector is open but not connected → just close
                    setActiveIcon('none');
                  } 
                  else {
                    // Case 4: Default → shrink and show comport selector
                    dispatch(setConnectionMode('Wired'));
                    setActiveIcon('usb');
                  }
                }}        
              />
            </div>
      
            {/* Center + Wireless */}
            {activeIcon === 'none' && !isConnected && (
              <>
                <div className="ml-auto mr-auto">
                  <Wiredicon className="w-[40px] h-[40px] cursor-pointer" />
                </div>
                <div className="pr-3">
                  <Wirelessicon
                    className="w-[35px] h-[25px] cursor-pointer"
                    onClick={() => {
                      dispatch(setConnectionMode('Wireless'))
                      const ws = getWebSocket();
                      if (!ws || ws.readyState !== WebSocket.OPEN) {
                        dispatch(connectWebSocket());
                        console.log('Trying to connect WebSocket...');  
                      }
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      
        {/* Show USB port selector when active */}
        {(activeIcon === 'usb' && mode === 'Wired')  && (<ComportSelector isConnected={isConnected}/>)}
        <span className="absolute top-[90%] left-4 mt-2 px-2 py-1 text-black bg-white rounded font-bold border-black text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Connect
        </span>
      </div>
      <Connectivity/>
      
      
                {/* Group 2: Wireless Connected (outside black box) */}
                {mode == "Wireless" && (
                  <div className="group relative">
                    <Wirelessconnected
                      className="w-[50px] h-[46px] cursor-pointer"
                      status = {status}
                      onClick={() => {
                        dispatch(setConnectionMode('Wireless')); // user clicked → sets mode
                        const ws = getWebSocket()
                        if (ws && ws.readyState === WebSocket.OPEN) {
                          ws.close(); // closes the websocket connection
                          dispatch(setDisconnected());  
                          console.log("WebSocket disconnected manually.");
                        }
                        dispatch(setMode());
                        //dispatch(setConnectionMode('Wireless'))
                        dispatch(setDisconnected());     // Redux: isConnected = false, mode reset
                        setActiveIcon('none');           // UI: go back to default black bg with icons
                      }
                      }
                    />
                    <span className="absolute top-[90%] left-4 mt-2 px-2 py-1 text-black bg-white rounded font-bold border-black text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Disconnect
                    </span>
                  </div>
                )}
      
                <div className="group relative">
                  <Games className="w-[50px] h-[50px] cursor-pointer" />
                  <span className="absolute  top-[90%] left-4  mt-2  px-2 py-1 text-black bg-white rounded font-bold border-black text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Controls
                  </span>
                </div>
                <div
                  ref={kitsButtonRef}
                  onClick={() => setShowKits((prev) => !prev)}
                  className="group relative"
                >
                  <Kits className="w-[50px] h-[50px]" />
                  <span className="absolute  top-[90%] left-2  mt-2  px-2 py-1 text-black bg-white rounded font-bold border-black text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Kit Selection
                  </span>
                </div>
                <div className="group relative">
                  <Settings className="w-[50px] h-[50px]" />
                  <span className="absolute  top-[90%] right-1  mt-2  px-2 py-1 text-black bg-white rounded font-bold border-black text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Settings
                  </span>
                </div>
              </div>
            </div>
    );
  };
  
  export default TopBar;
  
