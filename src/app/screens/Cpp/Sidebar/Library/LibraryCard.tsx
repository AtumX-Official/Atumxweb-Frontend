import { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../store";
import Swal from "sweetalert2";
import File from '../../../../components/ui/assets/File'
import { PlusCircle } from "lucide-react";
interface Library {
  name: string;
  version: string;
  description: string;
  published: string;
  [key: string]: any;
}

interface VersionInfo {
  version: string;
  size: string;
  published: string;
}

interface LibraryCardProps {
  data: Library;
  isInstalled?: boolean;
  onInstall?: () => void;
}

export default function LibraryCard({ data, isInstalled = false, onInstall }: LibraryCardProps) {
  const selectedFilePath = useSelector((state: RootState) => state.project.projectPath);
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(data.version);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const description = data.description || "No description available";
  const themeMode = useSelector((state: any) => state.theme.mode)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const author = data.name.includes("/") ? data.name.split("/")[0] : "Unknown";
  const libShortName = data.name.includes("/") ? data.name.split("/")[1] : data.name;

  const handleToggleDropdown = async () => {
    const next = !open;
    setOpen(next);
    if (next && versions.length === 0) {
      setLoadingVersions(true);
      try {
        const res = await window.api.cpp.getLibraryVersions(data.name);
        if (res?.success) setVersions(res.versions);
      } catch {}
      finally { setLoadingVersions(false); }
    }
  };

  const handleAdd = async () => {
    if (!selectedFilePath) { alert("No project selected"); return; }
    const iniPath = selectedFilePath.endsWith("platformio.ini")
      ? selectedFilePath
      : `${selectedFilePath}\\platformio.ini`;
    const res = await window.api.cpp.addLibrary(iniPath, { ...data, version: selectedVersion });
    if (res?.success) {
      onInstall?.();
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: res?.message || "Added successfully", showConfirmButton: false, timer: 1800, timerProgressBar: true, background: "#1f2937", color: "#fff" });
    } else {
      Swal.fire({ toast: true, position: "top-end", icon: "error", title: res?.error || "Failed to add", showConfirmButton: false, timer: 2000, timerProgressBar: true, background: "#1f2937", color: "#fff" });
    }
  };

  return (
<div
  className={`w-full bg-white rounded-md overflow-hidden flex flex-col mb-2`}
>
      {/* Header */}
      <div className="flex items-center px-3 py-2 rounded-top bg-[#2195FF]">
      <File className="w-4 h-4 mr-2" />
      <span className="text-[13px] font-semibold text-white truncate">
    {libShortName}
  </span>

  <div className="ml-auto">
    {isInstalled ? (
      <span className="text-[11px] text-white italic">
        Installed
      </span>
    ) : (
      <button
        onClick={handleAdd}
        className="text-white text-[18px] leading-none font-semibold"
      >
         <PlusCircle className="w-5 h-5" />
      </button>
    )}
  </div>
</div>
<div className="bg-[#D6D6D6] px-3 py-1 flex justify-end">
  <span
    className="text-[10px] italic text-black"
    style={{ fontFamily: "Nunito" }}
  >
    {author}
  </span>
</div>
<div className="bg-[#F0F0F0] px-3 py-2">
  <p
    className={`text-[12px] text-black leading-[1.5] ${
      expanded ? "" : "line-clamp-2"
    }`}
  >
    {description}
  </p>

  {description.length > 60 && (
    <button
      onClick={() => setExpanded(!expanded)}
      className="text-[11px] text-[#2195FF] mt-1"
    >
      {expanded ? "Less" : "More"}
    </button>
  )}
</div>
      {/* Footer */}
      <div className=" bg-[#F0F0F0] flex justify-end items-center gap-2 px-3 py-2">
  <span className="text-[11px]  text-black">
    Version
  </span>

  <div className="relative" ref={dropdownRef}>
    <button
      onClick={versions.length > 1 ? handleToggleDropdown : undefined}
      className="flex items-center gap-1 bg-[#FFDE21] px-2 py-1"
    >
      <span className="text-[11px] font-medium text-black">
        {selectedVersion || "N/A"}
      </span>

      {versions.length > 1 && (
        <span className="text-[10px] text-black">
          {open ? "▲" : "▼"}
        </span>
      )}
    </button>

    {open && versions.length > 1 && (
      <div className="absolute right-0 bottom-[calc(100%+6px)] w-44 bg-white border border-gray-200 z-50">
        <div className="max-h-[160px] overflow-y-auto">
          {versions.map((v) => (
            <div
              key={v.version}
              onClick={() => {
                setSelectedVersion(v.version);
                setOpen(false);
              }}
              className="px-3 py-2 text-[11px] hover:bg-[#FFDE21] cursor-pointer"
            >
              {v.version}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>
    </div>
  );
}