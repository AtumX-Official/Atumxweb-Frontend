import {
  FiMinus,
  FiSquare,
  FiX
} from "react-icons/fi";
import { showConfirmModal } from "../screens/CommonHelper/Popupfuntionalities";
const handleHeaderClose = async () => {
  const finalExit = await showConfirmModal({
    title: "Where are you going?",
    message: "Are you trying to exit and close the app?",
    variant: "exit"
  });
  if (finalExit.yes) {
    //localStorage.clear()
    window.api.window.close(); // close entire app
  }
};

const Header = () => {
  return (
    // 1. Hover Group Container (This is the interactive area)
    <div
      className="
       absolute fixed top-0 left-0
        w-full h-6
        z-50
        group
      "
      style={{ WebkitAppRegion: "no-drag" } as any}
    >
      <div
        className="
          w-full h-full
          flex justify-between items-center 
          px-3
          transition-opacity duration-300
          opacity-0 group-hover:opacity-100 group-hover:bg-white
        "
      >
        {/* Title (Must opt out of drag region to be visible/clickable) */}
        <div
          className="text-black text-sm"
          style={{ WebkitAppRegion: "no-drag" } as any}
        >
          Trix
        </div>

        {/* Window Buttons (Must opt out of drag region) */}
        <div
          className="flex flex-row items-center gap-4"
          style={{ WebkitAppRegion: "no-drag" } as any}
        >
          {/* Apply p-0.5 for better vertical alignment */}
          <FiMinus
            size={20}
            className="cursor-pointer text-black hover:bg-gray-200 rounded p-0.5"
            onClick={() => window.api.window.minimize()}
          />
          <FiSquare
            size={20}
            className="cursor-pointer text-black hover:bg-gray-200 rounded p-0.5"
            onClick={() => window.api.window.maximize()}
          />
          <FiX
            size={20}
            className="cursor-pointer text-black hover:bg-red-500 hover:text-white rounded p-0.5"
            onClick={handleHeaderClose}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;