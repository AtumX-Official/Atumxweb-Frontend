interface Autoscrollprops extends React.SVGProps<SVGSVGElement> {
    isSelected?: boolean;
    className?: string;
  }  
export default function AutoScroll({isSelected,className,}: Autoscrollprops) {
return(

<svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg"
className={`group ${className} `}
>
<path d="M4 16.6001C4 18.8279 4.88505 20.9646 6.46036 22.5399C8.03568 24.1152 10.1722 25 12.4 25C14.6279 25 16.7645 24.1152 18.3398 22.5399C19.9151 20.9646 20.8001 18.8279 20.8001 16.6001V9.40004C20.8001 7.17221 19.9151 5.03568 18.3398 3.46036C16.7645 1.88505 14.6279 1 12.4 1C10.1722 1 8.03568 1.88505 6.46036 3.46036C4.88505 5.03568 4 7.17221 4 9.40004V16.6001Z" stroke={isSelected?"#2EED08":"#3A3A3A"} fill={isSelected?"#2EED08": ""} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M12.4001 5.7998V15.3999" stroke={isSelected?  "White":"#3A3A3A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M16.0001 11.8003L12.4001 15.4003L8.80005 11.8003" stroke={isSelected?  "White":"#3A3A3A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

)
}