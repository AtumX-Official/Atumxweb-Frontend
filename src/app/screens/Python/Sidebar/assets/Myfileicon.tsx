import { useSelector } from "react-redux"
export default function Libraryicon({ className }: { className?: string }) {
      const themeMode = useSelector((state: any) => state.theme.mode)
      const fillColor = themeMode === 'dark' ? 'white' : 'black'
    return (

<svg className= {`group ${className}`}width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14 12.25C16.8995 12.25 19.25 9.89949 19.25 7C19.25 4.10051 16.8995 1.75 14 1.75C11.1005 1.75 8.75 4.10051 8.75 7C8.75 9.89949 11.1005 12.25 14 12.25Z" fill={fillColor}/>
<path d="M24.5 21C24.5 18.1004 22.1496 15.75 19.25 15.75H8.75C5.85051 15.75 3.5 18.1004 3.5 21V26.25H24.5V21Z" fill={fillColor}/>
</svg>
    )
}