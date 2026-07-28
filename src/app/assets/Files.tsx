import { useState } from "react";
export default function Settings({ className="" }) {
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
<g filter="url(#filter0_d_3244_7386)">
<rect x="2" width="64" height="64" rx="8" fill="#FF2191"stroke={isHovered && !isClicked ? "white":"none"} strokeWidth={isHovered && !isClicked ? "2" : "none"}/>
<path d="M47.6364 14H24.4545C23.0084 14.0017 21.622 14.5857 20.5994 15.624C19.5769 16.6623 19.0017 18.0701 19 19.5385V48.6154C19 48.9826 19.1437 49.3348 19.3994 49.5944C19.6551 49.8541 20.002 50 20.3636 50H44.9091C45.2708 50 45.6176 49.8541 45.8733 49.5945C46.1291 49.3348 46.2727 48.9826 46.2727 48.6154C46.2727 48.2482 46.1291 47.896 45.8733 47.6363C45.6176 47.3766 45.2708 47.2308 44.9091 47.2308H21.7273C21.7281 46.4966 22.0157 45.7927 22.527 45.2736C23.0383 44.7544 23.7315 44.4624 24.4545 44.4615H47.6364C47.998 44.4615 48.3449 44.3156 48.6006 44.056C48.8563 43.7963 49 43.4441 49 43.0769V15.3846C49 15.0174 48.8563 14.6652 48.6006 14.4056C48.3449 14.1459 47.998 14 47.6364 14ZM43.5455 30.6156L39.1804 27.2923C39.0624 27.2024 38.9188 27.1538 38.7713 27.1538C38.6238 27.1538 38.4803 27.2024 38.3622 27.2923L34 30.6152V16.7692H43.5455V30.6156Z" fill="white"/>
</g>
<defs>
<filter id="filter0_d_3244_7386" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="2" dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3244_7386"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3244_7386" result="shape"/>
</filter>
</defs>
</svg>

)
}
