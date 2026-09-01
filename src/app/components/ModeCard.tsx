"use client";

import Image from "next/image";
import { useState } from 'react'
import { useRouter } from "next/navigation";
import { useAppSelector } from '../../../store/hooks'



interface ModeCardProps {
  onClick?: () => void
  mode: 'code' | 'ai box' | 'games' | null
  image: string
  text: string
  linkto?: string
}

export default function ModeCard({ onClick, mode, image, text, linkto }: ModeCardProps) {
  const [hovered, setHovered] = useState(false)
  const router = useRouter();
  const themeMode = useAppSelector((state) => state.theme.mode)

  const imageSrc = `/icons/misc/${image}_${
    hovered
      ? themeMode === "dark"
        ? "light"
        : "dark"
      : themeMode === "dark"
      ? "dark"
      : "light"
  }.svg`;


  const handleClick = () => {
    // Record which card was used; actual board mode changes are handled by the
    // route-driven BoardModeManager (this page only navigates).
    if (mode === 'code') {
      window.localStorage.setItem("modecard", image);
    }

    if (linkto) {
      router.push(`${linkto}${linkto === "blockly" ? "?showModal=true" : ""}`);
    }

    onClick?.();
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex flex-col justify-between items-center px-8 py-10 border-8  rounded-xl hover:bg-black text-black dark:text-white hover:text-white transition-colors duration-300 cursor-pointer min-h-75 min-w-60`}
    >
      <div className="grow flex items-center justify-center">
        <Image
          className={`object-contain transition-all duration-300 ${hovered ? 'w-36 h-36' : 'w-32 h-28'}`}
          src={imageSrc}
          alt={`${mode} icon`}
          width={128}
          height={128}
          priority={false}
        />
      </div>
      <div className="mt-4">
        <h1 className="text-2xl font-black text-center">{text}</h1>
      </div>
    </div>
  )
}
