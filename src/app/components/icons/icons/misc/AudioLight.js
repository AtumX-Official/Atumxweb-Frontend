import * as React from "react";
const SvgAudioLight = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={210}
    height={180}
    fill="none"
    {...props}
  >
    <path stroke="#000" d="m30 70 25-25 25 35 25-50 25 30 25-20 25 35" />
    <path
      stroke="#000"
      d="M30 130V70M55 150V45M80 120V80M105 160V30M130 140V60M155 155V40M180 125V75"
      opacity={0.3}
    />
    <circle cx={30} cy={70} r={6} fill="#F6268B" stroke="#000" />
    <circle cx={55} cy={45} r={6} fill="#F6268B" stroke="#000" />
    <circle cx={80} cy={80} r={6} fill="#F6EC24" stroke="#000" />
    <circle cx={105} cy={30} r={8} fill="#8726F6" stroke="#000" />
    <circle cx={130} cy={60} r={6} fill="#F6268B" stroke="#000" />
    <circle cx={155} cy={40} r={6} fill="#F6268B" stroke="#000" />
    <circle cx={180} cy={75} r={6} fill="#8726F6" stroke="#000" />
  </svg>
);
export default SvgAudioLight;
