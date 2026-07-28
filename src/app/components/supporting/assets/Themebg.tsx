import { useSelector } from "react-redux"

export default function Themebg({ className }: { className?: string }) {
    const themeMode = useSelector((state: any) => state.theme.mode)
    const fillColor = themeMode === 'dark' ? 'white' : 'black';

    return (
<svg className={className} width="235" height="250" viewBox="0 0 235 250" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M125.554 0V40.6445C125.554 45.8223 131.176 50.0196 138.11 50.0196C145.044 50.0196 150.666 45.8223 150.666 40.6445V0H167.407V53.1394C167.407 58.3171 173.029 62.5144 179.963 62.5144C186.897 62.5144 192.519 58.3171 192.519 53.1394V0H221.819C228.755 0 234.375 4.1974 234.375 9.37506V112.501H0V9.37506C0 4.1974 5.6215 0 12.5558 0H125.554Z" fill={fillColor}/>
<path d="M0 131.249V153.15C0 168.683 16.8643 181.276 37.6675 181.276H83.7001V225C83.7001 238.807 98.6899 250 117.182 250C135.674 250 150.664 238.807 150.664 225V181.276H196.707C217.512 181.276 234.375 168.683 234.375 153.15V131.249H0Z" fill={fillColor}/>
</svg>
    )
}
