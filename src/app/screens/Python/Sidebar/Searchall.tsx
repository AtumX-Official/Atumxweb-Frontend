import React from 'react'
import { MdSearch } from 'react-icons/md'
import { useSelector } from 'react-redux'
import { useState } from 'react'
interface SearchallpanelProps {
  searchText: string
  setSearchText: React.Dispatch<React.SetStateAction<string>>
  handleGlobalSearch: () => void
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
  replaceText: string
  setReplaceText: (value: string) => void
  handleReplaceAll: () => void
}

const SearchallPanel = ({
  searchText,
  setSearchText,
  handleGlobalSearch,
  searchResults,
  groupedResults,
  highlightWord,
  renderHighlightedLine,
  navigate,
  clearSearch,
  replaceText,
  setReplaceText,
  handleReplaceAll
}: SearchallpanelProps) => {
    const themeMode = useSelector((state: any) => state.theme.mode);
    const [isReplacing, setIsReplacing] = useState(false);

  return (
    <div className="text-black text-sm flex flex-col gap-2 z-10">
      <div className={`w-[250px] h-full rounded-md custom-scrollbar flex flex-col ${themeMode === "dark" ? "bg-black" : "bg-white" }`}>

        <div className="w-full h-[35px] flex items-center px-4 font-bold">
          <div className="flex items-center gap-2">
            <MdSearch className={`w-5 h-5 ${themeMode === "dark" ? "text-white" : "text-black"}`} />
            <span className={`text-lg ${themeMode === "dark" ? "text-white" : "text-black"}`}>Search</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 px-4 py-2 overflow-y-auto">

          <div className="flex gap-1 mb-2 items-center">
            <input
              className={`text-xs px-2 py-1 border rounded w-full ${themeMode === "dark" ? "text-white" : "text-black" }`}
              placeholder="Search across files..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGlobalSearch()
                }
              }}
            />

            <button
              onClick={handleGlobalSearch}
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
          <div className="flex gap-1 mb-2 items-center">
  <input
    className={`text-xs px-2 py-1 border rounded w-full ${
      themeMode === "dark" ? "text-white" : "text-black"
    }`}
    placeholder="Replace with..."
    value={replaceText}
    onChange={(e) => setReplaceText(e.target.value)}
  />

  <button
    onClick={handleReplaceAll}
    disabled={!searchText.trim()}
    className={`text-xs px-3 py-1 rounded text-white ${
      searchText.trim()
        ? "bg-purple-500  hover:bg-green-600"
        : "bg-gray-400 cursor-not-allowed"
    }`}
  >
    Replace All
  </button>
</div>
          {searchResults.length > 0 && (
            <div className="mt-2">
              {Object.values(groupedResults).map((group: any, index: number, arr: any[]) => (
                <div
                  key={group.filePath}
                  className={`${index !== arr.length - 1 ? 'border-b border-gray-400 mb-3 pb-2' : ''
                    }`}
                >
                  <div className={`flex justify-between items-center text-sm font-semibold text-purple-700 ${themeMode === "dark" ? "text-white" : "text-black" }`}>
                    <span className={`truncate  ${themeMode === "dark" ? "text-white" : "text-black" } `}>{group.fileName}</span>
                    <span className={`ml-2 bg-purple-100 text-purple-500 px-2 rounded text-xs font-bold ${themeMode === "dark" ? "text-black" : "text-black" }`}>
                      {group.results.length}
                    </span>
                  </div>

                  {group.results.map((r: any, i: number) => (
                    <div
                      key={i}
                      className="group cursor-pointer hover:bg-purple-200 px-2"
                      onClick={() => {
                        const { filePath, fileName, lineNumber } = r

                        if (filePath !== '__unsaved__') {
                          navigate('/python', { state: { filePath, fileName } })
                        }

                        setTimeout(() => {
                          if (window.monacoEditor && lineNumber) {
                            window.monacoEditor.revealLineInCenter(lineNumber)
                            window.monacoEditor.setPosition({
                              lineNumber,
                              column: 1
                            })
                            window.monacoEditor.focus()
                            highlightWord(searchText)
                          }
                        }, 200)
                      }}
                    >
                   <div className={`text-xs ${themeMode === "dark"  ? "text-white group-hover:text-black": "text-black"}`}>                       
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

          {searchText.trim().length > 0 && searchResults.length === 0 && (
            <div className={`text-xs italic ${themeMode === "dark" ? "text-white" : "text-black" }`}>No matches found</div>
          )}

        </div>
      </div>
    </div>
  )
}

export default React.memo(SearchallPanel)