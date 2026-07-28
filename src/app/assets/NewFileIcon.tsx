import { useSelector } from "react-redux"

export default function FileCodeIcon({ className }: { className?: string }) {
  const themeMode = useSelector((state: any) => state.theme.mode)
  const fillColor = themeMode === "dark" ? "white" : "black"

  return (
    <svg
      className={`group ${className}`}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.4 32H17.6C13.0745 32 10.8118 32 9.40588 30.5941C8 29.1883 8 26.9254 8 22.4V17.6C8 13.0745 8 10.8118 9.40588 9.40588C10.8118 8 13.0864 8 17.6358 8C18.363 8 18.9457 8 19.436 8.01999C19.4199 8.11591 19.4114 8.21376 19.411 8.31268L19.4 11.714C19.3999 13.0305 19.3998 14.194 19.5259 15.1318C19.6626 16.1483 19.9764 17.1647 20.8059 17.9942C21.6354 18.8238 22.6518 19.1376 23.6683 19.2742C24.6062 19.4004 25.7696 19.4002 27.0861 19.4001H27.2H31.9489C32 20.0413 32 20.8281 32 21.8755V22.4C32 26.9254 32 29.1883 30.5941 30.5941C29.1883 32 26.9254 32 22.4 32Z"
          fill="#FFDE21"
        />
        <path
          d="M28.8213 14.7396L24.0707 10.4641C22.7173 9.24603 22.0407 8.63698 21.2103 8.31836L21.1992 11.5997C21.1992 14.4282 21.1992 15.8424 22.0779 16.7211C22.9566 17.5997 24.3708 17.5997 27.1992 17.5997H31.4953C31.0602 16.7547 30.2813 16.0536 28.8213 14.7396Z"
          fill="#FFDE21"
        />
        <path
          d="M12.2308 23L11 24.25L12.2308 25.5M17.7692 25.5L19 26.75L17.7692 28M15.9231 23L14.0769 28"
          stroke={fillColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <defs>
        <filter
          id="filter0_d"
          x="-1.5"
          y="-1"
          width="44"
          height="44"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.5" dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  )
}