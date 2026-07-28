import * as React from "react";
const SvgCfile = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={52}
    height={68}
    fill="none"
    {...props}
  >
    <g filter="url(#Cfile_svg__a)">
      <path
        fill="#2195FF"
        d="M1.5 9.373c0-2.836 0-4.254.526-5.348a5.33 5.33 0 0 1 2.499-2.5C5.619 1 7.037 1 9.873 1h19.292c1.31 0 1.966 0 2.58.147a5.3 5.3 0 0 1 1.727.759c.525.352.968.834 1.855 1.798L47.29 16.706c.791.86 1.187 1.29 1.474 1.78.29.49.498 1.025.618 1.582.119.554.119 1.139.119 2.307v34.252c0 2.836 0 4.254-.526 5.348a5.33 5.33 0 0 1-2.499 2.5C45.381 65 43.963 65 41.127 65H9.873c-2.836 0-4.254 0-5.348-.526a5.33 5.33 0 0 1-2.5-2.499C1.5 60.881 1.5 59.463 1.5 56.627z"
      />
    </g>
    <rect width={20} height={4} x={9.5} y={25} fill="#000" rx={2} />
    <rect width={10} height={4} x={31.5} y={25} fill="#FFDE21" rx={2} />
    <rect width={4} height={4} x={9.5} y={33} fill="#000" rx={2} />
    <rect
      width={4}
      height={4}
      fill="#000"
      rx={2}
      transform="matrix(1 0 0 -1 37.5 45)"
    />
    <rect
      width={10}
      height={4}
      fill="#722CF0"
      rx={2}
      transform="matrix(1 0 0 -1 9.5 53)"
    />
    <rect width={26} height={4} x={15.5} y={33} fill="#722CF0" rx={2} />
    <rect
      width={20}
      height={4}
      fill="#000"
      rx={2}
      transform="matrix(1 0 0 -1 21.5 53)"
    />
    <rect
      width={26}
      height={4}
      fill="#FFDE21"
      rx={2}
      transform="matrix(1 0 0 -1 9.5 45)"
    />
    <defs>
      <filter
        id="Cfile_svg__a"
        width={52}
        height={68}
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
          result="effect1_dropShadow_7059_25056"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_7059_25056"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default SvgCfile;
