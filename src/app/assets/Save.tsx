import { useState } from "react";
export default function Save({ className="" }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => {
          setIsClicked(false);
        }, 800);
      };  
return(
<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"
className={`group ${className}`} 
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
onClick={() => handleClick()}
>
<g filter="url(#filter0_d_398_249)">
<rect x="2" width="64" height="64" rx="8" fill="#FF2191" stroke={isHovered && !isClicked ? "white":"none"} strokeWidth={isHovered && !isClicked ? "2" : "none"}/>
<path d="M44 50L24 49.9996L44 50ZM44 50L45.6062 49.9996C47.842 49.9996 48.96 49.9996 49.8148 49.564C50.5674 49.1806 51.181 48.5682 51.5644 47.8156C52 46.9608 52 45.8417 52 43.6059V26.439C52 25.5413 52 25.0903 51.9042 24.662C51.819 24.2799 51.6786 23.9129 51.4864 23.5718C51.2732 23.1934 50.974 22.861 50.3858 22.2075L44.8754 16.0848C44.1938 15.3275 43.8484 14.9436 43.4336 14.668C43.0606 14.42 42.6484 14.2372 42.2146 14.1257C41.725 14 41.1996 14 40.15 14H22.4004C20.1602 14 19.0392 14 18.1836 14.436C17.4309 14.8195 16.8195 15.4309 16.436 16.1836C16 17.0392 16 18.1601 16 20.4003V43.6001C16 45.8402 16 46.9588 16.436 47.8144C16.8195 48.567 17.4309 49.1806 18.1836 49.564C19.0384 49.9996 20.158 49.9996 22.3938 49.9996H24M44 50V42.3935C44 40.1577 44 39.0381 43.5644 38.1833C43.181 37.4307 42.5674 36.8191 41.8148 36.4358C40.9592 35.9998 39.8406 35.9998 37.6004 35.9998H30.4004C28.1602 35.9998 27.0392 35.9998 26.1836 36.4358C25.4309 36.8191 24.8195 37.4307 24.436 38.1833C24 39.0389 24 40.1599 24 42.4001V49.9996M40 21.9999H28H40Z" fill="white"/>
<path d="M44 50L24 49.9996M44 50L45.6062 49.9996C47.842 49.9996 48.96 49.9996 49.8148 49.564C50.5674 49.1806 51.181 48.5682 51.5644 47.8156C52 46.9608 52 45.8417 52 43.6059V26.439C52 25.5413 52 25.0903 51.9042 24.662C51.819 24.2799 51.6786 23.9129 51.4864 23.5718C51.2732 23.1934 50.974 22.861 50.3858 22.2075L44.8754 16.0848C44.1938 15.3275 43.8484 14.9436 43.4336 14.668C43.0606 14.42 42.6484 14.2372 42.2146 14.1257C41.725 14 41.1996 14 40.15 14H22.4004C20.1602 14 19.0392 14 18.1836 14.436C17.4309 14.8195 16.8195 15.4309 16.436 16.1836C16 17.0392 16 18.1601 16 20.4003V43.6001C16 45.8402 16 46.9588 16.436 47.8144C16.8195 48.567 17.4309 49.1806 18.1836 49.564C19.0384 49.9996 20.158 49.9996 22.3938 49.9996H24M44 50V42.3935C44 40.1577 44 39.0381 43.5644 38.1833C43.181 37.4307 42.5674 36.8191 41.8148 36.4358C40.9592 35.9998 39.8406 35.9998 37.6004 35.9998H30.4004C28.1602 35.9998 27.0392 35.9998 26.1836 36.4358C25.4309 36.8191 24.8195 37.4307 24.436 38.1833C24 39.0389 24 40.1599 24 42.4001V49.9996M40 21.9999H28" stroke="#FF2191" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</g>
<defs>
<filter id="filter0_d_398_249" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="2" dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_398_249"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_398_249" result="shape"/>
</filter>
</defs>
</svg>

)
}
