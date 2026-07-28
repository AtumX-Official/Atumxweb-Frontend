import { useSelector } from "react-redux"

export default function About({ className }: { className?: string }) {
    const themeMode = useSelector((state: any) => state.theme.mode)
    const fillColor = themeMode === 'dark' ? 'white' : 'black';   

    return (

<svg className={className} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M16 0C24.8366 0 32 7.16338 32 16C32 24.8365 24.8366 32 16 32C7.16347 32 0 24.8365 0 16C0 7.16338 7.16347 0 16 0ZM17.6035 14.4H14.4035V24H17.6035V14.4ZM16.0163 7.6C14.8497 7.6 14.0035 8.44152 14.0035 9.57781C14.0035 10.7601 14.8274 11.6 16.0163 11.6C17.1589 11.6 18.0035 10.7601 18.0035 9.6C18.0035 8.44152 17.1589 7.6 16.0163 7.6Z" fill={fillColor}/>
</svg>
    )
}