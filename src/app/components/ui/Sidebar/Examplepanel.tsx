import React from 'react'
import { MdSearch } from 'react-icons/md'
import {Tooltip} from '../Tooltip'
import FileExplorer from '../FileExplorer'
import Exampleicon from '../assets/Example'

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
    onNavigate: (path: string, options?: { replace?: boolean; state?: Record<string, string | number | undefined> }) => void
    clearSearch: () => void
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
  onNavigate,
  clearSearch
}: ExamplePanelProps) => {

  const [showSearchBox, setShowSearchBox] = React.useState(false)

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
    handleGlobalSearch(path)
  }

  
  return (
    <div className="text-black text-sm flex flex-col gap-2">
      <div className="w-[250px] rounded-md bg-white dark:bg-[#272727] custom-scrollbar">
        <div className="w-full h-[35px] shrink-0 flex items-center justify-between px-4 text-black font-bold">
          <div className="flex items-center gap-2">
            <Exampleicon className="w-5 h-5" />
            <span className="text-lg text-black dark:text-white">Ideas</span>
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
                    handleExampleSearch()
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