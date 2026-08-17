import { useState } from "react";
interface Stopiconprops extends React.SVGProps<SVGSVGElement> {
    className?: string;
  }  
  export default function Stop({ className, ...rest }: Stopiconprops) {
    return (
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"
className={`group ${className}`} 
{...rest}
onClick={() => {
    if (rest.onClick) rest.onClick({} as any); // Forward onClick if provided
  }}
>
<g filter="url(#filter0_d_432_220)">
<circle cx="64" cy="60" r="60" fill="#FF2C11"/>
<path d="M36 60C36 46.8007 36 40.201 40.1005 36.1005C44.201 32 50.8007 32 64 32C77.1992 32 83.7991 32 87.8994 36.1005C92 40.201 92 46.8007 92 60C92 73.1992 92 79.7991 87.8994 83.8994C83.7991 88 77.1992 88 64 88C50.8007 88 44.201 88 40.1005 83.8994C36 79.7991 36 73.1992 36 60Z" fill="white"/>
</g>
<defs>
<filter id="filter0_d_432_220" x="0" y="0" width="128" height="128" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_432_220"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_432_220" result="shape"/>
</filter>
</defs>
</svg>
    )
}
