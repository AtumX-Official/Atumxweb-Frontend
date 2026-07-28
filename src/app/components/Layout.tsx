import Lottie from 'lottie-react'
import bg from '../assets/BG Black Lottie.json' // your lottie file
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Lottie Animation */}
      <Lottie
        animationData={bg}
        loop
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      {/* Overlay to darken background if needed */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-10 pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-20 w-full h-full">
        <Outlet />
      </div>
    </div>
  )
}
