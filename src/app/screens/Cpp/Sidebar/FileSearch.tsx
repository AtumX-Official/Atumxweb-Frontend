import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FileSearch({
    terminalPath,
    unsavedChanges
}){
    const navigate = useNavigate()
    const [fileResults, setFileResults] = useState<any[]>([]);
    const [fileSearchText, setFileSearchText] = useState("");
    
    const handleFileSearch = async () => {
        if (!fileSearchText.trim()) return;

        const folderPath = terminalPath

        const res = await window.api.fileSearch(folderPath, fileSearchText);

        if (res?.success) {
        setFileResults(res.data);
        } else {
        setFileResults([]);
        }
    }

    useEffect(() => {
        const delay = setTimeout(() => {
          handleFileSearch();
        }, 250);
    
        return () => clearTimeout(delay);
    }, [fileSearchText]);

    return (
        <div className="flex gap-1 mb-2 flex-col">
        <div className="flex gap-1 mb-2 items-center ">
            <input
            className="flex-1 min-w-0 text-xs text-black dark:text-white px-2 py-1 border rounded"
            placeholder="Search file name..."
            value={fileSearchText}
            autoFocus
            onChange={e => setFileSearchText(e.target.value)}
            />

            <button
            onClick={() => {
                setFileSearchText("")
                setFileResults([])
            }}
            className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-400"
            >
            ✕
            </button>
        </div>
        {fileResults.length > 0 && (
            <div className="mb-2 text-black dark:text-white">
            {fileResults.map((f, i) => (
                <div
                key={i}
                className="cursor-pointer hover:bg-[#00979C]/20 px-2 text-xs py-1 rounded"
                onClick={() => {
                    const { filePath, fileName } = f;

                    if (unsavedChanges) {
                    const confirmed = window.confirm(
                        "You have unsaved changes. Leave without saving?"
                    );
                    if (!confirmed) return;
                    }

                    navigate("/cpp", { state: { filePath, fileName }, replace: true });


                    setTimeout(() => {
                    window.dispatchEvent(new Event("focus-file"));
                    }, 100);
                }}
                >
                {f.fileName}
                </div>
            ))}
            </div>
        )}

        {fileSearchText.trim().length > 0 && fileResults.length === 0 && (
            <div className="text-xs text-black dark:text-white italic">No files found</div>
        )}
        </div>
    )
}