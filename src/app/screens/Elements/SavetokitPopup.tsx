import { useEffect, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import Edit from "../../assets/Edit"
import Star from "./assets/star.svg"
import { useDispatch, useSelector } from 'react-redux';
type SaveToKitPopupProps = {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
};

export const SaveToKitPopup = ({
  open,
  projectName,
  onClose,
  onConfirm,
}: SaveToKitPopupProps) => {
  const [name, setName] = useState(projectName);
  const themeMode = useSelector((state: any) => state.theme.mode)
  const bgColor = themeMode === 'dark' ? 'bg-black' : 'bg-[#EAEAEA]'
  useEffect(() => {
    if (open) setName(projectName);
  }, [open, projectName]);

  if (!open) return null;

  return (
    <div className="absolute z-50 top-16 right-16 w-[400px] h-[100px] shadow-lg  rounded overflow-hidden">

      {/* Header */}
      <div className="w-full h-[50px] bg-[#FFDE21] flex items-center justify-between px-4 font-bold text-[20px] text-black">
       <span>Saving to the kit</span>
     <img src={Star}   alt="Kit" className="h-5 w-auto"/>
     </div>

      {/* Body */}
      <div className={`w-full h-[50px] ${bgColor} flex items-center justify-between px-1`}>
        
        {/* Filename */}
        <div className="w-[320px] h-[40px] bg-white flex items-center justify-between px-3 rounded">
          <input
            className="w-full text-sm outline-none text-black"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onConfirm(name);
              }
            }}
          />
          <Edit className="w-4 h-4 text-black ml-2" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
  {/* Confirm Button */}
  <button
    onClick={() => onConfirm(name)}
    className="bg-[#2EED08] rounded-md ml-2"
  >
    <FiCheck className="w-8 h-8 text-white " />
  </button>

  {/* Cancel Button */}
  <button
    onClick={onClose}
    className="bg-[#FF4945]  rounded-md"
  >
    <FiX className="w-8 h-8 text-white" />
  </button>
</div>

      </div>
    </div>
  );
};
