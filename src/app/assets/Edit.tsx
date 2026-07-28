import { useState } from "react";
export default function Edit({ className="" }) {
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
onClick={() => handleClick()}>
<g filter="url(#filter0_d_436_253)">
<rect x="2" width="64" height="64" rx="8" fill="#FF2191" stroke={isHovered && !isClicked ? "white":"none"} strokeWidth={isHovered && !isClicked ? "2" : "none"}/>
<path fillRule="evenodd" clipRule="evenodd" d="M56.234 16.1198L51.8452 11.7273C50.8742 10.7576 49.3034 10.7576 48.3337 11.7273L44.0536 16.0098H47.5651L49.2109 14.3641C49.6958 13.8779 50.4818 13.8779 50.968 14.3641L53.601 16.9983C54.0858 17.4844 54.0858 18.2705 53.601 18.7553L51.9902 20.3674V23.8801L56.234 19.6326C57.2037 18.6641 57.2037 17.0895 56.234 16.1198ZM30.7761 32.8101C31.2422 33.2762 33.5204 35.5556 35.1649 37.2026L49.2109 23.1478L44.7909 18.7866L30.7761 32.8101ZM25.3889 41.7164C25.104 42.2887 25.6538 42.8785 26.2649 42.5936L32.978 38.5285L29.4528 34.9983L25.3889 41.7164ZM35.6347 39.5957L24.7641 44.9729C23.5394 45.5415 22.5597 44.4443 23.0108 43.2184L28.3843 32.3403C28.4768 31.8716 28.6567 31.4168 29.0204 31.0531L44.0536 16.0098H20.499C18.567 16.0098 17 17.5769 17 19.5089V47.501C17 49.4329 18.567 51 20.499 51H48.4912C50.4231 51 51.9902 49.4329 51.9902 47.501V23.8801L36.9206 38.9596C36.5582 39.322 36.1034 39.5045 35.6347 39.5957ZM50.968 21.3908L51.9902 20.3674V19.5089C51.9902 17.5769 50.4231 16.0098 48.4912 16.0098H47.5651L46.6404 16.9346L50.968 21.3908Z" fill="white"/>
</g>
<defs>
<filter id="filter0_d_436_253" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="2" dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_436_253"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_436_253" result="shape"/>
</filter>
</defs>
</svg>

)
}
