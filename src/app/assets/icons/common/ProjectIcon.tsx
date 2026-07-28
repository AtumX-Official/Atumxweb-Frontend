import { useState } from "react";
export default function ProjectIcon({ className,...rest}: { className?: string; color?: string; }) {
       const [isHovered, setIsHovered] = useState(false);
        const [isClicked, setIsClicked] = useState(false);
        const handleClick = () => {
            setIsClicked(true);
            setTimeout(() => {
              setIsClicked(false);
            }, 800);
          };  
        const  fillcolor= isClicked ? "black" : isHovered ? "#F6EC24" : "white"
    return (
<svg  className={`group ${className}`}width="35" height="32" viewBox="0 0 35 32" fill="none" xmlns="http://www.w3.org/2000/svg"
onClick={() => handleClick()}
>
<path d="M32.4074 32H2.59259C1.16019 32 0 30.8531 0 29.44V14.08C0 14.08 6.76796 17.5168 12.963 18.9235V20.48C12.963 21.1878 13.5424 21.76 14.2593 21.76H20.7407C21.4563 21.76 22.037 21.1878 22.037 20.48V18.9235C28.2307 17.5168 35 14.08 35 14.08V29.44C35 30.8531 33.8385 32 32.4074 32ZM19.4444 16.64C20.16 16.64 20.7407 17.2122 20.7407 17.92V19.2C20.7407 19.9078 20.16 20.48 19.4444 20.48H15.5556C14.8387 20.48 14.2593 19.9078 14.2593 19.2V17.92C14.2593 17.2122 14.8387 16.64 15.5556 16.64H19.4444ZM22.037 16.64C22.037 15.9322 21.4563 15.36 20.7407 15.36H14.2593C13.5424 15.36 12.963 15.9322 12.963 16.64V17.7869C6.76796 16.3379 0 12.8 0 12.8V7.68C0 6.26688 1.16019 5.12 2.59259 5.12H10.3704V2.56C10.3704 1.14688 11.5319 0 12.963 0H22.037C23.4681 0 24.6296 1.14688 24.6296 2.56V5.12H32.4074C33.8385 5.12 35 6.26688 35 7.68V12.8C35 12.8 28.2307 16.3379 22.037 17.7869V16.64ZM22.037 3.84C22.037 3.13216 21.4563 2.56 20.7407 2.56H14.2593C13.5424 2.56 12.963 3.13216 12.963 3.84C12.963 4.54656 12.963 5.12 12.963 5.12H22.037C22.037 5.12 22.037 4.54656 22.037 3.84Z" fill={fillcolor}/>
</svg>

    )
}