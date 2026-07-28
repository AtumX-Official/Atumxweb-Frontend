interface AIIconProps {
  isSelected?: boolean
  className?: string
}

export default function AIIcon({ isSelected, className }: AIIconProps) {
  const bg = isSelected ? 'white' : '#7C3AED'
  const fg = isSelected ? '#7C3AED' : 'white'

  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="72" height="72" rx="8" fill={bg} />
      {/* Central node */}
      <circle cx="36" cy="36" r="6" fill={fg} />
      {/* Top node */}
      <circle cx="36" cy="16" r="5" fill={fg} />
      {/* Bottom-left node */}
      <circle cx="20" cy="54" r="5" fill={fg} />
      {/* Bottom-right node */}
      <circle cx="52" cy="54" r="5" fill={fg} />
      {/* Connections */}
      <line x1="36" y1="21" x2="36" y2="30" stroke={fg} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="31" y1="39" x2="23" y2="49" stroke={fg} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="41" y1="39" x2="49" y2="49" stroke={fg} strokeWidth="2.5" strokeLinecap="round" />
      {/* Cross connections */}
      <line x1="36" y1="19" x2="23" y2="49" stroke={fg} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="36" y1="19" x2="49" y2="49" stroke={fg} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="23" y1="51" x2="49" y2="51" stroke={fg} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  )
}
