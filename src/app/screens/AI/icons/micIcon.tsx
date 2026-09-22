export default function MicIcon(){
    return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_mic_icon)">
                <rect x="2" width="64" height="64" rx="8" fill="black" />
                <rect x="28" y="14" width="12" height="22" rx="6" fill="white" />
                <path d="M22 29V31C22 37.6274 27.3726 43 34 43C40.6274 43 46 37.6274 46 31V29" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <path d="M34 43V50" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <path d="M28 50H40" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </g>
            <defs>
                <filter id="filter0_d_mic_icon" x="0" y="0" width="72" height="72" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dx="2" dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_mic_icon" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_mic_icon" result="shape" />
                </filter>
            </defs>
        </svg>
    );
}
