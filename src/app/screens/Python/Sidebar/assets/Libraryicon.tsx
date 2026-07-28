import { useSelector } from "react-redux"
export default function Libraryicon({ className }: { className?: string }) {
      const themeMode = useSelector((state: any) => state.theme.mode)
      const fillColor = themeMode === 'dark' ? 'white' : 'black'
    return (

<svg className={`group ${className}`}  width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24.9183 0.0255869L17.7261 1.41494V0H9.99899H7.72637H0V35.8303H7.72629H9.99892H17.7259V13.3486L22.4198 35.9904L31.9915 34.1411L24.9183 0.0255869ZM3.50678 4.46049H6.537V6.65415H3.50678V4.46049ZM7.72629 33.6366H2.2727V29.8393H7.72637V33.6366H7.72629ZM11.2338 4.46049H14.264V6.65415H11.2338V4.46049ZM15.4534 33.6366H9.99899V29.8393H15.4534V33.6366ZM20.0851 7.76275L19.654 5.6093L22.5373 5.07184L22.9683 7.22529L20.0851 7.76275ZM23.4304 29.6836L28.5462 28.7059L29.3166 32.4206L24.2023 33.4085L23.4304 29.6836Z" fill={fillColor}/>
</svg>
    )
}