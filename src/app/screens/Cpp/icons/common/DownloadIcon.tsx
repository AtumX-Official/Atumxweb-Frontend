import { useSelector } from "react-redux"

export default function DownloadIcon({ className }) {
  const themeMode = useSelector((state: any) => state.theme.mode)
  const color = themeMode === 'dark' ? '#000000' : 'black'

  return (
    <svg className={className} width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M13.569 13.5C12.6946 13.5 11.9216 14.068 11.6603 14.9025L7.04771 29.636C6.86188 30.2295 6.23046 30.5605 5.63662 30.3755C5.04144 30.1902 4.70965 29.557 4.89601 28.9621L10.0054 12.6521C10.2668 11.8178 11.0397 11.25 11.914 11.25H31.8161C32.9207 11.25 33.8161 10.3546 33.8161 9.24999V6.49999C33.8161 5.39542 32.9207 4.49999 31.8161 4.49999H17.5221C16.9171 4.49999 16.3447 4.22615 15.965 3.75515L13.5385 0.744846C13.1588 0.273839 12.5863 0 11.9814 0H2C0.895432 0 0 0.895431 0 2V32.625C0 34.4857 1.51722 36 3.38161 36H32.7183C34.3234 36 35.7189 34.8592 36.0345 33.2865L39.5204 15.893C39.7685 14.6552 38.8218 13.5 37.5594 13.5H13.569Z" fill={color}/>
    </svg>
    
    
  )
}
