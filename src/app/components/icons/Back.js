import * as React from "react";
const SvgBack = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={66}
    height={57}
    fill="none"
    {...props}
  >
    <rect width={66} height={57} fill="#fff" rx={5} />
    <rect width={60} height={50} x={3} y={3} fill="url(#Back_svg__a)" rx={5} />
    <rect width={60} height={50} x={3} y={3} fill="url(#Back_svg__b)" rx={5} />
    <g filter="url(#Back_svg__c)">
      <path
        fill="#fff"
        d="M46.946 26.468H24.008l10.021-9.97a2.052 2.052 0 0 0-.664-3.343 2.06 2.06 0 0 0-2.231.442L17.6 27.06a2.03 2.03 0 0 0-.445 2.22c.103.247.254.472.445.66l13.533 13.463a2.05 2.05 0 0 0 2.231.442 2.05 2.05 0 0 0 1.108-1.102 2.03 2.03 0 0 0-.444-2.22l-10.021-9.97h22.938c1.13 0 2.054-.919 2.054-2.042a2.054 2.054 0 0 0-2.054-2.043"
      />
    </g>
    <defs>
      <linearGradient
        id="Back_svg__a"
        x1={33}
        x2={33}
        y1={21.5}
        y2={57.5}
        gradientUnits="userSpaceOnUse"
      >
        <stop />
        <stop offset={0.773} />
        <stop offset={1} />
      </linearGradient>
      <linearGradient
        id="Back_svg__b"
        x1={59.5}
        x2={64.5}
        y1={22.5}
        y2={22.5}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.257} />
        <stop offset={0.328} />
        <stop offset={0.772} />
        <stop offset={1} />
      </linearGradient>
      <filter
        id="Back_svg__c"
        width={40}
        height={39}
        x={13}
        y={10}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_6_548" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_6_548"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default SvgBack;
