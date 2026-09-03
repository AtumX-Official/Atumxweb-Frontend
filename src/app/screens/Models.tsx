"use client";
import React, { useRef, useEffect } from 'react'
import Subu from '../assets/Subu';
import Wheels from '../assets/Wheels'
import Rekka from '../assets/Rekkamodel'
import Playmomodel from '../assets/Playmomodel'
import { useDispatch, useSelector } from 'react-redux'
import { setKit, setCategory } from '../../../store/kitslice'
import type { RootState } from '../../../store'
import Gripper from '../assets/Gripperimg'
import Walker from '../assets/Walkerimg'
import Crawler from '../assets/Crawlerimg'
import BackgroundImg from "../assets/Background.svg?url"

const Models: React.FC = () => {
  const dispatch = useDispatch()
  const activeModel = useSelector((state: RootState) => state.kits.kit)
  const models = [
    // { id: "cayo", label: "CAYO", Icon: Cayo },
    // { id: "snowflake", label: "SNOWFLAKE", Icon: Snowflake },
    { id: "subo", label: "SUBO", Icon: Subu },
    { id: "rekka", label: "REKKA", Icon: Rekka },
  ]

  const handleKitClick = (id: string) => {
    if (activeModel === id) {
      dispatch(setKit("Default"));
    } else {
      dispatch(setKit(id));
    }
  
    dispatch(setCategory(null));
  };

  return (
    <>
      <div onClick={(e) => e.stopPropagation()}>

        {/* SHADOW WRAPPER */}
        <div
          className="mt-8 mb-8"
          style={{
            filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.18))",
          }}
        >
          {/* ROUNDED RECT */}
          <div className="relative w-[700px] h-[520px] rounded-[40px] overflow-hidden bg-[#EAEAEA]">


            {/* MASKED SVG BACKGROUND */}
            <div
              className="absolute inset-0 z-10 animate-moving-bg bg-repeat bg-center bg-contain pointer-events-none opacity-30"
              style={{
                backgroundImage: `url(${BackgroundImg})`,
              }}
            />


            {/* CONTENT */}
            <div className="relative z-10 p-6 h-full">

              <div className="p-4 grid grid-cols-3 gap-x-6 gap-y-4">
                {models.map(({ id, label, Icon }) => {
                  const isActive = activeModel === id

                  return (
                    <div
                      key={id}
                      onClick={() => handleKitClick(id)}
                      className={`
                        cursor-pointer transition-all duration-200
                        rounded-2xl border-4
    px-1 pt-1 pb-2
                        ${isActive
                          ? "bg-[#2EED08] opacity-100 border-[#2EED08]"
                          : "bg-black opacity-70 hover:opacity-100 border-black"
                        }
                      `}
                    >

                      {/* White icon area */}
                      <div className="bg-white rounded-xl flex items-center justify-center h-[180px]">
                        <Icon className="w-[140px] h-[140px] hover:scale-110 transition-transform" />
                      </div>

                      {/* Label */}
                      <div className="mt-2 text-center font-bold tracking-wide text-white text-sm">
                        {label}
                      </div>
                    </div>
                  )
                })}
                <p className="font-nunito font-bold text-[23px] tracking-normal absolute top-[65%] left-[38%] opacity-80">Select your board</p>

              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default Models
interface TopLeftBarProps {
  handleLanguageClick: (language: string) => void;
}

export const AddBlocks: React.FC<TopLeftBarProps> = ({
  handleLanguageClick
}) => {
  const dispatch = useDispatch();
  const { kit } = useSelector((state: RootState) => state.kits);
  const activeModel = useSelector((state: RootState) => state.kits.category);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (kit?.toLowerCase() === "snowflake" && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      handleLanguageClick("None");
    }
  }, [kit, handleLanguageClick]);

  const allModels = [
    { id: "gaadi", label: "GAADI", Icon: Wheels },
    { id: "playmo", label: "PLAYMO", Icon: Playmomodel },
    { id: "gripper", label: 'GRIPPER', Icon: Gripper },
    { id: "walker", label: 'WALKER', Icon: Walker },
    { id: "crawler", label: 'CRAWLER', Icon: Crawler }
  ];

  // Filter for kits like CAYO
  const filteredModels =
    kit?.toLowerCase() === "cayo"
      ? allModels.filter(m => m.id === "trix")
      : allModels;

  // 🛑 HARD STOP: Snowflake → ONLY UnderDev popup
  if (kit?.toLowerCase() === "snowflake") {
    dispatch(setCategory("null"))
    return null;
  }

  const handleKitClick = (id: string) => {
    if (activeModel === id) {
      dispatch(setCategory(null));
    } else {
    dispatch(setCategory(id));
    }
  };


  // ✅ Normal modal ONLY for non-snowflake kits
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[100px] bg-black/50 backdrop-blur-sm">
      <div
        className="mt-8 mb-8"
        style={{ filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.18))" }}
      >
        <div className="relative w-[700px] h-[520px] rounded-[40px] overflow-hidden bg-[#EAEAEA]">
          <div
            className="absolute inset-0 z-10 animate-moving-bg bg-repeat bg-center bg-contain pointer-events-none opacity-30"
            style={{
              backgroundImage: `url(${BackgroundImg})`,
            }}
          />


          <div className="relative z-10 p-3 h-full">
            <div className="p-4 grid grid-cols-3 gap-6">
              {filteredModels.map(({ id, label, Icon }) => {
                const isActive = activeModel === id;

                return (
                  <div
                    key={id}
                    onClick={() => handleKitClick(id)}
                    className={`
                      cursor-pointer transition-all duration-200
                      rounded-2xl border-4 px-1 pt-1 pb-2
                      ${isActive
                        ? "bg-[#2EED08] opacity-100 border-[#2EED08]"
                        : "bg-black opacity-70 hover:opacity-100 border-black"
                      }
                    `}
                  >
                    <div className="bg-white rounded-xl flex items-center justify-center h-[180px]">
                      <Icon className="w-[140px] h-[140px] hover:scale-110 transition-transform" />
                    </div>
                    <div className="mt-2 text-center font-bold tracking-wide text-white text-sm">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
