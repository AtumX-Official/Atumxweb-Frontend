import type {SVGProps} from "react";

type TickIconProps = SVGProps<SVGSVGElement>;


export default function TickIcon({className, ...rest} : TickIconProps) {
  return (
    <svg
      className={`${className}`}
      width="40"
      height="29"
      viewBox="0 0 40 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 15.803L13.1364 27L38 2"
        stroke="black"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
