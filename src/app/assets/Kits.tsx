import { useState } from "react";
export default function Kits({ className="" }) {
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
<g filter="url(#filter0_d_360_207)">
<rect x="2" width="64" height="64" rx="8" fill="black"stroke={isHovered && !isClicked ? "white":"none"} strokeWidth={isHovered && !isClicked ? "2" : "none"}/>
<path d="M24 22.754C24.5563 21.0399 25.5761 19.5133 26.9461 18.3425C28.316 17.1717 29.9824 16.4031 31.7622 16.1207C33.5422 15.8383 35.3666 16.0538 37.0318 16.7431C38.6968 17.4323 40.1373 18.5689 41.1969 20.0267C42.2563 21.4844 42.8924 23.2062 43.0341 25.0027C43.1757 26.7992 42.8167 28.5997 41.9986 30.2053C41.1805 31.8112 39.936 33.1603 38.3993 34.102C36.8628 35.0436 35.0957 35.5422 33.2938 35.5422V37.9839M33.4154 47.7552V47.9995L33.1721 48V47.7552H33.4154Z" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
</g>
<defs>
<filter id="filter0_d_360_207" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="2" dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_360_207"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_360_207" result="shape"/>
</filter>
</defs>
</svg>
    )
}

{/* <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={`group ${className}`}
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 onClick={() => handleClick()}
>
<g filter="url(#filter0_d_398_252)">
<rect x="4" width="64" height="64" rx="8"fill={isClicked ? "white" : "black"} stroke={isHovered && !isClicked ? "#F6EC24" : "white"} strokeWidth={isHovered && !isClicked ? 2 : 0}/>
<path d="M18 22C18 17.5817 21.5817 14 26 14H46C50.4182 14 54 17.5817 54 22V42C54 46.4182 50.4182 50 46 50H26C21.5817 50 18 46.4182 18 42V22Z" 
fill={isClicked ? "black" : "none"} stroke={isClicked ? "#181818" : isHovered ? "#F6EC24" : "white"} strokeWidth="2" />
<path d="M35.143 23.4237C35.5318 22.7779 36.468 22.7779 36.8568 23.4237L39.073 27.1065C39.2126 27.3385 39.4404 27.504 39.7042 27.5651L43.8916 28.5348C44.626 28.705 44.9154 29.5954 44.4212 30.1646L41.6036 33.4106C41.426 33.615 41.339 33.8828 41.3624 34.1526L41.734 38.4348C41.7992 39.1856 41.0418 39.736 40.3478 39.442L36.39 37.7652C36.1406 37.6596 35.8592 37.6596 35.6098 37.7652L31.6521 39.442C30.958 39.736 30.2005 39.1856 30.2657 38.4348L30.6374 34.1526C30.6608 33.8828 30.5738 33.615 30.3963 33.4106L27.5786 30.1646C27.0845 29.5954 27.3738 28.705 28.1081 28.5348L32.2956 27.5651C32.5594 27.504 32.7872 27.3385 32.9268 27.1065L35.143 23.4237Z" 
strokeWidth="2" stroke={isHovered && !isClicked ? "#F6EC24" : "white"} fill ={isClicked ? "white" : "none"}/>
</g>
<defs>
<filter id="filter0_d_398_252" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_398_252"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_398_252" result="shape"/>
</filter>
</defs>
</svg> */}
