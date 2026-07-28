import React from 'react'
import Searchall from './Searchall'
import MyFilesPanel from './Myfilepanel'
import KitFilesPanel from './Kitfilepanel'
import LibraryPanel from './Librarypanel'
import ExamplePanel from './Examplepanel'

interface LeftSidebarPanelProps {
  leftPanel: string | null
  projects: any
  textColor: string

  selectedNode: any
  setSelectedNode: React.Dispatch<React.SetStateAction<any>>
  refresh: () => Promise<void>
  projectName: string

  fileTree: any
  libraries: any
  boardFiles: string[]
  examples: any
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

  handleGlobalSearch: (customPath?: string) => void
  clearSearch: () => void

  highlightWord: (text: string) => void
  renderHighlightedLine: (
    lineText: string,
    matchStart: number,
    matchLength: number
  ) => React.ReactNode

  navigate: any
  onAddNewFolder: () => void
  onAddNewFile: () => void
  handleDeleteClick: (file: string, e: React.MouseEvent<HTMLSpanElement>) => void
  onOpenBoardFile:(file: string) => void
}

const LeftSidebarPanel = ({
  leftPanel,
  projects,
  textColor,

  selectedNode,
  setSelectedNode,
  refresh,
  projectName,

  fileTree,
  libraries,
  boardFiles,
  examples,
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

  navigate,
  onAddNewFolder,
  onAddNewFile,
  handleDeleteClick,
  onOpenBoardFile
}: LeftSidebarPanelProps) => {
  if(leftPanel === 'Searchall'){
    return (     
      <Searchall
        searchText={searchText}
        setSearchText={setSearchText}
        handleGlobalSearch={handleGlobalSearch}
        searchResults={searchResults}
        groupedResults={groupedResults}
        highlightWord={highlightWord}
        renderHighlightedLine={renderHighlightedLine}
        navigate={navigate}
        clearSearch={clearSearch}
      />
    )
  }
  if (leftPanel === 'folder') {
    return (
      <div className={`${textColor} text-sm flex flex-col gap-2`}>
        <MyFilesPanel
          textColor={textColor}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          refresh={refresh}
          projectName={projectName}
          fileTree={fileTree}
          isFileCreating={isFileCreating}
          setIsFileCreating={setIsFileCreating}
          isFolderCreating={isFolderCreating}
          setIsFolderCreating={setIsFolderCreating}
          showSearchBox={showSearchBox}
          setShowSearchBox={setShowSearchBox}
          setShowFileSearch={setShowFileSearch}
          setFileSearchText={setFileSearchText}
          setFileResults={setFileResults}
          searchText={searchText}
          setSearchText={setSearchText}
          searchResults={searchResults}
          groupedResults={groupedResults}
          searchBoxRef={searchBoxRef}
          handleGlobalSearch={handleGlobalSearch}
          clearSearch={clearSearch}
          highlightWord={highlightWord}
          renderHighlightedLine={renderHighlightedLine}
          navigate={navigate}
          onAddNewFolder={onAddNewFolder}
          onAddNewFile={onAddNewFile}
        />

        <KitFilesPanel
          textColor={textColor}
          boardFiles={boardFiles}
          handleDeleteClick={handleDeleteClick}
          onOpenBoardFile={onOpenBoardFile}
        />
      </div>
    )
  }

  if (leftPanel === 'library') {
    return (
      <LibraryPanel
        libraries={libraries}
        projects={projects} 
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        refresh={refresh}
        projectName={projectName}
        searchText={searchText}
        setSearchText={setSearchText}
        handleGlobalSearch={handleGlobalSearch}
        searchResults={searchResults}
        groupedResults={groupedResults}
        highlightWord={highlightWord}
        renderHighlightedLine={renderHighlightedLine}
        navigate={navigate}
        clearSearch={clearSearch}
      />
    )
  }

  if (leftPanel === 'example') {
    return (
    <ExamplePanel
      examples={examples}
      projects={projects} 
      selectedNode={selectedNode}
      setSelectedNode={setSelectedNode}
      refresh={refresh}
      projectName={projectName}
      searchText={searchText}
      setSearchText={setSearchText}
      handleGlobalSearch={handleGlobalSearch}
      searchResults={searchResults}
      groupedResults={groupedResults}
      highlightWord={highlightWord}
      renderHighlightedLine={renderHighlightedLine}
      navigate={navigate}
      clearSearch={clearSearch}
    />
    )
  }

  return null
}

export default React.memo(LeftSidebarPanel)