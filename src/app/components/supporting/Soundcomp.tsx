
import { useState,useRef } from "react";
import { useSelector } from "react-redux";

import MuteIcon from "./assets/Volume_mute";
import LowIcon from "./assets/Volume_low";
import MediumIcon from "./assets/Volume_medium"
import HighIcon from "./assets/Volume_high"

export default function SoundEffects() {
  const [volume, setVolume] = useState(50);
  const prevVolumeRef = useRef(50); // remember last non-zero volume

  const themeMode = useSelector((state: any) => state.theme.mode);

  const textcolor = themeMode === "dark" ? "text-white" : "text-black";
  const bgcolor = themeMode === "dark" ? "bg-[#3A3A3A]" : "bg-[#D6D6D6]";

  const isMuted = volume === 0;

  const handleIconClick = () => {
    if (isMuted) {
      // restore previous volume
      setVolume(prevVolumeRef.current || 50);
    } else {
      // save current volume and mute
      prevVolumeRef.current = volume;
      setVolume(0);
    }
  };

  const handleSliderChange = (val: number) => {
    setVolume(val);
    if (val > 0) prevVolumeRef.current = val;
  };

  // Decide icon + size
  const getIconConfig = () => {
    if (volume === 0) return { Icon: MuteIcon, size: "w-8 h-8" };
    if (volume <= 30) return { Icon: LowIcon, size: "w-7 h-7" };
    if (volume <= 70) return { Icon: MediumIcon, size: "w-9 h-9" };
    return { Icon: HighIcon, size: "w-10 h-10" };
  };

  const { Icon, size } = getIconConfig();

  return (
    <div className="space-y-2">
      <h2 className={`text-lg font-semibold ${textcolor}`}>
        Sound effects
      </h2>

      <div
        className={`flex items-center gap-4 px-4 rounded-md ${bgcolor}`}
        style={{ width: "450px", height: "60px" }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={handleIconClick}
        >
          <Icon className={size} />
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="custom-slider w-full"
        />
      </div>
    </div>
  );
}