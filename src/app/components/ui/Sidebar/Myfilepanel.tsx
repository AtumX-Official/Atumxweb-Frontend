import React from 'react'
import { MdSearch } from 'react-icons/md'
import { TbFolderPlus } from 'react-icons/tb'
import {Tooltip} from '../Tooltip'
import FileExplorer from '../FileExplorer'
import Myfileicon from '../assets/Myfileicon'
import FileIcon from "@renderer/assets/icons/common/FileIcon"
import Folderup from '../assets/Folderup'
import fileicon from '../assets/File.svg'
interface MyFilesPanelProps {
  textColor: string
  selectedNode: any
  setSelectedNode: React.Dispatch<React.SetStateAction<any>>
  refresh: () => Promise<void>
  projectName: string
  fileTree: any
  isFileCreating: boolean
  setIsFileCreating: React.Dispatch<React.SetStateAction<boolean>>
  isFolderCreating: boolean
  setIsFolderCreating: React.Dispatch<React.SetStateAction<boolean>>
  showSearchBox: boolean
  setShowSearchBox: React.Dispatch<React.SetStateAction<boolean>>
  setShowFileSearch: React.Dispatch<React.SetStateAction<boolean>>
  setFileSearchText: React.Dispatch<React.SetStateAction<string>>
  setFileResults: React.Dispatch<React.SetStateAction<any[]>>
  searchText: string
  setSearchText: React.Dispatch<React.SetStateAction<string>>
  searchResults: any[]
  groupedResults: Record<string, any>
  searchBoxRef: React.RefObject<HTMLDivElement>
  handleGlobalSearch: () => void
  clearSearch: () => void
  highlightWord: (text: string) => void
  renderHighlightedLine: (
    lineText: string,
    matchStart: number,
    matchLength: number
  ) => React.ReactNode
  onNavigate: (path: string, options?: { replace?: boolean; state?: Record<string, string | number | undefined> }) => void
  onAddNewFolder: () => void
  onAddNewFile:() => void
}

const MyFilesPanel = ({
  textColor,
  selectedNode,
  setSelectedNode,
  refresh,
  projectName,
  fileTree,
  isFileCreating,
  setIsFileCreating,
  isFolderCreating,
  setIsFolderCreating,
  showSearchBox,
  setShowSearchBox,
  setShowFileSearch,
  setFileSearchText,
  setFileResults,
  searchText,
  setSearchText,
  searchResults,
  groupedResults,
  searchBoxRef,
  handleGlobalSearch,
  clearSearch,
  highlightWord,
  renderHighlightedLine,
  onNavigate,
  onAddNewFolder,
  onAddNewFile
}: MyFilesPanelProps) => {
  return (
    <div className="w-[250px] h-[450px] rounded-md overflow-hidden bg-white dark:bg-[#272727] flex flex-col">
      <div className="w-full h-[35px] shrink-0 flex items-center justify-between px-4 text-black font-bold">
        <div className="flex items-center gap-2">
          <Myfileicon  className="w-5 h-5" />
          <span className="text-lg text-black dark:text-white">My Files</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowSearchBox(v => {
                if (!v) clearSearch()
                return !v
              })
              setShowFileSearch(false)
              setFileSearchText('')
              setFileResults([])
            }}
            className="group relative text-black"
          >
            <Tooltip text="Search" />
            <MdSearch className="text-black w-5 h-5 dark:text-white" />
          </button>
          <button onClick={onAddNewFile} className="group relative text-black">
            <Tooltip text="New File" />
            <FileIcon className="inline-block w-5 h-5 text-black dark:text-white" />
          </button>
          <button onClick={onAddNewFolder} className="group relative text-black">
            <Tooltip text="New Folder" />
            <TbFolderPlus className="inline-block w-5 h-5 text-black dark:text-white" />
          </button>
        
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 custom-scrollbar">
        {isFileCreating && (
          <div className="flex mb-2">
          <img src={fileicon}  className="inline-block w-6 h-6 mr-2" />
            <input
              className="bg-neutral-secondary-medium text-xs px-2 py-1 border border-black dark:border-white rounded w-full focus:border-black focus:outline-none focus:ring-0"
              autoFocus
              onBlur={() => setIsFileCreating(false)}
              onKeyDown={async e => {
                if (e.key !== 'Enter') return

                await window.api.file.createCodeFile({
                  target: selectedNode ? 'selection' : 'root',
                  selectionPath: selectedNode?.path,
                  selectionType: selectedNode?.type,
                  name: e.currentTarget.value,
                  language: 'python'
                })

                setIsFileCreating(false)
                await refresh()
              }}
            />
          </div>
        )}

        {isFolderCreating && (
          <div className="flex mb-2">
            <Folderup  className="inline-block w-6 h-6 mr-2" />
            <input
              className="bg-neutral-secondary-medium text-xs px-2 py-1 border border-black dark:border-white rounded w-full focus:border-black focus:outline-none focus:ring-0"
              autoFocus
              onBlur={() => setIsFolderCreating(false)}
              onKeyDown={async e => {
                if (e.key !== 'Enter') return

                await window.api.file.createCodeDir({
                  target: selectedNode ? 'selection' : 'root',
                  selectionPath: selectedNode?.path,
                  selectionType: selectedNode?.type,
                  name: e.currentTarget.value,
                  language: 'python'
                })

                setIsFolderCreating(false)
                await refresh()
              }}
            />
          </div>
        )}

        {showSearchBox && (
          <div
            ref={searchBoxRef}
            className="flex gap-1 mb-2 items-center"
            onMouseDown={e => e.stopPropagation()}
          >
            <input
              className="text-xs px-2 py-1 border rounded w-full"
              placeholder="Search..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
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
        )}

        {searchResults.length > 0 && (
          <div id="search-results" className="mb-2 pb-1" onMouseDown={e => e.stopPropagation()}>
            {Object.values(groupedResults).map((group: any, index: number, arr: any[]) => (
              <div
                key={group.filePath}
                className={`${index !== arr.length - 1 ? 'border-b border-gray-400 mb-3 pb-2' : ''}`}
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
                        sessionStorage.setItem('py_searchText', searchText)
                        sessionStorage.setItem('py_searchOpen', 'true')
                        onNavigate('/python', { state: { filePath, fileName } })
                      }

                      setTimeout(() => {
                        if (window.monacoEditor && lineNumber) {
                          window.monacoEditor.revealLineInCenter(lineNumber)
                          window.monacoEditor.setPosition({ lineNumber, column: 1 })
                          window.monacoEditor.focus()
                          highlightWord(searchText)
                        }
                      }, 500)
                    }}
                  >
                    <div className="text-xs">
                      Line {r.lineNumber}:{' '}
                      {renderHighlightedLine(r.lineText, r.matchStart, r.matchLength)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {searchText.trim().length > 0 && searchResults.length === 0 && showSearchBox && (
          <div className="text-xs italic">No matches found</div>
        )}

        <FileExplorer
          data={fileTree}
          sectionType='myFiles'
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          refresh={refresh}
          projectName={projectName}
          language="python"
        />
      </div>
    </div>
  )
}

export default React.memo(MyFilesPanel)