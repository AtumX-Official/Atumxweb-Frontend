import * as React from "react";
const SvgPoseLight = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={210}
    height={180}
    fill="none"
    {...props}
  >
    <path
      stroke="#000"
      d="M105 58v52M80 68h50M80 68 65 88M65 88l-15 20M130 68l15 20M145 88l15 20M90 110h30M90 110l-10 28M80 138l-5 30M120 110l10 28M130 138l5 30"
    />
    <circle cx={105} cy={38} r={14} fill="#F6EC24" stroke="#000" />
    <circle cx={80} cy={68} r={5} fill="#F6268B" />
    <circle cx={130} cy={68} r={5} fill="#F6268B" />
    <circle cx={65} cy={88} r={5} fill="#F6268B" />
    <circle cx={145} cy={88} r={5} fill="#F6268B" />
    <circle cx={50} cy={108} r={5} fill="#8726F6" />
    <circle cx={160} cy={108} r={5} fill="#8726F6" />
    <circle cx={90} cy={110} r={5} fill="#F6268B" />
    <circle cx={120} cy={110} r={5} fill="#F6268B" />
    <circle cx={80} cy={138} r={5} fill="#F6268B" />
    <circle cx={130} cy={138} r={5} fill="#F6268B" />
    <circle cx={75} cy={168} r={5} fill="#8726F6" />
    <circle cx={135} cy={168} r={5} fill="#8726F6" />
  </svg>
);
export default SvgPoseLight;
