import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  mode: 'waveform' | 'spectrogram'
  analyser?: AnalyserNode | null
  spectrogramData?: Float32Array | null
  width?: number
  height?: number
  accentColor?: string
}

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export default function AudioVisualizer({
  mode,
  analyser,
  spectrogramData,
  width = 400,
  height = 150,
  accentColor = '#F6EC24'
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fit canvas resolution to screen pixels
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (mode === 'waveform') {
      // ── Glowing multi-strand "feed" wave (ported from prototypes/ai-lab-audio.html),
      //    tinted to the selected class colour and reacting to live mic loudness. ──
      const [ar, ag, ab] = hexToRgb(accentColor)

      const N = 90
      let prev = new Float32Array(N)
      let level = 0
      let t = 0

      let timeArr: Uint8Array<ArrayBuffer> | null = null
      if (analyser) {
        analyser.fftSize = 1024
        timeArr = new Uint8Array(analyser.fftSize)
      }

      const draw = () => {
        t += 0.016

        // pull live audio + compute a smoothed loudness level
        if (analyser && timeArr) {
          analyser.getByteTimeDomainData(timeArr)
          let acc = 0
          for (let i = 0; i < timeArr.length; i++) { const v = (timeArr[i] - 128) / 128; acc += v * v }
          const rms = Math.sqrt(acc / timeArr.length)
          level += (Math.min(1, rms * 3.4) - level) * 0.35
        } else {
          level += (0 - level) * 0.1
        }

        // background (subtle dark gradient)
        const bg = ctx.createLinearGradient(0, 0, 0, height)
        bg.addColorStop(0, '#0d1426')
        bg.addColorStop(1, '#070a14')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, width, height)

        // ── glowing wave (centred) ──
        const waveCY = height / 2
        const raw = new Float32Array(N)
        if (timeArr) {
          const st = timeArr.length / N
          for (let i = 0; i < N; i++) raw[i] = (timeArr[(i * st) | 0] - 128) / 128
        }
        const sm = new Float32Array(N)
        for (let i = 0; i < N; i++) {
          let s = 0, c = 0
          for (let k = -3; k <= 3; k++) { const j = i + k; if (j >= 0 && j < N) { s += raw[j]; c++ } }
          sm[i] = s / c
        }
        for (let i = 0; i < N; i++) sm[i] = prev[i] + (sm[i] - prev[i]) * 0.45
        prev = sm

        ctx.globalCompositeOperation = 'lighter'
        ctx.lineCap = 'round'
        for (let k = 0; k < 6; k++) {
          const kk = k / 5 - 0.5
          const ph = kk * 7
          ctx.beginPath()
          for (let i = 0; i < N; i++) {
            const xn = i / (N - 1)
            const x = xn * width
            const w = Math.pow(Math.sin(Math.PI * xn), 0.7)
            const tr = Math.sin(xn * 9 - t * 1.2 + ph) * 0.6 + Math.sin(xn * 4.5 + t * 0.8 + ph) * 0.4
            const y = waveCY + (tr * (0.10 + level * 1.5) + sm[i] * level) * (height * 0.34) * (1 - Math.abs(kk) * 0.3) * w
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
          }
          const a = (0.5 - Math.abs(kk) * 0.6).toFixed(2)
          ctx.strokeStyle = `rgba(${ar},${ag},${ab},${a})`
          ctx.lineWidth = (1 - Math.abs(kk)) * 2 + 0.6
          ctx.shadowBlur = 12
          ctx.shadowColor = accentColor
          ctx.stroke()
        }
        ctx.shadowBlur = 0
        ctx.globalCompositeOperation = 'source-over'

        animationRef.current = requestAnimationFrame(draw)
      }

      draw()
    } else if (mode === 'spectrogram') {
      // ── Static Recorded Spectrogram [64 mels, 130 frames] ──
      if (!spectrogramData || spectrogramData.length !== 64 * 130) {
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px font-sans font-bold'
        ctx.fillText('No audio recording found', width / 2 - 70, height / 2)
        return
      }

      const N_MELS = 64
      const MEL_FRAMES = 130

      const cellWidth = width / MEL_FRAMES
      const cellHeight = height / N_MELS

      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, width, height)

      // Draw each spectrogram element as a tiny rectangle
      for (let mel = 0; mel < N_MELS; mel++) {
        // Mel band 0 is low frequency, let's draw it at the bottom (y axis is inverted)
        const y = height - (mel + 1) * cellHeight

        for (let frame = 0; frame < MEL_FRAMES; frame++) {
          const x = frame * cellWidth

          // Index of log-mel value
          const idx = mel * MEL_FRAMES + frame
          const db = spectrogramData[idx] // value is negative, peaking at 0.0

          // Map DB [-80, 0] to standard normalization [0, 1]
          const norm = Math.max(0.0, Math.min(1.0, (db + 60.0) / 60.0))

          // Hot cyber glow thermal scale: Black -> Dark Violet -> Cyan -> Neon Yellow
          let color = ''
          if (norm < 0.1) {
            color = '#0f172a' // slate-900 (empty background)
          } else if (norm < 0.4) {
            // interpolation between black/violet and cyan
            const ratio = (norm - 0.1) / 0.3
            const r = Math.round(15 + ratio * 30)
            const g = Math.round(23 + ratio * 150)
            const b = Math.round(42 + ratio * 200)
            color = `rgb(${r}, ${g}, ${b})`
          } else if (norm < 0.8) {
            // interpolation between cyan and hot pink/yellow
            const ratio = (norm - 0.4) / 0.4
            const r = Math.round(45 + ratio * 201)
            const g = Math.round(173 + ratio * 63)
            const b = Math.round(242 - ratio * 206)
            color = `rgb(${r}, ${g}, ${b})`
          } else {
            // peak high energy: bright golden yellow
            const ratio = (norm - 0.8) / 0.2
            const r = 246
            const g = 236
            const b = Math.round(36 + ratio * 219)
            color = `rgb(${r}, ${g}, ${b})`
          }

          ctx.fillStyle = color
          ctx.fillRect(x, y, cellWidth + 0.5, cellHeight + 0.5) // slight overlap to avoid line seams
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mode, analyser, spectrogramData, width, height, accentColor])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        borderRadius: '12px',
        border: '2px solid #000000',
        boxShadow: 'inset 0px 4px 10px rgba(0,0,0,0.5)',
        display: 'block',
        backgroundColor: '#0f172a'
      }}
    />
  )
}
