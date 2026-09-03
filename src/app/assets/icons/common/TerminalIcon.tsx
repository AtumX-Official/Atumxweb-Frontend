import { useSelector } from "react-redux";
import type { SVGProps } from "react";

type TerminalIconProps = SVGProps<SVGSVGElement>;


export default function TerminalIcon({ className, ...rest } : TerminalIconProps) {
  return (
    <svg className={className} width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="24.4209" y1="17.1418" x2="4.1945" y2="5.46411" stroke="black" strokeWidth="8" strokeLinecap="round"/>
    <path d="M24.0364 17.5004L4.00082 28.3123" stroke="black" strokeWidth="8" strokeLinecap="round"/>
    <path d="M16.1921 36H36.3645" stroke="black" strokeWidth="8" strokeLinecap="round"/>
    </svg>
    
  )
}
