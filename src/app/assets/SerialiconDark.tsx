import { useState } from "react";
import { useSelector } from "react-redux";
interface SerialProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
  }  
  
export default function SerialiconDark({ className, ...rest }: SerialProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false)
    const themeMode = useSelector((state: any) => state.theme.mode)
    const handleClick = () => {
      setIsClicked(true);
      setTimeout(() => {
        setIsClicked(false);
      }, 800);
    };

return(
 <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"
className={`group ${className}`} 
{...rest}
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
onClick={(e) => {
  if (rest.onClick) rest.onClick(e);
  setIsClicked(!isClicked)
  handleClick()
}}>
<g filter="url(#filter0_d_432_236)" >
<circle cx="64" cy="60" r="60" fill={isClicked ? "#F6EC24":"white"} stroke={isHovered ? "#F6EC24" : "none"} strokeWidth={isHovered ?"4":"0"}/>
{
    isClicked ?(
        <>
        <line x1="4" y1="-4" x2="46.9583" y2="-4" transform="matrix(-0.858529 -0.512764 0.487343 -0.87321 77.061 53.1296)" stroke="white" strokeWidth="8" strokeLinecap="round"/>
      <line x1="4" y1="-4" x2="46.9583" y2="-4" transform="matrix(-0.858529 0.512764 0.487343 0.87321 76.7493 57.1638)" stroke="white" strokeWidth="8" strokeLinecap="round"/>
      <path d="M55.0001 87H87.5001" stroke="black" strokeWidth="8" strokeLinecap="round"/>
        </>
    ):
    (
   <>
   <line x1="75.5968" y1="53.7229" x2="38.7758" y2="32.4643" stroke={isHovered ? "#F6EC24" : "black"} strokeWidth="8" strokeLinecap="round"/>
   <line x1="4" y1="-4" x2="46.5173" y2="-4" transform="matrix(-0.866025 0.5 0.5 0.866025 80.7491 56.1587)" stroke={isHovered ? "#F6EC24" : "black"} strokeWidth="8" strokeLinecap="round"/>
   <path d="M59 85H91.5" stroke={isHovered ? "#F6EC24" : "black"} strokeWidth="8" strokeLinecap="round"/>
   </>
    )
}
</g>
<defs>
<filter id="filter0_d_432_236" x="0" y="0" width="128" height="128" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_432_236"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_432_236" result="shape"/>
</filter>
</defs>
</svg>
)
}
