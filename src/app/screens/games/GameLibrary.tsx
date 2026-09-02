// Updated GameLibrary using ONLY mpRemote for sending code
// (All IPC, window.api.file, send/subscribe removed)

/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import gameHelper from './gameHelper'
import type { StaticImageData } from 'next/image'

import flappybird from '../../assets/games/images/flappybird.png'
import bubbleshooter from '../../assets/games/images/bubbleshooter.png'
import car_game from '../../assets/games/images/car_game.png'
import dino_game from '../../assets/games/images/dino_game.png'
import snakegame from '../../assets/games/images/snakegame.png'
import shooting_game from '../../assets/games/images/shooting_game.png'
import brick_breaker from '../../assets/games/images/brick_breaker.png'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

interface CardImageProps {
  src: string
  alt: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

interface CardTitleProps {
  children: React.ReactNode
}

interface ProgressProps {
  value: number
}

const images: Record<string, StaticImageData> = {
  'flappybird.png': flappybird,
  'bubbleshooter.png': bubbleshooter,
  'car_game.png': car_game,
  'dino_game.png': dino_game,
  'snakegame.png': snakegame,
  'shooting_game.png': shooting_game,
  'brick_breaker.png': brick_breaker,
}

// Relative glob (not '/src/...') — absolute glob patterns fail to resolve in
// the rollup production build on Windows.


function Card({ children, className = '', onClick } : CardProps ) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`rounded-2xl shadow-lg border bg-white overflow-hidden cursor-pointer transition-all ${className}`}
    >
      {children}
    </motion.div>
  )
}

function CardImage({ src, alt }: CardImageProps) {
  const image = images[src] ?? null   // ✅ simplified — src is already e.g. "flappybird.png"
  return (
    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
      {image ? (
        <img src={image.src} alt={alt} className="w-full h-32 object-cover" />
      ) : (
        <div className="text-sm text-gray-500">No image</div>
      )}
    </div>
  )
}

function CardContent({ children, className = '' } : CardContentProps) {
  return <div className={`p-4 text-center ${className}`}>{children}</div>
}

function CardTitle({ children } : CardTitleProps) {
  return <h3 className="text-lg font-semibold">{children}</h3>
}

function Progress({ value } : ProgressProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-[width] duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

const games = [
  { id: 'flappybird', name: 'Flappy Bird', image: 'flappybird.png', code: 'flappy_bird' },
  {
    id: 'bubbleshooter',
    name: 'Bubble Shooter',
    image: 'bubbleshooter.png',
    code: 'bubble_shooter'
  },
  {
    id: 'car_game',
    name: 'Car Game',
    image: 'car_game.png',
    code: 'car_game'
  },
  {
    id: 'dino',
    name: 'Dino Run',
    image: 'dino_game.png',
    code: 'dino_run'
  },
  { id: 'snake', name: 'Snake', image: 'snakegame.png', code: 'snake' },
  { id: 'shooting', name: 'Shooting', image: 'shooting_game.png', code: 'shooting' },
  { id: 'brick_breaker', name: 'Brick Breaker', image: 'brick_breaker.png', code: 'brick_breaker' },
]

// Web-based simulation games — HTML files placed in src/renderer/public/games/
// Add new entries here with { id, name, emoji, file } to register a new sim game.
const simGames = [
  { id: 'gesture_rush', name: 'Gesture Rush', emoji: '🖐', file: 'gesture-rush.html' },
]

interface Game {
  id: string
  name: string
  image: string
  code: string
}



export default function GameLibrary() {
  const [uploadingGame, setUploadingGame] = useState<Game | null>(null)
  const [progress, setProgress] = useState(0)
  const [runningGame, setRunningGame] = useState<Game | null>(null)
  const [webGame, setWebGame] = useState<{ id: string; name: string; file: string } | null>(null)
  const uploadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const uploadGame = async (game : Game) => {
    setUploadingGame(game)
    setProgress(0)
    setRunningGame(null)

    // Only mpRemote is used
    try {
      await window.api.mpRemote.run(gameHelper[game.code])
    } catch (err) {
      console.error('mpRemote failed to send game:', err)
    }

    // Simulated progress (since no IPC allowed)
    if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current)
    uploadIntervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(uploadIntervalRef.current ?? undefined)
          uploadIntervalRef.current = null
          setRunningGame(game)
          setUploadingGame(null)
          return 100
        }
        return p + Math.round(5 + Math.random() * 12)
      })
    }, 150)
  }

  const stopGame = () => {
    setRunningGame(null)
    setUploadingGame(null)
    setProgress(0)
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current)
      uploadIntervalRef.current = null
    }
  }

  const focusedGame = uploadingGame ?? runningGame
  const navigate = useNavigate()

  // ── Simulation game: fullscreen iframe ──────────────────────────────────────
  if (webGame) {
    const src = `/games/${webGame.file}`
    return (
      <div className="w-screen h-screen flex flex-col bg-black">
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 shrink-0">
          <button
            onClick={() => setWebGame(null)}
            className="flex items-center gap-2 text-white bg-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-600 transition text-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-white font-semibold">{webGame.name}</span>
        </div>
        <iframe
          src={src}
          className="flex-1 w-full border-none"
          allow="camera; microphone; accelerometer; gyroscope; fullscreen"
          title={webGame.name}
        />
      </div>
    )
  }

  if (focusedGame) {
    const isUploading = !!uploadingGame
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50 p-6 overflow-hidden">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white w-[92%] max-w-md rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4"
        >
          <div className="w-40 h-40 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            {images[focusedGame.image] ? (
              <img
                src={images[focusedGame.image].src}
                alt={focusedGame.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-500">No image</div>
            )}
          </div>

          <h2 className="text-2xl font-bold">{focusedGame.name}</h2>

          {isUploading ? (
            <div className="w-full">
              <Progress value={progress} />
              <p className="text-sm text-gray-600 mt-2 text-center">{progress}%</p>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Sending to board — this may take a few seconds.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow"
                onClick={stopGame}
              >
                Stop Game
              </button>
            </div>
          )}

          {!isUploading && (
            <button
              className="mt-2 text-xs text-gray-500 underline"
              onClick={() => setRunningGame(null)}
            >
              Back to Library (UI only)
            </button>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen p-6 bg-gradient-to-br from-indigo-50 to-white overflow-hidden">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white bg-gray-700 px-5 py-2.5 rounded-lg shadow hover:bg-blue-800 transition"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-3xl font-bold">Game Library</h1>
      </header>

      {/* Hardware games — upload to robot board */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {games.map((game) => (
          <Card key={game.id} onClick={() => uploadGame(game)}>
            <CardImage src={game.image} alt={game.name} />
            <CardContent>
              <CardTitle>{game.name}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simulation games — runs in-app as a web game */}
      {simGames.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-10 mb-4">Simulations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {simGames.map((game) => (
              <Card key={game.id} onClick={() => setWebGame(game)}>
                <div className="w-full h-32 bg-linear-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                  <span className="text-5xl">{game.emoji}</span>
                </div>
                <CardContent>
                  <CardTitle>{game.name}</CardTitle>
                  <p className="text-xs text-gray-500 mt-1">PC Simulation</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}