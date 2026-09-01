interface TooltipProps {
  text: string;
  marginTop?: string;
  py?: string;
  positionClasses?: string;
}

export const Tooltip = ({ text, marginTop = "mt-0",py="py-[3px]", positionClasses = "top-[100%] left-1/2 -translate-x-1/2" } : TooltipProps) => (
  <span
    className={`
      absolute ${positionClasses} ${marginTop} ${py}
      px-2 py-[3px] text-xs text-black bg-white
      rounded font-bold border border-black
      whitespace-nowrap opacity-0 group-hover:opacity-100
      transition-opacity duration-200
      pointer-events-none z-[20] antialiased
    `}
  >
    {text}
  </span>
);