"use client"
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../../store/index';
import { setSelectedComPort } from '../../../../../store/comPortSlice';
import { disconnectSerial, sendSerialMessage, connectSerial } from '../../../../../store/serialSlice';
import SerialService from "../../../services/Serialservice";
import Back from '../../../assets/Blockback';
import New from '../../../assets/Edit';
import Import from '../../../assets/Import';
import Save from '../../../assets/Save';
import SavetoKit from '../../../assets/Savetokit';
import Book from '../../../assets/Files'
import { Tooltip } from '../../../components/Tooltip';
type SaveMode = "save" | "saveAs";

interface TopLeftBarProps {
  handleNewFileCreation: (unsavedChanges: boolean) => void;
  unsavedChanges: boolean;
  handleImport: () => void;
  handleSave: (savemode: SaveMode) => void;
  saveToKit: (action?: "save" | "clear") => void;  
  selectedKit?: string;
  setShowKits?: React.Dispatch<React.SetStateAction<boolean>>;
  kitsButtonRef?: React.RefObject<HTMLDivElement>;
  showPopup?: boolean;
  onPopupClose?: () => void;
  selectedLanguage?: string;
  handleLanguageClick: (language: string) => void;
  handleExitApp: () => void;
  onOpenPDF: () => void;
  runstatus?: any;
  animalMode: "Gripper" | "Walker" | "Crawler";
  setAnimalMode: React.Dispatch<React.SetStateAction<"Gripper" | "Walker" | "Crawler">>;
  selectedCategory: string;
}

const TopLeftBar: React.FC<TopLeftBarProps> = ({
  handleNewFileCreation,
  unsavedChanges,
  handleImport,
  handleSave,
  saveToKit,
  handleLanguageClick,
  selectedLanguage,
  handleExitApp,
  onOpenPDF,
  runstatus,
  animalMode,
  setAnimalMode,
  selectedCategory
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>()
  const { isConnected } = useSelector((state: RootState) => state.websocketSlice);
  const selectedKit = useSelector((state: RootState) => state.kits.kit)
  const handleBookfunction = () =>
    selectedKit === 'subo' ? onOpenPDF() : handleLanguageClick('None');
  const [menu, setMenu] = useState<"save" | "kit" | null>(null);
      const [activeItem, setActiveItem] = useState<string | null>(null);
  const themeMode = useSelector((state: any) => state.theme.mode)
  const bgColor = themeMode === 'dark' ? 'bg-[#000000]' : 'bg-[#D6D6D6]'
  const bgtext = themeMode === 'dark' ? 'text-white' : 'text-black'
  const hoverbg = themeMode === 'dark'? 'hover:bg-[#3A3A3A]': 'hover:bg-[#F0F0F0]';
  const clickbg = themeMode === 'dark' ? 'bg-[#29CB09]' : 'bg-[#2EED08]'
  const menuItemClass = (item: string) =>
    `flex items-center px-2 py-1 rounded-md cursor-pointer transition-colors
     ${
       activeItem === item
         ? ` ${bgtext} ml-2 mr-2 mt-1 mb-1 font-bold`
         : `${hoverbg} ${bgtext} ml-2 mr-2 mt-1 mb-1 font-bold`
     }`;
     useEffect(() => {
      const handler = () => setMenu(null);
      window.addEventListener("click", handler);
      return () => window.removeEventListener("click", handler);
    }, []);
  return (
    
    <div className="flex flex-col flex-shrink-0 min-w-0 relative overflow-visible z-50">
      {/* Project Name box ABOVE icons */}

      <div className="flex items-center gap-2 flex-wrap max-w-full ">
        <button className="group relative hover:scale-110 transition-transform duration-200">
          <Back className="w-[60px] h-[60px] cursor-pointer " onClick={() => {    
                
            handleExitApp()
            if (runstatus === "Start" && isConnected) {
              dispatch(disconnectSerial());
              dispatch(setSelectedComPort(null));
              console.log("Disconnected from serial");
            }
                  }} />
          <Tooltip text="Back" />
        </button>
        <button onClick={() => handleNewFileCreation(unsavedChanges)}
          className="group relative hover:scale-110 transition-transform duration-200 flex items-center">
          <New className="lg:w-[50px] lg:h-[50px]  cursor-pointer" />
          <Tooltip text='New' />
        </button>

        <button onClick={handleImport} className="group relative hover:scale-110 transition-transform duration-200 ">
          <Import className="lg:w-[50px] lg:h-[50px]  cursor-pointer" />
          <Tooltip text="Import" />
        </button>
        <button
  onClick={(e) => {
    e.stopPropagation();
    setMenu(menu === "save" ? null : "save");
  }}
  className="group relative hover:scale-110 transition-transform duration-200"
>
  <Save className="lg:w-[50px] lg:h-[50px] cursor-pointer" />
  <Tooltip text="Save" />

  {menu === "save" && (
    <div className={`absolute top-full left-1/2 -translate-x-1/4 mt-2 w-30 rounded-lg ${bgColor} shadow-lg z-50`}>
      <div
        className={menuItemClass("save")}
        onClick={() => {
          setActiveItem("save");
          handleSave("save");
          setMenu(null);
          setActiveItem(null);
        }}
      >
        Save
      </div>
      <div
        className={menuItemClass("saveAs")}
        onClick={() => {
          setActiveItem("saveAs");
          handleSave("saveAs");
          setMenu(null);
          setActiveItem(null);
        }}
      >
        Save As
      </div>
    </div>
  )}
</button>

<button
  className="group relative hover:scale-110 transition-transform duration-200"
  onClick={(e) => {
    e.stopPropagation();
    setMenu(menu === "kit" ? null : "kit");
  }}
>
  <SavetoKit className="lg:w-[50px] lg:h-[50px] cursor-pointer" />
  <Tooltip text="Save to Kit" />

  {menu === "kit" && (
    <div className={`absolute top-full left-1/2 -translate-x-1/4 mt-2 w-32 rounded-lg ${bgColor} shadow-lg z-50`}>
      <div
        className={menuItemClass("save")}
        onClick={() => {
          setActiveItem("save");
          saveToKit("save");
          setMenu(null);
          setActiveItem(null);
        }}
      >
        Save to Kit
      </div>
      <div
        className={menuItemClass("clear")}
        onClick={() => {
          setActiveItem("clear");
          saveToKit("clear");
          setMenu(null);
          setActiveItem(null);
        }}
      >
        Clear the Kit
      </div>
    </div>
  )}
</button>
        {/* <button className="group relative hover:scale-110 transition-transform duration-200" onClick={handleBookfunction}
        >
          <Book className="lg:w-[50px] lg:h-[50px] cursor-pointer "
          />
          <Tooltip text="Book" />
        </button> */}
      </div>

    </div>
  )
}

export default TopLeftBar