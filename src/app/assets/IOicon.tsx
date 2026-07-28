interface IOProps extends React.SVGProps<SVGSVGElement> {
    isSelected?: boolean;
    className?: string;
  }  
export default function IOicon({ isSelected,className, }: IOProps) {
return(
<svg width="72" height="76" viewBox="0 0 72 76" fill="none" xmlns="http://www.w3.org/2000/svg"
className={`group ${className}`} 
>
<rect width="72" height="72" rx="8" fill={isSelected ? "white": "#B515D9"} />
<path d="M51 15C52.1046 15 53 15.8954 53 17V33H55C56.1046 33 57 33.8954 57 35V55C57 56.1046 56.1046 57 55 57H17C15.8954 57 15 56.1046 15 55V35C15 33.8954 15.8954 33 17 33H19V17C19 15.8954 19.8954 15 21 15C22.1046 15 23 15.8954 23 17V33H29V17C29 15.8954 29.8954 15 31 15C32.1046 15 33 15.8954 33 17V33H39V17C39 15.8954 39.8954 15 41 15C42.1046 15 43 15.8954 43 17V33H49V17C49 15.8954 49.8954 15 51 15Z" fill={isSelected ? "#B515D9" : "white"}/>
</svg>
)
}