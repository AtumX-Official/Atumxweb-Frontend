import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { RootState } from "../../../../../store";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

interface GlobalSearchProps {
  searchBoxRef: React.RefObject<HTMLDivElement | null>
  highlightWord: (word: string) => void
  renderHighlightedLine: (text: string, start: number, length: number) => React.ReactNode
  unsavedChanges: boolean
  searchInUnsavedEditor: (query: string) => any[]
}

export default function GlobalSearch({
  searchBoxRef,
  highlightWord,
  renderHighlightedLine,
  unsavedChanges,
  searchInUnsavedEditor,
} : GlobalSearchProps) {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isReplacing, setIsReplacing] = useState(false);
  const selectedFilePath = useSelector((state: RootState) => state.project.projectPath);
  const [hasSearched, setHasSearched] = useState(false);
  const themeMode = useSelector((state: any) => state.theme.mode)

  const handleGlobalSearch = async () => {
    if (!searchText.trim()) return;

    setSearchResults([]);


    try {
      if (!selectedFilePath) return;
      const res = await window.api.globalSearch(selectedFilePath, searchText);

      console.log("Global search results:", selectedFilePath);

      const unsavedResults = unsavedChanges
        ? searchInUnsavedEditor(searchText)
        : [];

      if (res?.success && res.data) {
        setSearchResults([...unsavedResults, ...res.data]);
        setHasSearched(true);
      } else {
        setSearchResults(unsavedResults);
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleReplaceAll = async () => {
    if (!searchText.trim()) return;
    if (!selectedFilePath) return;
  
    const result = await Swal.fire({
      title: "Confirm Replace",
      text: `Replace all "${searchText}" with "${replaceText}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00979C",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, replace",
      cancelButtonText: "Cancel",
      background: document.documentElement.classList.contains("dark")
        ? "#1f1f1f"
        : "#ffffff",
      color: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#000000",
    });
  
    if (!result.isConfirmed) return;
  
    setIsReplacing(true);
  
    try {
      const res = await window.api.globalReplace(
        selectedFilePath,
        searchText,
        replaceText
      );
  
      if (res?.success) {
        await Swal.fire({
          title: "Success",
          text: `Replaced ${res.totalReplacements} occurrences`,
          icon: "success",
          confirmButtonColor: "#00979C",
          background: document.documentElement.classList.contains("dark")
            ? "#1f1f1f"
            : "#ffffff",
          color: document.documentElement.classList.contains("dark")
            ? "#ffffff"
            : "#000000",
        });
  
        handleGlobalSearch(); // refresh
      } else {
        await Swal.fire({
          title: "Replace Failed",
          text: "Could not complete replace operation.",
          icon: "error",
          confirmButtonColor: "#00979C",
          background: document.documentElement.classList.contains("dark")
            ? "#1f1f1f"
            : "#ffffff",
          color: document.documentElement.classList.contains("dark")
            ? "#ffffff"
            : "#000000",
        });
      }
    } catch (err) {
      console.error(err);
  
      await Swal.fire({
        title: "Error",
        text: "An error occurred during replace.",
        icon: "error",
        confirmButtonColor: "#00979C",
        background: document.documentElement.classList.contains("dark")
          ? "#1f1f1f"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#ffffff"
          : "#000000",
      });
    }
  
    setIsReplacing(false);
  };


  const groupedResults = searchResults.reduce((acc: any, r: any) => {
    if (!acc[r.filePath]) {
      acc[r.filePath] = {
        fileName: r.fileName,
        filePath: r.filePath,
        results: []
      };
    }
    acc[r.filePath].results.push(r);
    return acc;
  }, {});

  return (
    <div>
      <div
        ref={searchBoxRef}
        className="flex flex-col gap-2 mb-2"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* SEARCH */}
        <div className="flex gap-1 items-center">
          <input
            className={`text-xs px-2 py-1 border rounded w-full ${themeMode === "dark"? "border-white text-white":"text-black"}`}
            placeholder="Search..."
            value={searchText}
            autoFocus
            onChange={(e) => {
              setSearchText(e.target.value);
              setHasSearched(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGlobalSearch();
              }
            }}
          />

          <button
            onClick={handleGlobalSearch}
            className={`text-black text-xs px-3 py-1 rounded ${themeMode === "dark" ? "bg-[#006DD1] text-white" : "bg-[#2195FF]"}`}
          >
            Go
          </button>
        </div>

        {/* REPLACE */}
        <div className="flex gap-1 items-center">
          <input
            className={`text-xs px-2 py-1 border rounded w-full ${themeMode === "dark" ? "border-white text-white" : "text-black"}`}
            placeholder="Replace with..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />

          <button
            onClick={handleReplaceAll}
            disabled={!searchText.trim()||isReplacing}
            className={` text-black text-xs px-3 py-1 rounded disabled:opacity-50 ${themeMode === "dark" ? "bg-[#006DD1] text-white" : "bg-[#2195FF]"}`}
          >
            {isReplacing ? "Replacing..." : "Replace All"}
          </button>
        </div>
      </div>

      {/* RESULTS */}
      {searchResults.length > 0 && (
        <div
          className={`mb-2 pb-1 ${themeMode === "dark"? "text-white":"text-black"}`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {Object.values(groupedResults).map((group: any, index, arr) => (
            <div
              key={group.filePath}
              className={
                index !== arr.length - 1
                  ? "border-b border-gray-400 mb-3 pb-2"
                  : ""
              }
            >
              {/* FILE HEADER */}
              <div className={`flex justify-between items-center text-sm font-semibold  ${themeMode==="dark" ? "text-[#00979C]":"text-[#005C5F]"}`}>
                <span className="truncate">{group.fileName}</span>
                <span className={`ml-2 px-2 rounded text-xs font-bold ${themeMode==="dark"?"bg-[#254246]":"bg-[#E8F5E9]"}`}>
                  {group.results.length}
                </span>
              </div>

              {/* MATCHES */}
              {group.results.map((r: any, i: number) => (
                <div
                  key={i}
                  className={`cursor-pointer rounded px-2 ${themeMode==="dark"?"hover:bg-[#254246]":"hover:bg-[#D4ECE0]"}`}
                  onClick={() => {
                    const { filePath, fileName, lineNumber } = r;

                    if (unsavedChanges) {
                      const confirmed = window.confirm(
                        "You have unsaved changes. Continue?"
                      );
                      if (!confirmed) return;
                    }

                    if (filePath !== "__unsaved__") {
                      sessionStorage.setItem("cpp_searchText", searchText);
                      sessionStorage.setItem("cpp_searchOpen", "true");

                      navigate("/cpp", {
                        state: { filePath, fileName }
                      });
                    }

                    setTimeout(() => {
                      if (window.monacoEditor && lineNumber) {
                        window.monacoEditor.revealLineInCenter(lineNumber);
                        window.monacoEditor.setPosition({
                          lineNumber,
                          column: 1
                        });
                        window.monacoEditor.focus();
                        highlightWord(searchText);
                      }
                    }, 200);
                  }}
                >
                  <div className="text-xs">
                    Line {r.lineNumber}:{" "}
                    {renderHighlightedLine(
                      r.lineText,
                      r.matchStart,
                      r.matchLength
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* NO RESULTS */}
      {hasSearched && searchText.trim().length > 0 && searchResults.length === 0 && (      
          <>
          <div className={`text-xs italic ${themeMode==="dark"?"text-white":"text-black"}`}>
            No matches found
          </div>
          <div className="border-b border-gray-400 my-2"></div>
        </>
      )}
    </div>
  );
}