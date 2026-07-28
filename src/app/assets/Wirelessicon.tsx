import { useState } from "react";
interface WirelessiconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
  }  
export default function Wirelessicon({ className, ...rest }: WirelessiconProps) {
        const [isHovered, setIsHovered] = useState(false);
  
return(
<svg width="42" height="31" viewBox="0 0 42 31" fill="none" xmlns="http://www.w3.org/2000/svg"
className={`group ${className}`} 
{...rest}
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
onClick={() => {
    if (rest.onClick) rest.onClick({} as any); // Forward onClick if provided
  }}
>
<path fillRule="evenodd" clipRule="evenodd" d="M4.44169 11.9764C13.5866 2.89671 28.4135 2.89671 37.5584 11.9764C38.5744 12.9854 40.2219 12.9854 41.238 11.9764C42.254 10.9676 42.254 9.3318 41.238 8.32301C30.0608 -2.77434 11.9392 -2.77434 0.762068 8.32301C-0.254023 9.3318 -0.254023 10.9676 0.762068 11.9764C1.77816 12.9854 3.4256 12.9854 4.44169 11.9764ZM11.801 19.2833C16.8814 14.2389 25.1185 14.2389 30.1992 19.2833C31.2152 20.2921 32.8627 20.2921 33.8788 19.2833C34.8948 18.2743 34.8948 16.6388 33.8788 15.63C26.766 8.56791 15.234 8.56791 8.12134 15.63C7.10522 16.6388 7.10522 18.2743 8.12134 19.2833C9.13743 20.2921 10.7849 20.2921 11.801 19.2833ZM15.4801 22.9367C18.5284 19.9101 23.4707 19.9101 26.5191 22.9367C27.5351 23.9455 27.5351 25.5813 26.5191 26.59L22.8395 30.2434C21.8232 31.2522 20.1759 31.2522 19.1599 30.2434L15.4801 26.59C14.464 25.5813 14.464 23.9455 15.4801 22.9367Z" fill={isHovered ? "#F6EC24" :"white"}/>
</svg>
)
}