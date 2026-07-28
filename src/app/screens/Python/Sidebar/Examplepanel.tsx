import React from 'react'
import { MdSearch } from 'react-icons/md'
import {Tooltip} from '../../../components/Tooltip'
import FileExplorer from './FileExplorer'
import Exampleicon from './assets/Example'
import { useSelector } from 'react-redux'
interface ExamplePanelProps {
  examples: any
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
    navigate: any
    clearSearch: () => void
    searchMode: 'content' | 'filename'
    handleFileNameSearch: (customPath?: string) => void
    renderHighlightedFileName:(fileName:string) => React.ReactNode
    fileNameResults: any[]
    searchExecuted
}

const ExamplePanel = ({
  examples,
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
  navigate,
  clearSearch,
  searchMode,
  handleFileNameSearch,
  renderHighlightedFileName,
  fileNameResults,
  searchExecuted
}: ExamplePanelProps) => {

  const [showSearchBox, setShowSearchBox] = React.useState(false)
  const themeMode = useSelector((state: any) => state.theme.mode);

  React.useEffect(() => {
    if (!showSearchBox) return
    if (!searchText.trim()) return

    const delay = setTimeout(() => {
      const path = getExamplePath()
      handleGlobalSearch(path)
    }, 400)

    return () => clearTimeout(delay)
  }, [searchText, showSearchBox, projects])

  const getExamplePath = () => {

    const basePath = projects?.[0]?.filepath
      ? projects[0].filepath.split("\\").slice(0, -3).join("\\")
      : ""

    const finalPath = `${basePath}\\Examples\\python`
    return finalPath
  }

  const handleExampleSearch = () => {
    const path = getExamplePath()
    console.log("Example Path : ",path)
    handleFileNameSearch(path)
  }

  
  return (
    <div className="text-black text-sm flex flex-col gap-2 z-10">
      <div className={`w-[250px] rounded-md custom-scrollbar ${themeMode === "dark" ? "bg-[black]" : "bg-white" }`}>
        <div className="w-full h-[35px] shrink-0 flex items-center justify-between px-4 text-black font-bold">
          <div className="flex items-center gap-2 mt-2">
            <Exampleicon className={`w-5 h-5 ${themeMode === "dark" ? "text-white" : "text-black"}`}/>
            <span className={`text-lg ${themeMode === "dark" ? "text-white" : "text-black"}`}>Examples</span>
          </div>

          <button
            onClick={() => {
              setShowSearchBox(v => {
                if (!v) clearSearch()
                return !v
              })
            }}
            className="group relative text-black mt-2"
          >
            <Tooltip text="Search" />
            <MdSearch className={`w-5 h-5 font-bold  ${themeMode === "dark" ? "text-white" : "text-black"}`} />
          </button>
        </div>

        <div className="flex-1 min-h-0 px-4 py-2 overflow-y-auto">

  {showSearchBox && (
    <div className="flex flex-col gap-2">

      {/* Search Bar */}
      <div className="flex gap-1 items-center">
        <input
          className={`text-xs px-2 py-1 border rounded w-full ${
            themeMode === "dark" ? "text-white" : "text-black"
          }`}
          placeholder="Search examples..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleExampleSearch();
            }
          }}
        />

        <button
          onClick={handleExampleSearch}
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
      </div>

      {/* Results */}
      {fileNameResults?.length > 0 && (
        <div className="mb-2 pb-1">
          {fileNameResults.map((file: any, index: number) => (
            <div
              key={file.filepath || index}
              className="cursor-pointer hover:bg-purple-200 px-2 py-1 text-sm truncate"
              onClick={() => {
                navigate("/python", {
                  state: {
                    filePath: file.filepath,
                    fileName: file.filename,
                  },
                });

                setShowSearchBox(false);
              }}
            >
              <span
                className={
                  themeMode === "dark"
                    ? "text-white group-hover:text-black"
                    : "text-black"
                }
              >
                {renderHighlightedFileName(file.filename)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchExecuted &&
        searchText.trim().length > 0 &&
        fileNameResults?.length === 0 && (
          <div
            className={`text-xs italic ${
              themeMode === "dark" ? "text-white" : "text-black"
            }`}
          >
            No matches found
          </div>
        )}
    </div>
  )}

</div>


        <div className="p-3">
          <FileExplorer
            data={examples}
            sectionType='example'
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

export default React.memo(ExamplePanel)