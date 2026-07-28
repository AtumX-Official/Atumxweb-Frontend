import { useState } from "react";
interface Zoomouticonprops extends React.SVGProps<SVGSVGElement> {
    className?: string;
    themeMode?:string
  }  
export default function Zoomouticon({ className,themeMode, ...rest }: Zoomouticonprops) {
    const [isClicked, setIsClicked] = useState(false);
    const iconFill = themeMode === 'dark' ? 'white' : 'black';   
    const iconcFill = themeMode === 'dark' ? 'black' : 'white';   
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
<g filter="url(#filter0_d_462_3288)">
<circle cx="28" cy="24" r="24" fill={isClicked ? "#F6268B" : iconFill}/>
</g>
<path fillRule="evenodd" clipRule="evenodd" d="M26.6667 14.6667C22.2484 14.6667 18.6667 18.2484 18.6667 22.6667C18.6667 27.085 22.2484 30.6667 26.6667 30.6667C31.085 30.6667 34.6667 27.085 34.6667 22.6667C34.6667 18.2484 31.085 14.6667 26.6667 14.6667ZM16 22.6667C16 16.7756 20.7756 12 26.6667 12C32.5578 12 37.3334 16.7756 37.3334 22.6667C37.3334 25.1316 36.4972 27.4014 35.0932 29.2075L39.6095 33.7239C40.1302 34.2446 40.1302 35.0888 39.6095 35.6095C39.0888 36.1302 38.2446 36.1302 37.7239 35.6095L33.2075 31.0932C31.4014 32.4972 29.1316 33.3334 26.6667 33.3334C20.7756 33.3334 16 28.5578 16 22.6667ZM21.3333 22.6667C21.3333 21.9303 21.9303 21.3333 22.6667 21.3333H30.6667C31.4031 21.3333 32 21.9303 32 22.6667C32 23.4031 31.4031 24 30.6667 24H22.6667C21.9303 24 21.3333 23.4031 21.3333 22.6667Z" fill={isClicked ? "black" :iconcFill}/>
<defs>
<filter id="filter0_d_462_3288" x="0" y="0" width="56" height="56" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_462_3288"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_462_3288" result="shape"/>
</filter>
</defs>
</svg>
)
}
