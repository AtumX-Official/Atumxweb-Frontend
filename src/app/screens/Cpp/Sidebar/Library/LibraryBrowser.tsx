import { useState, useEffect, useRef } from "react";
import LibraryCard from "./LibraryCard";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../../store";
import { MdSearch } from "react-icons/md";
import { Tooltip } from "../../../../components/Tooltip";
import Libraryicon from "../../../../components/ui/assets/Libraryicon";
import Uploadicon from "../../../../components/ui/assets/Uploadicon";

export default function LibraryBrowser({ showSearch, setShowSearch }) {
  const [query, setQuery] = useState("");
  const [libraries, setLibraries] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [installedLibs, setInstalledLibs] = useState<any[]>([]);

  const selectedFilePath = useSelector((state: RootState) => state.project.projectPath);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const installedNames = new Set(installedLibs.map((l) => l.name));

  // Load installed libraries from disk on project change
  useEffect(() => {
    const getInstalledLibraries = window.api?.cpp?.getInstalledLibraries;
    if (!selectedFilePath || typeof getInstalledLibraries !== "function") return;

    getInstalledLibraries(selectedFilePath).then((res) => {
      if (res.success) setInstalledLibs(res.libraries);
    }).catch(() => setInstalledLibs([]));
  }, [selectedFilePath]);

  const refreshInstalled = async () => {
    const getInstalledLibraries = window.api?.cpp?.getInstalledLibraries;
    if (!selectedFilePath || typeof getInstalledLibraries !== "function") return;
    const res = await getInstalledLibraries(selectedFilePath);
    if (res.success) setInstalledLibs(res.libraries);
  };

  const search = async (q: string, pageNum: number, append = false) => {
    const searchLibraries = window.api?.cpp?.searchLibraries;
    if (!q.trim() || loading || typeof searchLibraries !== "function") return;
    setLoading(true);

    try {
      const res = await searchLibraries(q, pageNum);

      if (res.success) {
        setLibraries((prev) => (append ? [...prev, ...res.results] : res.results));
        setHasMore(res.hasMore);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    search(query, 1, false);
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await search(query, nextPage, true);
  };

  // Upload handler — matches the Python Library panel behavior exactly.
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('Selected file:', file)
      // TODO: Add your upload logic here
    }
  }

  return (
    <div className="relative h-full w-full overflow-visible flex flex-col">
      <div className="w-full max-w-[250px] h-full rounded-md bg-white dark:bg-[#272727] custom-scrollbar flex flex-col">
        {/* 🔍 Library + Search header (matches Python UI) */}
        <div className="w-full h-[35px] shrink-0 flex items-center justify-between px-4 text-black dark:text-white font-bold">
          <div className="flex items-center gap-2">
            <Libraryicon className="w-5 h-5" />
            <span className="text-lg">Library</span>
          </div>

          <button
            onClick={() => setShowSearch((v: boolean) => !v)}
            className="group relative text-black dark:text-white"
          >
            <Tooltip text="Search" />
            <MdSearch className="text-black dark:text-white w-5 h-5 font-bold" />
          </button>
        </div>

        {/* 📚 Content: search + installed + results */}
        <div className="flex-1 min-h-0 px-4 py-2 overflow-y-auto">

          {/* 🔍 Search box */}
          {showSearch && (
            <div className="flex items-center gap-2 w-full max-w-full overflow-hidden mb-2">
              <input
                value={query}
                autoFocus
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);

                  if (value.trim() === "") {
                    setLibraries([]);
                    setPage(1);
                    setHasMore(false);
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search libraries..."
                className="flex-1 h-8 min-w-0 px-2 py-1.5 text-black dark:text-white border rounded bg-white"
              />

              <button
                onClick={handleSearch}
                className="bg-purple-500 text-white px-3 py-1.5 text-xs rounded flex-shrink-0 hover:bg-purple-600"
              >
                Go
              </button>
              <button
                onClick={() => {
                  setQuery("");
                  setLibraries([]);
                  setPage(1);
                  setHasMore(false);
                  setShowSearch(false);
                }}
                className="bg-gray-300 text-gray-700 px-3 py-1.5 text-xs rounded flex-shrink-0 hover:bg-gray-400"
                title="Clear search"
              >
                ✕
              </button>
            </div>
          )}

          {/* 📦 Installed Libraries — visible whenever there is no active search query */}
          {query.trim() === "" && installedLibs.length > 0 && (
            <div className="flex flex-col gap-2">
              {/* <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                Installed Libraries ({installedLibs.length})
              </p> */}
              {installedLibs.map((lib, i) => (
                <LibraryCard
                  key={`installed-${i}`}
                  data={lib}
                  isInstalled={true}
                  onInstall={refreshInstalled}
                />
              ))}
              <hr className="border-gray-200 my-1" />
            </div>
          )}


          {/* 📚 Search Results */}
          {query.trim() !== "" && (
            <div className="flex flex-col gap-2">
              {libraries.map((lib, i) => (
                <LibraryCard
                  key={i}
                  data={lib}
                  isInstalled={installedNames.has(lib.name)}
                  onInstall={refreshInstalled}
                />
              ))}
            </div>
          )}

          {/* ➕ Load More */}
          
          {query.trim() !== "" && !loading && hasMore && (
            <button
              onClick={loadMore}
              className="w-full bg-purple-500 text-white py-2 text-sm rounded"
            >
              Load More
            </button>
          )}
        </div>

        {/* ⬆ Upload box below header (matches Python UI) */}
        <div className="px-3 pt-2 shrink-0">
          <button
            onClick={handleUploadClick}
            className="w-full h-[35px] border-2 border-dashed border-[#722CF0] rounded-md bg-white flex flex-row items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
          >
            <Uploadicon className="w-5 h-5" />
            <span className="text-xs font-semibold text-[#722CF0] dark:text-[#561DBC]">UPLOAD</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* 🔄 Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="w-[260px] min-h-[140px] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col items-center justify-center gap-4 px-5 py-6">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm sm:text-base text-gray-700 font-medium text-center">
              Fetching libraries...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}