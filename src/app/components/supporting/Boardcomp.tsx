import { useSelector } from "react-redux";
import type { RootState } from '../../../../store/index';
import snowflake from '../../assets/Snowflake.svg'
import subo from '../../assets/Subu'
import cayo from '../../assets/Cayo.svg'
import { useState,useEffect } from "react";
import { FiEdit2 } from "react-icons/fi";

declare global {
  interface window {
    api?: {
      getWifiName: () => Promise<string | null>;
    };
  }
}



export default function BoardInfo() {
  const themeMode = useSelector((state: any) => state.theme.mode);
  const selectedKit = useSelector((state: RootState) => state.kits.kit);

  const [wifiName, setWifiName] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const {mode,isConnected, version } = useSelector(
    (state: RootState) => state.websocketSlice
  );

  const textcolor = themeMode === "dark" ? "text-white" : "text-black";
  const bg = themeMode === "dark" ? "#3A3A3A" : "#D6D6D6";

  const kitMap: Record<string, React.ElementType> = {
    snowflake,
    subo,
    cayo,
  };

  const BoardIcon = kitMap[selectedKit];
  const modecard = window.localStorage.getItem("modecard");
  const isPython = modecard === "python";
  
  /* ---------------- WIFI FETCH ---------------- */
    useEffect(() => {
    const fetchWifi = async () => {
      try {
        const wifi = await window.api?.getWifiName();
        setWifiName(wifi || null);
      } catch (err) {
        console.error("Failed to get WiFi:", err);
      }
    };

    fetchWifi();
  }, []);

  useEffect(() => {
    if (wifiName) setName(wifiName);
  }, [wifiName]);

  /* ---------------- RENAME ---------------- */
 useEffect(() => {
    (window as any).appTheme = themeMode;
  }, [themeMode]);
  
  const handleRename = async () => {
    const data = { ssid: name };

    try {
      await fetch("http://192.168.4.1/rename", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Rename error:", error);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col w-full">
      <h2 className={`text-lg font-semibold ${textcolor}`}>
        About Board
      </h2>
  
      {!isConnected ? (
        <div className="flex items-center justify-center h-24 mt-32">
          <div className={`text-xl font-bold text-center ${textcolor}`}>
            Connect a Board
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full mt-4">
          {/* Main layout container */}
          <div className="flex flex-row items-start justify-between w-full">
            
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Board Icon */}
              <div className="w-26 h-26 bg-white border-[3px] border-black rounded-md flex items-center justify-center shrink-0">
                {BoardIcon && (
                  <BoardIcon className="w-14 h-14 object-contain" />
                )}
              </div>
  
              {/* Board Info Column 
                  - If Wireless: use justify-between to span the h-26
                  - If Wired: use flex-start with a fixed gap to keep text close
              */}
              <div className={`flex flex-col h-26 flex-1 min-w-0 py-1 ${!isPython && mode === "Wireless"
                         ? "justify-between": "justify-start gap-2"}`}>
                
                {/* Top Group: Name and Version stay together in Wired mode */}
                <div className="flex flex-col gap-2">
                  {/* 1. Kit Name */}
                  <div className={`text-2xl font-bold uppercase leading-none truncate ${textcolor}`}>
                    {selectedKit}
                  </div>
  
                  {/* 2. Version */}
                  {!isPython && (
                  <div className={`text-[14px] font-extralight leading-none ${textcolor}`}>
                    Version - {version}
                   </div>
                   )}
                </div>
  
                {/* 3. Board Name Input - Only exists in Wireless */}
                {!isPython && mode === "Wireless" && (                 
                   <div className="flex items-center justify-between px-3 rounded-md w-full max-w-[320px]"
                    style={{
                      height: "34px",
                      background: bg,
                    }}
                  >
                    <input
                      value={name}
                      disabled={!isEditing}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRename();
                          setIsEditing(false);
                        }
                      }}
                      className={`bg-transparent outline-none w-full text-sm font-medium ${textcolor}`}
                    />
                    <FiEdit2
                      className="ml-2 shrink-0 cursor-pointer text-black/70"
                      size={14}
                      onClick={() => setIsEditing(prev => !prev)}
                    />
                  </div>
                )}
              </div>
            </div>
  
            {/* STATUS BADGE */}
            <div className="shrink-0 pt-1">
               <div className="bg-[#2EED08] text-black text-[12px] font-bold px-2 py-1 uppercase whitespace-nowrap rounded-sm border border-black/10">
               {isPython ? "Connected" : `Connected with ${mode === "Wireless" ? "Wi-Fi" : "USB"}`}               
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
