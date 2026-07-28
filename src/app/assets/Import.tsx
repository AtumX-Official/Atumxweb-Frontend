import { useState } from "react";
export default function Import({ className="" }) {
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
<g filter="url(#filter0_d_436_259)">
<rect x="2" width="64" height="64" rx="8" fill="#FF2191" stroke={isHovered && !isClicked ? "white":"none"} strokeWidth={isHovered && !isClicked ? "2" : "none"}/>
<path fillRule="evenodd" clipRule="evenodd" d="M29.569 27.5C28.6946 27.5 27.9216 28.068 27.6603 28.9025L23.0477 43.636C22.8619 44.2295 22.2305 44.5605 21.6366 44.3755C21.0414 44.1902 20.7097 43.557 20.896 42.9621L26.0054 26.6521C26.2668 25.8178 27.0397 25.25 27.914 25.25H47.8161C48.9207 25.25 49.8161 24.3546 49.8161 23.25V20.5C49.8161 19.3954 48.9207 18.5 47.8161 18.5H33.5221C32.9171 18.5 32.3447 18.2262 31.965 17.7551L29.5385 14.7448C29.1588 14.2738 28.5863 14 27.9814 14H18C16.8954 14 16 14.8954 16 16V46.625C16 48.4857 17.5172 50 19.3816 50H48.7183C50.3234 50 51.7189 48.8592 52.0345 47.2865L55.5204 29.893C55.7685 28.6552 54.8218 27.5 53.5594 27.5H29.569Z" fill="white"/>
</g>
<defs>
<filter id="filter0_d_436_259" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="2" dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_436_259"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_436_259" result="shape"/>
</filter>
</defs>
</svg>

)
}
