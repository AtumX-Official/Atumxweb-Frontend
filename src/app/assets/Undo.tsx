import { useState } from "react";
interface Undoiconprops extends React.SVGProps<SVGSVGElement> {
    className?: string;
  }  
export default function Undoicon({ className, ...rest }: Undoiconprops) {
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
<g filter="url(#filter0_d_462_3261)">
<circle cx="28" cy="24" r="24" fill={isClicked ? "black" : "#F6268B"}/>
</g>
<path fillRule="evenodd" clipRule="evenodd" d="M25.9683 12.4686C26.5819 13.0935 26.5819 14.1065 25.9683 14.7314L22.3652 18.4H30.3571C35.1305 18.4 39 22.3398 39 27.2C39 32.0602 35.1305 36 30.3571 36H26.4286C25.5607 36 24.8571 35.2837 24.8571 34.4C24.8571 33.5163 25.5607 32.8 26.4286 32.8H30.3571C33.3947 32.8 35.8571 30.2928 35.8571 27.2C35.8571 24.1072 33.3947 21.6 30.3571 21.6H22.3652L25.9683 25.2686C26.5819 25.8934 26.5819 26.9066 25.9683 27.5314C25.3547 28.1562 24.3597 28.1562 23.746 27.5314L17.4603 21.1314C16.8466 20.5065 16.8466 19.4935 17.4603 18.8686L23.746 12.4686C24.3597 11.8438 25.3547 11.8438 25.9683 12.4686Z" fill={isClicked ? "#F6268B" : "white"}/>
<defs>
<filter id="filter0_d_462_3261" x="0" y="0" width="56" height="56" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_462_3261"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_462_3261" result="shape"/>
</filter>
</defs>
</svg>
)
}
