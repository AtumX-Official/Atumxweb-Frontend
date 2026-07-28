import { useState } from "react";
export default function Games({ className="",...rest }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
      setIsClicked(true);
      setTimeout(() => {
        setIsClicked(false);
      }, 800);
    };
    return (
<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" 
className={`group ${className}`} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
      onClick={() => {{
          if (rest.onClick) rest.onClick({} as any); 
        }
        handleClick()
        }}>
<g filter="url(#filter0_d_398_250)">
<rect x="2" width="64" height="64" rx="8" fill="black"stroke={isHovered && !isClicked ? "white":"none"} strokeWidth={isHovered && !isClicked ? "2" : "none"}/>
<path d="M48.4 24.8H41.2V17.6C41.2 16.6452 40.8207 15.7295 40.1456 15.0544C39.4705 14.3793 38.5548 14 37.6 14H30.4C29.4452 14 28.5295 14.3793 27.8544 15.0544C27.1793 15.7295 26.8 16.6452 26.8 17.6V24.8H19.6C18.6452 24.8 17.7295 25.1793 17.0544 25.8544C16.3793 26.5295 16 27.4452 16 28.4V35.6C16 36.5548 16.3793 37.4705 17.0544 38.1456C17.7295 38.8207 18.6452 39.2 19.6 39.2H26.8V46.4C26.8 47.3548 27.1793 48.2705 27.8544 48.9456C28.5295 49.6207 29.4452 50 30.4 50H37.6C38.5548 50 39.4705 49.6207 40.1456 48.9456C40.8207 48.2705 41.2 47.3548 41.2 46.4V39.2H48.4C49.3548 39.2 50.2705 38.8207 50.9456 38.1456C51.6207 37.4705 52 36.5548 52 35.6V28.4C52 27.4452 51.6207 26.5295 50.9456 25.8544C50.2705 25.1793 49.3548 24.8 48.4 24.8ZM25 35.6L19.6 32L25 28.4V35.6ZM34 46.4L30.4 41H37.6L34 46.4ZM34 35.6C33.5271 35.5999 33.0589 35.5066 32.6221 35.3256C32.1852 35.1445 31.7883 34.8791 31.454 34.5447C31.1198 34.2102 30.8546 33.8132 30.6738 33.3763C30.4929 32.9393 30.3999 32.4711 30.4 31.9982C30.4001 31.5253 30.4934 31.0571 30.6744 30.6203C30.8555 30.1834 31.1209 29.7865 31.4553 29.4522C31.7898 29.118 32.1868 28.8528 32.6237 28.672C33.0607 28.4911 33.5289 28.3981 34.0018 28.3982C34.9568 28.3984 35.8726 28.778 36.5478 29.4535C37.2229 30.129 37.602 31.045 37.6018 32C37.6016 32.955 37.222 33.8708 36.5465 34.546C35.871 35.2211 34.955 35.6002 34 35.6ZM30.4 23L34 17.6L37.6 23H30.4ZM43 35.6V28.4L48.4 32L43 35.6Z" fill="white"/>
</g>
<defs>
<filter id="filter0_d_398_250" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="2" dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_398_250"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_398_250" result="shape"/>
</filter>
</defs>
</svg>

    )
}
