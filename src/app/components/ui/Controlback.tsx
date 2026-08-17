import { useState } from "react";
interface BackProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
  }  
export default function Back({ className, ...rest }: BackProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    
return(
    isClicked || isHovered ?
    (<>
       <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg"
    className={`group ${className}`} 
    {...rest}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    onClick={() => setIsClicked(!isClicked)}

>
<rect width="80" height="80" rx="8" fill="black"/>
<path d="M67.6144 60.4218C67.1737 60.4218 66.7585 60.1743 66.5549 59.7671C66.4867 59.6353 61.0571 49.5676 38.3986 49.2251V59.2373C38.3986 59.6885 38.1418 60.1003 37.7375 60.2993C37.3337 60.4983 36.8526 60.4521 36.4929 60.178L11.6656 41.1513C11.373 40.9268 11.2 40.5797 11.2 40.212C11.2 39.8423 11.373 39.4954 11.6656 39.2704L36.4941 20.2445C36.8543 19.9698 37.3349 19.9234 37.7386 20.1214C38.143 20.319 38.3998 20.7326 38.3998 21.1826V31.734C38.999 31.6959 39.7797 31.6628 40.7011 31.6628C49.15 31.6628 68.8 34.3503 68.8 59.2348C68.8 59.7854 68.4217 60.2643 67.885 60.3893C67.7947 60.4126 67.7057 60.4218 67.6144 60.4218Z" fill="white"/>
</svg>

</>) :
(
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg"
    className={`group ${className}`} 
    {...rest}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    onClick={() => {
      setIsClicked(!isClicked);
      if (rest.onClick) rest.onClick({} as any); // Forward onClick if provided
    }}>
<g filter="url(#filter0_d_3247_7448)">
<rect x="2" width="80" height="80" rx="8" fill="black"/>
<path d="M31.8551 16.058C31.8551 13.8168 33.6719 12 35.913 12H48.087C50.3281 12 52.1449 13.8168 52.1449 16.058V28.2319H31.8551V16.058Z" fill="#FF2191"/>
<path d="M65.942 29.8551C68.1832 29.8551 70 31.6719 70 33.913V46.087C70 48.3281 68.1832 50.1449 65.942 50.1449H53.7681V29.8551H65.942Z" fill="#722CF0"/>
<path d="M52.1449 63.942C52.1449 66.1832 50.3281 68 48.087 68H35.913C33.6719 68 31.8551 66.1832 31.8551 63.942V51.7681H52.1449V63.942Z" fill="#FF2191"/>
<path d="M18.058 50.1449C15.8168 50.1449 14 48.3281 14 46.087L14 33.913C14 31.6719 15.8168 29.8551 18.058 29.8551H30.2319V50.1449H18.058Z" fill="#722CF0"/>
<path d="M31.8551 31.4783C31.8551 30.5818 32.5818 29.8551 33.4783 29.8551H50.5217C51.4182 29.8551 52.1449 30.5818 52.1449 31.4783V48.5217C52.1449 49.4182 51.4182 50.1449 50.5217 50.1449H33.4783C32.5818 50.1449 31.8551 49.4182 31.8551 48.5217V31.4783Z" fill="#FFDE21"/>
<path d="M41.8243 16.3623C41.9024 16.2271 42.0976 16.2271 42.1757 16.3623L46.2172 23.3623C46.2953 23.4976 46.1976 23.6667 46.0415 23.6667H37.9585C37.8024 23.6667 37.7047 23.4976 37.7828 23.3623L41.8243 16.3623Z" fill="black"/>
<path d="M65.8406 39.8243C65.9758 39.9024 65.9758 40.0976 65.8406 40.1757L58.8406 44.2172C58.7053 44.2953 58.5362 44.1976 58.5362 44.0415V35.9585C58.5362 35.8024 58.7053 35.7047 58.8406 35.7828L65.8406 39.8243Z" fill="black"/>
<path d="M42.1757 64.6522C42.0976 64.7874 41.9024 64.7874 41.8243 64.6522L37.7828 57.6522C37.7047 57.5169 37.8024 57.3478 37.9585 57.3478H46.0415C46.1976 57.3478 46.2953 57.5169 46.2172 57.6522L42.1757 64.6522Z" fill="black"/>
<path d="M17.3478 40.1757C17.2126 40.0976 17.2126 39.9024 17.3478 39.8243L24.3478 35.7828C24.4831 35.7047 24.6522 35.8024 24.6522 35.9585L24.6522 44.0415C24.6522 44.1976 24.4831 44.2953 24.3478 44.2172L17.3478 40.1757Z" fill="black"/>
<path d="M47.0725 40C47.0725 42.8014 44.8014 45.0725 42 45.0725C39.1986 45.0725 36.9275 42.8014 36.9275 40C36.9275 37.1986 39.1986 34.9275 42 34.9275C44.8014 34.9275 47.0725 37.1986 47.0725 40Z" fill="black"/>
</g>
<defs>
<filter id="filter0_d_3247_7448" x="0" y="0" width="88" height="88" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="2" dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3247_7448"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3247_7448" result="shape"/>
</filter>
</defs>
</svg>
)
)
}
