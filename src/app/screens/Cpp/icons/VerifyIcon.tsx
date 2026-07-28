import { useSelector } from "react-redux"
export default function ArrowIcon({ size = 72 }: { size?: number }) {
    const themeMode = useSelector((state: any) => state.theme.mode)
    const color = themeMode === 'dark' ? '#000000' : 'black'
    return (
        <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_5131_15493)">
                <circle cx="34" cy="32" r="32" fill="#FFDE21" />
            </g>
            <path d="M16 33.803L27.1364 45L52 20" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
                <filter id="filter0_d_5131_15493" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dx="2" dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5131_15493" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5131_15493" result="shape" />
                </filter>
            </defs>
        </svg>
    )
}
