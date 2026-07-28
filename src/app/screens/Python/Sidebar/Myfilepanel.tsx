import React from 'react'
import { MdSearch } from 'react-icons/md'
import { TbFolderPlus } from 'react-icons/tb'
import {Tooltip} from '../../../components/Tooltip'
import FileExplorer from './FileExplorer'
import Myfileicon from './assets/Myfileicon'
import FileIcon from "../../../assets/icons/common/FileIcon"
import Folderup from './assets/Folderup'
import fileicon from './assets/File.svg'
import { useSelector } from 'react-redux'
import { ExplorerNode } from './FileExplorer'
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
  fileNameResults: any[]
  groupedResults: Record<string, any>
  searchBoxRef: React.RefObject<HTMLDivElement>
  handleFileNameSearch: () => void
  clearSearch: () => void
  highlightWord: (text: string) => void
  renderHighlightedLine: (
    lineText: string,
    matchStart: number,
    matchLength: number
  ) => React.ReactNode
  renderHighlightedFileName:(fileName:string) => React.ReactNode
  navigate: any
  onAddNewFolder: () => void
  onAddNewFile:() => void
searchMode: 'content' | 'filename';
searchExecuted
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
  fileNameResults,
  groupedResults,
  searchBoxRef,
  clearSearch,
  highlightWord,
  renderHighlightedFileName,
  navigate,
  onAddNewFolder,
  onAddNewFile,
  handleFileNameSearch,
  searchMode,
  searchExecuted
}: MyFilesPanelProps) => {
    const themeMode = useSelector((state: any) => state.theme.mode);
  const exactMatches = fileNameResults.filter(
  (file: any) =>
    file.filename.toLowerCase() === searchText.trim().toLowerCase()
);
  return (
    <div className={`w-[250px] h-[450px] rounded-md overflow-hidden flex flex-col z-10 ${themeMode === "dark" ? "bg-black" : "bg-white" }`}>
      <div className="w-full h-[35px] shrink-0 flex items-center justify-between px-4 text-black font-bold mt-2">
        <div className="flex items-center gap-2">
          <Myfileicon  className={`w-5 h-5 ${themeMode === "dark" ? "text-white" : "text-black"}`} />
          <span className={`text-lg ${themeMode === "dark" ? "text-white" : "text-black"}`}>My Files</span>
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
            <MdSearch className={`w-5 h-5 font-bold  ${themeMode === "dark" ? "text-white" : "text-black"}`} />
          </button>
          <button onClick={onAddNewFile} className="group relative text-black">
            <Tooltip text="New File" />
            <FileIcon className={`inline-block w-5 h-5 ${themeMode === "dark"?"text-white": "text-black"}`} />
          </button>
          <button onClick={onAddNewFolder} className="group relative text-black">
            <Tooltip text="New Folder" />
            <TbFolderPlus className={`inline-block w-5 h-5 ${themeMode === "dark"?"text-white": "text-black"}`} />
          </button>
        
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 custom-scrollbar"
      >
        {isFileCreating && (
          <div className="flex mb-2">
          <img src={fileicon}  className="inline-block w-6 h-6 mr-2" />
            <input
              className={`bg-neutral-secondary-medium text-xs px-2 py-1 border rounded w-full focus:border-black focus:outline-none focus:ring-0 ${themeMode === "dark"?"border-white": "border-black"}`}
              autoFocus
              onBlur={() => setIsFileCreating(false)}
              onKeyDown={async e => {
                if (e.key !== 'Enter') return
              
                const isWritable =
                  selectedNode &&
                  selectedNode.sectionType === 'myFiles'
              
                await window.api.file.createCodeFile({
                  target: isWritable ? 'selection' : 'root',
              
                  selectionPath: isWritable
                    ? selectedNode?.path
                    : undefined,
              
                  selectionType: isWritable
                    ? selectedNode?.type
                    : undefined,
              
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
              className={`bg-neutral-secondary-medium text-xs px-2 py-1 border rounded w-full focus:border-black focus:outline-none focus:ring-0 ${themeMode === "dark"?"border-white": "border-black"}`}
              autoFocus
              onBlur={() => setIsFolderCreating(false)}
              onKeyDown={async e => {
                if (e.key !== 'Enter') return
              
                const isWritable =
                  selectedNode &&
                  selectedNode.sectionType === 'myFiles'
              
                await window.api.file.createCodeDir({
                  target: isWritable ? 'selection' : 'root',
              
                  selectionPath: isWritable
                    ? selectedNode?.path
                    : undefined,
              
                  selectionType: isWritable
                    ? selectedNode?.type
                    : undefined,
              
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
      className="flex flex-col gap-2"
    >
      {/* Search Bar */}
      <div className="flex gap-1 items-center">
        <input
          className="text-xs px-2 py-1 border rounded w-full"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleFileNameSearch();
            }
          }}
        />

        <button
  onClick={async () => {
    await handleFileNameSearch();
  }}
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

      {/* Exact Matches */}
      {exactMatches.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {exactMatches.map((file: any) => (
            <ExplorerNode
              key={file.filepath}
              node={{
                name: file.filename,
                path: file.filepath,
                type: "file",
              }}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              refresh={refresh}
              projectName={projectName}
              language="python"
              sectionType="myFiles"
              toggleStyle={false}
              triggerToast={() => {}}
            />
          ))}
        </ul>
      ) : (
        fileNameResults.length > 0 && (
          <div
            id="search-results"
            className="mb-2 pb-1"
          >
            {fileNameResults.map((file: any, index: number) => (
              <div
                key={index}
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
        )
      )}

{
  searchExecuted &&
  fileNameResults.length === 0 && (
    <div className="text-xs italic">
      No matches found
    </div>
  )
}
    </div>
  )}

  {!showSearchBox && (
    <FileExplorer
      data={fileTree}
      sectionType="myFiles"
      selectedNode={selectedNode}
      setSelectedNode={setSelectedNode}
      refresh={refresh}
      projectName={projectName}
      language="python"
    />
  )}

      </div>
    </div>
  )
}

export default React.memo(MyFilesPanel)