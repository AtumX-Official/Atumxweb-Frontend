import * as React from "react";
const SvgElectron = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:vectornator="http://vectornator.io"
    xmlSpace="preserve"
    style={{
      fillRule: "nonzero",
      clipRule: "evenodd",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }}
    viewBox="256.311 573.18 1874.66 521.64"
    {...props}
  >
    <defs>
      <filter
        id="electron_svg__a"
        width={347.52}
        height={306.329}
        x={256.311}
        y={679.322}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feGaussianBlur in="SourceGraphic" result="Blur" stdDeviation={0.287} />
      </filter>
    </defs>
    <g vectornator:layerName="Layer 2">
      <g vectornator:layerName="Group 2">
        <path
          vectornator:blur={0.574}
          stroke="#000"
          d="M398.852 683.271 260.259 981.702l70.986-1.302 27.637-62.031 144.087-1.302 28.085 64.187 68.828-.854-133.464-297.129zm25.154 66.996 50.675 115.718-99.07.488z"
          filter="url(#electron_svg__a)"
        />
        <path
          vectornator:layerName="Curve 3"
          stroke="#000"
          d="m589.21 732.066.768-50.144 257.369.512.511 49.12-95.78 1.467-.787 246.835-61.054.255-3.835-246.436z"
        />
        <path
          vectornator:layerName="Curve 6"
          stroke="#000"
          d="m886.511 683.453 64.031.818L953.427 881s5.246 50.887 71.343 50.625c66.11-.263 68.65-47.098 68.89-54.466.23-7.368.88-194.465.88-194.465l64.49.331-1.32 198.781s-10.92 106.833-132.63 105.179c-121.719-1.653-137.141-94.853-136.876-106.262s-1.693-197.27-1.693-197.27"
        />
        <path
          vectornator:layerName="Curve 4"
          stroke="#000"
          d="m1236.01 980.074.4-296.65 53.5-.405 116.07 189.861 115.2-190.291 52.29.394 1.97 298.016-58.59.786-2.75-186.751-91.6 152.546-32.24.787-91.22-149.009-2.16 180.812z"
        />
        <path
          vectornator:layerName="Curve 7"
          fill="#ff8202"
          stroke="#ff8201"
          d="M1584.69 578.577 1810 576.41l96.76 159.594 103.27-158.872h91.71l-153.09 226.032 179.09 285.246-220.98 2.89-115.22-179.213-120.58 179.503-85.46-.39 162.15-246.205z"
        />
      </g>
    </g>
  </svg>
);
export default SvgElectron;
