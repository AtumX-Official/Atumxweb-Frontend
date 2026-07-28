import * as React from "react";
const SvgPfolder = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={60}
    height={60}
    fill="none"
    {...props}
  >
    <g filter="url(#Pfolder_svg__a)">
      <path
        fill="#722CF0"
        fillRule="evenodd"
        d="M27.14 1.44A1.5 1.5 0 0 0 26.078 1H4.5a3 3 0 0 0-3 3v8c0 .11.09.2.2.2h35.717a.2.2 0 0 0 .142-.341z"
        clipRule="evenodd"
      />
      <path
        fill="#722CF0"
        d="M1.5 15h53a3 3 0 0 1 3 3v36a3 3 0 0 1-3 3h-51a2 2 0 0 1-2-2z"
      />
      <rect
        width={4}
        height={4}
        fill="#2195FF"
        rx={2}
        transform="matrix(1 0 0 -1 48.5 53)"
      />
      <rect
        width={26}
        height={4}
        fill="#FFDE21"
        rx={2}
        transform="matrix(1 0 0 -1 20.5 53)"
      />
    </g>
    <defs>
      <filter
        id="Pfolder_svg__a"
        width={60}
        height={60}
        x={0}
        y={0}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dx={0.5} dy={1} />
        <feGaussianBlur stdDeviation={1} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_7059_12318"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_7059_12318"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default SvgPfolder;
