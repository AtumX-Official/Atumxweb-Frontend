import { useSelector } from "react-redux"
import type { SVGProps } from "react";

type HelpProps = SVGProps<SVGSVGElement>;

export default function Help({ className, ...rest } : HelpProps) {
    const themeMode = useSelector((state: any) => state.theme.mode)
    const color = themeMode === 'dark' ? 'white' : '#E8F5E9'

    return(
<svg className={className} width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.00049 8.75405C2.55677 7.03995 3.57658 5.51333 4.94654 4.34254C6.31651 3.17172 7.98291 2.40307 9.76267 2.12067C11.5427 1.83829 13.3671 2.05379 15.0323 2.74307C16.6973 3.43233 18.1377 4.5689 19.1974 6.02666C20.2568 7.4844 20.8929 9.20619 21.0346 11.0027C21.1762 12.7992 20.8172 14.5997 19.9991 16.2053C19.181 17.8112 17.9365 19.1603 16.3998 20.102C14.8633 21.0436 13.0962 21.5422 11.2942 21.5422V23.9839M11.4159 33.7552V33.9995L11.1726 34V33.7552H11.4159Z" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
    )
}