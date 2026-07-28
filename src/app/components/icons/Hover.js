import * as React from "react";
const SvgHover = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={600}
    height={360}
    fill="none"
    {...props}
  >
    <path
      fill="url(#hover_svg__a)"
      d="M0 16C0 7.163 7.163 0 16 0h568c8.837 0 16 7.163 16 16v344H0z"
    />
    <defs>
      <linearGradient
        id="hover_svg__a"
        x1={600}
        x2={-38.411}
        y1={342.5}
        y2={225.132}
        gradientUnits="userSpaceOnUse"
      >
        <stop />
        <stop offset={0.192} />
        <stop offset={1} />
      </linearGradient>
    </defs>
  </svg>
);
export default SvgHover;
