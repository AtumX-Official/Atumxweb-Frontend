import { useState, useEffect } from "react";
import LibraryCard from "./LibraryCard";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../../store";

export default function LibraryBrowser({ showSearch, setShowSearch }) {
  const [query, setQuery] = useState("");
  const [libraries, setLibraries] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [installedLibs, setInstalledLibs] = useState<any[]>([]);
 // const [showSearch, setShowSearch] = useState(false);

  const selectedFilePath = useSelector((state: RootState) => state.project.projectPath);

  const installedNames = new Set(installedLibs.map((l) => l.name));

  // Load installed libraries from disk on project change
  useEffect(() => {
    if (!selectedFilePath) return;

    window.api.cpp.getInstalledLibraries(selectedFilePath).then((res) => {
      if (res.success) setInstalledLibs(res.libraries);
    });
  }, [selectedFilePath]);

  const refreshInstalled = async () => {
    if (!selectedFilePath) return;
    const res = await window.api.cpp.getInstalledLibraries(selectedFilePath);
    if (res.success) setInstalledLibs(res.libraries);
  };

  const search = async (q: string, pageNum: number, append = false) => {
    if (!q.trim() || loading) return;
    setLoading(true);

    const res = await window.api.cpp.searchLibraries(q, pageNum);

    if (res.success) {
      setLibraries((prev) => (append ? [...prev, ...res.results] : res.results));
      setHasMore(res.hasMore);
    }

    setLoading(false);
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

  return (
    <div className="relative h-full w-full overflow-visible">
      <div className="h-full w-full overflow-y-auto pr-1">
        <div className="w-full flex flex-col gap-2">

          {/* 🔍 Search */}
          {showSearch && (
            <div className="flex items-center gap-2 w-[250px] max-w-full overflow-hidden">
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
                className="flex-1 h-8 min-w-0 px-2 py-1.5 text-black dark:text-white border rounded"
              />

              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded flex-shrink-0"
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
                className="text-gray-300 hover:text-white px-1 text-base flex-shrink-0"
                title="Close search"
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
              className="w-full bg-blue-500 text-white py-2 text-sm rounded"
            >
              Load More
            </button>
          )}
        </div>
      </div>

      {/* 🔄 Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="w-[260px] min-h-[140px] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col items-center justify-center gap-4 px-5 py-6">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm sm:text-base text-gray-700 font-medium text-center">
              Fetching libraries...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}