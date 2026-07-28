import { useSelector } from "react-redux"

export default function FolderIcon({ className }: { className?: string }) {
  const themeMode = useSelector((state: any) => state.theme.mode)
const color = themeMode === 'dark' ? '#000000' : 'black'

  return (
    <svg className={className} width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.3945 0C21.9868 1.61838e-05 22.5658 0.175387 23.0586 0.503906L30.6641 5.57422C31.4986 6.13061 32 7.06727 32 8.07031V35C32 36.6569 30.6569 38 29 38H3C1.34315 38 0 36.6569 0 35V3C0 1.34315 1.34315 0 3 0H21.3945ZM7 30C6.44772 30 6 30.4477 6 31C6 31.5523 6.44772 32 7 32H25C25.5523 32 26 31.5523 26 31C26 30.4477 25.5523 30 25 30H7ZM7 24C6.44772 24 6 24.4477 6 25C6 25.5523 6.44772 26 7 26H25C25.5523 26 26 25.5523 26 25C26 24.4477 25.5523 24 25 24H7ZM7 18C6.44772 18 6 18.4477 6 19C6 19.5523 6.44772 20 7 20H25C25.5523 20 26 19.5523 26 19C26 18.4477 25.5523 18 25 18H7ZM7 12C6.44772 12 6 12.4477 6 13C6 13.5523 6.44772 14 7 14H25C25.5523 14 26 13.5523 26 13C26 12.4477 25.5523 12 25 12H7Z" fill={color}/>
    </svg>
  )
}
