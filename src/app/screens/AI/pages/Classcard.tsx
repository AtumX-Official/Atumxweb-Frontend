import { Camera, Upload, Edit3 } from "lucide-react";

export function ClassCard({ placeholder, onCameraClick }) {
    return (
    <div className="w-[300px] h-[120px] bg-white border-2 border-black rounded-lg p-3 flex items-center gap-3 relative">
      
      {/* Grid */}
      <div className="p-1 bg-[#D6D6D6] rounded">
        <div className="grid grid-cols-4 gap-[3px]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-5 h-5 bg-black rounded-sm"></div>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col flex-1 justify-center">
        
        {/* Input */}
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder}
            className="w-full border-b border-black outline-none pr-6 text-xs"
          />
          <Edit3 size={14} className="absolute right-0 top-1/2 -translate-y-1/2" />
        </div>

        {/* Icons BELOW input */}
        <div className="flex gap-2 mt-2">
          <button onClick={onCameraClick}
          className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <Camera size={14} color="white" />
          </button>
          <button className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <Upload size={14} color="white" />
          </button>
        </div>

      </div>
    </div>
  );
}