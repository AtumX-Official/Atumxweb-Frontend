import { useSelector } from "react-redux"

export default function Aboutbg({ className }: { className?: string }) {
    const themeMode = useSelector((state: any) => state.theme.mode)
    const fillColor = themeMode === 'dark' ? 'white' : 'black';

return (
<svg className={className} width="250" height="250" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M125 0C194.036 0 250 55.9639 250 125C250 194.035 194.036 250 125 250C55.9646 250 0 194.035 0 125C0 55.9639 55.9646 0 125 0ZM137.527 112.5H112.527V187.5H137.527V112.5ZM125.127 59.375C116.013 59.375 109.402 65.9494 109.402 74.8266C109.402 84.063 115.839 90.625 125.127 90.625C134.054 90.625 140.652 84.063 140.652 75C140.652 65.9494 134.054 59.375 125.127 59.375Z" fill={fillColor}/>
</svg>

)
}