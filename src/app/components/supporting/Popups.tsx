import { useState,useEffect,useRef } from 'react'
import { useSelector } from 'react-redux'
import Blocks from './assets/Blocks.svg'
import Arrow from './assets/Arrows'
import Python from './assets/Python.svg'
import Cimg from './assets/Cimg.svg'
import Usbicon from './assets/Usbicon.svg'
import type { RootState } from '../../../store'
import Wifiicon from './assets/Wifiicon'
import Exclamation from './assets/Exclamation.svg'
import Files from './assets/Files'
import ExitImage from './assets/Exit'
import { motion, AnimatePresence } from "framer-motion";
import Savedicon from './assets/Savedfile'
import Savedkit from './assets/Savetokit'
import Connect from './assets/Connect'
import Oops from './assets/Oops'
import Underdev from './assets/Underdev'
import Delete from './assets/Delete.svg'
import { FiCheck, FiX } from "react-icons/fi";
import LArrow from './assets/DArrows.svg'
import Resetgif from './assets/Reset.gif'
import { createPortal } from 'react-dom';
import BR from './assets/BR2.gif'
//import Resetgif from '../../assets/Reset.gif'

export default function ConvertToLanguagePopup({ show, onClose, language }) {
  const [visible, setVisible] = useState(false);
  const themeMode = useSelector((state: any) => state.theme.mode);

  const bgColor = themeMode === 'dark' ? 'bg-[#3C3C3C]' : 'bg-white';
  const textcolor = themeMode === 'dark' ? 'text-white' : 'text-black';

  useEffect(() => {
    if (show) setVisible(true);
  }, [show]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 500); // wait for animation to finish
  };

  // Select icon based on language
  let languageIcon;
  if (language?.toLowerCase() === 'python') languageIcon = Python;
  else if (language?.toLowerCase() === 'c++') languageIcon = Cimg;
  else languageIcon = Python; // default fallback

  return (
    <>
      {(show || visible) && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div
            className={`w-[350px] h-[250px] flex flex-col rounded-lg overflow-hidden shadow-lg transform transition-transform duration-500 ease-out
              ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}
          >
            {/* Yellow top */}
            <div className="relative h-[100px] bg-[#F6EC24] flex items-center justify-center p-2 overflow-visible">
              <div className="flex flex-row items-center justify-between w-full px-4">
                <img src={Blocks} alt="blocks" className="w-30 h-22 object-contain" />
                <img src={Arrow} alt="arrow" className="w-18 h-18 object-contain" />
                <img src={languageIcon} alt={language} className="w-18 h-22 object-contain" />
              </div>
            </div>

            {/* White bottom */}
            <div className={`flex-1 ${bgColor} flex flex-col items-center justify-center px-4 py-3 text-center space-y-3`}>
              <p className="text-[#FF0000] font-extrabold text-xl">
                SWITCHING TO {language.toUpperCase()}
              </p>
              <p className={`${textcolor} text-sm font-semibold`}>
                Are you sure you want to convert these blocks to {language}?
              </p>
              <div className="flex space-x-4 mt-2">
                <button
                  className="bg-[#2EED08] text-white px-4 py-1 rounded"
                  onClick={() => {
                    console.log(`Converting to ${language}`);
                    handleClose();
                  }}
                >
                  Yes
                </button>
                <button
                  onClick={handleClose}
                  className="bg-[#FF0000] text-white px-4 py-1 rounded"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



export function Connectivity() {
  const { isConnected, mode, lastMode } = useSelector(
    (state: RootState) => state.websocketSlice
  );

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000); // Dismiss after 3 seconds
    return () => clearTimeout(timer);
  }, [isConnected, mode]);

  const connectionType = lastMode || mode;
  const isWired = connectionType === "Wired";
  const icon = isWired ? Usbicon : Wifiicon;

  const statusText = isConnected
    ? isWired
      ? ["USB", "CONNECTED"]
      : ["Wi-Fi", "CONNECTED"]
    : isWired
    ? ["USB", "DISCONNECTED"]
    : ["Wi-Fi", "DISCONNECTED"];

  const connectedBg = `
    linear-gradient(
      to bottom right,
      #2EED08 0%,
      #2EDF0B 53.8624%,
      #2ED20D 100%
    )
  `;
  
  const disconnectedBg = `
    linear-gradient(
      to bottom right,
      #FF2C11 0%,
      #FF4A32 100%
    )
  `;
  
  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 140,
            }}
            className="flex justify-center"
            style={{
              marginTop: "clamp(75px, 14vh, 180px)", // responsive top spacing
            }}
          >
            <div
              className="flex items-center gap-[clamp(8px,1vw,14px)] rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.25)] px-[clamp(12px,2vw,20px)]"
              style={{
                width: "clamp(200px, 24vw, 320px)",   
                height: "clamp(64px, 8vw, 96px)",     
                background: isConnected ? connectedBg : disconnectedBg
              }}
            >
              {/* Responsive Icon */}
              <img
                src={icon}
                alt={connectionType}
                className="
                  object-contain flex-shrink-0
                  w-[clamp(28px,3vw,44px)]
                  h-[clamp(28px,3vw,44px)]
                "
              />

              {/* Responsive Text */}
              <div className="flex flex-col leading-tight">
                {statusText.map((line, idx) => (
                  <p
                    key={idx}
                    className="text-white font-extrabold"
                    style={{
                      fontSize: "clamp(12px, 1.2vw, 18px)",
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

type ConfirmUnsavedChangesModalProps = {
  open: boolean;
  title: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
  variant? : "exit" | "unsaved"
};
type SavetokitpopProps = {
  type?: "save" | "clear";
};
export const ConfirmUnsavedChangesModal = ({
  open,
  title,
  message,
  onYes,
  onNo,
  variant,
}: ConfirmUnsavedChangesModalProps) => {
  const modalImage = variant === "exit" ? ExitImage : Files; 
  const themeMode = useSelector((state: any) => state.theme.mode)
  const bgColor = themeMode === 'dark' ? 'bg-[#000000]' : 'bg-[#F0F0F0]'
  const textColor = themeMode === 'dark' ? 'text-white' : 'text-black'
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          
          <motion.div
            /* ANIMATION: Drop from top (-100px) to center (0) */
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            
            className="
              relative 
              w-[90%] md:w-[50%] lg:w-[40%] 
              min-w-[380px] max-w-[700px]
              aspect-[600/500]
              min-h-[400px] max-h-[85vh] 
              flex flex-col 
              rounded-lg
              overflow-visible 
              shadow-2xl border border-white/10
            "
          >
            <div className="absolute -top-6 -right-6 z-[60] transform translate-x-1/4 -translate-y-1/4">
               
               <Exclamation className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl"/>
            </div>

            <div className="flex flex-col w-full h-full rounded-lg overflow-hidden">
              
          {/* Changed justify-start to justify-center and added pt-8 */}
<div className={`flex-[72] flex flex-col items-center justify-center text-center gap-1 px-10 relative ${bgColor}`}>


<img
  src={modalImage}
  alt="Unsaved"
  className={`
    drop-shadow-lg  object-contain
    ${
      variant === "exit"
        ? "w-48 h-48 lg:w-52 lg:h-52"
        : "w-36 h-36 lg:w-40 lg:h-40 mb-5 mt-4"
    }
  `}
/>



  <h2 className={`${textColor} font-bold text-2xl lg:text-[2.2vw] xl:text-4xl leading-tight`}>
    {title}
  </h2>

  <p className={`${textColor} font-semibold text-sm md:text-base lg:text-[1.1vw] xl:text-xl leading-relaxed max-w-[90%]`}>
    {message}
  </p>
</div>

              <div className={`
                flex-[28] ${bgColor}  flex items-center justify-center gap-6 lg:gap-10
              `}>
                <button 
                  onClick={onYes} 
                  className="bg-[#2EED08] text-white px-10 py-2.5 lg:py-3.5 rounded-2xl font-bold text-base lg:text-xl hover:brightness-110 active:scale-95 transition-all shadow-xl"
                >
                  Yes
                </button>
                <button 
                  onClick={onNo} 
                  className="bg-[#FF0000] text-white px-10 py-2.5 lg:py-3.5 rounded-2xl font-bold text-base lg:text-xl hover:brightness-110 active:scale-95 transition-all shadow-xl"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const SavePopup =() =>{
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{
            type: "spring",
            damping: 18,
            stiffness: 140,
          }}
          className="flex justify-center"
          style={{
            marginTop: "clamp(75px, 14vh, 180px)", // responsive top spacing
          }}
        >
          <div
  className="flex items-center gap-[clamp(8px,1vw,14px)] 
             rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.25)]
             px-[clamp(12px,2vw,20px)] w-fit"
  style={{
    minWidth: "clamp(180px, 20vw, 240px)",
    height: "clamp(64px, 8vw, 96px)",
    background: `linear-gradient(
      to bottom right,
      #2EED08 0%,
      #2EDF0B 53.8624%,
      #2ED20D 100%
    )`,
  }}
>

            {/* Responsive Icon */}
            <Savedicon
  className="
    object-contain flex-shrink-0
    w-[clamp(40px,5vw,60px)]
    h-[clamp(40px,5vw,60px)]
  "
/>

            {/* Responsive Text */}
            <div className="flex flex-col leading-tight">
                <p
                  className="text-white font-extrabold"
                  style={{
                    fontSize: "clamp(14px, 1.4vw, 20px)",
                  }}
                >
                  SAVED 
                </p>
             <p className='text-white font-extrabold' style={{fontSize: "clamp(14px, 1.4vw,20px)"}}>SUCCESSFULLY</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export const Savetokitpop = ({ type = "save" }: SavetokitpopProps) => {
  const isClear = type === "clear";

  const title = isClear ? "CLEARED THE KIT" : "SAVED TO KIT";
  const subtitle = "SUCCESSFULLY";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{
            type: "spring",
            damping: 18,
            stiffness: 140,
          }}
          className="flex justify-center"
          style={{
            marginTop: "clamp(75px, 14vh, 180px)", // responsive top spacing
          }}
        >
          <div
  className="flex items-center gap-[clamp(8px,1vw,14px)] 
             rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.25)]
             px-[clamp(12px,2vw,20px)] w-fit"
  style={{
    minWidth: "clamp(180px, 20vw, 240px)",
    height: "clamp(64px, 8vw, 96px)",
    background: `linear-gradient(
      to bottom right,
      #2EED08 0%,
      #2EDF0B 53.8624%,
      #2ED20D 100%
    )`,
  }}
>

            {/* Responsive Icon */}
            <Savedkit
  className="
    object-contain flex-shrink-0
    w-[clamp(40px,5vw,60px)]
    h-[clamp(40px,5vw,60px)]
  "
/>

            {/* Responsive Text */}
            <div className="flex flex-col leading-tight">
            <p
                className="text-white font-extrabold"
                style={{ fontSize: "clamp(14px, 1.4vw, 20px)" }}
              >
                {title}
              </p>

              <p
                className="text-white font-extrabold"
                style={{ fontSize: "clamp(14px, 1.4vw,20px)" }}
              >
                {subtitle}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export const RunPopup = ({ variant }) => {
  const config = {
    CONNECT: {
      image: Connect,
      title: "HOLD ON",
      message: "CONNECT A KIT FIRST!",
    },
    NOCODE: {
      image: Oops,
      title: "OOPS..",
      message: "CAN'T RUN WITHOUT A CODE",
    },
    RUNNING: {
      image: Oops,
      title: "OOPS..",
      message: "CAN'T EXIT WHEN CODE IS RUNNING",
    },
  };

  const { image, title, message } = config[variant] || {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: "spring", damping: 18, stiffness: 140 }}
          className="flex justify-center"
          style={{ marginTop: "clamp(75px, 14vh, 180px)" }}
        >
          <div
            className="flex items-center gap-[clamp(8px,1vw,14px)] 
                       rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.25)]
                       px-[clamp(12px,2vw,20px)] w-fit"
            style={{
              minWidth: "clamp(180px, 20vw, 260px)",
              height: "clamp(64px, 8vw, 96px)",
              background: `linear-gradient(
                to bottom right,
                #FF2C11 0%,
                #FF4A32 100%
              )`,
            }}
          >
            {/* Icon */}
            <img
              src={image}
              alt={variant}
              className="
                object-contain flex-shrink-0
                w-[clamp(40px,5vw,60px)]
                h-[clamp(40px,5vw,60px)]
              "
            />

            {/* Text */}
            <div className="flex flex-col leading-tight">
              <p
                className="text-white font-extrabold"
                style={{ fontSize: "clamp(20px, 3vw, 24px)" }}
              >
                {title}
              </p>
              <p
                className="text-white font-extrabold"
                style={{ fontSize: "clamp(10px, 1vw, 12px)" }}
              >
                {message}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const UnderdevelopmentPopup = ({ onNo }) => {
  const buildImgData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmQAAAGYCAYAAADsqf5DAAAQAElEQVR4Aey9B2AkV5X9fW9VdyuMJjtnG5OcyTgBxibtLrAsYGB3WWBZsPf/bWAJCwYcsXH2mGjAeYKzYbGNCU5kMA4E45zH9sw4TlDqUPXed261Sir1tDSSpiW11Kfp0/fld++vJNXllUYOhC8SIAESIAESIAESIIFpJcCEbFrxc3MSIAESaBUCjJMESGA0AkzIRqPDPhIgARIgARIgARKYAgJMyKYAMrdoDQKMkgRIgARIgAQmSoAJ2UTJcR4JkAAJkAAJkAAJNIjAOBKyBu3IZUiABEiABEiABEiABIYRYEI2DAcrJEACJEAC006ADpBACxJgQtaCF50hkwAJkAAJkAAJNBcBJmTNdT3oTWsQYJQkQAIkQAIkMIwAE7JhOFghARIgARIgARIggaknMDkJ2dTHwR1JgARIgARIgARIYMYSYEI2Yy8dHScBEiABEiABEpgtBJiQzZYryThIgARIgARIgARmLAEmZDP20tHx1iDAKEmABEiABFqBABOyVrjKjJEESIAESIAESKCpCUx7QtbUdOgcCZAACZAACZAACUwBASZkUwCZW5AACZAACUw7ATpAAk1NgAlZU18eOkcCJEACJEACJNAKBJiQtcJVZoytQYBRkgAJkAAJzFgCTMhm7KWj4yRAAiRAAiRAArOFwExKyGYLc8ZBAiRAAiRAAiRAAsMIMCEbhoMVEiABEiABEiABEph6AkzIpp45dyQBEiABEiABEiCBYQSYkA3DwQoJtAYBRkkCJEACJNBcBJiQNdf1oDckQAIkQAIkQAItSGCWJmQteCUZMgmQAAmQAAmQwIwlwIRsxl46Ok4CJEACJDDtBOgACTSIABOyBoHkMiRAAiRAAiRAAiQwUQJMyCZKjvNIoDUIMEoSIAESIIEpIMCEbAogcwsSIAESIAESIAESGI0AE7LR6LCPBEiABEiABEiABKaAABOyKYDMLUiABEiABEiABEhgNAJMyEajwz4SIAESIAESIAESmAICTMimADK3IIHWIMAoSYAESIAEJkqACdlEyXEeCZAACZAACZAACTSIABOycYDkUBIgARIgARIgARKYDAJMyCaDKtckARIgARIggYkT4MwWJMCErAUvOkMmARIgARIgARJoLgJMyJrretAbEmgNAoySBEiABEhgGAEmZMNwsEICJEACJEACJEACU0+ACdnkMOeqJEACJEACJEACJDBmAkzIxoyKA0mABEiABEig2QjQn9lCgAnZbLmSjIMESIAESIAESGDGEmBCNmMvHR0ngdYgwChJgARIoBUIMCFrhavMGEmABEiABEiABJqaABOyab88dIAESIAESIAESKDVCTAha/WvAMZPAiRAAiTQGgQYZVMTYELW1JeHzpEACZAACZAACbQCASZkrXCVGSMJtAYBRkkCJEACM5YAE7IZe+noOAmQAAmQAAmQwGwhwIRsJl1J+koCJEACJEACJDArCTAhm5WXlUGRAAmQAAmQwMQJcObUE2BCNvXMuSMJkAAJkAAJkAAJDCPAhGwYDlZIgARagwCjJAESIIHmIsCErLmuB70hARIgARIgARJoQQJMyGbpRWdYJEACJEACJEACM4cAE7KZc63oKQmQAAmQAAk0GwH60yACTMgaBJLLkAAJkAAJkAAJkMBECTAhmyg5ziMBEmgNAoySBEiABKaAABOyKYDMLUiABEiABEiABEhgNAJMyEaj0xp9jJIESIAESIAESGCaCTAhm+YLwO1JgARIgARIoDUIMMrRCDAhG40O+0iABEiABEiABEhgCggwIZsCyNyCBEigNQgwShIgARKYKAEmZBMlx3kkQAIkQAIkQAIk0CACTMgaBLI1lmGUJEACJEACJEACk0GACdlkUOWaJEACJEACJEACEyfQgjOZkLXgRWfIJEACJEACJEACzUWACVlzXQ96QwIk0BoEGCUJkAAJDCPAhGwYDlZIgARIgARIgARIYOoJMCGbeuatsSOjJAESIAESIAESGDMBJmRjRsWBJEACJEACJEACzUZgtvjDhGy2XEnGQQIkQAIkQAIkMGMJMCGbsZeOjpMACbQGAUZJAiTQCgSYkLXCVWaMJEACJEACJEACTU2ACVlTX57WcI5RkgAJkAAJkECrE2BC1upfAYyfBEiABEiABFqDQFNHyYSsqS8PnSMBEiABEiABEmgFAkzIWuEqM0YSIIHWIMAoSYAEZiwBJmQz9tLRcRIgARIgARIggdlCgAnZbLmSrREHoyQBEiABEiCBWUmACdmsvKwMigRIgARIgARIYOIEpn4mE7KpZ84dSaBpCdztfeFX3i+80fvFpp94vygra5ss3eL9Fra22VRWb6SysVj5h97PPc57/hxs2q9IOkYCrUOAP4ha51ozUhIYlcC3n9rw0v/6/g2f+u8rfnbBKTfdd9nRP7zrkuOvufuS46/9y4pjrr19xTE/um3Fl66965IvXffXy77woz9d+oUf/fHSL11/xyXHXP/HS4++/s7Ljv7RnZfDXvHl6++80mTlY378xyuO+cmdVyYWZWszfflHt19+9HV3XPHlH91xZaqjquWrzB51/Z1XmY7+8R+vsrXS+VbG+KugK7/4o9sTHXX9bVegfPkXsOYXr7vtiqz98o/vvPyLP7nzcsy77Kgf//HSY3985yXw55LjfnLniuOvv/PSM39059l/vv5P77ziCd8xKpxZ2MmQSIAEmosAE7Lmuh70hgSmhcBxK5/d7tw/3/WNh7bc8qSV2+38978q+sMemLf1W++bs8XboLc/PGfLtz/cscXbH+6c/9aHOhYc9nDnwrc8NGfBW+7rWvzWu7sWvuXeuYsPu3fe4kNh33zf3MWHmKycqGuLQ8ze07XozWar2uLQe+Yttrr1pXoT+qrqWvTGe6t6k61lc01WtjEoH/LAnMWHPNi5+JCHOrZ488Mdiw99uNOEcsY+1L7o0EQdiw57uGPhWx5uX/Q21N/2UNuitz/UseitD7TN/9c/VfQ7P1y95mPXe982LfC5KQmQAAmAABMyQOB7NhJgTOMh8MsHn/r0I0HhLU/mOnLPdcyX8qLtZG1bl6zNz4Pmygv5ObBzZF2+U9bn22VtoU3WFdplfYg6tC7olHUj2LVoX6sdw/rXh3MG5sLmIMxfj3HrszbAnOy8gbqN24D5tt96mwuthX9WrrUv5Kp+1bPmV/ecLeXZjoVb/3rN2v9Y/ouHDxgPM44lARIggUYSCBq5GNciARKYeQROu/uZbVZV5O2VeVtI3DZfJArEV1Rc0Uvgc1BeAslJaP/zijLaRdAeSC4OpBAVpC3KS6GSl/a4kNi0brZtoL0tM87aC6jb+KTd5qHeNmALWC+f1jG/UMlJ3qy1D9g21yZ5VxhVuTgPH+tLcCDW2x9Jf8c8Xdc57yWPFItvv937vPBFAiRAAuMh0KCxQYPW4TIkQAIzlMCGyHWUpC0PiTjkI8hJ2jQnHaoSulgCSJ1DXyxeYhEPOS8CBS5Av5cA1RBStJnN1gO0WbvZtD1ra9uz9XRe1qbrC17eexlNGDL6O9cuPtcm/W0d4bMV13nXY8g6R5/BXhIgARKYFAJMyCYFKxclgZlDoD1uc4HmfYCTMY1EgshJW7kkhbgoOV/CiZipLGrJWCIvoXdo9+ICJ1HgJ6yKbjw/DkVq5XIqqdI+p17s30em9ayt9cn2qVWMWALs7xBrGUmjb2vTmXPVptRTbkYCJDAFBJiQTQFkbkECTU0g75ylV4IUK3RBNdlSS8DKSHgq4oII8pATh1MzDwkOktSFCMvaJkcxEianm15bxCV+jGZVfZ0xMWKNICeaJJj8cQhIfJMACUwTAf4Emibw3LaJCLS4K/2xdxX1PtZA4sAlquSclHKxFPORRDmRCLlXFIQSBTmkSQXkPm1IYvB4E0mcIGmaqBSna6bsfI8dTNm2euUAiZid1OWQTE1EeTyAzfkKTgErUkBKWnBoaPGvBYZPAiQwfQSYkE0fe+5MAs1BYOAvcDk1d6o/EmIYPMEUPKesygr2fNASMB9K6HKJFG2qmvwOmeAV2jhY5Fn4lMH2enVrS2Xz0nJqk98bw8FWWq+1yQYT/FDVZKaXCB7HksNnaL+MlrTygwRIgAQmh8BoqwajdbKPBEhg9hOoFIsaqGjoAiRZAQ6jckNB+zxOw/KSj/M4RQohlTavsKHkkcHlUA4sKYNCe4w5YLESkrFALGFL+2ut9W2uvOKcbIzyOOFzw8aKxCoiFjx8R0G2jsSjhW8SIAESmHICwZTvyA1JgASaioDmgkAdUigXikKWmHgJRDVMkio7mcITTAnxaBDZmTiNxSsyF3UoV0NR1Woh86m6cVume3jRVfOg5Fe90GNWVcUsqiNa63P2AdWzqirZdlWF74rR1bcXRVKGNiRrGgS+Z3fx1R5+TowAZ5EACUyUQDDRiZxHAiQwewgoTrZMgcfpGB5JepwYeSQrFqElRWrJGBKxKKxIKV+SvrZ+KRZKkvzCvzrxkINqLTI68ZbRQbXW+pzESJjiZL7NNVm7ycqbkvmFMzIkbE7Gay02OzGLJScRks8ykrUuGQha+CIBEiCBqSXAhGxqeXO3GU5gNrrfjqC8KTk4cijZ2340BEh0JEl0vAoSJwhWAqRRQSwxZEmYqoqzdkwbj03HYhoSMvuUYVZVh9VthPmRtVZWcx6FkSyiQK8ksQhe6TgUk79hllgkk4Kk0coUCZAACUwHgWA6NuWeJEACzUUgkor4XCyRlCQIkeHYiRlOjUKNRaE4VInwWC/A6VkQh5KHQmRUIU7SAgyfsESR8KlYkjQWBQPjUysjvFSxJpR2qw6vW7vtl9OchElfSUQrKnyRAAmQwDQRCIbvyxoJkEArEvCWdAWRiELikPagiERLUHbIXJB7ibfUKfldswAJVCCBJTLJGJkxL9XhOZda4onHseoRnXMiD82YUOgoCZDALCMQzLJ4GA4JkMA4CUSa5F/jmqWq4xrfTINVZ67vzcRxs33hAiRAAsMIMCEbhoMVEmhRAl50JvwwaNSfClNVUdXhF9uLH97AGgmQAAlMHYGZ8DN46mhwJxJoHIFZtVI2EVKtSWSmOFLzJdUUb83tSIAESGDSCDAhmzS0XJgEZgaBHE6GkGINng7V/lBI64oRg+WZERq9JAESIIEZQyD9+Tp+hzmDBEhgVhCInEeqNXIodho1cu/M7VFFGpp1X0WzVZZJgARIYCoJMCGbStrciwSakEDetVtCZtroT3GNlozZiVkThjMml1SZe40JVJMMohsk0AoEmJC1wlVmjCQwKoF+UbxsSBAE4pyz+uAfTbX2VAPD0moyLhCVJDmz//wRZOVUgvqoGlipdt2B5kkzlmiashtY3Nk6yyRAAiQwlQSCqdyMe5EACdQjML1tFfuDYjUupAmV1rRb1frMmiypMVnZkiqTlRuhdN1GrMU1SIAESKDZCTAha/YrRP9IYJIJRCWtl3dt1q6WTJnGukjtwOM8ogAAEABJREFU2Nr6WNfZrHHKP3uxWfw4mQRIYLMITElCtlkecjIJkMCkEsi1VX+pP3vyVbuh/aeRatuSenVqUpyMD0vMUk3G+lyTBEiABJqFABOyZrkS9IMEpolAvvqvLJNf6p8KF1RVVKuy/SzhMpuqtr6p9rSflgREhBBIYMYSYEI2Yy8dHSeBxhCoIAMa8QQMW6QnZ/bDYrA8kL6pKkYMf2O54Q2Zmurw8aONzUwbLI53/ODEMRZ6dudjyzGi4jASIIEGE7CfsQ1eksuRAAlMGoEmXdgSpVSb46KtkZ1fW8/2NbqMVHEgzWz0ylyPBEiABDZNgAnZphlxBAnMagIVVXXIRtJTMjsF8+qkquqf8bc2k4HwGBsH1i8yWgaDZW34GJX+KNrYVpOyjdvHuPCIwxCGhN6JWYspUu/Xjh7SiGuxgwRIgAQ2l0D6U25z12nUfK5DAiQwxQSioKhhGKiPnYSakzAMJYqLIqGTCn5CxKqSQ+qV99XkLEZbCQmZyRIZkUBUQ9EBWd3kk84A0QzJ2kzOiZi8BpIIa9Sztk6tbH7apj6QrKzd+pEuiilGwmXWkjqTeC8mhVcITwqYH0ZO7M+lxWGITnTwTQIkQALTQCCYhj25JQmQQBMR6JAOJCmx5MOC+DgpSgHJVYhkSUTFBaE4y2BEBHmY5WmC9EvsRM1jQq1EHHKeOJGVa2Xjrc1O4LBk9a3I0FBSWxRWBuq2iaqiZaAfx3SqQ3V0iI1N5mGuoj+dY+UgCMSsBCrJGIW1MSJi+aL9MdgwyEuAiFzJy0vQjC6+W4IAgySB5iIQNJc79IYESGCqCST/yrIYIiXJicY4IXOh5Cp5kZLClYIgo5EIiU0ciOSRFxUiL20Vj7ITFTs1QwKGBMoSrFSWFI0k5HpifZokRk4c5sYy9D+rm6zFbLqmWYdxZquKxAcQ5lfrTszanKp8srbTqvWwPhnrk3H22LWoIkWcmoWxSkcl0AcQrfBFAiRAAtNAIJiGPbklCZDAFBAY6xa5Xu/bc947XxGHp3ZhPieFMC95PKgMkKigEY/0QvFI1MQFEiBpQw6DOrIZpGSC8yX19qMkkKxVZF7Zer1xHgspnhcGmG9WcRSXWhx4idVtDDIrQT4FBQJnIE3kMV4w16zHkZepupaKmq/oC3yI/A+PRlEXjPewyXiUg0IgcVyRNviQj2JdeI/oWLlxHAmQAAk0kkDQyMW4FgmQwMwj0Besi3L5ii+7bpwW9UiPL0rZR0jIQik4KA4lZ4kZEhvvCzgty0s5bJMoLIhzOEFDgiYuJ1JjfRTiESgEm+239rSuLo/EqaoAa6eq165+YJwUkGBBsNZma5kNsJbJ5to6ZjeSrTGonGiMkz7EGlTK0rtunfBFAiRAAtNFYAYnZNOFjPuSwOwiUOovxa5nnZ+b8xK2e3FBUUrOVJK8jyXnnASKmNWJPbaM8FPDLA6YRFXHJMwefKvqUHmgpOLEWlMbqMeeijYn4r0ga0MSJhLYOJxmmbUTtKxk4KWwpgD7mEUV60giSV92coa1wqhHFuRi6eh7wc+r9EZbPoPGdAwtCZAACUwhgWAK9+JWJEACzUhg9WpZddsfo7m93TJXK5LLO9EOJF/5SGItifP9Eku/RFKSshYl9mURJGziSiLo90EFWUxZnEJSxtgSxkAY71BP21MbZ9ojrBPhRC72GD+KbFwF40zmh1mTlWPsm1jMT/bDnsPWw35WT/sSizmB75POaL3M7VklxQfu7N9Ji2sOOUQj4YsEagmwTgJTQIAJ2RRA5hYk0MwEys89Wl7/42t75K4/ydzHHpatnn1Ktu95Xrbuflq23bBGtuteJdtCWyNxSbXD+jWyw4bVss2Atu6ulrfasCppM7v1+lVYo9qe9tfabXrWYO011XED5W27q21m0/WT8kC7tVndtF3P05i/SraFrZarc61ssjEm28e0be+zUtXTsk3PszL/+SeldP9f3XM3/6xSeGFVpZmvE30jARKY3QSYkM3u68voSGCTBBa/8EKxfe3TG56//BJZf+H5Ei2/WNad+x0prjhfepedI32XnCNrl35N1i37mjxzwVmyYcW3pO+yb8t6tPWs+HZSX7/8m+j/xqCsXiubZ+q+5NuSyuqp0vFp3WztuO7l3xLThmXfTOz6pd+QDdi7x9rRtv7ir0s3rNWfv+hssTVt7IZl3xJTN3zvvfQcMfvssu/IU5ddJk9cflW/PPrQM9uG/ulNwuIAEiABEpgkAkzIJgkslyWBmULguOOOK+//4l2vXbTh+Yre82dxd/xB8vf+Scq3/1Yqf/q99N/+K4n//HvJ3f1HmffoA75yx+99+fY/ePfnO33059t89Kfb0H+71Nr4z7dL+c5bpfLHPwzKxpisz+T+coe4u26T1EZ/uV2iP98K3QbdKv6vd0K3Q1Ub332nxHffLg7tMebJPXdK6Y+/k97bfpVY99fbpYL55T/9QXL3/mVg3p0+/sttvvLn233pzlt9322/9T23/jrq/v2v1vXfdvuz8tCDPdLfe/duW23/25lyzegnCZDA7CPQGgnZ7LtujIgEGkpgi/nhd3d70bbf6QzjJ9pcfxT3rJUg6hOJemVOTqWtWPZ+XbfrXfVC7NZFZe2XsvRrFOAhX+hiMeW8G2atrVZBHIlJo4oMqlItS7ksUoFgfakkpqQNdbUxUBBFYuXAylDU2ysFL9IGGrk4ljwUYLzr7xexNfr6xff1e6zlpFh2vr8Yx/39laivryh9RSdB0CfbbHX7l0740umf+si7VmIZvkmABEhgWggE07IrNyUBEmgqAldeeWV89vnfOepT/9+//ceeu+14eiEqL1vYXrhsQXv+is5C/qr2QvvVW2630/c7t9v1uh1e+frfbbnf/o/P2fOVvfmX7l3M775PKf/ifWNI8i/eV/IDKrxkP2l76SvErCltz+2+j4Qv2ntQwe57S/CiPcRsuPueorvvJcGLq1Z3e3m1jv6kfcDK7nuIf9GeUthjP9n5jW+XPf72H+Qlb3uXvOStfy97/d3hss+7D5e93vk+2ftdH5CXv/P9+rJ3/EO0+9v+rneXQ//2mR3f8LZHtzvwLX9dcOBhv97yzW+79MVve89p81518MrvPvzCTqfcvWqns2GPhT0F9pSHV+105kNP7XjmQ8/vaO1nP9yP/v6drO+MR9buvOTRtbuYvvlI/85nr6r2mbX6OY/27/Ltx4u7fX3luhd964ni7t96Yv3uX19ZfNFQvZjUbYyNzeobj/XvakrbbD1b91tP9e1oOht7WZvpDOydlfljc7/x2LpkjSXww2RtSxJ/ii/62hPFF38T/l/hfdhUX4izwBmGQAITJcCEbKLkOI8EZhmBfbfZpvfzn/nMNUuWnHnc8u+c9+lvnn3af5/37W//9zdPO/2/Lr78h//9ubO/9ql3f/nLR235rvf+Yov3f6Bt0Qc+nJ/7vo+HnR84IpzzgSO064NHyvj0SZn7oSOgf5e5H4Q+9O8y70P/b1Dz//H/k3nWDtWz8z50pBTe/RHJ/X1V4bv/RQb1zg9LaHr3hyX/rg9j3L8EbX//kXz7ez7a0fbej83reP+/brXgA5/YtetdHzmw74C3nPCNR1Zdcuyf7l3xncdeWH7GX59cvuyxnuXnP/jciu889MJyJDgrljz67IozHnlu+VkPPrViyYOrVpz74DMrvvvA6uVfv29VojPvf3z51/4CPfD48q/f9fjysx5Yufx0lM+87/FlX7t3zbKz7lm59Kx7Vi/92r0rM/WVSd3GnPHAU8vPeOBJqGrPvv+pZWff/+SyMx6o1pfAfuOuJ5af9ddVK87665MrvnHXU8vPfOiJ5UseWb38nEeegobsNx95fvnZD62B4C/W+Dp8+foDTy4/637sfd8Ty86697FlS+55YunX739y+dk/u33JqU8VXzrLvpQZDgnMSAJMyGbkZaPTJDB5BPbcc8/yIe885Lm3ve1tzxxyyCFr3v72t69+6ytftmqHXfZde7/L/f26XXf5j8e6Fu7Ys/OL56zdYbfCuu1flIMCSNbvsPugrL52u93EbCrr37Dji8W0fseXyrodd6+O3+nF1TazO79ENkDdO71E1sPa2HVot3pqk3b0FXGStnLuFnKPtssD+S55sNApf3V5uSvOyd2+IHe5gtwt7XpP0Jl/sGNBx2Pztlz41MJtt3126513W7v9bntv2GaXgzdsu8sbVy/c6uAN27/ooCe7tjz4uQU7Hvx02xYHr2nb8qCn2hcd/FTHgoOfnLPo4Cc7oTmLDlrdMf+gp9vmH7S6ff5Ba7q2OHDV3C0PXD0X7XMXH7xm3uKDV3UtPtjqsAeu6lp0wFNdi/df1bVw/9SumrvF/ujff9XcRfuv7toCdssDVnctOnDV3MUH1tpVcxYe+JT1dS086Clbt2vRwZh/MMYdjL0PerJ93kErOxYMt+0LDnyyfe4BaD9gDdZcNW/LA1P79NzFB6yet9X+sK9fM3erg+4P5hx5zUMrLz7rkcrB3vv0z7ZN3hcXVyYBEhiRABOyEdGwgwRIIEvgazf84JVPdRb++7EwXBwt3i54pijSl8tLf06lmA9GVLY/LZcKoZQwp5TLSX++vopoz6o/F2KP3KBK+bzEnZ3SHXjpESfFXCC9oUqpPS+VzrbExh1tErUXpGJqy0t5YN8ifO7D/s/390oZ60qhIH3FooT5DpnTOU/6u0uS04IEYUEEMUqQEwlzEmoIBRKGsJATLzHkvJfIO4mdG2ajOJaKi8Vs2j+sjjlJ+xhthLWS+QPWByoCjWRHW7tfQ4kX7Zi/txK+7rJH7v/c11YXd8xeb5ZJgASmlkAwtds1/270kARIYGMCOD0Jun1hj1J7+zYyd4GsLUeic+ZKFAQSj1ORqlSwhdnIkpogFJeVBuIgW9tZP5TuYXOsbO1xGEhfJcLYnATtneJyBSlLIDHGO0v0IidlJEolJEllJE0R9qxgb1ujbFZUCnPnSKlcEod5bR1d4rDe8889J1tuvZUUrR1zkSuJOC8Se/GoeKxpiQ6WF4Wfqiqq41MAZqoKj0Z/q2rdtW2+yXwZTaOtHsP3db1F6e+cL890zD348j/c9vLRxrOPBEhgcgkEk7s8VycBEpgNBK4U0Y558xdKBUkJkpY8Tqe8jyXE/3Ienw6nRnVkfaawps/aTCHynADJzjBZ24CSRAj9inoqa/OxE40EuweiXsUhO/JImKxs1hQqTrWcitlQQsFRFuY4CZ1IAXPySLYkqkghDCSHtVwpEkVqVugMZUNpvbgCxiJpySO+PJIwU6hecLAkHkmfSXwgAaRQahV7iikW+Da8P4Af5svQeMF8GzfcWoyKuLMWB4FYrzoubc+2qa/2Za3tFcD/AP4proFZiVXMxwC8wiAQXEZ5ody2oNS+eD6SOxW+pooA9yGBYQSCYTVWSIAESGAEAoFrU0U2gg8xCR6V2c1/c2QJRSiaJCVWHo8EL0tsBN+sXGAAABAASURBVMlGXaHf3kgyRJGs1Jcb6AtgAwx3ieIgEq8OJ2JeLHExhTgdU8jWc0jo0IOxgnmSvGx9K2yutWRrPOsYMxtfz5qvimQy6ceH1S1KFMWsxWTlctCGk8UOK1IkQALTRMC+J6dpa25LAiQwkwgEOE2xRCyrUf0fR6etOY7h0zLUkpnsxrX1bJ+Va2Oy8SbrM2XLVjfVa7N2k/WZrDxe2TxTOs/KprRu1uHw0yxFAiQwPQSYkE0Pd+5KAjOOAJ54eUsyUlkA2bLVN0e21ubMn4y5lrSY0rWtbErr9Ww2jmw5O3ZTa2TH1pZtbqravtp6vXHWVjvO6jjZwzmilSgSIIHpIMCEbOLUOZMEWopA4PC8rqUiHgq2NomprQ+N3HQpnZvadEZtPW0fzdqc0ZSdm47LtrFMAiTQPASYkDXPtaAnJNDUBLxonDpoN/e0bHakkyDrG48atU7tnrX+Wn+9Nmuvp1q/auu1c6zfZO2ptXKq7N5WNqV9WWvtqbLtEymbH7XKruNVNFtnuZkI0JdWIMCErBWuMmMkgQYQCEKJszd0W9LqZhupyVhzov6ZL6bs/Np6tm+8ZUu2xjrHxprGOn684+zfaIx3DseTAAk0jgATssax5EokMGsJvF/ET+YvfdeCa2TSU7u21Sea2DTSr4n6YP5TJEACs48AE7LZd00ZEQlMGgFLIky2QTU5cSgOl/expBIZ3rdxHdNHeNv6qUYYMthsPmU12JEpZPtr103r9WxmCcTlE2XbxlJO17Wx5odZazM7Xtn8VOOdW2+8+WH/grZeH9tIgASmjgATsilhzU1IoHUI2A2+daKduZFaUpf1XgPx2TrLJEACU0uACdnU8uZuJDBrCNTe0LOBWVJmyrZNZtn2yqpRe40W40T2GO962ZjqlUfzYaS9rN1kc1NrZWqWEGAYM5YAE7IZe+noOAlMH4H0Rp7a6fNk6ne2xKhRuxo/U6PWs3VsPZOVs7I200ht3vFfWWbZsEwCU02ACdlUE+d+JDDDCdTe1C2cem3WPgkatuRo+47WN2yRcVRqkzHbI9WmlrFxI42xPlNtf+1+tf219do1rJ6qdmy2bmNkvJtlF2CZBEhgswkwIdtshFyABFqDQO2fRUhu4k0UuuUTpslyqXbt2vhr65vyYyzj642xtlSb2mO0fltjtH72kQAJTC0BJmRTy3vTu3EECTQxgUbfxC3JGU1jRWFrpGOz5bRtonakeEdqH2mfsY7f1LjR+kfry/pl40zZNpZJgASmnwATsum/BvSABGYYAf5B9829YGlClNqxrJcda2VTOi9bTtvq2Y3H2S0gEPWxiI/4ryzrQZvFbQytuQgEzeUOvSEBEmhmAkOnT/ajIxC7wZvG67Otk0jsN8k3liQJQiw6Qr+12xj7+1m2Tu3+1mZ9te1Wtz6zY1E6NrXpHKsnCrxoRl5iqSdRJ1kNztHhya3q8LqM8FKtjjP2phGGiXrZhHAdnUrOOcl5uC58kQAJTBcBfDdO19bclwRIYKYQuFJwX9fkJfiUodf0/QgZ7seQR0Ol+qXREpj6M3B45JHZjNSZaTefUmWa6xYn4kd2IdsnWx9LeaM5XgX5JC6uSOBiFb5IgASmjcD0/TSdtpC5MQmQwEQI4Gbe+J8XHkuOQSqh1Epsnoz+gs+SKjvSkiFTtm1T5brjzYcRpBmfE18HxnmcSJmSNhn7y+IY++ixjUQ+JnBHzMaTscHY3OAoEiABEMBPQ3zyPSMJ0GkSmEoCgbPcZvghylTcw0faY6T2kZiMd/xI62xOezapy5Y3Z83xzjUOpuq8sZ38VcfykwRIYDIJMCGbTLpcmwRmEQEnLvmdsdqQ7OZuqm2fjLrtY5ro2psz1/ZsVBI10XXMf5P5srmydUxenV3ZzV2O82c3AUY3BQSYkE0BZG5BArOBgPeioyUSdnOfjDize2bLE93L/Ew1kTXMB5PNTa2V68n6TbV9tn9t23jqNt80njm1Y+0xpT2uHFynnqO1k1gnARKYNAJMyCYNLRcmgdlFIDlHQVY2Hfft7J7ZcsMIT2Ch1A+ztaq3nI3Jtg8mQtnGBpfHskc1MXMS438N3p7LkQAJjIMAE7JxwOJQEmhlAt5pckJmiYWpHouxJAD15o3UNtI+I42vbbf5ptp289NU2z7eer21bQ1rr5W1T4fGGqcG4qfDP+5JAiRQJcCErMphtn8yPhLYbAIuqiS/Q2Z/3ysMw7rrWRJStyPTmE0QrGzKdCdFazPZXmZNScc4P2yeqXaa+WmqbR9vPfWvdp6tbaptH6luPprSfpu7KTnn0uEj2nSNEQeIk1BF1HmJy7HwRQIkMH0EmJBNH3vuTAIzikA+l5c0AbFkwG72mwqg3hhrq5Wtk22z+nQrmyCN5ov5PVr/pvrq7VOvrXadsYypnZOtqxfxcTUJi8oV6WzvQEt2BMskMBECnDNRAkzIJkqO80ig1QgEitzDJ6dkMW7kY00IMCmZY3ZjZPYjCM/K7BeZpFoWWI96KquPrI1X3NwWi8s0tnWGfE59NL/T8qbsaPuM1jc238YwCidjgaoU8jnp7+8bwwQOIQESmCwCwWQtzHVJgARmF4E4inEw5pLkCgX7o2TDAqyXcKlqMk61aodNGGPF1jWNcfiEh6lu7KPqxm3ZDRrpl+roe2X3Tcuq1Tmq9W06biRrJ56uEiUnn945HWkc20mABCafABOyyWfMHUhgVhCIfOzsd8fsJq5avXdbQpKqXpCqOiwhUx1erzdnpDbbZ6S+kdpVh++nOnJ9pDWsXbU6z8qjaSI+puvZXFNan2xre+VzgVTKxeR3yNryBT6ynGzoXJ8ERiHAhGwUOK3ZxahJYGMC7xfxrhxFlpCpqpi1UzKZ5pdqNVFSrW83xz1V3ZzpY5prSZGpdrC1mWrbra6qg0mu1SciW9t+h8x+md/+W5aFXF5eeOZ5JmQTgck5JNAgAkzIGgSSy5DAbCfQ3dNdtCTMZKdkdlOfSMw2r1a2TrbN6vVkY+q1N7JNtZrw1FtTVes1J22b45vNzSpZsM6H6sj71xmeJG617bZP2hbHseSCUMrFvor3lbKqpWlpLy0JTDIBLj+MABOyYThYIQESGIGA9xvW9uX71ktbsUfyUpbAR6JicrACma0v8bGkUknHDM2xvqF2V2esG1x/aGy691Bfdo2xlvG8LlnbbGD5iFbXq1e3Na3dbCM0FEt1z+yaXuJBv6zd9q2VtSfyAyyzFmUx1ojJxiRl1FMb4tp1RH2yIO6T4qP3rX/9zjttEL5IgASmjQATsmlDz41JYOYQsJOTB35747Nr//y77m3iDZLvf07m5CoSItEKxCM5c/ZvI5O/aWV/1ypVPhS0OSnkUHBxMsbKuUBFLaFLhOROKuirKtQIcyKc3MSJTetZGyTj42QNK4srJeNzeP7Wlg+S9qH1I6ztE6V+DVn4jQTM5oWYG6JsdlP1ZBzGiqtINcYIuVUx8cF8iSt9aHfYszIYg/mpvgzfykm71W2fAIlXPZkfSQzoN5vPGTOP9TRRIJLYUFVCVFKLYjWRw7VRJGCmENfIxmCJZGzgnbRH/bJ13C3z19wvlT/cGLxuQeiFLxIggWkjYN+707Y5NyYBEpg5BOInHqtsuPmnled/fpNfuGqldD3xqGzx9BOyxRro6ZWyxdOPy+I1jw3T/CcfSupmt3n+KdnymZXS/vDdMm/lw7L1c0/KotWPDujxxC5es3KYXbjqMVm46hGovrX9Fq1+TLZb+zT2f0LmPfGgzHnsPqzxeLJX4h98tHGJf6tXJv4sHrALVj+OsY9K1tp+tfX5A35Ye9pvZYthwVMPY9+Hk3i2eX41/Hhctnr2KZm78gGsXV1/0cA+tdbiNd/MVllUx9vats8WWMfazS548lFZuOZR+PqIzF/1sCx6+jGxvW3cIjCorvN4Nb41Zh+FLxbvo7IwuTaPyoI1j8GnRxI7f/UjUvzz7fLQj38o8V/+sP6Yj/5LaeZ8NdJTEph9BJiQzb5rOnURcaeWIvCe1+y7unPV0w+uv+ZH/pmLLpX+Sy6X0mUXSvny71V12XlSToT6ZVUVL/meRFdcIBsu+rqsv/BrYnV31UWY9120fTOpFy85T/qXf0/6V5wrtbZv2XelD31Zmx3XffE5WPeb0LeSce6qpdjvIilhzbXnf0OSebYG1Lv0O9K7DMrY0qXnYez58ONcKa44b9D2r/gefDlXzGbbi5ecm4xP5mHuhgu/hfp5El1+YbL/c99dgj2+m9T768STja827rRu1vaxffuWf1e6LzpHepaek/gm318m/uqliV8bLvom7HeleOl3pHTpdxOmZu16mC1dhja0W72M62F1s1avXH6udIPV49+/Wsr33u86S8W73vb6V65uqS9oBksCTUaACVmTXRC6QwLNSuB/PvyBlfP71l2xRfe69fOeelzaH7lP2h74K3SXFO7/C/SnRPn7/iypwnv+mJTnPna/dD58j+Tu/ZO0P/jXxHY8dDfG27y/SNuDf0nK+fv/lIzP3Vedl9ZTW3igurbZAsZ2PXqPLHzyYaz5FwnvuUOCu28X/ett0vHwX5P2zkfullpZX6q2+7Df/X+WZP0Bm0Ob7T+SzQ+My9//p2Rtf9cfxMbPX/lgUs8jfveXW2XOI/eK+Wl1G5swgv+ptXabZ9b6zaYcOh74C5jcJe0P3SXzcepn/lpfdOdvpQJ1PHiXLFh5P9aH/9gvf3/Kq2oLD/xpgGe1bv22b9uDfxbj3/4Q1n/4XtklLvv569c/Mb9cvOLzn/wXJmTN+s1Hv6QVEDAha4WrzBhJoAEEDjjggP7/+o+PXbh4npwR9z79tPY9W+7UOOoUgRwkUYf3lU51iTokrszLBxXp76m0xXGlKwgq+Uqp3CnOFaJIOnwsBV+WghQl7/sHlXN9Ygrj3sG2bL+VrT/vS+J610nc80JciPujdl+K5uV91BXGUSHui4LSBrMVlGtl7RHWiNqDctSpQ+qQ0rB6ts/Kc4LK8P5cFHVC8DUqbngmWXNeuzi0Jb5jj8SmPls9lbXBN6mVtduYNtcviMHnKj1l+AWWDrFF0RzsNzcXI76eaG6oUVeQ8K+A56A6xVXmqB+sp33tLhpsm+PiYvjcM3e+7+AD/vMPN177/Ve/+tWVBnyZcAkSIIEJEmBCNkFwnEYCrUjgqKOOWvvXv9751Q++6x0HvOkNr/t/r97nZSe9Yt+XfeVV++514iv32xN2jxNfue9eJ7x6731OeM1+e33ldfvt95X9X/2qE173qn2O32WH7Y4vda87qb9n3V8LGvmoZAlXLIGLBPlF8g8EzKb11IZI3PIuHtZvdRubV+8DH614w/6vPXn/177qlNe/ar9TzB78+ld/9Y0HvfbE/V/9yhP3f+2rT4Ad0H5J24GvfeVJB77qlSe9dr99T3rtPnuf+GoI9qTX7bvPoF6z914nou1EG4P2r6J88mv23WeYXrHnHicf9Pq0YC9eAAAQAElEQVTXnfKWgw86Ffa0Nx2w/1mhdzdrueTiUr+Yn2kcZrN1899iM+V8nHAI4ooElfKgwqgSdaicgb1PedWee5wCn07ef7/9Tnr9fvuab195HRgb59fss9eJrwZ32ONRPxb2mNfuu+fRKEN7HP2qfff+8qv22fNLaP/yq/d+ObTX51+91x7ves8b9n3j+cu+fe2OO+7Y34pfz4yZBJqJABOyZroa9IUEZgiBJecseWTZxeedv/ySi467dMXFJ1xyyUXHm7300mUnXHbJshMvueziEy+5ZPlXll9y0Vcuu2zZiWg/6Wc/u/akNc88eYKLi7cV8uLCwItHMiYxgrb/as+ADXwgCqVWrQ/KWuRomOuk2N8fd7TNufSiiy46ZsWyZUdfeOGFRy+7+GKzx150wUXHL1t28QnLLr7wRNhUJyxfvvT4pUsvOg72uEuWLz3ukkuWH38ZBGvlQV122SXHJ7pk+XGXXrriWJSPwbhhuuKyS45ZcfGF2O/8L19xyfIvYa/Pd+Tbryr2lVxOc2J+1vqd1q1PEJcpLZtN5SIvlXK5/JKX7H6K7b1ixbKjr7jiMtv/OPh//JVXXn4C2k64dMWyE8A34Q57Euonw56CeE6Fv9Alp15x6bLTLr90+eloPw2xnHbZZcuWXHrl8hvOWLasF/T5JgESaAICQRP4QBdagABDJIGUQCChOIfnnOUKkipF8lXt0YE/uhAI2lTFrOCVttdaj2Smq3OOPvHEE4phTfN+7rnntL29PTB/VXUwPotHVYfiQlk8gjaJIGoIbUFWaK08XVHhiwRIYNYTCGZ9hAyQBEigqQiotGkcBZLPdSb5iBMvJo+0w2TlsUjwiqJI589pQ1aDSpO8OzraNHKxSqCISwY0PEavDu0xIpf6Guh36K3MrYCM8EUCJDA2AjN2VDBjPafjJEACM5UAEowACYkXS8CqQaApKYzd2lwIB1FhOilZYdo/ggA/V80lCI9eq/6gjNMuSSR4YYiYatutjm6bB6mEQVdX10Cj8EUCJDCLCdhPhFkcHkMjARJoJgLeI4UK48AJHlfaL0vBOYckxSE5Ga8VzBMfikgOaqa3JZuBxgjVqZVzSD5NVjbhka09toX/HnEPCo8qkzKsQzgeVgIcs6E87M0KCZDArCQQzMqoGBQJkEBTElBV5GQOP3c8/DPBJG9LQawwXuvt9Mhkk5tGiBOPY+vFZy5ajCYrDwiPKJNSapOKt3wMrJIKP0iABGY5AX6zz/ILPAPDo8uznACe6CU/d5CZIdIYZ0Tjl/pIPCQaiYQlrNM87wCHdoHEA3FFsKa0XkF9oKwVcUEFh3yRqDoEEIugbUjWHgeVCn+HTPgigRYgkPxgbIE4GSIJkECTEFD1AU6QdKLuVBM5zE6SGNgme4d4IIv4kDBmT8hqnBzwPZQhDDanZhSqlqjB8E0CJDAJBJprSSZkzXU96A0JzGoCSKaQgdgv4cMgGVGPlGQcEjztHJzjciIekrCpmGmcQ84Jn8xX+Kim2hjRlvoeoE+SGDDH4oHUB2ISWPuXpE0VIJ0hARKYFALBpKzKRUmABEhgEwSqJ0L2I2iiUtvBO6d41mfFJtHAL+IPOx9DYlX1zmK1kiLhUiSUqFufyZqRpCJpzbQjSUvaJ/bBWSRAAjOHAH4azBxn6SkJkMDMJ4DjIzzOs0dx9mcvnHgduyTIzhHRwPtcToflPjLtL6+xr4iHr07iYfGJWNypgx7plxuS92I/kAO0qCJZAxfElw6mJQESmOUEglkeH8Ob1QQY3MwkkPzLyDG5rqqiqsPGqupAmx/W3jwVJ07hjXpJkjIkVmJCU/pGCAMxpC01sQwbPy8dREsCJDCLCTAhm8UXl6GRQHMSCCxdGZdrqlqTwEhat7+j0VQ/x3DQpZJ5qWriq+qQzXSPWFTVpK+zM6oWkho/SIAEpoXAFGzaVD/IpiBebkECJDDNBLzf9AmZqtZNYlR1I+/Hst5Gk6aoQXVjfze1tWp2jgp/qX9TxNhPArODABOy2XEdGQUJzAoCqpokYqMFo6qD3YoXKkMNqPA9IQKcRAIkMM0EmJBN8wXg9iTQSgSOP/54S55MEw4bJ2K1c2t+Aau2e+bVLc802T/YLJfb3cyLgB6TAAmMlwATsvES4/iZSYBeNz0BS0A25WQ2GUvLmDcjE7LU/03F3NFRYUK2KUjsJ4FZQIAJ2Sy4iAyBBGYSgSCQMZ2QIdEaDKs2ecnWUR7TeoOLTXph5N+Rg6+SaixuZBmMZTzHkAAJTD+BiXoQTHQi55EACZDAeAnsscce6r0mCZQlJtn59eqqyVBRrdrseCvbnLa2Nis2nVR1I79VdUx+Wlyp+N+yHBMyDiKBGU+ACdmMv4QMgARmDoF77rlnXI8XLSkZLTrrj+Nm+0P9geI1otuj9dWbVCgUmuzndD0v2UYCJLC5BPiNvrkEOZ8ESGCzCViSYhppIUu80r5s2bnm+/UqHwTDjsHqxZW2ZWOpH5/nn71IwdCSwCwnwIRsll9ghjd+ApwxuQQCJCxpQmLWNJ4ds+PrJTTjWWsyxgZeFDEOe1ypqsPqtq+qmkl+pywp4KNePO3t7dWB6OebBEhg9hJgQjZ7ry0jI4GmJIA8xKvqRgnKeJxV1WS4amJ9UmmSj2q+mfg1Jo9Uh8aqDpXHNJmDSIAEZjKBYb4zIRuGgxUSIIHJJzCUdKhqkpipVu1Ie6tq0qWqyXirqCZln8vlmiwhCxQvc3HQ16SCD2s3oZi8s+WkAR+1bVEUNd9zWfjJNwmQQGMJMCFrLE+uRgIksAkCOEFytUlHOqW23eom6zdrypbxaLCpkjHzTRBg6qfVs2Wrm2rbrJ4q7bc6lmq++MzBsYrjSIAExkyACdmYUXEgCZBAIwh4leTEB7bucpaI1HZk27JlEbXkrqmSFvu7HqGomOwHrMl81jpeJu2qkn2pDqs33Qlg1leWSYAEGkfAflY0bjWuRAKtRYDRjpPAscce6zXUWAKPgyQRyz1qJeIH2713kirbjpMjzA8kDAPX3t7upYlenYX2wFWiOIeULNScwEtRHyCmcJiXqiresrRA0KfDFGogpkDUdXR0qPBFAiQw6wkEsz5CBkgCJNBUBIJovYuKz/tcWIJf/cizYP2QVMqSKgwiSZUL48GyteWCkvjKWr9oXoh1mue91Vb5IB/0x7lcUULplZwWobIEaopgTbFoUEHsFfGuKM4XxUMi/QikD2NKUL/ElbXx4sX5pko44SDfJEACk0Bg9IRsEjbkkiRAAq1NYPuFFV1QWCud8rzktVuCsFfCXN8w5fL9YtKgB4lLVYKx2XpeN0guft6/eLvm4plvez5wskoj9xROwJ7F89nnxMsLcHKdqCIWKAh6JdR+ySOpDJGYhkjeciEYgEUu1wMW6yQHRvnCC9Le/gJPyECPbxKY7QSC2R4g4yOBViTg7/5W1/p7z37b+kdO+uf1Dx/zoe6Hjvtg90MnfqD7oZM/0Gd6+OQP9T/41Q/3P3TiR3oeOh467l96HjIl5Y+iDKH84DEf7nnwuH+uysoZ3Xf8P/Xce9I/9tx78oe67znlg933nXR4931ffV/3vSe+t/vek6ET3/vcn477hw13n/jup+445p1P3Pblv/nZRf9w2P57BFu84RVt+pqXxXLA3gGksv9ektgD9tbEWt108H45yeqgfcPB+oGvCOSw1xfkFS/r3/fhX/3336383aff9fjvPvtO07N/Puadz/3lmHevu/f4966774TD1997/IfW33vih7rvP+mD3feDA2zf/Sd8sO+B4z/U98AxH+q795gP9d979D+m6kM9VQ/ae+475p8Ghbr1dd9/9AdX3vXpD6y89zMfevTP//PBO35xxAd+evX73/fql8cvOXT/Of7gVxbkwH0CORA+H7hfIAfsZ76HcuArBux+edl/X8S7H7S3yuv3MUk1fpT3x9w3v36Of9FWaw/+3U8/8Y5bb/zY3z3y5/9918q7j3rX43/97DvX3Puld2548Jh3brj/mPd03/vlf+h+4Jj3dt933Pu67zvm/d33HX149/3HfKAv0dEf7LsHQkxJLPce/Y+J/zbmvuPfv+6+EzEeuv/kD3Tfc9oH+u47/fCqTq62g1+39T14+uHrHjzrrfa1NRnfU1yTBFqdABOyVv8KYPyzioBfc/qcNX/82L893Xfz3X0bfnSt9P7sAun/2cW+/2dLff+Pl/n+65dF/dfBXnexL/7ofOn7yblBz43QTecFPTedp903nKvdSR1tN56rPTefrz03XmCS7pvOH6a+Gy8M+2+6KOy/4eJc8WdLc303LM/1/eySXP/PLs31/xT62aVt8c2XFeJbrpwT33T14tzv/u/g/bqv++yRLz/s1C+9MVhy3BtlyZf2lSVf3DPRWUftIbVK+7I2HXPmF/aV0770+rZPvn/7k7fv+tP3FwS/u2rLwq1Xb91xq+119Vz/8yvzvTdcWuj76fI8GBSKP7k41/fjpfn+ny7L9/9kaVi8can03Xix9N1ysZRuudiXfn7RoIo3X+wHpMVbLtL+my80Sd9NF0r/zRe5/psu1t6bl26jf162ZfmOixcUb126U/4vy16309OXfOwdCz506qdekz/zc6+TJV94rSw56pXQftDeiPPlQ/rSS+VrR79czv7SHvK1L+8Ju5ec/UXwOGofWfIFzPn8a+T4f99jzocOCa/Ye6uHf/jSeQ98f1u5/aoto1uhO66eV/r11UHvz68O+m++XEs/v0z7br40KN10SVC6ZUVQ+vnyoHjLMt93M3TLUle8ean5bL6brKz9Ny7X/p+syBevX5GDzfX+eFmh+NNlYd9Plod91y8P0dZWvHFFof+m5fm+ny0Le366PNzws2v7Sj/7o3/4o//qn/lW16z65mEwJDDNBJiQTfMF4PatQmDy4/T+9vwzz97znrb8kyd05p7caau5z+U7dSX0ZL5Dn4DMVtWOeiJ5Cu2rErUPlXMom/KdwepBzQnXDJar7U/l23NP5NvDldDjkJUhawsey7ehvatzDezj+Tnhk/l2RZs8VugIHgvy7iFp8w9KV/CozK/RPH1EUnX5h2Qkdcoj0lVYre351bmg8mh+bvsz+Y786nybrspr5eG8lB/Nd6LekVuV74Dv7SH8RTxtwZPJmALibQ9Xw++q2oJV+VRpe1pPbdputhNrSd/D+fZoVX5B4YX8Fp3r8vM71+bn59aECzqe0Tn+UZmjj0kX/JyjD8lcfVA69QHY+2VOcH9i54YPy/zwETE7L/eIGIt5uZWoPy5dweOy9cIN2hk8kZ/jVmLdZ/Lt8RP59mhlvsOvyXfI6nwHfDZfUqV+1lrrr20zTrZ2R/B4vh1fJ+3BynwhfKwqXL8C6nlcN7MFfTxfCB7NtwePFYL4wd3L6/54UveTN33A++N4DxG+SKAxBPjN1BiOXIUEpp1A72O3Lo56Vn80Fz+/bVh5QYLKBsnFZclFseScSC4Oqc9+0gAAEABJREFUBpSTIMqJupzYy6mTscoHfvhYiVCPBYtJrBXxUpEY//NY02yxr1v6+3vE5qltF3oJC4H4MBZVL/ZSr2IShxpk5VShhrKRgpyEpjAncSWSKI4lzBdEcjmplCtSsf++ZRBKoaNDRBTLBiKwMfbx2NKsc4jDxsXY0EUikPo4sVZOZW21Svs85ufhgzgV8YG4UiS+tyRAIkAgubAAP/MShnnJBSbzuyBh0CaBFiQIcqKYawp8KIkkEIWfVdma4FmGf2gXk4YIxSTJK0BA6i0G831IGkdiwgpYLx5RoCAx1nAaicO1c74sJu+jxMaVXvAtJmVVJ7m8k/aOENZv44PSp5+7f8c5iSP8IAES2GwCwWavMLAADQmQwPQSWP/c4/PndvnXFIKidBaQeeCmKrjZCm72EudEHG7kHjaRle3bPxSvZoNRrUeS4JDUmE3HCxIEVRVRJHQioqriA9QFW8GoqrS3t0uhUJAwp1KpVKRU6keviP3ZisgSCayBGtoCzA/Rnhsm5DySKtkbftg0k7WHhXbxTpFUqEhiQ8nn2sQh5lKxIs7WR9msSg4xhqKwEoBDGGJfvH0gCsH5MVmVEKsOzA1EvCAJy8Wi9q8mkdjk20OJ46LErgQ/InFI9hycxRtlsEqSQaRCsYrAG8F6ghV1MNlSNJu8BKGXMI8yMmr715iCRDaRlDEmFnsF8D3EGiYrmywWk6IvQF892X5OsDZkFvhsuUROvHjvRVRFc6FgCYlcRYrlopTKSNLsX4ZK6aXl+KndhS8SIIGGEAgasgoXIQESmHYCPh/hDtqnan8+wZIx3PjF4VscN2VJkrA8sgcTbrBIbOyG7dDncbc14c6L23A4TNZvsv6sbKxogIRHxWEtJwMWZY/kIlUlckm/HUR5jLeTLAcvIzSESIhUdZCbJQAOWYtZk3WoqqgOydpS2ZgY62uYE0WCFWHhXL4NiYNP9rS9Yuw1khxODGPEb7IYzXqwcNBYLBwTr/2i+aJI3C2aQ5KUL6GtKEFYgWL4FUEOLlel2M8UYA+TldULEkEROC3iYytAEVQWUUiwvtg+KGu3SNAjEsJi71i8mN+pHNY1ebXkE7I69rT4PMrDhK8N7/LYdkgxkleTwzV0iusLxU4wRhGuSnLNQhFRJyqVEIeSTqb+xR1JYFYSwE/rWRkXgyKBFiRQwmMv53Qwcvv2zqGGG7PdWFF1gROTwIrazV9QDERx0w5wgx6rFexiYwW3Y7PhoK2uFWKtjSVi40LvJfQiAYRbvXh1iZIGNKb1rLW+bN3KikxGLYFxMboriMEh5YiGW++qdScbWcErQNzwRGRCVrECpiJ58Sh6VfFo8UkZ7bBwLGmTAJVEXsz3IQ2MA0hrg5MD/QPtWHNoLtaQADvYGxbXVJAWSdKGej1rcY0kjA+QgIW4lqkCOB8giGQ1s1AIBUh2VQTuOYQUJwqR9OddBWSFLxIggQYQsO+7BizDJUiABBpGYMIL4VGdBuqTmzROwpCeCORxU48DJy7A47OgJC7slzgsiuD0JUDCEjgnqUKUx6rAfncLN2obrwPzstbK6bpmbdyQPJIyL0g7xMHjscpyi3SsqCUGFcn5CvyvSOjKaCoPswEesyX9GFPPqjikJQ7Exm8FM2PfgROqrgHNEedNuA4eAnsH+SAQj2TM/Pb4iWty8N3bNdGKOMgHMWycJGMOVBzWdpITJwWsibV8O2zngLpgu8RLB/AFycgAI+vJ4htJITZKhJPCxCZ1D36SPBUdanNogze43jl8vVQVSWjJsLfzRzjMNwmQwGYTwI+HzV6DC5AACTQFgRK8cFD6xre3iuAARHxikZSp9ZswRj0+YkEWIxgl47eYj7cgJRimdEPbNFXSBn8sG0kk1Rf8UfhRT4lP4sT60vJwa0vAf6mIYJ0RJfZy9gFlrROVWBRJhtg+47ZYDklTErs9Eq7lkMSJmG0YpKr4tLezD7FHrtZriZQ1WDmxNs8K8A6HieJdAIUitocvwFblXYgdba0Yo4dbi0kRmyAuQfJXa60/aUv2CkQSi2XsesEMvrPX18ZYfUCW6ElQxuTB0SyQAAlsBoHp+GbaDHc5lQRIYGQCZQmCEm6pFRGcutiN2Ks9IvPiLGERewVIQHKiDidoeFyFoyVxYVkkxEkNrIeNx2wjsXt0jNMfD0Uq2AdC2Q3I+kxpfZhFwqE+kGAUhThhqu1P2yyaWAOp4AQqRrJTwXoO5QhtwyzaknqNdRjn1YkqZk5Axjj0ZSRFkJ02CmyiCG0mBwt5QRQKBYmy8VSBqQyzyMICnDwGDr5BgTisE4n6ClTKCNct8bssiqRU4UNqzTdBXawfPmmNleQfIMTicEoXByJxCME6yOrGK1ac0AU5MRtrHhZCBC5pD1APRENkhcIXCZBAIwgEjViEa5AACcwMAoEX3NADCew+ihOX5OAqyQec+HHYWGKxEx58DlrBy9ZLhBQCVbyrP2Js7VSCZE1VRVXFNsWnmALUTVYeiywbdIL1fYBlQlENk9RF0Ja0JzaEDyoOa4vAIqFIbbUNLkj15atGxmqT4RpjVQ+l1sobK1nUYwakAKFIhhPrNLkemrQLykMSvBQSO7nLSjDYpM56rSSCsrVmrdjL2pNFqtdXZMhia7GE1OZYu4MTHrJr6nB9zSZrIjpbSsBTUEa+CJdUBGWthFaQ5n3RMxKYOQTw02zmOEtPSYAERiOAR1lxm4q30y9TKJrc/FUC3EWrEgnsTpwchYQo22lZAbYg6sZmJc4n4wOXkwB37Oq6HuWMxOF27UWRSMChallQzwidYi9rFTutGhiVLVvfSBKMRwRIsfCJOIO6CuDXyPKY7SUvHszGb5EIIknxSdJjiU5GIojUPhSFAWGswEeB9bAmjBjqtzbElMSrSU/y4fGZ7oFgxGG/RGh3eGTqpAD/C1JrPR5vDmpgjM9YgR/Va4OTNyRggUTYPUIrTtxw3ap1hzafXKrkWnqplkVEcYonfJEACTSMQNCwlbgQCZDAlBPIbqiaUzwOU8WJkd1sTbjHY4jHTRU1X5UoCmhN3hhgiYxgxFisx9R0nOClieymnUqwkskjSfC4uUPJHIdcoiq7sQvSB7FX1herj1M2XRGDeknCSm0AL0xpfdBi36Q8YAUeCl4eCSGMjM+qTRmjXM242npNd1pVFdUhDZ8VDIxScRgjMtymbdbu0bexFbwcCNiqDiOQUCIxU7QKkj7jVL1ONsZjXEbeBgmusbhqiZ8kQAKbSyD9jt7cdTifBEhgmgm0VWLkOshOEj9wnwzsrmlyEiYnHmhL/mWcFwkikRB13HXdgGLcW9PyWGyyTfJhP0ZSJQ3Jh6olCCJOTQFsID4Ik6THpwkQMjwV+AP/zNZK0F5P6ThRzM3IljUNthuDAeGJppiQGcqgBAxs/wlbhGoJcK3QbG+HdQflI9SMcizpiZeHb6kckiCPEYnvNhmyx8ImGVgfCTdcT0/8ROyUqvaEMhTBuV9VxilQkVRWH5QqRuLayMC1wx6Kmalk8IUI4Jv5l5UI2A+OYYEESGBzCdh34uauMYnzuTQJkMC4CeDmmaRlsOlcxb3TZPUkGUDBocFV78mobfqdJAabHjahEarjcGRcOyDwJHHw4pHcmaqJxFB7dTmrW2m81uaMVbZ2rcY6t/441UZys9tBrdJ9LXGtlfWFjXTAFqRIoGUJ2HdfywbPwElgNhHw1b8JZXfNMYeFAxqcuMiENOZNRhmoqnV7Veu31x2cafQ4cctUZ0wx63e2vNkBjMDR9jCl66uqqGpaTazq8HrSWPOhzv51SE3jTK3SbxKYZgJMyKb5AnB7EmgYAWfp1dgyEtVN32xTv+zGbUrrE7WqY99zrHs0wq+x7jVTxo3EJG1Pbb14VMd3jfB4mPeQeiDZRgITIMBvpglA4xQSmIEERnDZbsAjq5rejdw/wqKDzaqanLyo6mDbWApp0mB2NNla1m82VbaeLaf9qR2tLx0zEWvrphrLfBtbO65eW+2Y0eqD86sXcLShyfUZdQA7SYAEpoQAE7IpwcxNSIAERiNgCURWo41t5j6LoVn8y/qSLasOJceqQ+XUb9WN29I+WhIggckjMHsSssljxJVJYAYRGH43Vd345qq6cdtEAsze5CcyPzvH1qqn7JjRyjY325+tZ8vpmHptaV8jre2zKY20n80bqW+s7baGqXa8qjbmZMz+iWjt4qyTAAlMiAATsglh4yQSaG0C9W7yEyWSXStbnuh66bxGrpWuOdOsMTBNlt/et+Zfh50snly3tQkwIWvt68/oZyEB7+1PPFTlnJO0noZq9bSctao6WLUxJtWN26zdBqpqcsqiOrK1cZuS6vD5I423fU3ZftWhudn22rLNy6q2X3VoHVWt7R6xbiOzCjA3q2xfvfKIC0+wIxujlVU1uUYTXG7T0+wP3G16FEeQAAmMgQATsjFA4hASmDkEkI2NwVm7WY88bKhnrOOGZrDUSgS8D+0Pq7VSyIyVBCaNABOySUPLhUmguQlYsmUSh3vqgBRFq2etlUfSVEaoOsmnPVMZzBj2UtUxjBoaklzLoerUlLwf19+9mxqnuAsJzEwCLZmQzcxLRa9JYBMEAvu7+yPfxX2dwzNLtDaxatJdb27S0eAP1eFJiOrwenY71ZH7suNmYll1fLFN1fWpZZkL4ri2jXUSIIGJEWBCNjFunEUCTUkAt3G8R3at9sbtxUmtBFmatZk1ZctWN6n95LBxSPJszZE0sicj96hq8ntPqpoMUq3apDLwobpx20DXjDeqw2NTHV7PBphyz7ZNaZmPLDeFm/0kMGYC9mN1zIM5kARIYOYTSG/iZutFk23PluuNnao21aGkRHWoPFX7c5+RCET2kHukTraTAAmMgwATsnHA4lASaHYCuDviPXYvLeEyjX1GzcgprKpqcnI2hVtucitjN5o2ucAoA1SbL96N3c3pxm1sIQESmAgBJmQTocY5JNCMBJL/lqXgM5DAOTxZ9GJ3S/sm9yiYzG31AfpUQvuVM2uE7FezUwnqY5IIhuGRpzqUTIJ1h0vG+rI9bex4rI3NyubXCGEnDMxmuyx001BbOmJ81gh7LOJtl6wv9coYZ2+PDxOM2H99NJXVVQf2h03HWPugwNoNKJZG/PpWMLj0xoXqNR1sx74C+QFZuaLxgMODo1ggARKYIIHRvhsnuOSsmsZgSGDmEGgTCZNkCy4rbueuhHumEyuiRexGbnmCldXlRF0BCUEOVfsxMD55LJT8w0zcnJ1GWMP2ccjQrKiwVaV7e4zLCqOqb6yDrA5l7G9lGYfFWJU8UqH84HxEjeWGkkRFllmVYJzgpeCgGFN10SHxEfRYPB6TPXzwsIK1rX1T1msoPgjEYbxPfrEO/qMcSIhPCNcjgJJ1bG3s5bCnU6m+gAyTRdAQQOaYxxhLtYbkkXqZLAWLxaHmtIKhDnvbQkOq+p6pYy1bbyRhEfgRiIe3JqyI9b1Ur5Ukf4QO1CUAABAASURBVMMOXyiiAVawZQMRpz5RjGsqUsZ8vkmABBpBAN9ejViGa5AACUw3gRJujtWbpBPxdjsfuIP6UNAiHjddl9xEHfrhLZIVSXpQR7VatsLY6khrkNBJIrWkI5FiAfxYsTJKuI2Lh1XUcR8XE6pibSYrVzW2PYf7aHMyssXT+BAX8h+pKkhsdR/b1Sd+2PAgyWA8umyd8VpMS/ZLra2Bcs3b8ixrMl+qZZ/4Y0mPtScyZ1BIx1gSZwodUjtMCuFaAIYmI6woJ7KsGPPsbY9OU5uWrb4pKdZP1gSz6tihOFSTqyyC/TySO4GDwYBsDtOxKrHGfHKVVieAn5ytjoDxk8BsIbAB980S7q/VEysJQgSWl1hz4nCSYw+XLCGLA/SHJZGwIoKTlokKaY4EcQAVRFwogsRPJCfeToygCIoDGXwpbuqpHG70TjElQOK4GT5IgBhMtoZESLSGkgkrxRogfk3k4Qm2lBwe5+Z8JCbFHFGkFTZ/3LaCFDdGQuoTidgODrvgnEmrMt6iFuOABFZc4qf1udCJKcp5iXBY6dTWEAkchKEKq4CocQjOprzkogGhTb1iP+ycJJZJcfBjU0mZYivFNbEJyT7YK3QRTlldIoWfgq8hr3nxOIkU3ybq2iTEyaopByvAb/MpEiCBzScQbP4SXIEESKAZCJQrSHECxQFGiBuoh0tIjpAyiMed3mRltOL2LT6IROxRo92JRdCDu/EYrapKoNVTHlH7EaIiYhZSW10kDpw4yGMcOnEjdyJ2ImcS28v8czLQbWcvNmxjqyqqVdkAtQ8otdUYLBaH1upbLclI4jUOpiR1lBjr2K4DOQwGY446sbUUPo3bYjFFPDbXeJgVjaWKJOmUwQCxvuAVwA4KQyTw4gLMBDrjhSuIUdbhYCEropS84aD57m2DJEZMsg6ckhlHU/pHfa28KdlUr05sTYGtyjZBD/YNksfaIVwEQyTc3uVFjWuiQNRhbBlj+SYBEmgIgaAhq3AREiCBaSdQsYTM55GS4UQDN1DBTVVx4w5wxzUb4gaKWyhSJydqJypIJsQFuOHix8BYLU7BbC2b57FSOVQp5kWiHG7sQSQ+SfIsQUJiIqYICU8ENhBOpTCyWk/GObQH8AUJo9387UaftXYqg7qk7QP1JClAuyI2OwUyqYRY15RP1gt8QXI4zcn5PLzMI0u05DQnEZKfCk7uymEglSAntrbipGdiMt9FFCduCpbBgKycKhCP/U0qIa6DeZiVIgYZeDlYp04sMZMQNRNO/3yuIpV8BZwrUrIyFEE+BF9c42AUKfpGEtyRSihY0ycWXwJSzSaNVxvYFERxKhbEsC4vIa69DPqLhUXwkLyAT75JgAQaQSBoxCJcwwhQJDC9BErdSHeifCDaJqqWeuGmqZEoEqMQyYLd/ENLZHBzFZMlOvZIChLIaSACbcp6jKmOw8rYBruIvRQFRaIX+Bg3b4d9nTWL6ICVgRfGWclMIqyBweKzFomTtW0ktA8bZwsNCv4nnbDWhsVta8trLB2zhMl8tK5UHomct02QbIzXCuaKJSiK1RKL7AaPhs0FY+TAKStr80jPkjk2HlIohMwK+hTzVRUL4m3Oo2inWDEsnlyKh3XosggV11TUiwcTNIlDn6omNq2btTn1rIhHs8lWRCKI+R4+CGxVTgQ+2P4aOOwTCS5sVSJ42KtSjKIYRb5JgAQaQMC+rxuwDJcgARKYbgKlYuArlZw6nAo5u6PixArnHyiVIYd7aSBBjGQt7hBxpjbcvEOJcBO3kyOzFdzcR7IxTpaigX6zHgFbMpFHppDDvRp5n92lxaz9aljgsR8klvhJDqMzQrtHwhJpLBFu9lnFoRd75GltDmWzaT21aRsWHXxb4oFlkTg4sURC1JyCPOJ3FbHfGcvHsRQiJ/nYgQcwqEiUxBVMyHokUF6R7mENZ/EgsY3QZgyN0ZCM84BsDOQtocNJpsYhfMtBxktFq0HAOfx4RtnqAWyIIyxTIcY4O9rCPK/wP/Riv38WwVag1MbAbeWR5DC3AA7tUN6JWOKKTcVO6CJc0ChXkkquR6J8t0S5XonyRam2C07VAinihPG59WX+FplMw4tbzkoC+I6flXExKBJoOQJ9lTmuWJ5XqriFSC46JUai4HCXdXi0ZaccHkT8YGKEb30kEHYDRgYgXr1Y1Wxaz1o7OMnWk3FYD9PQhbu5eBGNoQhCPXBI9hx8kETJ4hgpSCzELKSYInjZI0evKOBdz6qq1GsXWwtSSLAepmNPnyhGRujtHy3YP14IkDPYL+wLfBuQYm+4aFMSeYXPKI3fimApSLGvwmIRvFN/nQra0YB32mbjUR16wxk77cJQPD721cTIBiVx2bAACbWgT3AJNJFYH6QDcXuMULX90Q8rdjFF4I/is74NPLqwhljmhpNTwdeGhxzWNA5evYgauwEJ1kHiWdEOPKqcKyXf5bqLUkIz3yRAAg0gEDRgDS5BAiTQBARed/Dh7vqbHoifWd8lpXAr6XNtUskXpBTEUsFpSb/rF21XifKx9PtekXwF920n9q8OQ5wcBVGUlK2eytrTcmqtLZHEEiCRUctswkgEpyq+gBMvrF/MOZyiOClbQpgLRPI4RXJORC1BULEm+wX0HB4V5pEM5HDakyqMAhksoz2EButRkPSFsAFOijQ5fQtFcgWJ4H+Yy0k5KknYLtIn/VIuRFIqlKScL0sFcrlYfGiJhiSv0HsJk0escV2b12qKko7JiUtSlqRu8WO+r5TFVyqSy+clQIx5xJiDvPmD06cwUSRhDKE/hHJosyRMfEkEx1NR3C8hElrFmKQ9MPecIKOyAqyKszWRaMWQIDESjMFSEsSCfTWxIRKsbD0noYROxdqzNkCbj1VEAMpB2ikSdEmxEmDLPGYVEFMEn73ksWYOJ3mBncpV5oi4RVKJt5Lv/9/v+u966Il+LMI3CZBAAwgEDViDS5AACTQBgWVX3Ox+eeuz/bf+pVee791Ggrn7Sp/fSaL8bhKFu4hve2lSLwW7ip/zUumVnaTf7SRlxRj0O4yLc7smY62tJDtKJdh5mKx9sA3zi/H20usg3VF6wp2kO7eT9OZ3lf7cLlIJd5Oy31Viv5uU451xooK2YBfpibaRPoyPMK4oO+OIZZeNVPQ7i6ksu0gi3VXKUCXYTUxR+CL4+SLpk12Rdr1Iuvu3RRK2h5TK22OvnaSvvJ3EGNOPGGyvnmBH6cXevZhfDHbHfrtLWUy7SAnx11MRc3vj7aTf75CMKYNFViXUo9yLRDv3FN/+UilXtpfeeIdE/dEOEmOvqnYRY2HlCG2mCmwZfPrzu0gR+xfDXaU32l4qiDG2mOG/hLtLBJ+r8e8sZd0ZfuyIBHtH8N1eSiHq1q+7oW9XaGPbj+tb9LskLEtgZQzL6XjsX8Ea/bmdk6+FPrdjEotre5nE4YvF5V8iFcztL22Lc8UXiS/sIUV5sax6bpFcf/NT8pNbXghf9ap/6BG+SIAEGkIgaMgqXGR8BDiaBCaBwO57HdL/4Kr2+79z0R/9ty64Wy669An50U2R/PRmlWtviOQa6LIfbpDLftgjP/ypkx/cEMv3b3Jy1c1DuvKmWMajH94cyw9vcfL9X3j5/i9NKv+H8vW3BPLjG1VuuCmQ638qcs1PY7n+16H89LZ2ufYPObn617Fc/vOS/PBXkVzzy6qu/VU8WP7hLypiuvqmfjF9/+aipPrBLSUxXfXzinz/tyrf/00o37/Fy4preuS6G0O58ecdcsuv58oPrq3ID37i5Qc/E7nqBpErb4SFrkD56hsCucrKN0Zoj+QqxH01OJisfCXazdq6prT9ihsqYkr7L72hLJf+LJIrbvJyGXhe/5uCmH74c5X/u0USvlffGEutbO0rwW0FWC29BX7+Oo8YVK77ZYjYRK74aVkuv6EkV9xYlituKmJ+n3z/hl656sZeufKmbrn85vWJrrq5H9evBJWhsdursefVt/TLihueAb/1cs3vi/KDX/XJFTf2yLLr1suKn/TKNb8I5Me/75Sb7lwI32K56qaynH/1GvnKN++Qby2/3z/2bOG+N73ptTjGm4QvZi5JAi1IgAlZC150hjxLCbzpb57rXLjrsjXrOl+4/uaV/vwVd8o3vvsbOe0bv5DTvvZL+eb5v5cLr/irXHj5X+Wsc38np3/3t3L2hbfJmRfcJmec/wc57dzfD8rqabuVTz/vVqnVWefdJmd973Y54zuYe86tcsq3fy+nDeiMb/1ezvrWbfL17/1Jvnb+nXLWBXfKV7/zWznqzB/jhv5LOembv5El5/1eTjvn13L6d34J/RrlXwzYX6L8Kzn127+SM7/3W+g3kNlfb2RPO+cWOfFbN8jXLr5VvovYTkVMZ577B/nyKT+Tby/9q3zte3fIku/eLmfDmszfJefeIWecezv0B8R7K+L6PcrQ+bfKmYjzzAv+IGeBxxmoLwGbs8DI6qfD3zPAyNqtbuOWXHQ71vgd4sOcC34vJ3/rl3LCkhvg/y/lbPA+85xfyVnf+Q30Kznju6Zfw1Z16nd/KUuw19m2z/d+J0vO+a2c+s1fyhnf/q0suehOOeV7v5fTLrxdzrjgdjnz/Dvk7PP+AJZ/kLPPvx26U85E35nY4wzozPN/izh+J2ec9xtJ62bPugBt6E+tjTvzglvhL9rh7zfwNXIGvhZO+dYtsuTc38jXoHMuvg32Vjn5G7+WY8/6hXzh1Jvl5HN+g2vzKznvsjvltrt6/cNPhj3zt9j7QpE9oln63TRrwmIgM4cAE7KZc63oKQmMSuAQ1eiUU77x43lb7nheHC56/oWeLt9d2RqPwraQUrCFPF/skjXdbbJyQ06e7u/yxfZd5Xk8PlwXbSemtZVtJdUL5W2Scm172m/tL2D8+mhn6a7sKuvKO8m64o6ytn87Wd+/o3QXd5L15Z3l2dJ28mT/1vKk21aeze8ka/F4rDJnFzy+XCTrurtkQ3kx5m4p6yumrVDeYlDrK4sH2rccaKvataUtZG1psawrLZAXettkQ6VT1kbz5MHnRJ4LtpInoy2ku/1F8ly8A9q3h387Sm9pB2g76UVcG8BkbbSVvGAWeiHaRtbF20pq16K83m0n6/321TGob0DZ6t2yg2wwoW7jX8BezxbnypPrCtITbyH9wTZ4jLqV9KL8zLo26YsXS2+0WLoHtCFeJKl6Ue7u7ZJi30Ip9S8U5zC3uBXi2Vq6g51lDXx4Fo9NTWvdDrIej317KttLb2Ub6YHP3dC6eCtZ66Boy8Ra/YV4S8SDtpr2dX5rWe+2ltR2Y/11uEbrS1U+3cVtpLtnke/pXex74ce6/kWytryF9MjW0qs7yFPrO6S7NMdv6AnWzcnNv/Trpyy5UlXdqF+U7CQBEhgzASZkY0bFgSTQ/ARe//q9nz715LPPnr9ghy/6YNE13b1td/eV5z4ShwsfKUvnwyWd81BUWPhg+xa7PfxCsPipZxbt3vvkVi+Ua+/NAAAQAElEQVR3T2+zlzy9/T7yzLZ7y+pt95I1W+8paE/sqm32rGttzLPb7SNPY45Z03Pb7iMvbLOPJOXt95bndnqFrNlxb3lqu5fL6q1fEq/p2Lb70e72p6Vt5yeieIvHRRY/7nTh47HMf9zJgseczn8Mfj/ugwUrfbBwZcV1QXOhrscrbi6U2JWleM7Kcty1Utu2WBl0bPdEqWv7p9cv3KX3+W1e5p7fdV95eMGushJxrNp2P3l6633lua33kue32kuegX16mz1k1TYvlae2falY2eLIKmFhPAZkTKrx7JvEZWOfWPSSeNWcHXrW5xY/vWDrF690hcWP9fuuR/srnY9GMv9RzS16NChs+UjJzXmk7LseiaQL7V2Pw64sSdfKsqDs5jyeC+Y9LnH74319ucd7K50r+3TBE/3zd1qzpmu79b077R2thp+rcS3WbL03fDftJ89s9QrEZNoX/u8ja7baE9obGm6fRqyrt9xLVm+5B7RX0v/01vtg7l7QPrJ6m/1k1davkhd2fJ30bPeKyprcNi+Uu7Zf2SddD8ba9VCQW/SQhgsfcjLvoZ6o4yGfX/DAhj794Z77vPb4o4764kmvfsMbVjf/dwQ9JIGZQ4AJ2cy5VvSUBMZE4JBDXrvmc5/75QUXX3zFf1x12bX/uPTCS95/zjkXHH7+hcsPX3H5lR84/+JLPnDKWd/4wPaveuOnd/3n//fsFh//tC7++Kdlq098VraEzG71yc/JNkf8b1LfGuW0PWu3POKzMvfjR8r8Txwh8/7tCFnwiSNl4Sf+XRZY+eNHyLyPf1LCf/kXWXDkEbLtv/+7bPfPH9Vd//6fVu/y+nd8/sTTL3jvFct/8r6lFy8b1MUXL3v/0ouXQ8vet2zpivdeuOzi912y4rL3rVh+6Xshs6nee+mKy967bPkV773g/B++94xvXPFet/gln9j3g5+8a4d/+jed+6GPy/b/e6x0/Nt/ysJP/o8s+uSnZQtoq09+Srb85H/LoiPR/v/+Sxb9O+pHfla2zsS3xb99RraEUmscrG58Fv/r/8giCLxkwUf/W3f80CceWvDSvT71pWOPf9+FF136vssvu/L9Sy+59P3nnrfs/d89/6L3X7r08sOXLru0qqWXvn/ZsmXvW770svcuhS5eetn7Lr54xfuWXXAhYl32vsuvuPp9K676wXu/Bn3ytLMOX/y2t186/93vDbb/+L/L1v/2H7LFv31Ktvj4Z6D/lcX/9gVZ/HHo345C/Sj4+3n0f76u3fITX8B1/ULSv8XHMdf0r59DHJ+TBf/6WWn72P9I+z//h8w//KPBju/5xyu/eMEFH/rWiuUfvHDFRYdfdN45H1h+7vkfuHz5xYdf8J1vH/5/V/3ggz+48rL/POus08854lOfWil8kQAJNJQAE7KG4mz8YlyRBCZC4PDDNT7kkH2ffP0b9v7LGw7d/843v/ngOw59wxvufMOrX33n3xzwmj++9w2vvjPYfvv7K7u8rL1v15dpz64vle6dXizdu7xEUJf+3feQ8ov3kr4XvTypp7Z3t5cldbOmnt1fLr277ylFjC2+aE8pvWgPzHmZ9O72Utmw20vQvof07PoSWbftzlLa+eVBx96v7axsv9tD/3zYK2476KCX3X7QQa8bUW868MDbDjzwtRhXf8whmPvWg155+wff9IrbvnTe0nuKO+9R6NvpZRq9dG+ciO0EX/aS7l1fhv1fKr277gHtCV/3kL7dIPjZbbHs9nLph5L+XQbGwfbsgrhgN+z0Utmw4+6ydvvdZd32u4nVe9Fe3H3vIN51z1znri+775/fcdhtf3fwq+44+FX73PHm17/qjre9+fV3vPng19/xemuDPXhABx10UBLrIfC7KqsfgrZDbn8d2l73ur1vf9drX3rb3vu89o7yNjuvm/PK/YP+HV8ivTu/VPp2fgnsy6V7Z9MeiGsP6dl5T8S0h/Ttsldie1Hvgd99A3Wz/S/aS/p33Rsx75mM6975ZdKz0x5JHBt2rMbbvzs47fyycMOW2xYPfe3ed74bXx9vPOCAP77h0EPvfMOhb7jzAJT/5i1v+eMBr9nvj4cccsiTe+65Z3kiX5OcQwIkMDoBJmSj82EvCcxaAp3b75x3czo6XViQioQSaU7iIJ8o0gLa8sNkbakqkpeiz0lJ2qWobVLxBcxrxxpdUtY5aLP2ghTjnERxu3idK72+QzZ0bt01Z9eXdzQa6pLvX5PbsMUOHd2FLvjVJmHYId4H2Bf7I6ZK2Cb9YV5KiNEUwV+v7VIO2uBvATaf2JL1I7bUViQnZcQZaV5c2A4eOcQUIM68BHMXds3d9WXtjY7F5SXs2mrnwrNF+CWdEkubOG2TchhKCSrmAimrSCnwiAflIJQyVAlzYrJySQMpig7rT9utzxQFKqF6XB8vG/JzZeEuL1nwrEggfLUqAcY9zQT4zTfNF4Dbk8C0EejskEgCjXHzzirCjTyCU6ZYVUaSl1AcEpYYSso+lBhJkENCE6n15UWQyHj0W1sctEsx35nz7Z2hNPgVzlsUFju62kpIsGIkJs7hRxt8sfzCJTHAN/gUIVYHefjo4JeHHNod2lwdm3BBnJExwXpmY9SdJUC5fD6aMy/X4FAkH4h6bcsZrxjJmPf5gWsgsIFEgiQqELEQHfyO4ZvZerK+rLJjvATiYydORSr5NonbOjoLgsWELxIggekggG/r6diWe5IACUw3gXxnp7ng7GOi8t4je/CD03FvR11wOuUTDXag4AMVxQlP2NbwfEzmd3WGYRAWzJ8gCCSOkYaoYtfMu07RxteTOMRkwpy0H8XBt6pKEIS5Oe2Fhv8MzauoahjgQ7KSzCv1yWzabOWs0vZaa2PStrQc2nUJw5yl0GkfLQmQwNQSaPgPk6l1n7uRAAlMlEBbIXS44ddNyOxGbRrr2tmx2TLWF4cTHWeJm6ot53KFNmQ7VmycCnO6BhcLkJCZD6rJfmKfVk8HZMtp26aszUmVjkVaia0an5Al6+fgdRhIksSmccB6NCf9NR/mW01TkhBbuyntqy1bXVWRXAaSC0NXQS4tfJEACUwLASZk04J9UjbloiQwLgKBz1liVJOQKW7koyzj8SMjFR55WX6gWCW1tTOzi2OYJWcOd/7aYZtdV2QWzrvYwRFVfExwRSyD+Kune1a2ZWqtteH4yozPNfyBpS0rIBtotdTYT9WhZVVVVDW7gV2ibJ1lEiCBKSSAn65TuBu3IgESaBoCFakkyUfqUJp4qA67Safdo1rVoTmqQ2WbZEmZarXNOefzOPix9kYqjmJnrwCnYyglJz62viWLZk0WnynbZu2jycbX6x9o9/FAod6YCbctFEuUgjQ7slMxk4zyUq3yzQ5RrbapVm3apzpUV62WLQzsh3c6ipYERiPAvskgwIRsMqhyTRKYAQRcpMhNINyG8UQRHldvzihYQpDIyokGT8WS2uBHIIrTHE1+bwyLJVbwUkUbhOKwN06xvPoQOw5rbkgFp2M+ScjG+PtjQWbX1PcA8Vg505UUFZ+pkMWihmd7kxKFSG4dnAihZJeNP1RVVKsKBBZ+mM9WziptM1urwXFIYAd3sKxssMICCZDAVBMIpnpD7kcCJNBEBDzu6A1yRxXJAWTLqX1Atfd475D6hRD6Gv22ZExVk1/oH2nt1K+0X1VFVdPqoK1XUK03Lldv6Ga3qdfkZ7PHSrHYJwojvFXr+bXxYFUdPdZkx43nsYUESGBqCPBbcGo4cxcSaEICFRGtf7e3RCqRwwBIBl6q1Zu66nBrBzrpDxNVHRgtYklSWrGyD1SjODMg7dxMq0j04K89HRX7F4Oq8HsMeZ8i1zFlt1dVUdWkCe6KSVWTNovBlHTiw2usMA195xaIApzYS1VFVa0o9thSVZO6qiZt6YeqJu1pvZ4FHxzuIeBMp+oQJ/WoZPpYJAESmFoC6c/Qqd2Vu00zAW5PAiKB/VK/l+F36DpgVLVO6/iaVDd/jTHsOBhLkplhgh/Y1n4hy4Sm5K2DI5PqhD6Q4AysPqHpm5xkvptsYK272NuaKRIggVlEgAnZLLqYDIUEJkCg9l5fXcLjRwOkOracww7R0iTIFlCtzlOtWmszISkKAh9jcas1r8xr02ge4mwp+Wtho42ZSF8k4p3WP96zBM000rqqm/J6pJkiKtr010X4mnkE6PGYCfAbcMyoOJAEZiOB+jf+yYhUVSdj2eyaY9pgTIOyq86wsur4I1Qd/5wZhoXukkDTE2BC1vSXiA6SwBQSwKmYmEbc0n5kpBL7u2Iy0omNat2bvMc5TP1TuRH33HSHt1/0EjHHNj14YIRuhhc46RtYRSbdjsR3tI1VVVR1tCFJHx99Jhj4QQJNQWBcP8CawmM6QQIk0DwERsgWsrmOaiYxsOd8k/RnLwAlsxFqk/CeigSmV8QoqUM09f6F5aT5wLuB8EUC00mA34LTSX8m7E0fSWAEAmliYNbyslTZ4arIKtCgWrUoTsrb/pWlLWw+mJ2ozEvTSPPtZAx7jdTdwHZLx8a2nPk7UWV3CESV/y3LLBGWSWBqCQRTux13IwESaBYCUTjx3x+zJCyJI/PcL5sMWYJg/fYDxpTts/bJke1Uf2VLb0zW6weebE7EJ1vDZOuYIvuYBHnVBKElgIOsa/bJoK/pGVs1PcUctCo6tpkcRQKTQ6DVVx35J1irk2H8JDDLCbhYNRb75Sv7K2KhiK/+OFBVUcVTM+RrqjpIwRID7/EQDRJxSbvibh4IxqJmLagmv1OWtKOisRcrY5ZUMCcSj5GT806Sl9i8gEcZvwVx2a4eoXgJxKz5ESM+J14sLvPIrLO2Adkcq5sVrGfWZGVLyireSQ7/s7mN1Pz1Ijnsp6rYSuEx+MIn80+cT3iqDL08iiMJC8hIUq2uoqoYoiISKj74JgESmCYCwTTty21JgASmmUBQPSHDfd5u51VnUBlMUKzF6mZHUpIEpckCBlmiApO8rS8pDHwku6j6KDfQ0EBTyeeT5bNLWrIlSGcsAcu2j1RW1ZG6Nmof2MzHlrFt1DtSw9jbnQQ+5bepazD2VYePtHWNjVnsN7yTNRIggSknwIRsypFzQxJoHgIepzx+IKEyuzme2fxaZddTHXvCk5031jKSQZ+ONT/Scj2ruvm+KJJLmYTk0vzVgQAGjDWJlVMlDRP8GGkNfBm4CS7JaSRAAg0gwISsARC5RJUAP2cWAXtkiZvwmDITu4lPJLo684aeEU5kwRHm5CsVi8NUd4R16EC6ZtZ+8JmsnJ2AJCtbTcppW20sWM4HLmx4EhOBkB3sJZsPfGy0Ny5cbdvA0FHNaHOQBLqK4BnuqCuwkwRIYLII2M+kyVqb65IACTQxAXtkqbrpG/BoN/GRwrM5JutPrZUnWd4ewWX3qN07m4CpWpqWHV0tq+rA71TJoJURXthPR+iaEc0pH7MzPZYZAZxONorArFyHCdmsvKwMigQ2TUDtv2Up6lU3zinsBm0rH7vw5wAAEABJREFUpNbKjZDaY75GLFSzhv0OGQ6WcGglYv+AIOl2SRURJrXBD0WzabBhhAJ8HaFHkkTN/jmETNYLwWSXrvXF6qbsmPGW02ubWgQV8M9ejJcix5NA4wgwIWscS65EAjOKgNdIAxyT2Y09VaMCSNcbvNlnFkYyhJQo09Cgos8kMdl903L6S/LpdvAjLU7UTkociTMDH8ZxoIh8SQeVto3HphxsTrZs9UTOaWL5QQIkMC0EmJBNC3ZuSgLNQ8Bu+qZaj2pv2lY3ZcfZvFTZ9nplG4d29SoK29C3Vv+1Y/L7XLWJl21Ur83aN6UBn0ccpuGmH/mOOHmMHZvyYYzLDA6rvYaDHSyQAAlMKwEmZNOKv2U3Z+BNQsC5WJxzyb/gS11Kb9i1iYDVTem4bNnaauvWlirbpziVS9sbaRFLkui1tbWJ7RfH8eDyFpNJ7Rgto3SAjTel9XrW+k3WZ2uZnSw57+AqjvwGfLV9sxrLviP5aOuk861sSurBRNPWZDY/SIAENpMAE7LNBMjpJNCKBAZv4psIPh03LDnIJEqbmD6O7rIEGkggKt3r1ontG4bhOOaPPNR8N408ovl6NuWv8an1GqeMcYX/yrIWC+sznsDMCSCYOa7SUxIggUYScLHaKUxyqjSedevdzMcyf1NJwljWGGlMuSSSz+fFTsU6urqSU79cbuM/EpY80xxpkTrtm/LZANaZtllNvSpILVXHsogNqhWOO2Usbao2amgXOysdqrFEAiQw1QSCqd6Q+5EACTQHATw5tF9KR85hZsgn1eE36qEeEdWR+2QML9tMsfEYho5rSKGtIJVKRaIokvZCm8QDZR0e2rjW3ORglUn7S/2b3DszIFsE32w1KddrSzrwkeWjykeWQMI3CUwbASZk04aeG5PANBPA86lp9qBh27chCdPYSQdsX1+f2OlYEIz+481PILe05MbUMMfrLDTHN+4fCozV12Rc8lHHITaRAAlMCYHRf2JNiQvchARGI8C+qSBQey9W3ThbUd24bVO+qaqoajIs3cNOsZKGBn50d3dLvlDwqprsZ78/pqp1d/BoNtXtHGNjGssYh497mPc63qereFK5eceBzm/e/HEHyQkkQALDCDAhG4aDFRJoHQLlaqgj3oVVkblUxyRJzkBxswwSGa9h4+/8Wy5a5ONyxZXLZbFkzOxkJH7DgsdJliKgYW0NqCT/6ST140rIGuEGHl+O+LXQgLC4BAk0P4Fp9pAJ2TRfAG5PAtNKAEnFpvZXHUrMsmNxAxexg5xEuJfD2m8hqTg8cwvEDU5zElh+gQkxmuNGZA8y/PWuQ3fzQaXou+Z0JL9HZklZe6Eg6UFT1ZdA7Ace3MDkoXzH3DShccxvG48w/JgnjHNgIF7MT1OVqaAeQLAiVTtwzAc/ZKKvgSXAJRINnJ/oOpxHAiSw+QSCzV+CK5AACcxUAk5UvOLHQBAm1upZCW7VPrlrYwzKVh8UEjCRCK0xEgSHpMt6rCxYS6oJmUYiPsIuIqoqUS6Wysb/+FE297UFFtgi73y52C8VcahFA4LB28NL8y50KnlIMSZNegIfiKJNILVyRmmbWR+LWH+oOclBgnG2izT6tRALujihHnp4DYWR+S3wXSSHcuiChLdaDgU/zBeTxTmKJO0TDbEwroclypbx4Rq5uBTj1BS7YX++SYAEppxAMOU7ckMSIIGmIFAZ9MINlDa2SVYgOPHydp+u7R+YlhokBwGSA7u/i0fWBdnpTfJDBsmOYDGHlEa92GLprIbYeVgl3rBeCkgs29vbRcJAipWyVLc1DyD4ppAgOTNrvok6zByQlSE7VauVZT8awG3rlzj5n8cnJk/q2yX7iQCdJF6qSNKG9sGNUQ4EvbAKWyvMEGvLWo/sMol/cBFnY9xglQUSIIEpJ4CfUlO+JzckgckhwFXHRSAIYofUArdmfCK5sBt9PdUmJ4N17KZIcNSFon5ASTk3WA+QlAmeUwYObXEoAU52RHKY2fh3GObgmkq55MQhMYvDUDySL/EB/EEmg5QjxslWjBNBa/dmFWMHhMkyVjnwQlKjTmNbuOHBYFUfBSKJQidlqJIoErPl0EsUxoL9xR4Hq7jEWjkrxRUWXOGstbGpcNXAJsDcQNThcLHhkXBBEiCBsRIIxjqQ40iABGYfgQDHJHbwM5osavWCdAaqsQ6tJu8tLwmQ0ECWBEFJG5IhScqYCKs2bhKe820oiRQKHRog4YtLZQmCHDT04y10IibBC0V8BqLmEkq1bx1oAJqBkiBKGfayuejXnNN0+LD+zalURLxTXBlkSB4bxbg4yHPFLHLbxPrAiSXP6T4jhIIx1RFuwEuz8FtSiQQYYFKzFWAcaSn0800CJJASmAxr34mTsS7XJAESaHYCZUFSEuKeH8AGYnfvAAlNgCSq1iraTCFsiDFmFXd3S25wmmNTE1k5QhIRicf/RKxsbRgq3u75IpN2w7d/VZnHHp25HM7gvLgoRiLlcPrjJAdHTYFHXZyEsIkQSxJvGhfqAmcttrTdrKLflMSOMdYWgJxM4gtumCtDOyiCcC6JSeF/klQhH3QaYFxVdvqXlfMqHklXrRzmeFCS5GQzSK5/CGS7DO3GEgmQwBQTCKZ4P25HAiTQdATSHwMDFslH4uII1k6+LBlwGOTw6M4Uw5qs7C1xEJzgBJFIEIvVTZZEqMPssOIxtaHvjjbRisYaI1GxvwfrKmWkIUN7i8bi4EscmIcx0sKKiEvdsLirSn6V3uIeSVgVQcH3AIlRziGxMQyoN/itWBnuhdjFdgqxS4hEEEmTJNbKkO2KYeLhl1nzzau1BpJYPLo16y0BQ3tqBeNtVFWaJGRqgKoNIsICCZDAVBMIpnpD7kcCJNAcBApwA+mJRkhWkkQlcBLhzp+VQ1tWEeqprF3UIWWIcXuvCmmRDApJmiVCpgB7BBJJXiJfcM5Jg1/3dYtUOvNBny9K5JBs+Ug0ScBixBRLJYxgI6kgSXSBl1gh61dB2Q3KIb5aIc0TjEgUSyz2qNDkQx8HceNjyQuQighclGoCpjjhU8njqLEQh9IWqRQqEJ5f4nJhsBtZSFBV0F9jA/Giqom8CGoiMbLlqFpEC98kQAJTTSCY6g25Hwk0AwH6gDtvYHdkOwpywDE2eY/TJdzgZVA+SRwseVC0JcLNP0DZHgkGKJsNvZe8FyQVzn7NH/s19n3Db36jxRxSQYQU4IisI1+QIHJi/ljyhNwFCceQ17Z7gA/rFySVJqRoaHH1hTHZfkXAIdKYHEZPxht5oQa4NIrjLeSPUlUgAU7FFARDF6KsScIWwI9AYiTFHorRNmQV7Qr2qQ0QRyACLrEoro1kXt6rIh7NNLFIAiQwhQTse3MKt+NWJEACzUIg1xYgH4k0xE06hzu+WcXJkt3cc0ioTMkNHP12Qxf0ZVUdp0gABCc4IiGShdAJbvYDdSRgiqQocLEEsRekSOL7SxqUMVAa++oul6WioW/vnCOWM/qesszBjjn7HSkNkbKIeBUJkbLkoBCV0KlYohjGEZKbqkIXSQ4LmPJgYCqo+V5V3vpsDBTGsYRBrNLo11os6L3k7HEjrIevAp8FCZpXS5lyiCWPphBJFcbhkA4PT8WU+AS/EubgnkfSlVUObalCJGsxYs/lwSdwEnkcvWFrvkmABBpKYMyLBWMeyYEkQAKzikC5r1eQh+GmjrCQnNjvVClu+maRd4jDjd2sxw0/tYJxVjeL+7mIw9wkBQuq6wwkDsgWrEPCfE4K7Z0SRbGUyxWZP2de4GMcYyW9jftom7tYSpH3vT1FmdM+VzTyElrehxzDOTvbUvE4VfKxoA/Coz9BLBZ/CHcsbkQA7y3JMe+r1mEdHzuxWNV7Uayp3uarBM5r3n4xXhr/CrBZFJfFflfPhLwWD3xV8DBWytiuBCfsN/Hg2eAY59xg2eaYVBWjh79VVVQhxNHehpQzqkilVBRwCB8bPpQ1EiCBKSQQTOFe3IoESKCJCMzpXCBh2KaBtkngC0hGChJKm+SCdgkha1ecMplyGBNiTIh6DmPMWnuMhMTkMdMFOTF5PDJ0QYhyXnqKZSk7Lz60kx20+VyA5Ealwa/nn3nWz+ta7MN8h/T2l6WtbY7gEEtCzYlKPpGgHGpBVENRU9JeEPF5SWNLrcVmsliT2BFzTsHFOFgZCrQQtBU6Gx4LEi3EgXMtJFiqWD4ErBxywpyXKC9SCRUWGHO5hKsP2mQkOcRrfWZrpUFe4qiMa1+RtkIeiXMBm2Gv8b45ngRIoCEEgoaswkVIgARmHIF169YJ7uTqXCARkiYXBzhhwT3Z4+4v+NEA6/G4zONkKR6wHqdKVq9aFTuVcT7CPF8t45FY0uacxHFFcoWcVPBYLECSZoDK/cUg195hxYZqm4VbBZXefs0jEYzhjwtUUEl8Uh+L9x5yqFd9tboTLxXEHTnE7wUMhmzsRGK0Ow0kxmNPbxb1tD3hIXj6WixqQwPBYosWibhK2SHvErXs1cNTVxHvcDYG63wFPlVwYlaGVfFeEZck1spZ4TIkfVkbx36gzUm7Kh51xhJgXS2XQQEO8E0CJDAtBPBTd1r25aYkMFMIzFo/O9rbFIlSgMMikcCL/WmKVFbPKmm3MRkpyoVApRCI5NVLGxQGTuz30ZCGoQ03/HyApKIsuTCWNpzwdOS8+lKPNhrq86tWy9wQoWD/fHtO1pbW4RQpEgkj7F8R0bKoKYhFg0jiAMkMrCAGkzEwIfeSRGj3kPWZYiRG9o8DvDqxuo3FdoEPYpUGv6LnxJd7e31nLpQ2JIx5HPW1IalsQ6KZR+LUhoeWeV+SAsoh0rJAHE4C/TDlxOPsckghvKxV3uOa41FlAet34jqG3sX8O2TCFwlMG4Fg2nbmxiRAAtNKoG9dr+R8RTtw8tLpK9Luy9Iel6QtKkqh0p9Yq6dqcyVpR1+qNowtxEW0DcxJ+spSwGOwdpyO2Xpxz1opxGXJV0qSLxdlfg4nTt1rfaMD76j0uq6enijf1y1BqUc620RySMDMv86oJHMgi8PKbfDFYskjnhz8z8rG510RPldlfQXElce4pA+JkMWVJEWCU6ru7kaHIpUtxM9r73RtXqUtjqUTx3IdUUXaK2XpBNuOShG2JBZPB65B24DMz5HUjhgs5lRJLIizHUleAaealpwVRJGaIZNreERckARIYCwEAhnLKI4hARKYNAJ4fBY++OCDbakeffTR9onoiSee6MhqpDUe9L7tlkd9e7lvQ1tb79p4bt8LsqC0XhZVumVBZYPML69P6vOL62Re/9pEaXluaZ2Y5sN2ob+z2CPtxT7p6Ift703KneVe6az0yRwkYAtwsmTqtAQPYzr7e7UrKrff8uhQjGncY7XZuJI5iOfjbzwsmPfs88Wty5EsROIyD8lliGRwXqlPFsK/hdh7UV+PzIe/8+Hf3GKvzCt1y9wi4kMs8zKamylbu9Xng0vKxupdmNfWv0GjYm/7FeC+kRjkf90AABAASURBVE/juJ5JDIPjfdvD9zxZkErF973wnLQhEWsDx06cZJnmlPrFbFexKF3FfunAdesorxVTZ2UduFc1J1qPJHR90t5h7VYvr5M5A+osrZV2xF9Aghn390q5d4OlY+6xR9a2V2PxA/bR9qx/1b6ha9eouvd2Ljlp32JcmARmBIFgRnhJJ0lgFhP41Oe++OrD3vHOz7z5rX/zv295xzs/f/Ahh37+jYe+7fOHvu0dX4BNddQb3nzYF6EvQV886E2HffHgQ97yhQPfeOjnDzzkkKMOeNObvvT6g9705YMOOCTRAQe8AWPe/MXXHXzI5/d/01s/d8Bhb//sm97xt58+9G1/+6nD9n7Nf73rA2/9r3tu/NF7nv/1DeUNv/6Z7/3dzdL3+5ul/9afJ7YP9f5bb5be394kvb+7UXp+c2NiB+vW/ltru0V6fv8L2QD1/B5zk3m/lOIffi3F22Bv/ZVs+NVN0o966c7fyVO/+HH+nhuve8/H3nf4p97xt2/7nze/7W8/fdjfvuczh7313Z9509ve+ek3Hfa3nzG9+bC/++yb3/53nzvsre/63ze/9e8+h/r/vumwv/nfNx/2N597A2J582Hghbnv+Ie//9Qhr3jVf3/lyE8cvvKm6/IbfnuTL/7h57L25z8V86HvN7dIL9T/W/PNdDNiuUX6fod2yOLtRZx9v0fbH25J4i/eWrV94GFcrL8f/Wb7YDf89gZZB2bP/PaG4E8/vuY9//NPR3zmTX/zrs+9/e1v/9ybDnvr5976rvd8FtfiM/D/s29+69v/9424Roe88W1fMCXXDNf3wERv+d/93/z2z73h7X/32UPf+c5Pv+Mf3vepd3/wgP885shPfPzBn12/h97zJ9cNpr2/+8UA31/I+t/9XHpQTwT/ehBDqm74ZmWz3b+9WTbgWvTafFzTXqjvD7+QrHoQ59pf3yT9f/yd9N/5O3/n/13+yo9/5PBPvfntf/OZw/5mv8+95d3v//xBb/27zx70jnd/5oDD3gG9/XOvOwQ+H/qWzx986KH42jvk88nXH+Izi6/bL9TqjYe+5aiMvoD48fWN+VjnjaY3HvL5Qw459AsvfvGLX4ukLJjF3+YMjQQ2SYDfAJtExAEkMLkEfnTNNQeEXo6W2J3gKtHxEstx6vxx5f7ysagfk8pH/mjoyyb0fxnjj4E91sdytDj9EupHRXGUKHb+ixhnbV+OS8WjKz29R/eu3XB097r1R69/evUx/Q/dc1T0h1s+9uwl53etW/7d4nPLvldee+l5bt2lF8j6yy+QtZdfKOuvvEi6r14GLZWe7y+HlkFVuyFpR/2qC6QH6r36Qum7eqn0X71c+jC3+4rzZMNl50rPpRf67ksuKD930deLT120pO/xS76TW/fbmz+07qlVX37u2fVf7u/uOabY031cudR7PPz8isSVr3gXfUV8ZCxO8K5yvIuj1B4XRxVwKR7b37/h2F7MfX7N88esf2rV0c/ddeunHv3JFTs+cvGSvqcvPLvYe9kFUT/27rlyqWy4aqmsv/qiAS2V7h8sRRxLE397r1omvei3cd1XXCTdV1wMVW3PVReLtZs1Hs9dcq57Zul3is8t/Xbv8xef0/vkivPa1/725/+49v67v9D93PNHrV3X86VSf/Ho/g09xxfyhRPicuUEH/njnZdjYxclwjU6VnB9IVh3rJRLx7pS8bjShv7jup9fd9xzq1Yd2/Pog1/uvvHqA58+97TiC+D2wopzKusvP9dvAGdjnarXfAfz3lSIIynX2O4kLovpooFYL5YNuEbrL73AdV/6vdK6i7/Zt+6Cs/vWX3vFvs/ce/d/Pf/M859//pmnj3phzZovRr19x/r+/uM1qpwQxPHx0HFBxR3rIn9M4PU4fP0NCrEem6oan+Dr1x3jKoM6FvEfNyBcV3e8Snici+WY3u7+199xxx2h8EUCLUwgaOHYGToJNJjAxJYLxOvAS2AHFQSBQPaL9yYrp7J6olwup4Uwr/kgp2EYapiHNYVhEIZhMKejIwfluzo7C3PnzGnv6urqXDi3q2u7uR3ztu/Iz9/aFXPblfv8DqUNul3fBt22b61s27teti+uF9Rlu/51MqK1Pmh7PPJMxifldbJ9n+mFxG7T/bxs17vWb1vcUNmm0hNt5/vCLTWaM6+to7Ozc25noVBoa8snrxxsiHiCQi6X+J4PQ+BQzQVBEpu1Y2TYXijk2gpt+Y62trb5XfM6F3Z2dW3REczbNlfp2F76/Q6Vbrdj33rZvgeCLxbDNvBtW8RksnpW2/dtEKvX2u0G2o3HABfdqm+tW9y7vryoby20Ptgu7+csKoSdYAx32tsK+bY8/AxN8D8IQ1wTKMiFYkJd8mFoUtigLZ8P23OFHGIqQO3thXzXglDn7ijlOTu5vtz2eCy8Q/9a3R6+m4/b9b8AX03rYCHzcUCJ/yjXs9Zm2s6u7cCYHfrXy5brnom32PBMZXHfC5UtfSm3oJCfNw9fJAvmzetYMLerUMgFubYwyLXn8mFbmAsKQZhcj5yG+PpDTEHyNSr4Op2QRFQkkXjhiwRanEDQ4vEzfBKYdgJO1cGJTd6QVFVUhwvz6r5Vq+PiOJZUzjnBY6FkPG6gQRiGeeQ0c5DkdKBuf+tCrT+VqiZjN/WhOjTO5tp4syasa8kU8pMc7u6FudirDcLWdkMffjNX1SQ+m19PqtV+VR1288diksvlQqgNmoO6xRNq9ZWsiaJM5AX/k72wrhQKBe3Aa86cOQuQsyycO3fuHLTbvhajYN9krM0Z6342zsansjUgWw8mzKO9DQrhe3JtYAevYVo2ziPJxphq+60NeweIpQOaB8230BBjDhurfa1EUTQYj43PKl0PawzynUh5YE2FNcHwTQKtS2BcCVnrYmLkJDCJBGJJboDpTa6etd3rtW+qzealN8rasWi3Gz9OOgIrbnRDtPE2fzRh4kbdNi8Vkgm7qQ/bx/rshm+JopVrZX2psotnx6X9ljSk62As3Km+rQzVfWPEYBJRb0B2H1vbZPtZO8YnvCxpMaEtSZRgk0Qpten4tD6atbGpasYle8HfwWtj/fBhQm+bm8oWwLrGIdkD1ym5RojJ2hLZmOz4tGy+puXNtbYHRQIkUCXAhKzKgZ8kMC0EcENTCbzdcE0y0gvjht3w03EDN1VLegaVtpm1GyxutnX7rD9dJ7XZNtszbZ+orUlmBm/0tp7tlZW1mbJttWXrzyobm5VtvPWb7yYrj0cjzbH2NBGxmCwRNI20tvkxEdWuZ2vUtqV18yktj2TTMVmblm2OxZRV2mf7jqSUs/XbGqnSuVZPy2ZTWfuI8kHt1/+IQ9lBArOVABOy2XplGdeMIYAjlo0er9nNzpQGYeWs0vZ6NjvOkge74aY3RbO1dWszpWvZfCtn26xeTzZmNNkcWy+VjbU2k7VZPZW1ZVXbb+Oy/Vau12bzUtmYWtmcVNk+a8vWrWzJh8nWM2uyJBePKpNHlNaelc0Zj2zuWMdn/bPyeDTSHhaLxWR+2Hr2tWGyrxtTdp6NSetWNqV1s2ndrClts7LJ6qmsbkrreF7PhCyFQduyBJiQteylZ+DTSmAzN7ebmcluoqPJxqSyG29WdjPOzq11yebVto21bnNN6X5WTufanml5JGtjLDEwm1XteBtjsuTBrI21Mbaf7W31VNY+Htk8OwUz2fqmdA/rqydbP9tu9dE0nvVGW2ekPvMl22f1VNZusZlSP1Ju9rVhSWc6NrU2Jy2btfHWNh6NMIcJ2XggcuysJMCEbFZeVgY1kwgkv9HvvaQ3RbvRZWWxjFS3m9toqremtaVK56Z7mB2PUr+yc2zNtJ7ukx1n/ZYs2U3fylml89I2G5dV2p9aW8P6bby12T62Z2qtLZW1mdL6aDYdZ0lJukftPjYmq3Q988Vk49O2iVpbf6S5o/XVzjF/rC21Vrb5FpvJfLU+azN+lnxaombtJusz2bzUWtnGm83K2kzWZjaV1U1p3azVB4RDsoESDQm0KIHJSshaFCfDJoHxE3ARsjEZ+mf/dgO0m6LZ7M0vXbnmRpY217XZNWyeKR1o5VQjtaX9tTYdb/6Z0rrZ7NjaPus32RiL0comq5usnJW1jSZbw5SdY+V0jpVrlfbVWhuXtlnZZGub0naz1l5P1peVzas3rlFtxja7X72y7WXt5otZk7WlStutbuuZ0rJ97Vi/yeaZrG8syq5jZdNI82xdb5uMNIDtJNAiBJiQtciFZpjNSQA3KjsZMA37hffRvMWc0brZN4UE7FqMpil0ZZNbWeKzyUENHmB7pmrw0pnlWCSB2UGACdnsuI6MYoYTsJv6dIZQ76ZpbdPpUyP2thhGU3YPG5etW3msbTaWGp2AsTTVH+WS/1NSv4+tJNAaBJiQtcZ1ZpRNTEB16GaUTczSm9dortuY0bSpubX9tlZtW726jcuq3pixttk6Yxk71nHpWmMZb2NSpfPM1muz9vGqUeuMd9+Rxps/I/VNVbv5kFV1X/7ZiyoHfrYyASZkrXz1GXtTEcgmY6lj9drSvonYjW+Ekvx9s7Gulc6vHb+p9rS/1tauU1vPjq/tS+v1GNm8tH+s1uakGuucsY6brHVH2n+0/UbrG2k9tpMACUw+gSZIyCY/SO5AAk1OYPBxjSUXpqy/Vjdl2yZSthtx7byxttXOa1S9dn+rmzZn/fHMt7GpxrOnzRnP+KkcO1bfxjqu0b7b13KqRq/N9UhgJhNgQjaTrx59nxUEnKjHDWowKZuMoGpvvlY3jWevsYwfy5iR9tycuSOtOdnt5vNoqt3fxta2NbI+2etvjq/4Gq/7D1eqPg89tt+cPTY5lwNIoIkJMCFr4otD11qDQCB+TH8U025ojSBSvQFu/kq2jmnzV9p4hUasa2uMVRt70JgW278xK83MVexrNlX9COz/h5jq97KVBFqJABOyVrrajLVZCWgcR+I9zsqQmkVRBScJ5qrdqIZL0S+SbbNxg8IafpiGeoZKqor1qxpqrV+yPw+VyvuN11bVjSZmx23UWdMw2ths30hl1er+2X7bQlXF/o6W1Lyy46ycdlt5vDIu6fzUquogW9VqOe1L7Xj2Ud14jez8dM3UqlbHq1Zt2j6Sza6VlrNjVTdex8Zlx9Qr25h6Gj7Wi/ORhyTXlh/exRoJtCABJmQteNEZcvMQ8N5rsVgK2tvbFRK7ydtfhzfVSyjqeY41BpMw68/W07K1m9L6SNbGmNJ+1eoNWbW+tbGjKV1nJDvaXOszBqPJeJlq17c2k60xmbI9TOn+Vjal9c3dO7tOtmzrpvXNsbbOaErXtjHZclo3O5rSOWZtnNlUqPtCoSD5fCilUh+qfJNAaxOYWQlZa18rRj87CajmwnypVAorlQpuTKUkynK5LP39/UmCZjf4kRUjGXOblHMx1orHPS6dN13WTg5H01j9StfIjre2bL1e2caMpnpzsm2jzbW+7NhNlT1OUFPZ2LS8OdbCSSrhAAAMNElEQVTWGU3p2jYmLWettY+m7NjaMr6mFV/nJnxtOk2+8PlBAi1MgAlZC198ht4UBHxHIf9wsdh/bblS+QEOon4Qx+7/nPPXeO+viSrRNXEU/dBk5SiuXDeoSnRtFMdVJeVqXxzF10KYF19TiaJEGHcNVB07tMaPsFYqrBsn/S6Or4uj6EemgX70VdceqNuc6+BPZnx8fRxVZfMze/0oQnsi27cSJTFV51auQxI6oOjaSqV8TVVWzsrarV4zPqr8EHslwvrXRlF0XVXxYPzpPtV2648xzhRdF8fx9eDzY/RdD8HPaGB+ZGXTdejHePhc5Xgt6tZmStrjOLrGhPnJ3NhF14HDtcm+FVyfKFnL1jdhTdvbFNn4H8F/03XghXXiH5pF23WQtf8ojp3tadcQMUVYO/pRjDXRn8zBPriuybWxta9Pro/tW4muqfbF19pYU1T9WsH42DTYnulL2mJcLxPaba9qrJiLeuIX9rgOa8OfGAxM0XWIH/tHJpStrSrw+FEqmwOlfsGH8jU4Hbu2WCxeh9PhR1/1qle5pviOHHCChgSmmgATsqkmzv1IIENAVf1Xv/qV688849R/P/us04449ZSTjjzt1BOPPHvJaUececbXjzz99K8e+dWvnZnIykvOPP2IU08+60jTkiWnHXn6qScdYbKy9Zkw7ggomYs+G5PqiCVnnnqkjbH50BFnnHaKrYX206vroP/MM0894uSTz0h06slnDe6HcjIWNmmr7nnqkRhrex1x1lmnJtbq1X1OxfiTjjjj9K8mOvXkk6wf4880/5I9Tzv1JMR7ksV75BmnnzKgrx6B+JM2s9V2azv9iHS8rXnKV8860nz96lfPTMZm+04HN5P5eCp4nXbqWRhz+uC6Vj/zjFOO+NqS08H5FKx7lgm+nGWysunIszAG4440WfnrZ59xhMnKp56y5IhTTl6C2E5J1rb9T0WMtif2PsIs9knWx3xbb3D/s7Gv9YHVERbDySedccRXTzojuU5oO/K0074KTmccceYZJydtuI5HJOMGrouV0ZbwtOtp19GYINaE7cknJ4xxravXx8bbNUnmgLmVTz75DNvjyLQvbTPf7VoO+JCskfZhzuC1t3G2ZxoLYjR2YHEaruNXk1jBA+NPSmQ8MCfxuerHKUd++tOfPvKjH/3okZ/85CdvxPdCnPnWYJEEWo4AE7KWu+QMuNkIHH744T3/+I//+DTss//yL//yzEB5zYc//N7VH/7wh1d/7PDD15is/KEPfWjVRz5y+FMmK1ubycqprD6S0jEf+Uh1jX/+539+MrtWbb/1jaTsWFsH9SfM2niUV5k+8pGPPGVtJiubXx/72OGI7cOr035rt7L1pbJ6qmybjTVZm61jrMzaWGs3WV+qans1ViunMh/NJ9QHfba2WqXrpBbjk7isbvuarGzttrfJykNth2fiP/wp60uV7mV1W8dk86zdfDNrfdZmsrK1maxsbSYr23iT9Vlbupb1WZtZk/WZrGztJiunsrqtg/ogF5STmK0vlbXZOiYrW7vNM2v1ofaP4Gu1qrTd+lL953/+56olS5Y8ddxxx/U02/cl/SGBqSbAhGyqiXM/EiABEiABEiABEqghMGsTspo4WSUBEiABEiABEiCBpiXAhKxpLw0dIwESIAESmAEE6CIJNIQAE7KGYOQiJEACJEACJEACJDBxAkzIJs6OM0mgNQgwShIgARIggUknwIRs0hFzAxIgARIgARIgARIYnQATMpHRCbGXBEiABEiABEiABCaZABOySQbM5UmABEiABEigSoCfJDAyASZkI7NhDwmQAAmQAAmQAAlMCQEmZFOCmZuQQGsQYJQkQAIkQAITI8CEbGLcOIsESIAESIAESIAEGkaACdm4UHIwCZAACZAACZAACTSeABOyxjPliiRAAiRAAiSweQQ4u+UIMCFruUvOgEmABEiABEiABJqNABOyZrsi9IcEWoMAoyQBEiABEsgQYEKWgcEiCZAACZAACZAACUwHASZkk0Wd65IACZAACZAACZDAGAkwIRsjKA4jARIgARIggWYkQJ9mBwEmZLPjOjIKEiABEiABEiCBGUyACdkMvnh0nQRagwCjJAESIIHZT4AJ2ey/xoyQBEiABEiABEigyQkwIWuCC0QXSIAESIAESIAEWpsAE7LWvv6MngRIgARIoHUIMNImJsCErIkvDl0jARIgARIgARJoDQJMyFrjOjNKEmgNAoySBEiABGYoASZkM/TC0W0SIAESIAESIIHZQ4AJ2cy6lvSWBEiABEiABEhgFhJgQjYLLypDIgESIAESIIHNI8DZU02ACdlUE+d+JEACJEACJEACJFBDgAlZDRBWSYAEWoMAoyQBEiCBZiLAhKyZrgZ9IQESIAESIAESaEkCTMhm7WVnYCRAAiRAAiRAAjOFABOymXKl6CcJkAAJkAAJNCMB+tQQAkzIGoKRi5AACZAACZAACZDAxAkwIZs4O84kARJoDQKMkgRIgAQmnQATsklHzA1IgARIgARIgARIYHQCTMhG59MavYySBEiABEiABEhgWgkwIZtW/NycBEiABEiABFqHACMdmQATspHZsIcESIAESIAESIAEpoQAE7IpwcxNSIAEWoMAoyQBEiCBiRFgQjYxbpxFAiRAAiRAAiRAAg0jwISsYShbYyFGSQIkQAIkQAIk0HgCTMgaz5QrkgAJkAAJkAAJbB6BlpvNhKzlLjkDJgESIAESIAESaDYCTMia7YrQHxIggdYgwChJgARIIEOACVkGBoskQAIkQAIkQAIkMB0EmJBNB/XW2JNRkgAJkAAJkAAJjJEAE7IxguIwEiABEiABEiCBZiQwO3xiQjY7riOjIAESIAESIAESmMEEmJDN4ItH10mABFqDAKMkARKY/QSYkM3+a8wISYAESIAESIAEmpwAE7Imv0Ct4R6jJAESIAESIIHWJsCErLWvP6MnARIgARIggdYh0MSRMiFr4otD10iABEiABEiABFqDABOy1rjOjJIESKA1CDBKEiCBGUqACdkMvXB0mwRIgARIgARIYPYQYEI2e65la0TCKEmABEiABEhgFhJgQjYLLypDIgESIAESIAES2DwCUz2bCdlUE+d+JEACJEACJEACJFBDgAlZDRBWSYAESKA1CDBKEiCBZiLAhKyZrgZ9IQESIAESIAESaEkCTMha8rK3RtCMkgRIgARIgARmCgEmZDPlStFPEiABEiABEiCBZiTQEJ+YkDUEIxchARIgARIgARIggYkTYEI2cXacSQIkQAKtQYBRkgAJTDoBJmSTjpgbkAAJkAAJkAAJkMDoBJiQjc6Hva1BgFGSAAmQAAmQwLQSYEI2rfi5OQmQAAmQAAmQQOsQGDlSJmQjs2EPCZAACZAACZAACUwJASZkU4KZm5AACZBAaxBglCRAAhMjwIRsYtw4iwRIgARIgARIgAQaRoAJWcNQcqHWIMAoSYAESIAESKDxBJiQNZ4pVyQBEiABEiABEiCBcRHYKCEb12wOJgESIAESIAESIAES2GwCTMg2GyEXIAESIAESmAABTiEBEsgQYEKWgcEiCZAACZAACZAACUwHASZk00Gde7YGAUZJAiRAAiRAAmMkwIRsjKA4jARIgARIgARIgAQmi8DmJGST5RPXJQESIAESIAESIIGWIsCErKUuN4MlARIggZlIgD6TwOwnwIRs9l9jRkgCJEACJEACJNDkBJiQNfkFonutQYBRkgAJkAAJtDYBJmStff0ZPQmQAAmQAAmQQBMQmKKErAkipQskQAIkQAIkQAIk0KQEmJA16YWhWyRAAiRAAhMgwCkkMEMJMCGboReObpMACZAACZAACcweAkzIZs+1ZCStQYBRkgAJkAAJzEICTMhm4UVlSCRAAiRAAiRAAjOLQPMlZDOLH70lARIgARIgARIggc0mwIRssxFyARIgARIggZlIgD6TQDMRYELWTFeDvpAACZAACZAACbQkASZkLXnZGXRrEGCUJEACJEACM4UAE7KZcqXoJwmQAAmQAAmQwKwlMKMTsll7VRgYCZAACZAACZBASxFgQtZSl5vBkgAJkAAJTIAAp5DApBNgQjbpiLkBCZAACZAACZAACYxOgAnZ6HzYSwKtQYBRkgAJkAAJTCsBJmTTip+bkwAJkAAJkAAJkIDI/w8AAP//sKA1RgAAAAZJREFUAwBpBB1ZGp7+dwAAAABJRU5ErkJggg=="
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="
              relative 
              w-[350px] 
              h-[250px] 
              flex flex-col 
              rounded-[2rem] 
              /* IMPORTANT: Changed from overflow-hidden to visible */
              overflow-visible 
              shadow-2xl border border-white/10
          "
        >
          {/* Warning Icon - Positioned outside using negative values */}
          <div className="absolute -top-5 -right-5 z-[60]">
          <Exclamation className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl"/>
          </div>

          {/* Top Yellow Section */}
          <div 
            className="flex-[80] flex flex-col items-center justify-center text-center gap-2 px-6 relative rounded-t-[2rem]"
            style={{ background: "linear-gradient(135deg, #F8DA16 0%, #F6EC24 100%)" }}
          >
            {/* Larger Image Row */}
            <div className="flex items-center justify-center gap-4 mt-2">
  <div className="w-28 h-28 ml-4 drop-shadow-lg opacity-95 flex items-center justify-center">
  <Underdev className="w-28 h-28" width={112} height={112}/>  
  </div>
  <div className="w-10 h-10 drop-shadow-lg flex items-center justify-center">
  <Arrow className="w-[72px] h-[72px]" width={80} height={80}/>  
  </div>
  <img
    src={buildImgData}
    alt="Build"
    className="w-[140px] h-[140px] object-contain"
  />
</div>

            <div className="mb-1">
              <h2 className="text-black font-bold text-lg leading-none">
                Building this feature!
              </h2>
              <p className="text-black font-semibold text-xs mt-1">
                Stay tuned :)
              </p>
            </div>
          </div>

          {/* Bottom Dark Section */}
          <div className="flex-[20] bg-[#252525] flex items-center justify-center rounded-b-[2rem]">
            <button 
              onClick={onNo} 
              className="bg-[#FF0000] text-white px-6 py-1.5 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-xl"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export const CopyToast = ({ show }: { show: boolean }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-70 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 140,
            }}
            className="flex justify-center"
            style={{
              marginTop: "clamp(75px, 14vh, 180px)",
            }}
          >
            <div
              className="
                flex items-center justify-center
                rounded-lg
                shadow-[0_4px_10px_rgba(0,0,0,0.25)]
                px-[clamp(16px,2vw,28px)]
              "
              style={{
                minWidth: "clamp(200px, 22vw, 280px)",
                height: "clamp(56px, 7vw, 80px)",
                background: "white",
              }}
            >
              <p
                className="text-black font-extrabold tracking-wide text-center"
                style={{
                  fontSize: "clamp(14px, 1.5vw, 20px)",
                }}
              >
                COPIED TO CLIPBOARD
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


interface ToastProps {
  show: boolean;
  message: string;
}

export const DeletionToast = ({ show, message }: ToastProps) => {
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="border border-white text-white text-bold px-6 py-3 rounded-md shadow-md"
           style={{
            background: `linear-gradient(
              to bottom right,
              #FF2C11 0%,
              #FF4A32 100%
            )`,}}
          >
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};


interface VariablePopupProps {
  open: boolean;
  name: string;
  setName: (val: string) => void;
  onConfirm: (name: string) => void;
  onClose: () => void;
}

export const VariablePopup = ({
  open,
  name,
  setName,
  onConfirm,
  onClose,
}: VariablePopupProps) => {
  if (!open) return null;

  return (
    <div className="absolute z-50 top-24 left-1/2 -translate-x-1/2 w-[360px] shadow-lg rounded-md border border-black bg-white p-4">
      
      {/* Title */}
      <div className="text-black font-semibold text-sm mb-3">
        Enter Variable Name
      </div>

      {/* Input */}
      <div className="w-full bg-white border border-black rounded px-3 py-2">
        <input
          autoFocus
          className="w-full outline-none text-black text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Variable name"
        />
      </div>

      {/* Buttons BELOW input */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => name.trim() && onConfirm(name)}
          className="bg-[#2EED08] rounded-md p-2"
        >
          <FiCheck className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={onClose}
          className="bg-[#FF4945] rounded-md p-2"
        >
          <FiX className="w-6 h-6 text-white" />
        </button>
      </div>

    </div>
  );
};

export const Deletepythonfile = ({
  open,
  title,
  message,
  onYes,
  onNo,
  variant,
}: ConfirmUnsavedChangesModalProps) => {
  const modalImage = variant === "exit" ? ExitImage : Files; 
  const themeMode = useSelector((state: any) => state.theme.mode)
  const bgColor = themeMode === 'dark' ? 'bg-[#000000]' : 'bg-[#F0F0F0]'
  const textColor = themeMode === 'dark' ? 'text-white' : 'text-black'
  return createPortal (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 px-4 
          backdrop-blur-sm">          
          <motion.div
            /* ANIMATION: Drop from top (-100px) to center (0) */
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            
            className="
              relative 
              w-[90%] md:w-[50%] lg:w-[40%] 
              min-w-[380px] max-w-[700px]
              aspect-[600/500]
              min-h-[400px] max-h-[85vh] 
              flex flex-col 
              rounded-lg
              overflow-visible 
              shadow-2xl border border-white/10
            "
          >
<div className="absolute -top-6 -right-6 z-[100000]">
<Exclamation className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl"/>
            </div>

            <div className="flex flex-col w-full h-full rounded-lg overflow-hidden">
              
          {/* Changed justify-start to justify-center and added pt-8 */}
<div className={`flex-[72] flex flex-col items-center justify-center text-center gap-1 px-10 relative ${bgColor}`}>


<img
  src={Delete}
  alt="Unsaved"
  className={`
    drop-shadow-lg  object-contain
    ${
      variant === "exit"
        ? "w-48 h-48 lg:w-52 lg:h-52"
        : "w-36 h-36 lg:w-40 lg:h-40 mb-5 mt-4"
    }
  `}
/>



  <h2 className={`${textColor} font-bold text-2xl lg:text-[2.2vw] xl:text-4xl leading-tight`}>
  {title}
  </h2>

  <p className={`${textColor} font-semibold text-sm md:text-base lg:text-[1.1vw] xl:text-xl leading-relaxed max-w-[90%]`}>
  {message}
  </p>
</div>

              <div className={`
                flex-[28] ${bgColor}  flex items-center justify-center gap-6 lg:gap-10
              `}>
                <button 
                  onClick={onYes} 
                  className="bg-[#2EED08] text-white px-10 py-2.5 lg:py-3.5 rounded-2xl font-bold text-base lg:text-xl hover:brightness-110 active:scale-95 transition-all shadow-xl"
                >
                  Yes
                </button>
                <button 
                  onClick={onNo} 
                  className="bg-[#FF0000] text-white px-10 py-2.5 lg:py-3.5 rounded-2xl font-bold text-base lg:text-xl hover:brightness-110 active:scale-95 transition-all shadow-xl"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};



interface FlashSuccessPopupProps {
  open: boolean;
  onOk: () => void;
}

export const FlashSuccessPopup = ({ open, onOk }: FlashSuccessPopupProps) => {
  const themeMode = useSelector((state: any) => state.theme.mode);

  const bgColor = themeMode === 'dark' ? 'bg-[000000]' : 'bg-[#F0F0F0]';
  const textcolor = themeMode === 'dark' ? 'text-white' : 'text-black';
  const ArrowBg = themeMode === 'dark' ? Arrow : LArrow
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={`relative w-[70%] md:w-[40%] lg:w-[30%] min-w-[350px] max-w-[500px] ${bgColor} rounded-lg shadow-2xl overflow-visible border border-white/10`}
          >
            {/* Right corner image */}
            <div className="absolute -top-6 -right-6 z-[60] transform translate-x-1/4 -translate-y-1/4">
            <Exclamation className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl"/>
            </div>

            <div className="flex flex-col items-center justify-center p-8 gap-4">
              {/* Three images in a row */}
              <div className="flex justify-center gap-6">
                <img src={Python} alt="Python" className="w-20 h-22 object-contain" />
                <img src={ArrowBg} alt="arrow" className="w-17 h-17 object-contain" />
                <img src={Blocks} alt="blocks" className="w-20 h-22 object-contain" />
              </div>

              <h2 className={`${textcolor} font-bold text-2xl lg:text-[2vw] xl:text-4xl`}>
                Flash Successful
              </h2>

              <button
                onClick={onOk}
                className="bg-[#2EED08] text-white px-10 py-2.5 rounded-2xl font-bold text-base lg:text-xl hover:brightness-110 active:scale-95 transition-all shadow-xl"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface PressResetPopupProps {
  open: boolean;
  onOk: () => void;
}
interface BootResetProps{
  open: boolean;
  onOk: () => void;
  onClose: () => void;
}
export const PressResetPopup = ({ open, onOk }: PressResetPopupProps) => {
  const themeMode = useSelector((state: any) => state.theme.mode);

  const bgColor = themeMode === 'dark' ? 'bg-[#000000]' : 'bg-[#F0F0F0]';
  const textColor = themeMode === 'dark' ? 'text-white' : 'text-black';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="
              relative
              w-[60%] md:w-[40%] lg:w-[30%]
              min-w-[280px] max-w-[600px]
              rounded-lg
              overflow-visible
              shadow-2xl border border-white/10
            "
          >
            {/* Exclamation top right corner */}
            <div className="absolute -top-6 -right-6 z-[60] transform translate-x-1/4 -translate-y-1/4">
            <Exclamation className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl"/>

            </div>

            <div className={`flex flex-col w-full rounded-lg overflow-hidden ${bgColor} py-4`}>
              {/* GIF */}
<div className="flex items-center justify-center px-6 pt-0 h-[180px] overflow-hidden">
  <img
    src={Resetgif}
    alt="Reset"
    className="w-60 lg:w-70 object-contain drop-shadow-lg"
  />
</div>

              {/* Press RESET label */}
              <div className="flex justify-center -mt-8 relative z-10">
  <div className=" px-4 py-1 rounded-md">
    <span className="text-black font-bold text-md">Press RESET</span>
  </div>
</div>

              {/* Description */}
              <p className={`${textColor} text-sm text-center px-8 mt-2`}>
                Press the "RESET" button in your board to continue
              </p>

              {/* OK button */}
              <div className="flex items-center justify-center mt-4 mb-2">
  <button
    onClick={onOk}
    className="bg-[#FFDE21] text-black px-6 py-1.5 rounded-xl font-semibold text-sm hover:brightness-105 active:scale-95 transition-all shadow-lg"
  >
    OK
  </button>
</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const PressBootResetPopup = ({ open, onOk,onClose }: BootResetProps) => {
  const themeMode = useSelector((state: any) => state.theme.mode);

  const bgColor = themeMode === 'dark' ? 'bg-[#000000]' : 'bg-[#F0F0F0]';
  const textColor = themeMode === 'dark' ? 'text-white' : 'text-black';
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0  z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="
              relative
              w-[60%] md:w-[40%] lg:w-[30%]
              min-w-[280px] max-w-[600px]
              rounded-lg
              overflow-visible
              shadow-2xl border border-white/10
            "
          >
            {/* Exclamation top right corner */}
            <div className="absolute -top-6 -right-6 z-[60] transform translate-x-1/4 -translate-y-1/4"
                onClick={(e) => e.stopPropagation()}
            >
                           <Exclamation className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl"/>

            </div>

            <div className={`flex flex-col w-full rounded-lg overflow-hidden ${bgColor} py-4`}>
              {/* GIF */}
<div className="flex items-center justify-center px-6 pt-0 h-[180px] overflow-hidden">
  <img
    src={BR}
    alt="Reset"
    className="w-60 lg:w-70 object-contain drop-shadow-lg"
  />
</div>

    
              {/* Description */}
              <p className={`${textColor} text-sm text-center px-8 mt-2`}>
              Please <b>long press the Boot button</b>, <b>press the Reset button</b>, and then click <b>OK</b>
              </p>

              {/* OK button */}
              <div className="flex items-center justify-center mt-4 mb-2">
  <button
    onClick={onOk}
    className="bg-[#FFDE21] text-black px-6 py-1.5 rounded-xl font-semibold text-sm hover:brightness-105 active:scale-95 transition-all shadow-lg"
  >
    OK
  </button>
</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};