import { useState } from "react";
export default function Savetokit({ className="" }) {
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
<g filter="url(#filter0_d_1233_1685)">
<rect x="2" width="64" height="64" rx="8" fill="#FF2191" stroke={isHovered && !isClicked ? "white":"none"} strokeWidth={isHovered && !isClicked ? "2" : "none"}/>
<path d="M24 49.9996L44 50L45.6062 49.9996C47.842 49.9996 48.96 49.9996 49.8148 49.564C50.5674 49.1806 51.181 48.5682 51.5644 47.8156C52 46.9608 52 45.8417 52 43.6059V26.439C52 25.5413 52 25.0903 51.9042 24.662C51.819 24.2799 51.6786 23.9129 51.4864 23.5718C51.2733 23.1935 50.9743 22.8613 50.3865 22.2083L50.3858 22.2075L44.8754 16.0848L44.8745 16.0838C44.1935 15.3271 43.8482 14.9435 43.4336 14.668C43.0606 14.42 42.6484 14.2372 42.2146 14.1257C41.725 14 41.1996 14 40.15 14H22.4004C20.1602 14 19.0392 14 18.1836 14.436C17.4309 14.8195 16.8195 15.4309 16.436 16.1836C16 17.0392 16 18.1601 16 20.4003V43.6001C16 45.8402 16 46.9588 16.436 47.8144C16.8195 48.567 17.4309 49.1806 18.1836 49.564C19.0384 49.9996 20.158 49.9996 22.3938 49.9996H24Z" fill="white" stroke="#FF2191" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M32 21L42 21" stroke="#FF2191" strokeWidth="2" strokeLinecap="round"/>
<path d="M35.6572 30.7188C35.7911 31.1308 36.1752 31.4102 36.6084 31.4102H41.9717L37.6328 34.5625C37.2823 34.8171 37.1357 35.2687 37.2695 35.6807L38.9268 40.7812L34.5879 37.6289C34.2374 37.3743 33.7626 37.3743 33.4121 37.6289L29.0732 40.7812L30.7305 35.6807C30.8643 35.2687 30.7177 34.8171 30.3672 34.5625L26.0283 31.4102H31.3916C31.8248 31.4102 32.2089 31.1308 32.3428 30.7188L34 25.6182L35.6572 30.7188Z" fill="#FF2191" stroke="#FF2191"/>
</g>
<defs>
<filter id="filter0_d_1233_1685" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="2" dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1233_1685"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1233_1685" result="shape"/>
</filter>
</defs>
</svg>

)
}
