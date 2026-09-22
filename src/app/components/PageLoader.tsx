"use client";

import { useAppSelector } from "../../../store/hooks";
import BackgroundImg from "../assets/Background.svg?url";
import Backgrounddark from "../assets/Backgrounddark.svg?url";

/**
 * Full-screen themed loader used as the `next/dynamic` fallback for the heavy
 * client-only screens. Same drifting icon pattern as the home screen, with three
 * chunky blocks in the mode colours (code / ai box / games) hopping in turn.
 */

interface PageLoaderProps {
  /** what is loading, e.g. "Hand Gesture" */
  label?: string;
  /** accent for the progress bar — defaults to the AI Box cyan */
  accent?: string;
}

const BLOCKS = ["#2EED08", "#36D3FF", "#FF8800"];

export default function PageLoader({ label, accent = "#36D3FF" }: PageLoaderProps) {
  const isDark = useAppSelector((state) => state.theme.mode) === "dark";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none ${
        isDark ? "bg-[#151515] text-white" : "bg-[#efefef] text-black"
      }`}
    >
      {/* drifting icon pattern — same as the home screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -inset-[1960px] animate-moving-bg-gpu will-change-transform ${
            isDark ? "opacity-40" : "opacity-20"
          }`}
          style={{
            backgroundImage: `url(${isDark ? Backgrounddark : BackgroundImg})`,
            backgroundSize: isDark ? "auto" : "980px 980px",
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* hopping blocks */}
        <div className="flex items-end gap-4 h-24">
          {BLOCKS.map((color, i) => (
            <div
              key={color}
              className={`w-14 h-14 rounded-xl border-4 animate-block-hop ${
                isDark ? "border-white/90" : "border-black"
              }`}
              style={{
                background: color,
                animationDelay: `${i * 0.15}s`,
                boxShadow: isDark ? "0 6px 0 rgba(255,255,255,0.15)" : "4px 6px 0 rgba(0,0,0,1)",
              }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-end gap-1 text-3xl font-black tracking-[0.3em] uppercase">
            <span>Loading</span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block animate-loading-dots"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                .
              </span>
            ))}
          </div>
          {label && (
            <span className={`text-sm font-bold tracking-widest uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {label}
            </span>
          )}
        </div>

        {/* indeterminate progress bar */}
        <div
          className={`w-64 h-3 rounded-full overflow-hidden border-2 ${
            isDark ? "border-[#4c4c4c] bg-[#1f1f1f]" : "border-black bg-white"
          }`}
        >
          <div className="h-full w-2/5 rounded-full animate-loader-sweep" style={{ background: accent }} />
        </div>
      </div>
    </div>
  );
}
