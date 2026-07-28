import { useSelector } from "react-redux"

export default function AddFolderIcon({ className }: { className?: string }) {
  const themeMode = useSelector((state: any) => state.theme.mode)
  const color = themeMode === 'dark' ? 'white' : 'black'

  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M41 11H21.57l-1.12-2.31A3 3 0 0 0 17.75 7H7a3 3 0 0 0-3 3v28a3 3 0 0 0 3 3h34a3 3 0 0 0 3-3V14a3 3 0 0 0-3-3Zm1 27a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h10.75a1 1 0 0 1 .9.56l2.79 5.75a3 3 0 0 0 2.7 1.69H39a1 1 0 0 0 0-2H24.14a1 1 0 0 1-.9-.56l-.7-1.44H41a1 1 0 0 1 1 1ZM31.07 28a1 1 0 0 1-1 1H25v5.07a1 1 0 0 1-2 0V29h-5.07a1 1 0 0 1 0-2H23v-5.07a1 1 0 0 1 2 0V27h5.07a1 1 0 0 1 1 1Z"
        fill={color}
      />
    </svg>
  )
}