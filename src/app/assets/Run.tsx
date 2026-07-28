import { useState } from "react";
interface Runiconprops extends React.SVGProps<SVGSVGElement> {
    className?: string;
  }  
export default function Runicon({ className, ...rest }: Runiconprops) {
    const [isHovered, setIsHovered] = useState(false);
return(
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"
className={`group ${className}`} 
{...rest}
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
onClick={() => {
    if (rest.onClick) rest.onClick({} as any); // Forward onClick if provided
  }}
>
<g filter="url(#filter0_d_432_232)">
<circle cx="64" cy="60" r="60" fill="#00FF44" stroke={isHovered ? "#F6EC24":"none"} strokeWidth={isHovered ? "4":"0"}/>
<path d="M90.3095 52.6901C96.5635 56.0942 96.5635 64.9058 90.3095 68.3098L52.5479 88.8628C46.4697 92.1712 39 87.8651 39 81.053V39.9471C39 33.1349 46.4697 28.8289 52.5479 32.1372L90.3095 52.6901Z" fill="white"/>
</g>
<defs>
<filter id="filter0_d_432_232" x="0" y="0" width="128" height="128" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_432_232"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_432_232" result="shape"/>
</filter>
</defs>
</svg>
)
}
