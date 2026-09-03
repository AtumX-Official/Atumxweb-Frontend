import React, { useEffect, useRef } from "react";


interface PopUpProps {
  showPopUp: boolean
  children: React.ReactNode
  closePopUp: () => void
  title?: string
}

function PopUp({ showPopUp, children, closePopUp, title = "Create New Project" } : PopUpProps) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!showPopUp) return;

    const handleKeyDown = (e : KeyboardEvent) => {
      if (e.key === "Escape") closePopUp();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPopUp, closePopUp]);

  if (!showPopUp) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={closePopUp}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[500px] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] p-5 flex flex-col gap-4 bg-[#EAEAEA] dark:bg-[#1B2B2D] text-black dark:text-white border border-black/10 dark:border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[22px] tracking-wide">{title}</h2>

          <button
            onClick={closePopUp}
            className="bg-[#FF4945] text-white w-9 h-9 rounded-md cursor-pointer text-lg font-bold flex items-center justify-center hover:scale-105 transition-transform"
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

export default PopUp;