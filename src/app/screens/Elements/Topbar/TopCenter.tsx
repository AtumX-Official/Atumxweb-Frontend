import { Tooltip } from "../../../components/Tooltip";
interface TopBarCenterProps {
  selectedKit: string;
  setShowKits: React.Dispatch<React.SetStateAction<boolean>>;
  kitsButtonRef: React.RefObject<HTMLButtonElement | null>;
  projectName: string;
  setProjectName: (name: string) => void;
}

const TopBarCenter: React.FC<TopBarCenterProps> = ({
  selectedKit,
  setShowKits,
  kitsButtonRef,
  projectName,
  setProjectName,
}) => (
< div
  className="
    w-[300px] max-w-[90vw] sm:w-[280px] md:w-[320px] lg:w-[300px]
    h-[50px] bg-white rounded-xl flex items-center justify-between px-3 
    transition-all duration-300 ease-in-out border-1 border-transparent
    hover:border-black
  "
>    {/* Project Name on the left */}
{/* Project Name Input */}
<div className="relative group">
  <input
    type="text"
    value={`Project ${projectName}`}
    onChange={(e) => setProjectName(e.target.value.replace(/^Project\s*/i, ''))}
    className="flex-1 h-full text-black font-semibold text-sm bg-transparent outline-none"
    placeholder="Project Name"
  />
  {/* Standardized Tooltip */}
  <Tooltip text="Project Name" marginTop="mt-4" />
</div>

{/* Selected Kit Button */}
<button
  ref={kitsButtonRef}
  onClick={() => setShowKits((prev) => !prev)}
  className="relative group flex-shrink-0 flex items-center justify-center 
             w-[120px] h-[40px] bg-black border-[2px] border-white 
             shadow-[0_0_6px_rgba(255,255,255,0.6)] cursor-pointer rounded-xl"
>
  <span className="text-white text-sm font-bold tracking-wide uppercase whitespace-nowrap overflow-hidden text-ellipsis px-1">
  {selectedKit && selectedKit !== "Default" ? selectedKit : "No Kit"}
  </span>
  {/* Standardized Tooltip */}
  <Tooltip text="Kit Selection" marginTop="mt-3" />
</button>
  </div>
);

export default TopBarCenter;