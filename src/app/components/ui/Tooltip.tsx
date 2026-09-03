interface TooltipProps {
  text : string,
  marginTop? : string,
  py? : string
}

export const Tooltip = ({ text , marginTop = "mt-1",py="py-[3px]"} : TooltipProps) => (
  <span
    className={`
      absolute top-[100%] left-1/2 -translate-x-[20%] ${marginTop} ${py}
      px-2 py-[3px] text-xs text-black bg-white
      rounded font-bold border border-black
      whitespace-nowrap opacity-0 group-hover:opacity-100
      transition-opacity duration-200
      pointer-events-none  z-[9999] antialiased
    `}
  >
    {text}
  </span>
);