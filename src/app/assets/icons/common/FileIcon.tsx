import { useSelector } from "react-redux"
export default function FileIcon({ className }: { className?: string }) {
    const themeMode = useSelector((state: any) => state.theme.mode)
    const strokecolor = themeMode === 'dark' ? 'white' : 'black'

    return (
  
<svg className={className} width="27" height="25" viewBox="0 0 27 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23 19.5H15M19 23.5V15.5" stroke={strokecolor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M12 23.5H5.22247C4.89832 23.5 4.58744 23.3712 4.35823 23.142C4.12902 22.9128 4.00025 22.6019 4.00025 22.2777V2.72222C4.00025 2.39807 4.12902 2.08719 4.35823 1.85798C4.58744 1.62877 4.89832 1.5 5.22247 1.5H16.2224L21.1113 6.38888V11.5" stroke={strokecolor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
    )
}