import { useState } from "react";

// Drone — toolbar quick-launch icon for the integrated Drone Simulator. Built to match the
// existing top-right toolbar icons (Games / Settings) EXACTLY: same 72x72 canvas, same 64x64
// rounded-square black button, same drop shadow, same white hover border + 800ms click reset.
// Glyph is a minimal, flat, white top-down quadcopter (X-frame + 4 propeller discs + central
// body) — recognizable at 20–24px, no gradients/outlines/accents.
export default function Drone({ className = "", ...rest }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 800);
  };
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
      onClick={(e) => {
        if (rest.onClick) rest.onClick(e as never);
        handleClick();
      }}
    >
      <g filter="url(#filter0_d_drone_sim)">
        <rect
          x="2"
          width="64"
          height="64"
          rx="8"
          fill="black"
          stroke={isHovered && !isClicked ? "white" : "none"}
          strokeWidth={isHovered && !isClicked ? "2" : "none"}
        />
        {/* X-frame arms (two crossed rounded bars) */}
        <rect x="18" y="29.4" width="32" height="5.2" rx="2.6" fill="white" transform="rotate(45 34 32)" />
        <rect x="18" y="29.4" width="32" height="5.2" rx="2.6" fill="white" transform="rotate(-45 34 32)" />
        {/* Four propeller discs at the arm ends */}
        <circle cx="22.7" cy="20.7" r="6.2" fill="white" />
        <circle cx="45.3" cy="20.7" r="6.2" fill="white" />
        <circle cx="22.7" cy="43.3" r="6.2" fill="white" />
        <circle cx="45.3" cy="43.3" r="6.2" fill="white" />
        {/* Central flight-controller body */}
        <rect x="28.3" y="26.3" width="11.4" height="11.4" rx="3.2" fill="white" />
      </g>
      <defs>
        <filter id="filter0_d_drone_sim" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="2" dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_drone_sim" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_drone_sim" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}
