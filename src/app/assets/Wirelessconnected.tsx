interface WirelessconnectedProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
    status?: string;
  }  
export default function Wirelessconnected({ className,status = 'connected', ...rest }: WirelessconnectedProps) {
  const fillColor = status === "connected" ? "#2EED08" : "white";
return(
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
className={`group ${className}`} 
{...rest}
onClick={() => {
    if (rest.onClick) rest.onClick({} as any); // Forward onClick if provided
  }}
>
<rect width="64" height="64" rx="8" fill="black"/>
<path fillRule="evenodd" clipRule="evenodd" d="M15.4417 28.9764C24.5866 19.8967 39.4135 19.8967 48.5584 28.9764C49.5744 29.9854 51.2219 29.9854 52.238 28.9764C53.254 27.9676 53.254 26.3318 52.238 25.323C41.0608 14.2257 22.9392 14.2257 11.7621 25.323C10.746 26.3318 10.746 27.9676 11.7621 28.9764C12.7782 29.9854 14.4256 29.9854 15.4417 28.9764ZM22.801 36.2833C27.8814 31.2389 36.1185 31.2389 41.1992 36.2833C42.2152 37.2921 43.8627 37.2921 44.8788 36.2833C45.8948 35.2743 45.8948 33.6388 44.8788 32.63C37.766 25.5679 26.234 25.5679 19.1213 32.63C18.1052 33.6388 18.1052 35.2743 19.1213 36.2833C20.1374 37.2921 21.7849 37.2921 22.801 36.2833ZM26.4801 39.9367C29.5284 36.9101 34.4707 36.9101 37.5191 39.9367C38.5351 40.9455 38.5351 42.5813 37.5191 43.59L33.8395 47.2434C32.8232 48.2522 31.1759 48.2522 30.1599 47.2434L26.4801 43.59C25.464 42.5813 25.464 40.9455 26.4801 39.9367Z" fill={fillColor}/>
</svg>
)
}