import * as React from "react";
const SvgWifidisconnect = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={56}
    height={56}
    fill="none"
    {...props}
  >
    <g filter="url(#wifidisconnect_svg__a)">
      <rect width={56} height={56} fill="#fff" rx={5} />
    </g>
    <rect width={54} height={54} x={1} y={1} stroke="#000" rx={4} />
    <path
      stroke="#000"
      d="M18.644 29.534a12.9 12.9 0 0 1 4.257-3.047 12.74 12.74 0 0 1 10.214-.036c1.615.7 3.071 1.727 4.278 3.017M13 21.614a20.6 20.6 0 0 1 6.811-4.875 20.383 20.383 0 0 1 16.345-.057A20.6 20.6 0 0 1 43 21.507M28.049 41c-1.42 0-2.572-1.164-2.572-2.6s1.151-2.6 2.572-2.6c1.42 0 2.572 1.164 2.572 2.6S29.469 41 28.049 41Z"
    />
    <path stroke="#fff" d="m12 10 33 33" />
    <path stroke="#F91A08" d="m10 10 33 33" />
    <defs>
      <filter
        id="wifidisconnect_svg__a"
        width={60}
        height={60}
        x={-2}
        y={-2}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dx={2} dy={2} />
        <feGaussianBlur stdDeviation={1.5} />
        <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend in2="shape" result="effect1_innerShadow_1265_1007" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dx={-2} dy={-2} />
        <feGaussianBlur stdDeviation={1} />
        <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend
          in2="effect1_innerShadow_1265_1007"
          result="effect2_innerShadow_1265_1007"
        />
      </filter>
    </defs>
  </svg>
);
export default SvgWifidisconnect;
