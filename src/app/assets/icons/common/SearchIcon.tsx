import { useSelector } from "react-redux";
import type { SVGProps } from "react";

type SearchIconProps = SVGProps<SVGSVGElement>;


export default function SearchIcon({ className, ...rest } : SearchIconProps) {
    const themeMode = useSelector((state: any) => state.theme.mode)
    const color = themeMode === 'dark' ? '#1B2B2D' : 'black'
    return (
        <svg className={className} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.9961 0.5C23.0021 0.5 29.4921 6.99011 29.4922 14.9961C29.4922 18.0948 28.5159 20.968 26.8594 23.3242L36.7588 33.2236C37.7346 34.1997 37.7348 35.7828 36.7588 36.7588C35.7828 37.7348 34.1997 37.7346 33.2236 36.7588L23.3242 26.8594C20.968 28.5159 18.0948 29.4922 14.9961 29.4922C6.99011 29.4921 0.5 23.0021 0.5 14.9961C0.50011 6.99018 6.99018 0.50011 14.9961 0.5ZM14.9961 5.49902C9.75102 5.49913 5.49913 9.75102 5.49902 14.9961C5.49902 20.2412 9.75095 24.4931 14.9961 24.4932C17.6195 24.4932 19.9906 23.4334 21.7119 21.7119C23.4334 19.9906 24.4932 17.6195 24.4932 14.9961C24.4931 9.75095 20.2412 5.49902 14.9961 5.49902Z" fill={color}/>
        </svg>
    )
}
