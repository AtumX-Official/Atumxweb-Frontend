interface Clearallprops extends React.SVGProps<SVGSVGElement> {
    className?: string;
  }  

export default function Clearall({ className, ...rest }: Clearallprops){
    return(
<svg className={`group ${className}`}  width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
{...rest}
onClick={() => {{
    if (rest.onClick) rest.onClick({} as any); 
}}}>
<circle cx="24" cy="24" r="24" fill="#FF0000"/>
<path d="M29.25 29H34.25V31.5H29.25V29ZM29.25 19H38V21.5H29.25V19ZM29.25 24H36.75V26.5H29.25V24ZM14.25 31.5C14.25 32.875 15.375 34 16.75 34H24.25C25.625 34 26.75 32.875 26.75 31.5V19H14.25V31.5ZM28 15.25H24.25L23 14H18L16.75 15.25H13V17.75H28V15.25Z" fill="white"/>
</svg>
    )
}
