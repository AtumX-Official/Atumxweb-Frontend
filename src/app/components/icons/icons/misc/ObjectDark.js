import * as React from "react";
const SvgObjectDark = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={210}
    height={180}
    fill="none"
    {...props}
  >
    <path
      stroke="#fff"
      d="M30 50V30h20M180 50V30h-20M30 130v20h20M180 130v20h-20"
    />
    <rect
      width={140}
      height={110}
      x={35}
      y={35}
      stroke="#fff"
      opacity={0.4}
      rx={4}
    />
    <path
      stroke="#fff"
      d="m70 85 35-20 35 20v40l-35 20-35-20ZM70 85l35 20m35-20-35 20m0 40v-40"
    />
    <circle cx={105} cy={65} r={5} fill="#8726F6" stroke="#fff" />
    <circle cx={70} cy={85} r={5} fill="#F6268B" stroke="#fff" />
    <circle cx={140} cy={85} r={5} fill="#F6268B" stroke="#fff" />
    <circle cx={105} cy={105} r={6} fill="#F6EC24" stroke="#fff" />
    <circle cx={70} cy={125} r={5} fill="#8726F6" stroke="#fff" />
    <circle cx={140} cy={125} r={5} fill="#8726F6" stroke="#fff" />
    <circle cx={105} cy={145} r={5} fill="#8726F6" stroke="#fff" />
    <circle cx={105} cy={105} r={22} stroke="#F6268B" opacity={0.85} />
  </svg>
);
export default SvgObjectDark;
