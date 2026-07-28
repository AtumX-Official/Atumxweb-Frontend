interface SensorProps extends React.SVGProps<SVGSVGElement> {
    isSelected?:boolean
    className?: string;
  }  
export default function Sensoricon({isSelected,className}: SensorProps) {
return(
<svg width="72" height="76" viewBox="0 0 72 76" fill="none" xmlns="http://www.w3.org/2000/svg" className={`group ${className}`}>
<rect width="72" height="72" rx="8" fill={isSelected ? "white": "#FF7104"}/>
<path d="M27.7506 44.3332C23.1945 39.7309 23.1945 32.269 27.7506 27.6666M21.1507 51C12.9498 42.7158 12.9498 29.2843 21.1507 21M44.2494 44.3332C48.8054 39.7309 48.8054 32.269 44.2494 27.6666M50.8492 51C59.0503 42.7158 59.0503 29.2843 50.8492 21M38.3333 36.0002C38.3333 37.3017 37.2887 38.3572 36 38.3572C34.7113 38.3572 33.6667 37.3017 33.6667 36.0002C33.6667 34.6984 34.7113 33.6432 36 33.6432C37.2887 33.6432 38.3333 34.6984 38.3333 36.0002Z" stroke={isSelected ? "#FF7104" : "white"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
)
}