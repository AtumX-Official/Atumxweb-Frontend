import { useState } from "react";
interface Redoiconprops extends React.SVGProps<SVGSVGElement> {
    className?: string;
  }  
export default function Redoicon({ className, ...rest }: Redoiconprops) {
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
      setIsClicked(true);
      setTimeout(() => {
        setIsClicked(false);
      }, 800);
    };
return(
<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"
className={`group ${className}`} 
{...rest}
onClick={() => {{
    if (rest.onClick) rest.onClick({} as any); 
    setIsClicked(!isClicked)
    handleClick()
  }}}
>
<g filter="url(#filter0_d_462_3272)">
<circle cx="28" cy="24" r="24"  fill = {isClicked ? "black" : "#F6268B"}/>
</g>
<path fillRule="evenodd" clipRule="evenodd" d="M30.0317 12.4686C29.4181 13.0935 29.4181 14.1065 30.0317 14.7314L33.6348 18.4H25.6429C20.8695 18.4 17 22.3398 17 27.2C17 32.0602 20.8695 36 25.6429 36H29.5714C30.4393 36 31.1429 35.2837 31.1429 34.4C31.1429 33.5163 30.4393 32.8 29.5714 32.8H25.6429C22.6053 32.8 20.1429 30.2928 20.1429 27.2C20.1429 24.1072 22.6053 21.6 25.6429 21.6H33.6348L30.0317 25.2686C29.4181 25.8934 29.4181 26.9066 30.0317 27.5314C30.6453 28.1562 31.6403 28.1562 32.254 27.5314L38.5397 21.1314C39.1534 20.5065 39.1534 19.4935 38.5397 18.8686L32.254 12.4686C31.6403 11.8438 30.6453 11.8438 30.0317 12.4686Z" fill={isClicked ? "#F6268B" : "white"}/>
<defs>
<filter id="filter0_d_462_3272" x="0" y="0" width="56" height="56" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_462_3272"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_462_3272" result="shape"/>
</filter>
</defs>
</svg>
)
}
