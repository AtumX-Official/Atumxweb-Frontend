interface LogicProps extends React.SVGProps<SVGSVGElement> {
    isSelected?: boolean;
    className?: string;
  }  
export default function Logicicon({isSelected,className, }: LogicProps) {
return(

<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={`group ${className}`} 
>
<rect width="56" height="56" rx="8" fill={isSelected ? "white" :"#FF0CD2"}/>
<path d="M24 16C24 18.2091 22.2091 20 20 20C17.7909 20 16 18.2091 16 16C16 13.7909 17.7909 12 20 12C22.2091 12 24 13.7909 24 16Z" fill={isSelected ? "#FF0CD2":"white"}/>
<path d="M40 16C40 18.2091 38.2091 20 36 20C33.7909 20 32 18.2091 32 16C32 13.7909 33.7909 12 36 12C38.2091 12 40 13.7909 40 16Z" fill={isSelected ? "#FF0CD2":"white"}/>
<path d="M16 37.28C16 36.5731 16.5731 36 17.28 36H22.72C23.4269 36 24 36.5731 24 37.28V42.72C24 43.4269 23.4269 44 22.72 44H17.28C16.5731 44 16 43.4269 16 42.72V37.28Z" fill={isSelected ? "#FF0CD2":"white"}/>
<path d="M20 18.24V36.08V28.16C20 28.16 36.32 34.72 36.32 25.76C36.32 16.8 35.84 17.3601 35.84 17.3601M24 16C24 18.2091 22.2091 20 20 20C17.7909 20 16 18.2091 16 16C16 13.7909 17.7909 12 20 12C22.2091 12 24 13.7909 24 16ZM40 16C40 18.2091 38.2091 20 36 20C33.7909 20 32 18.2091 32 16C32 13.7909 33.7909 12 36 12C38.2091 12 40 13.7909 40 16ZM17.28 44H22.72C23.4269 44 24 43.4269 24 42.72V37.28C24 36.5731 23.4269 36 22.72 36H17.28C16.5731 36 16 36.5731 16 37.28V42.72C16 43.4269 16.5731 44 17.28 44Z" stroke={isSelected? "#FF0CD2":"white"} strokeWidth="5" strokeLinecap="round"/>
</svg>


)
}