import { useEffect,useState } from "react"
interface JoysticControllerProps{
      action: string
      setAction : (value: string) => void
      className?: string;
  }
  export default function JoysticControl({action,setAction,className} : JoysticControllerProps){
      let mouseHoldTimeout
      const handleMouseDown = (direction) => {
          clearTimeout(mouseHoldTimeout)
          setAction(direction)
          mouseHoldTimeout = setTimeout(() => setAction(direction), 100)
        }
        const handleMouseUp = () => {
          clearTimeout(mouseHoldTimeout)
          setAction('stop')
        }
        
        const handleKeyDown = (event) => {
          const keyMapping = {
            ArrowLeft: 'left',
            ArrowRight: 'right',
            ArrowUp: 'forward',
            ArrowDown: 'backward'
          };
          const dir = keyMapping[event.key];
          if (dir) {
            setPressedDirection(dir); // This makes the icon shrink on keyboard press
            setAction(dir);
          }
        };
        const handleKeyUp = (event) => {
          const keyMapping = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
          if (keyMapping.includes(event.key)) {
            setPressedDirection(null); // This makes the icon pop back on key release
            setAction('stop');
          }
        };
        useEffect(() => {
          window.addEventListener('keydown', handleKeyDown)
          window.addEventListener('keyup', handleKeyUp)
      
          return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
          }
        }, [])
        const [pressedDirection, setPressedDirection] = useState(null);
        const handlePressStart = (direction) => {
          setPressedDirection(direction); // Tracks EXACTLY which one is active
          handleMouseDown(direction);
        };
        
        const handlePressEnd = () => {
          setPressedDirection(null); // Clears animation
          handleMouseUp();
        };
     return( 
  <svg width="336" height="336" viewBox="0 0 336 336" fill="none" xmlns="http://www.w3.org/2000/svg"     className={`group ${className}`} >
  <g filter="url(#filter0_i_346_88)">
  <circle cx="168" cy="168" r="168" fill="#FFDE21"/>
  </g>
  <g
  onMouseDown={() => handlePressStart('backward')}
  onMouseUp={handlePressEnd}
  onMouseLeave={handlePressEnd}
  onTouchStart={() => handlePressStart('backward')}
  onTouchEnd={handlePressEnd}
  style={{
    cursor: 'pointer',
    transition: 'transform 0.1s ease-out',
    transform: pressedDirection === 'backward' ? 'scale(0.92)' : 'scale(1)',
    transformOrigin: 'center',
  }}
>
  <g filter="url(#filter1_f_346_88)">
  <path d="M205 308.008C205 312.426 201.418 316.008 197 316.008H141C136.582 316.008 133 312.426 133 308.008V220.612C133 217.933 134.341 215.432 136.572 213.949L164.572 195.341C167.255 193.558 170.745 193.558 173.428 195.341L201.428 213.949C203.659 215.432 205 217.933 205 220.612V308.008Z" fill="black" fill-opacity="0.6"/>
  </g>
  <g>
  <path d="M205 308.008C205 312.426 201.418 316.008 197 316.008H141C136.582 316.008 133 312.426 133 308.008V220.612C133 217.933 134.341 215.432 136.572 213.949L164.572 195.341C167.255 193.558 170.745 193.558 173.428 195.341L201.428 213.949C203.659 215.432 205 217.933 205 220.612V308.008Z" fill="black"/>
  <path d="M168 308L176.66 293H159.34L168 308Z" fill="white"/>
  </g></g>
  <g
  onMouseDown={() => handlePressStart('left')}
  onMouseUp={handlePressEnd}
  onMouseLeave={handlePressEnd}
  onTouchStart={() => handlePressStart('left')}
  onTouchEnd={handlePressEnd}
  style={{
    cursor: 'pointer',
    transition: 'transform 0.1s ease-out',
    transform: pressedDirection === 'left' ? 'scale(0.92)' : 'scale(1)',
    transformOrigin: 'center',
  }}
>
  <g filter="url(#filter2_f_346_88)">
  <path d="M118.397 132C121.076 132 123.577 133.341 125.059 135.572L143.667 163.572C145.45 166.255 145.45 169.745 143.667 172.428L125.059 200.428C123.577 202.659 121.076 204 118.397 204H31C26.5817 204 23 200.418 23 196V140C23 135.582 26.5817 132 31 132H118.397Z" fill="black" fill-opacity="0.6"/>
  </g>
<g>
  {/* The Background Shape */}
  <path 
    d="M118.397 132C121.076 132 123.577 133.341 125.059 135.572L143.667 163.572C145.45 166.255 145.45 169.745 143.667 172.428L125.059 200.428C123.577 202.659 121.076 204 118.397 204H31C26.5817 204 23 200.418 23 196V140C23 135.582 26.5817 132 31 132H118.397Z" 
    fill="black"
  />
  
  {/* The Arrow Icon */}
  <path 
    d="M30 168L45 176.66V159.34L30 168Z" 
    fill="white" 
    style={{ pointerEvents: 'none' }} // Ensures the arrow doesn't interfere with the group click
  />
</g></g>
<g
  onMouseDown={() => handlePressStart('right')}
  onMouseUp={handlePressEnd}
  onMouseLeave={handlePressEnd}
  onTouchStart={() => handlePressStart('right')}
  onTouchEnd={handlePressEnd}
  style={{
    cursor: 'pointer',
    transition: 'transform 0.1s ease-out',
    // Only shrink if 'right' is the active direction
    transform: pressedDirection === 'right' ? 'scale(0.92)' : 'scale(1)',
    transformOrigin: 'center',
  }}>
  <g filter="url(#filter3_f_346_88)">
  <path d="M315.385 196C315.385 200.418 311.803 204 307.385 204H219.989C217.31 204 214.809 202.659 213.326 200.428L194.718 172.428C192.935 169.745 192.935 166.255 194.718 163.572L213.326 135.572C214.809 133.341 217.31 132 219.989 132H307.385C311.803 132 315.385 135.582 315.385 140V196Z" fill="black" fill-opacity="0.6"/>
  </g>
<g>
  <path d="M315.385 196C315.385 200.418 311.803 204 307.385 204H219.989C217.31 204 214.809 202.659 213.326 200.428L194.718 172.428C192.935 169.745 192.935 166.255 194.718 163.572L213.326 135.572C214.809 133.341 217.31 132 219.989 132H307.385C311.803 132 315.385 135.582 315.385 140V196Z" fill="black"/>
  <path d="M306 168L291 176.66V159.34L306 168Z" fill="white"/>
  </g></g>
  <g
  onMouseDown={() => handlePressStart('forward')}
  onMouseUp={handlePressEnd}
  onMouseLeave={handlePressEnd}
  onTouchStart={() => handlePressStart('forward')}
  onTouchEnd={handlePressEnd}
  style={{
    cursor: 'pointer',
    transition: 'transform 0.1s ease-out',
    transform: pressedDirection === 'forward' ? 'scale(0.92)' : 'scale(1)',
    transformOrigin: 'center',
  }}
>
  <g filter="url(#filter4_f_346_88)">
  <path d="M173.428 144.667C170.745 146.45 167.255 146.45 164.572 144.667L136.572 126.059C134.341 124.577 133 122.076 133 119.397V32C133 27.5817 136.582 24 141 24H197C201.418 24 205 27.5817 205 32V119.397C205 122.076 203.659 124.577 201.428 126.059L173.428 144.667Z" fill="black" fill-opacity="0.6"/>
  </g>
  <g>
  <path d="M173.428 144.667C170.745 146.45 167.255 146.45 164.572 144.667L136.572 126.059C134.341 124.577 133 122.076 133 119.397V32C133 27.5817 136.582 24 141 24H197C201.418 24 205 27.5817 205 32V119.397C205 122.076 203.659 124.577 201.428 126.059L173.428 144.667Z" fill="black"/>
  <path d="M169 32L177.66 47H160.34L169 32Z" fill="white"/>
  </g></g>
  <defs>
  <filter id="filter0_i_346_88" x="0" y="-2" width="336" height="338" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feOffset dy="-2"/>
  <feGaussianBlur stdDeviation="1"/>
  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_346_88"/>
  </filter>
  <filter id="filter1_f_346_88" x="123" y="184.004" width="92" height="142.004" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_346_88"/>
  </filter>
  <filter id="filter2_f_346_88" x="13" y="122" width="142.004" height="92" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_346_88"/>
  </filter>
  <filter id="filter3_f_346_88" x="183.381" y="122" width="142.004" height="92" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_346_88"/>
  </filter>
  <filter id="filter4_f_346_88" x="123" y="14" width="92" height="142.004" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
  <feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_346_88"/>
  </filter>
  </defs>
  </svg>
     )
  }
