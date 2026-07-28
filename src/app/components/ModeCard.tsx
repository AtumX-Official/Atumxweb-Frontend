"use client";

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppSelector } from '../../../store/hooks'



interface ModeCardProps {
  onClick?: () => void
  mode: 'code' | 'ai box' | 'games' | null
  image: string
  text: string
  linkto?: string
}

interface PortInfo {
  port: string
  board: string
  mode: string
}

const BLOCKLY_USB_IDS = ['303a:1001', '2e8a:000a']
const PYTHON_USB_IDS = ['303a:817a', '2e8a:0005']

async function detectBoardMode(): Promise<PortInfo | null> {
  let result
  try {
    result = await window.api.mpRemote.listPorts()
  } catch (err) {
    console.error('listPorts threw:', err)
    return null
  }

  if (!result || !Array.isArray(result.ports)) return null

  const ports = [...result.ports]
  let detectedMode = ''

  const blocklyIndex = ports.findIndex((line) => BLOCKLY_USB_IDS.some((id) => line.includes(id)))
  const pythonIndex = ports.findIndex((line) => PYTHON_USB_IDS.some((id) => line.includes(id)))

  if (blocklyIndex !== -1) {
    const [blocklyPort] = ports.splice(blocklyIndex, 1)
    ports.unshift(blocklyPort)
    detectedMode = 'Blockly Mode'
  } else if (pythonIndex !== -1) {
    const [pythonPort] = ports.splice(pythonIndex, 1)
    ports.unshift(pythonPort)
    detectedMode = 'Python Mode'
  }

  const boardLine = ports.find((line) => {
    const parts = line.split(' ')
    return parts[1] && parts[1] !== 'None'
  })

  const parts = boardLine ? boardLine.split(' ') : []

  return {
    port: parts[0] || '',
    board: parts[1] || '',
    mode: detectedMode
  }
}

export default function ModeCard({ onClick, mode, image, text, linkto }: ModeCardProps) {
  const [hovered, setHovered] = useState(false)
  const [currentMode, setCurrentMode] = useState('')
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

  const borderColor = {
    light: {
      code: 'border-black',
      'ai box': 'border-cyan-700',
      games: 'border-orange-700',
      default: 'border-zinc-900'
    },
    dark: {
      code: 'border-[#02e519]',
      'ai box': 'border-[#36d3ff]',
      games: 'border-orange-400',
      default: 'border-white'
    }
  }

  const backgroundColor = {
    light: { code: 'bg-[#2EED08] hover:bg-black', 'ai box': 'bg-[#36D3FF] hover:bg-black', games: 'hover:bg-black' },
    dark: {
      code: 'bg-black dark:hover:bg-[#02e519]',
      'ai box': 'bg-black dark:hover:bg-[#36d3ff]',
      games: 'bg-black dark:hover:bg-orange-400'
    }
  }

  // const selectedBorder =
  //   borderColor[themeMode]?.[mode || 'default'] || borderColor[themeMode].default
  // const selectedBackground = backgroundColor[themeMode]?.[mode]

  useEffect(() => {
    detectBoardMode().then((info) => {
      if (info) setCurrentMode(info.mode)
    })
  }, [])

  const handleClick = async () => {

    if (mode === 'code' && image === 'python') {
      localStorage.setItem("modecard", "python");
    }
  
    if (mode === 'code' && image === 'blocks') {
      localStorage.setItem("modecard", "blocks");
    }
  
    if (mode === 'code' && image === 'cpp') {
      localStorage.setItem("modecard", "cpp");
    }
  
    if (mode === 'code' && image === 'python') {
      const latest = await detectBoardMode()
  
      if (latest && latest.port && latest.mode !== 'Python Mode') {
        try {
          await window.api.serial.open(latest.port, { baudRate: 115200 })
          await new Promise((resolve) => setTimeout(resolve, 300))
          await window.api.serial.write(JSON.stringify({ msg: 'switch' }) + '\n')
          await new Promise((resolve) => setTimeout(resolve, 300))
        } catch (err) {
          console.error('Serial port error:', err)
        }
      }
    }
  
    if (linkto) {
    router.push(
  `/${linkto}${linkto === "blockly" ? "?showModal=true" : ""}`
);
    }
      onClick?.()
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex flex-col justify-between items-center px-8 py-10 border-8  rounded-xl hover:bg-black text-black dark:text-white hover:text-white transition-colors duration-300 cursor-pointer min-h-75 min-w-60`}
    >
      <div className="grow flex items-center justify-center">
        <img
          className={`object-contain transition-all duration-300 ${hovered ? 'w-36 h-36' : 'w-32 h-28'}`}
          src={imageSrc}
          alt={`${mode} icon`}
        />
      </div>
      <div className="mt-4">
        <h1 className="text-2xl font-black text-center">{text}</h1>
      </div>
    </div>
  )
}
