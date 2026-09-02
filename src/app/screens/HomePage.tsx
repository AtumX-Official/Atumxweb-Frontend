"use client";

/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { useDispatch, useSelector } from "react-redux";
import { useState, Suspense } from "react";

import { setMode } from "../../../store/modeSlice";

import "../assets/css/homepage.css";

import BackgroundImg from "../assets/Background.svg?url";
import Backgrounddark from "../assets/Backgrounddark.svg?url";
import Header from "../components/Header";
import ModeCard from "../components/ModeCard";
import ModeSwitch from "../components/ModeSwitch";
import Navbar from "../components/Navbar";
import ResetPopupHandler from "../components/ResetPopHandler";
import '../assets/main.css'
import {
  UnderdevelopmentPopup,
  PressResetPopup,
} from "../components/supporting/Popups";

type Mode = "code" | "ai box" | "games";

export default function HomePage() {
  const dispatch = useDispatch();

  const mode = useSelector((state: { mode: Mode }) => state.mode);

  const themeMode = useSelector(
    (state: { theme: { mode: "light" | "dark" } }) => state.theme.mode
  );

  const [pressResetOpen, setPressResetOpen] = useState(false);
  const [showUnderDev, setShowUnderDev] = useState(false)

  /* -------------------- Handlers -------------------- */

  const handleModeChange = (newMode: Mode) => {
    if(newMode === "games"){
      setShowUnderDev(true)
      return
    }
    dispatch(setMode(newMode))
  }

  const handlePressResetOk = () => {
    setPressResetOpen(false);
  };

  /* -------------------- Styles -------------------- */

  const bgColor =
    themeMode === "dark"
      ? "bg-black"
      : mode === "code"
      ? "bg-[#2EED08]"
      : mode === "ai box"
      ? "bg-[#36D3FF]"
      : mode === "games"
      ? "bg-[#FF8800]"
      : "bg-white";

  /* -------------------- Render Helpers -------------------- */

  const renderContent = () => {
    switch (mode) {
      case "code":
        return (
          <div className="grid grid-cols-3 gap-12">
            <ModeCard
              mode={mode}
              linkto="blocks"
              image="blocks"
              text="BLOCKS"
            />
            <ModeCard
              mode={mode}
              image="python"
              text="PYTHON"
              onClick={() => setShowUnderDev(true)} 
            />
            <ModeCard
              mode={mode}
              image="cpp"
              text="C++"
              onClick={() => setShowUnderDev(true)} 
            />
          </div>
        );

      case "ai box":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto justify-center">
            {/* Will this bloacks component come here ? */}
            <ModeCard
              mode={mode}
              linkto="Mainlayout"
              image="blocks"
              text="BLOCKS"
            />
            <ModeCard
              mode={mode}
              linkto="ai"
              image="gesture"
              text="HAND GESTURE"
            />
            <ModeCard
              mode={mode}
              linkto="pose"
              image="pose"
              text="POSE DETECTION"
            />
            <ModeCard
              mode={mode}
              linkto="audio"
              image="audio"
              text="AUDIO CLASSIFIER"
            />
          </div>
        );

      case "games":
        return (
          <div className="grid grid-cols-1 gap-12 max-w-sm mx-auto">
            <ModeCard
              mode={mode}
              linkto="gamelib"
              image="python"
              text="GAME LIBRARY"
            />
          </div>
        );

      default:
        return null;
    }
  };

  /* -------------------- JSX -------------------- */

  return (
    <>
      <Suspense fallback={null}>
        <ResetPopupHandler onTrigger={() => setPressResetOpen(true)} />
      </Suspense>

      <div
        className={`${bgColor} h-screen w-screen flex flex-col relative overflow-hidden`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {themeMode === "dark" ? (
            <div
              className="absolute -inset-[3836px] animate-moving-bg-gpu opacity-70 will-change-transform"
              style={{
                backgroundImage: `url(${Backgrounddark})`,
                backgroundSize: "auto",
                backgroundRepeat: "repeat",
              }}
            />
          ) : (
            <div
              className="absolute -inset-[1960px] animate-moving-bg-gpu opacity-30 will-change-transform"
              style={{
                backgroundImage: `url(${BackgroundImg})`,
                backgroundSize: "980px 980px",
                backgroundRepeat: "repeat",
              }}
            />
          )}
        </div>

        <Navbar mode={mode} />

        <div className="flex flex-col items-center justify-center flex-1 gap-10 px-8 lg:px-24 pt-8 pb-12 relative z-20">
          {renderContent()}
          <ModeSwitch mode={mode} setMode={handleModeChange} />
        </div>
      </div>
      {showUnderDev && (
        <UnderdevelopmentPopup onNo={() => setShowUnderDev(false)} />
      )}
      <PressResetPopup
        open={pressResetOpen}
        onOk={handlePressResetOk}
      />
    </>
  );
}