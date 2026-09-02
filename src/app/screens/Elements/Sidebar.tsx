import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/index';
import Basic from '../../assets/Basic';
import Input from '../../assets/Input';
import Loop from '../../assets/Loop';
import Logic from '../../assets/Logicicon';
import IO from '../../assets/IOicon';
import Variable from '../../assets/Variableicon';
import Sensor from '../../assets/Sensoricon';
import Maths from '../../assets/Mathicon';
import AddBlock from '../../assets/Addblock';
import Crawler from '../../assets/Crawler';
import Walker from '../../assets/Walker';
import Gripper from '../../assets/Gripper';
import Display from '../../assets/Displayicon';
import WHEELZ from '../../assets/Wheelz'
import Rekkaicon from '../../assets/Rekka';
import Playmoicon from '../../assets/Playmo';
import AIIcon from '../../assets/AIIcon';
interface SidebarProps {
  selectedIcon: string;
  handleIconClick: (label: string) => void;
  setBlocklyVisible: (visible: boolean) => void;
  themeMode: string;
  istoolboxVisible: boolean;
  setShowaddBlock: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedIcon,
  handleIconClick,
  setBlocklyVisible,
  themeMode,
  istoolboxVisible,
  setShowaddBlock
}) => {   
  const selectedKit = useSelector((state: RootState) => state.kits.kit);
  const selectedCategory = useSelector(
    (state: RootState) => state.kits.category
  );
  var isRekka = false;
  if (selectedKit == "rekka") {
    isRekka = true;
  }
  const bgColor = themeMode === 'dark' ? 'black' : '#EAEAEA'
  const bgText = themeMode === 'dark' ? 'white' : 'black'
  const baseIconData = [
    { icon: Basic, label: 'BASIC', color: '#8726F6' },
    { icon: Loop, label: 'LOOP', color: '#1ECE21' },
    { icon: Logic, label: 'LOGIC', color: '#FF0CD2' },
    { icon: IO, label: 'PINS', color: '#B515D8' },
    { icon: Maths, label: 'MATH', color: '#2FADE7' },
    { icon: Variable, label: 'VARIABLE', color: '#FF2C11' },
    { icon: Sensor, label: 'SENSOR', color: '#9F7826' },
    { icon: Input, label: 'ACTUATORS', color: '#4787FF' },
    { icon: Display, label: 'DISPLAY', color: '#FF12A0' },
    { icon: Rekkaicon, label: 'REKKA', color: '#4787FF'},
  ];

  const addBlockIcon = [{ icon: AddBlock, label: 'ADD BLOCKS', color: '#8726F6' }];

  const trixIcons = [
    { icon: Gripper, label: 'GRIPPER', color: '#19BCCF' },
    { icon: Walker, label: 'WALKER', color: '#19BCCF' },
    { icon: Crawler, label: 'CRAWLER', color: '#CF196B' },
  ];

  const WHEELZIcons = [
    { icon: WHEELZ, label: 'GAADI', color: '#4787FF' },
  ];

  const DroneIcons = [
    { icon: WHEELZ, label: 'DRONE', color: '#4787FF' },
  ];
  const PlayMO = [
    {icon:Playmoicon, label:'PLAYMO',color: '#19BCCF'},
  ]
  const iconData = useMemo(() => {
    let filteredBaseIcons = baseIconData;
  
    // Remove DISPLAY for snowflake kit
    if (selectedKit === 'snowflake') {
      filteredBaseIcons = filteredBaseIcons.filter(item => item.label !== 'DISPLAY');
    }
    if (selectedKit === 'rekka') {
      filteredBaseIcons = filteredBaseIcons.filter(
        item => item.label !== 'DISPLAY' && item.label !== 'ACTUATORS'
      );
    }
    // Show REKKA only when kit is rekka
    if (selectedKit !== 'rekka') {
      filteredBaseIcons = filteredBaseIcons.filter(item => item.label !== 'REKKA');
    }
  
    // 🔹 TRIX mode
    const selectedTrixIcon = trixIcons.find(
      (item) => item.label.toLowerCase() === selectedCategory?.trim().toLowerCase()
    );
    
    if (selectedTrixIcon) {
      return [
        ...filteredBaseIcons,
        selectedTrixIcon,
        ...addBlockIcon,
      ];
    }
  
    // 🔹 WHEELZ mode
    if (selectedCategory === 'gaadi') {
      return [...filteredBaseIcons, ...WHEELZIcons, ...addBlockIcon];
    }
  
    if (selectedCategory === 'playmo') {
      return [...filteredBaseIcons, ...PlayMO, ...addBlockIcon];
    }
  
    if (selectedCategory === 'Drone') {
      return [...filteredBaseIcons, ...DroneIcons, ...addBlockIcon];
    }
  
    // 🔹 Normal mode
    return [...filteredBaseIcons, ...addBlockIcon];
  
  }, [selectedKit, selectedCategory]);


  const iconCount = iconData.filter(
    item => item.label !== 'ADD BLOCKS'
  ).length;

  const sidebarSize = useMemo(() => {
    if (selectedKit === 'snowflake') {
      return {
        width: '16vw',
        minWidth: '150px',
        maxWidth: '190px',

        height: `${Math.min(iconCount * 60 + 60, 380)}px`,
        minHeight: '300px',
        maxHeight: '400px',
      };
    }

    // default for subo / trix
    return {
      width: '14vw',
      minWidth: '160px',
      maxWidth: '220px',

      height: '55vh',
      minHeight: '320px',
      maxHeight: '480px',
    };
  }, [selectedKit, iconCount]);

  return (
    <div className='relative'>
      {/* TRANSPARENT BAR */}
      <div
        className="rounded-[12px] shadow-lg mx-2 my-2 flex flex-col overflow-hidden z-[50]"
        style={{
          background: bgColor,
          width: sidebarSize.width,
          minWidth: sidebarSize.minWidth,
          maxWidth: sidebarSize.maxWidth,
          height: sidebarSize.height,
          minHeight: sidebarSize.minHeight,
          maxHeight: sidebarSize.maxHeight,
        }}
      >
        <div className="overflow-y-auto flex-grow custom-scrollbar">
          <div className="flex flex-col  px-3 py-3">
            {iconData
              .filter(item => item.label !== 'ADD BLOCKS')
              .map((item, idx) => {
                const isSelected = selectedIcon === item.label;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      handleIconClick(item.label);
                      setBlocklyVisible(true);
                    }}
                    className="group flex items-center gap-1 px-2 py-1 rounded-[8px] cursor-pointer transition-colors"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${item.color}50`; // 50%
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <item.icon
                      isSelected={isSelected}
                      className="w-[36px] h-[36px] rounded-[6px] "
                      themeMode={themeMode}
                    />

                    <span
                      className="text-sm font-bold leading-none whitespace-nowrap transition-colors"
                      style={{ color: bgText }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}

          </div>
        </div>
      </div>
      {!isRekka && selectedKit && selectedKit !== "Default" && (
  <button
    onClick={() => setShowaddBlock((prev) => !prev)}
    className="absolute left-1 flex items-center gap-1
      px-2 py-1 rounded-[8px] cursor-pointer
      transition-colors group"
  >
    <AddBlock className="w-[48px] h-[48px]" />
  </button>
)}
    </div>
  );

};

export default Sidebar;
