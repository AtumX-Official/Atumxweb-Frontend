import { useSelector } from "react-redux"

export default function Theme({ className }: { className?: string }) {
    const themeMode = useSelector((state: any) => state.theme.mode)
    const fillColor = themeMode === 'dark' ? 'white' : 'black';   

    return (

<svg className={className} width="30" height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.071 0V5.20247C16.071 5.86522 16.7905 6.40247 17.6781 6.40247C18.5657 6.40247 19.2853 5.86522 19.2853 5.20247V0H21.4281V6.8018C21.4281 7.46455 22.1477 8.0018 23.0353 8.0018C23.9228 8.0018 24.6424 7.46455 24.6424 6.8018V0H28.3929C29.2806 0 30 0.537264 30 1.2V14.4H0V1.2C0 0.537264 0.719552 0 1.60715 0H16.071Z" fill={fillColor}/>
<path d="M0 16.7998V19.6032C0 21.5913 2.15863 23.2032 4.82144 23.2032H10.7136V28.7998C10.7136 30.5672 12.6323 31.9998 14.9993 31.9998C17.3663 31.9998 19.285 30.5672 19.285 28.7998V23.2032H25.1786C27.8415 23.2032 30 21.5913 30 19.6032V16.7998H0Z" fill={fillColor}/>
</svg>
    )
}