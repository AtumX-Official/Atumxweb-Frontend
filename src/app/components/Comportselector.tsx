import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/index";
import { setSelectedComPort, fetchComPort } from "../../../store/comPortSlice";
import refresh from "../assets/refresh.svg";

const ComPortSelector = ({ className = "", isConnected = false ,onPortSelected }: { className?: string; isConnected?: boolean;  onPortSelected?: (port: string) => void;}) => {
  const selectedPort = useSelector((state: RootState) => state.comPort.selectedComPort);
  const fetchedComPort = useSelector((state: RootState) => state.comPort.comPorts);
  const dispatch = useDispatch<AppDispatch>();

  const [open, setOpen] = useState(false);
  const fillColor = isConnected ? "#2EED08" : "white";

  useEffect(() => {
    dispatch(fetchComPort());
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    dispatch(fetchComPort());
  };

  const handleSelect = (value: string) => {
    dispatch(setSelectedComPort(value));
    setOpen(false);
    if (onPortSelected) {
      onPortSelected(value);
    }
  };

  return (
    <div
      className={`relative w-[130px] h-[48px] rounded-[8px] bg-[black] shadow-[0px_4px_4px_rgba(0,0,0,0.15)] ${className}`}
    >
      {/* Display selected port */}
      <div
        className="flex items-center justify-between px-2 py-2 text-white cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">
          {selectedPort || "Select Port"}
        </span>
        <div className="flex items-center space-x-2">
          {/* Caret */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill={fillColor}
            viewBox="0 0 24 24"
            stroke={fillColor}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>

          {/* Refresh */}
          <img
            src={refresh}
            alt="Refresh"
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            width={18}
            height={18}
            className="cursor-pointer hover:scale-105 transition-transform"
          />
        </div>
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white text-black rounded-[6px] shadow-lg z-50 max-h-[150px] overflow-y-auto">
          {fetchedComPort.length === 0 ? (
            <div className="px-3 py-2 text-gray-500">No ports</div>
          ) : (
            fetchedComPort.map((comPort, index) => (
              <div
                key={index}
                onClick={() => handleSelect(comPort.path)}
                className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
              >
                {comPort.path}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ComPortSelector;
