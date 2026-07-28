import { useSelector } from "react-redux"

export default function AddFileIcon({ className }: { className?: string }) {
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
        d="M40.12 15.71 29.29 4.88A3 3 0 0 0 27.17 4H10a3 3 0 0 0-3 3v5a1 1 0 0 0 2 0V7a1 1 0 0 1 1-1h17v9a3 3 0 0 0 3 3h9v23a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V16a1 1 0 0 0-2 0v25a3 3 0 0 0 3 3h28a3 3 0 0 0 3-3V17.83a3 3 0 0 0-.88-2.12ZM29 15V7.41L37.59 16H30a1 1 0 0 1-1-1Zm-4 13h6.07a1 1 0 0 1 0 2H25v6.07a1 1 0 0 1-2 0V30h-6.07a1 1 0 0 1 0-2H23v-6.07a1 1 0 0 1 2 0Z"
        fill={color}
      />
    </svg>
  )
}