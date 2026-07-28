import { useState } from "react";
interface Zoominiconprops extends React.SVGProps<SVGSVGElement> {
    className?: string;
    themeMode?:string
  }  
export default function Zoominicon({ className,themeMode, ...rest }: Zoominiconprops) {
    const [isClicked, setIsClicked] = useState(false);
    const iconStroke = themeMode === 'dark' ? 'stroke-black' : 'stroke-white';
    const iconFill = themeMode === 'dark' ? 'white' : 'black';   
    const iconcFill = themeMode === 'dark' ? 'black' : 'white';   
     const handleClick = () => {
      setIsClicked(true);
      // Reset back to normal after 2 seconds
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
  }
  handleClick()
  }}
>
<g filter="url(#filter0_d_462_3282)">
<circle cx="28" cy="24" r="24" fill={isClicked ? "#F6268B" : iconFill}/>
</g>
<path fillRule="evenodd" clipRule="evenodd" d="M18.4 22.8C18.4 18.1608 22.1608 14.4 26.8 14.4C31.4392 14.4 35.2 18.1608 35.2 22.8C35.2 27.4392 31.4392 31.2 26.8 31.2C22.1608 31.2 18.4 27.4392 18.4 22.8ZM26.8 12C20.8353 12 16 16.8353 16 22.8C16 28.7647 20.8353 33.6 26.8 33.6C29.35 33.6 31.6936 32.7162 33.5413 31.2383L37.9515 35.6485C38.4201 36.1171 39.1799 36.1171 39.6485 35.6485C40.1171 35.1799 40.1171 34.4201 39.6485 33.9515L35.2383 29.5413C36.7162 27.6936 37.6 25.35 37.6 22.8C37.6 16.8353 32.7647 12 26.8 12Z" fill={isClicked ? "black" : iconcFill}/>
<path fillRule="evenodd" clipRule="evenodd" d="M25.6 26.4C25.6 27.0628 26.1372 27.6 26.8 27.6C27.4628 27.6 28 27.0628 28 26.4V24H30.4C31.0628 24 31.6 23.4628 31.6 22.8C31.6 22.1372 31.0628 21.6 30.4 21.6H28V19.2C28 18.5373 27.4628 18 26.8 18C26.1372 18 25.6 18.5373 25.6 19.2V21.6H23.2C22.5373 21.6 22 22.1372 22 22.8C22 23.4628 22.5373 24 23.2 24H25.6V26.4Z" fill={isClicked ? "black" :iconcFill}/>
<defs>
<filter id="filter0_d_462_3282" x="0" y="0" width="56" height="56" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_462_3282"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_462_3282" result="shape"/>
</filter>
</defs>
</svg>
)
}
