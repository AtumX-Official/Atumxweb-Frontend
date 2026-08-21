import React, { useRef } from 'react'
import { MdSearch } from 'react-icons/md'
import { Tooltip } from '../Tooltip'
import FileExplorer from '../FileExplorer'
import Libraryicon from '../assets/Libraryicon'
import Uploadicon from '../assets/Uploadicon'

interface LibraryPanelProps {
  libraries: any
  projects: any
  selectedNode: any
  setSelectedNode: React.Dispatch<React.SetStateAction<any>>
  refresh: () => Promise<void>
  projectName: string
  searchText: string
  setSearchText: React.Dispatch<React.SetStateAction<string>>
  handleGlobalSearch: (customPath?: string) => void
  searchResults: any[]
  groupedResults: Record<string, any>
  highlightWord: (text: string) => void
  renderHighlightedLine: (
      lineText: string,
      matchStart: number,
      matchLength: number
  ) => React.ReactNode
  onNavigate: (path: string, options?: { replace?: boolean; state?: Record<string, string | number | undefined> }) => void
  clearSearch: () => void
}

const LibraryPanel = ({
  libraries,
  projects,
  selectedNode,
  setSelectedNode,
  refresh,
  projectName,
  searchText,
  setSearchText,
  handleGlobalSearch,
  searchResults,
  groupedResults,
  highlightWord,
  renderHighlightedLine,
  onNavigate,
  clearSearch
}: LibraryPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showSearchBox, setShowSearchBox] = React.useState(false)
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

  React.useEffect(() => {
    if (!showSearchBox) return
    if (!searchText.trim()) return

    const delay = setTimeout(() => {
      const path = getLibraryPath()
      handleGlobalSearch(path)
    }, 400)

    return () => clearTimeout(delay)
  }, [searchText, showSearchBox, projects])

  const getLibraryPath = () => {

    const basePath = projects?.[0]?.filepath
      ? projects[0].filepath.split("\\").slice(0, -3).join("\\")
      : ""

    const finalPath = `${basePath}\\Libraries\\python`
    return finalPath
  }

  const handleLibrarySearch = () => {
    const path = getLibraryPath()
    handleGlobalSearch(path)
  }

  return (
    <div className="text-black text-sm flex flex-col gap-2">
      <div className="w-[250px] h-full rounded-md bg-white dark:bg-[#272727] custom-scrollbar">
        <div className="w-full h-[35px] shrink-0 flex items-center justify-between px-4 text-black font-bold">
          <div className="flex items-center gap-2">
            <Libraryicon className="w-5 h-5" />
            <span className="text-lg text-black dark:text-white">Library</span>
          </div>

          <button
            onClick={() => {
              setShowSearchBox(v => {
                if (!v) clearSearch() 
                return !v
              })
            }}
            className="group relative text-black"
          >
            <Tooltip text="Search" />
            <MdSearch className="text-black w-5 h-5 font-bold dark:text-white" />
          </button>
        </div>

        <div className="flex-1 min-h-0 px-4 py-2 overflow-y-auto">

          {showSearchBox && (
            <div className="flex gap-1 mb-2 items-center">
            <input
              className="text-xs px-2 py-1 border rounded w-full"
              placeholder="Search across files..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLibrarySearch()
                }
              }}
            />

            <button
              onClick={handleLibrarySearch}
              className="bg-purple-500 text-white text-xs px-3 py-1 rounded hover:bg-purple-600"
            >
              Go
            </button>

            <button
              onClick={clearSearch}
              className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-400"
            >
              ✕
            </button>
          </div>)}

          {showSearchBox && searchResults?.length > 0 && (
            <div className="mt-2">
              {Object.values(groupedResults || {}).map((group: any, index: number, arr: any[]) => (
                <div
                  key={group.filePath}
                  className={`${index !== arr.length - 1 ? 'border-b border-gray-400 mb-3 pb-2' : ''
                    }`}
                >
                  <div className="flex justify-between items-center text-sm font-semibold text-purple-700">
                    <span className="truncate">{group.fileName}</span>
                    <span className="ml-2 bg-purple-100 text-purple-500 px-2 rounded text-xs font-bold">
                      {group.results.length}
                    </span>
                  </div>

                  {group.results.map((r: any, i: number) => (
                    <div
                      key={i}
                      className="cursor-pointer hover:bg-purple-200 px-2"
                      onClick={() => {
                        const { filePath, fileName, lineNumber } = r

                        if (filePath !== '__unsaved__') {
                          sessionStorage.setItem("py_searchText", searchText)
                          sessionStorage.setItem("py_searchOpen", "true")

                          onNavigate('/python', {
                            state: {
                              filePath,
                              fileName,
                              lineNumber,
                              searchText,
                              timestamp: Date.now()
                            }
                          })
                        }
                      }}
                    >
                      <div className="text-xs">
                        Line {r.lineNumber}:{' '}
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
          {showSearchBox && searchText.trim().length > 0 && searchResults.length === 0 && (
            <div className="text-xs italic">No matches found</div>
          )}

        </div>

        {/* Upload box below Library title */}
        <div className="px-3 pt-2">
          <button
            onClick={handleUploadClick}
            className="w-full h-[35px] border-2 border-dashed border-[#722CF0] border-[#561DBC] rounded-md bg-white flex flex-row items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
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

        <div className="p-3">
          <FileExplorer
            data={libraries}
            sectionType="library"
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            refresh={refresh}
            projectName={projectName}
            language="python"
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(LibraryPanel)