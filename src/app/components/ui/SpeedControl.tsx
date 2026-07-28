import { useEffect, useRef, useState } from "react";

interface SpeedControllerProps {
  clampedValue: number;
  setClampedValue: (value: number) => void;
  className?: string;
}

// 1. Reduced Base Dimensions
const BASE_TRACK_HEIGHT = 280; // Reduced from 300
const BASE_HANDLE_HEIGHT = 22; // Reduced from 24
const VALUE_RANGE = 255;
const OFFSET = 4;

export default function SpeedController({
  clampedValue,
  setClampedValue,
  className,
}: SpeedControllerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const [trackHeight, setTrackHeight] = useState(BASE_TRACK_HEIGHT);
  const [handleHeight, setHandleHeight] = useState(BASE_HANDLE_HEIGHT);

  useEffect(() => {
    console.log("SpeedController Clamped Value:", clampedValue);
  }, [clampedValue]);

  // 2. Reduced Responsive Dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      if (w >= 1536) {
        setTrackHeight(350); // Reduced from 380
        setHandleHeight(30); // Reduced from 32
      } else if (w >= 768) {
        setTrackHeight(300); // Reduced from 340
        setHandleHeight(26); // Reduced from 28
      } else {
        setTrackHeight(BASE_TRACK_HEIGHT);
        setHandleHeight(BASE_HANDLE_HEIGHT);
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const MIN_Y = OFFSET; 
  const MAX_Y = trackHeight - handleHeight - OFFSET;

  const valueToY = (value: number) => {
    const normalized = 1 - value / VALUE_RANGE;
    return MIN_Y + normalized * (MAX_Y - MIN_Y);
  };

  const yToValue = (y: number) => {
    const normalized = (y - MIN_Y) / (MAX_Y - MIN_Y);
    return Math.round((1 - normalized) * VALUE_RANGE);
  };

  const [handleY, setHandleY] = useState(valueToY(clampedValue));

  useEffect(() => {
    setHandleY(valueToY(clampedValue));
  }, [clampedValue, trackHeight, handleHeight]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    draggingRef.current = true;
    e.preventDefault();
  };

  const stopDrag = () => {
    draggingRef.current = false;
  };

  const onMove = (clientY: number) => {
    if (!draggingRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let newY = clientY - rect.top - handleHeight / 2;
    newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));
    setHandleY(newY);
    setClampedValue(yToValue(newY));
  };

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => onMove(e.clientY);
    const touchMove = (e: TouchEvent) => onMove(e.touches[0].clientY);
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", touchMove);
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [trackHeight, handleHeight]);

  const fillHeight = (trackHeight - OFFSET) - handleY;
  const fillRatio = clampedValue / VALUE_RANGE;
  
  const fillColor =
    fillRatio < 0.33 ? "url(#green)" : fillRatio < 0.66 ? "url(#yellow)" : "url(#red)";

  return (
    <div
      // 3. Reduced Tailwind Widths
      className={`bg-[#FFDE21] rounded-2xl p-2 w-[70px] md:w-[85px] 2xl:w-[95px] ${className}`}
      style={{ height: trackHeight + 16 }}
    >
      <div
        ref={trackRef}
        className="bg-black rounded-xl w-full h-full relative overflow-hidden"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <rect
            x="20%" // Centered bar
            rx="6"
            y={handleY}
            width="60%" // Slightly narrower fill bar
            height={fillHeight}
            fill={fillColor}
          />
          <defs>
            <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2AFF00" /><stop offset="100%" stopColor="#0E7C00" />
            </linearGradient>
            <linearGradient id="yellow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE600" /><stop offset="100%" stopColor="#FFB800" />
            </linearGradient>
            <linearGradient id="red" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4A4A" /><stop offset="100%" stopColor="#C40000" />
            </linearGradient>
          </defs>
        </svg>

        <div
          className="absolute left-0 right-0 z-10 cursor-grab active:cursor-grabbing flex justify-center"
          style={{ top: handleY }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          {/* 4. Handle scales with handleHeight */}
          <svg width="85%" height={handleHeight} viewBox="0 0 72 32" preserveAspectRatio="xMidYMid meet">
            <rect width="72" height="32" rx="8" fill="#FFDE21" />
            <rect x="24" y="8" width="24" height="16" rx="4" fill="black" fillOpacity="0.25" />
          </svg>
        </div>
      </div>
    </div>
  );
}