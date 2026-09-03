import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import FolderIcon from '@renderer/assets/icons/common/FolderIcon'
import CppLogo from "@renderer/assets/icons/cplusplus/CppLogo"
import fileicon from './assets/File.svg'
import libicon from './assets/Libicon.svg'
import { Deletepythonfile, DeletionToast } from "../supporting/Popups"
import { useSelector } from 'react-redux'
import Folderup from './assets/Folderup'
import Folderdown from './assets/Folderdown'
import { IoMdAddCircleOutline } from "react-icons/io"
import { SlOptionsVertical } from "react-icons/sl"
import { createPortal } from "react-dom"
import WorkspaceFileService from "@/app/services/WorkspaceFileService"

const sortNodes = (nodes) => {
  return [...nodes].sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name)
    }
    return a.type === "file" ? -1 : 1
  })
}

type SectionType = "myFiles" | "library" | "example"
type FileSourceType = "user" | "library" | "example"

interface ExplorerNodeType {
  name: string
  path: string
  type: "file" | "folder"
  children?: ExplorerNodeType[]
  sourceType?: FileSourceType // only useful mainly for My Files
}

export default function FileExplorer({
  data,
  selectedNode,
  setSelectedNode,
  refresh,
  projectName,
  language,
  sectionType = "myFiles"
}) {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("Deleted Successfully")

  const handleTriggerToast = (message = "Deleted Successfully") => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <div>
      <ul className="gap-1 flex flex-col p-0 m-0">
        {sortNodes(data).map((node) => (
          <ExplorerNode
            key={node.path}
            node={node}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            refresh={refresh}
            projectName={projectName}
            toggleStyle={false}
            language={language}
            triggerToast={handleTriggerToast}
            sectionType={sectionType}
            isInsideOpenFolder={false}
          />
        ))}
      </ul>

      <DeletionToast
        show={showToast}
        message={toastMessage}
      />
    </div>
  )
}

function ExplorerNode({
  node,
  selectedNode,
  setSelectedNode,
  refresh,
  projectName,
  toggleStyle,
  language,
  triggerToast,
  sectionType,
  isInsideOpenFolder = false
}: {
  node: ExplorerNodeType
  selectedNode: any
  setSelectedNode: any
  refresh: () => void
  projectName: string
  toggleStyle: boolean
  language: string
  triggerToast: (message?: string) => void
  sectionType: SectionType
  isInsideOpenFolder?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState("")
  const renameInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const themeMode = useSelector((state: any) => state.theme.mode)
  
  const isSelected = selectedNode?.path === node.path
  const isReadOnlySection = sectionType === "library" || sectionType === "example"
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const newFileInputRef = useRef<HTMLInputElement | null>(null)
  
  useEffect(() => {
    if (isCreatingFile && newFileInputRef.current) {
      newFileInputRef.current.focus()
    }
  }, [isCreatingFile])
  // Focus + select text when rename mode activates
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus()
      // Select only the name part, not the extension
      const dotIndex = renameValue.lastIndexOf(".")
      renameInputRef.current.setSelectionRange(0, dotIndex > 0 ? dotIndex : renameValue.length)
    }
  }, [isRenaming])
  const portalMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      // ✅ ignore clicks inside the options button OR the portal menu
      if (
        optionsRef.current?.contains(target) ||
        portalMenuRef.current?.contains(target)
      ) return
      
      setShowOptions(false)
      setOptionsPos(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  const handleRenameStart = (e) => {
    e.stopPropagation()
    setRenameValue(node.name)
    setIsRenaming(true)
    setShowOptions(false)
  }

  const handleRenameCommit = async () => {
    if (!isRenaming) return
    setIsRenaming(false)

    const isFile = node.type === "file"
    const oldExt = node.name.includes(".") ? "." + node.name.split(".").pop() : ""
    let newName = renameValue.trim()

    if (!newName || newName === node.name) return

    // Preserve extension if user omitted it
    if (isFile && oldExt && !newName.endsWith(oldExt)) {
      newName += oldExt
    }

    const result = await WorkspaceFileService.rename(node.path, newName)
    if (result.success) {
      refresh()
    } else {
      console.error("Rename failed:", result.error)
      triggerToast(`Rename failed : ${result.error}`)
    }
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRenameCommit()
    } else if (e.key === "Escape") {
      setIsRenaming(false)
    }
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setFileToDelete(node.name)
    setIsModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      let res;
      if (node.type === "file") {
        res = await WorkspaceFileService.deleteFile(node.path);
      } else {
        res = await WorkspaceFileService.deleteFolder(node.path);
      }
      if (res.success) {
        setIsModalOpen(false)
        triggerToast("Deleted Successfully")
        refresh()
      } else {
        console.error(res.error)
      }
    } catch (err) {
      console.error(err)
    }
    setIsModalOpen(false)
  }

  const handleCancelDelete = () => setIsModalOpen(false)

  const handleAddFileToMyFiles = async (e) => {
    e.stopPropagation()
    if (node.type !== "file") return
    try {
      const res = await window.api.file.copyToMyFiles({
        sourcePath: node.path,
        fileName: node.name,
        language,
        sourceType: sectionType
      })
      if (res.success) {
        triggerToast(`${node.name} added to My Files`)
        refresh()
      } else {
        console.error(res.error)
      }
    } catch (err) {
      console.error(err)
    }
  }
  const handleDuplicateClick = async () => {
    const result = await WorkspaceFileService.createFile(node.path + '.copy')
    if (result.success) {
      refresh()
    } else {
      console.error('Duplicate failed:', result.error)
      triggerToast(`Duplicate failed: ${result.error || 'Unknown error'}`)
    }
  }
  const renderFileIcon = () => {
    if (node.type !== "file") return null
    if (sectionType === "library") {
      return <img src={libicon} alt="library-file" className="inline-block w-5 h-5 shrink-0" />
    }
    if (sectionType === "example") {
      return <img src={fileicon} alt="example-file" className="inline-block w-5 h-5 shrink-0" />
    }
    if (sectionType === "myFiles") {
      if (node.sourceType === "library") {
        return <img src={libicon} alt="library-copied-file" className="inline-block w-5 h-5 shrink-0" />
      }
      if (node.sourceType === "example") {
        return <img src={fileicon} alt="example-copied-file" className="inline-block w-5 h-5 shrink-0" />
      }
      if (language === "cpp") {
        return <CppLogo className="inline-block w-5 h-5 shrink-0" />
      }
      return <img src={fileicon} alt="user-file" className="inline-block w-5 h-5 shrink-0" />
    }
    return <img src={fileicon} alt="file" className="inline-block w-5 h-5 shrink-0" />
  }
  const handleNewFileCommit = async () => {
    if (!isCreatingFile) return
    setIsCreatingFile(false)

    const trimmed = newFileName.trim()
    if (!trimmed) return

    const ext = language === 'cpp' ? '.cpp' : '.py'
    const finalName = trimmed.endsWith(ext) ? trimmed : `${trimmed}${ext}`
    const filePath = node.path ? `${node.path}/${finalName}` : finalName
    const result = await WorkspaceFileService.createFile(filePath)
    if (result.success) {
      refresh()
    } else {
      triggerToast(`Failed to create file: ${result.error}`)
    }
  }
  
  const handleNewFileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleNewFileCommit()
    else if (e.key === 'Escape') {
      setIsCreatingFile(false)
      setNewFileName("")
    }
  }
  const [showOptions, setShowOptions] = useState(false)
  const optionsRef = useRef<HTMLDivElement | null>(null)


  const fileMenuItems = [
    { label: "Rename", action: handleRenameStart },
    { label: "Duplicate", action: handleDuplicateClick },
    { label: "Delete", action: handleDeleteClick, danger: true }
  ]

  const folderMenuItems = [
    { label: "Rename", action: handleRenameStart },
    { label: "Add file",     action: (e) => {
      e.stopPropagation()
      setOpen(true)          // ✅ open folder so children are visible
      setIsCreatingFile(true)
      setNewFileName(`untitled.${language === 'cpp' ? 'cpp' : 'py'}`)
      setShowOptions(false)
    }
 },
    { label: "Duplicate", action: handleDuplicateClick },
    { label: "Delete", action: handleDeleteClick, danger: true }
  ]

  const menuItems = node.type === "folder" ? folderMenuItems : fileMenuItems
  const isOpenFolder = node.type === "folder" && open
  const [optionsPos, setOptionsPos] = useState<{ x: number; y: number } | null>(null)
  const optionsBtnRef = useRef<HTMLButtonElement | null>(null)
  const rowBgClass =
    isRenaming
      ? language === "python"
        ? "bg-[#561DBC] text-white ring-2 ring-yellow-300"
        : "bg-red-200 dark:bg-red-800 text-black dark:text-white ring-2 ring-yellow-300"
      : isOpenFolder
        ? "bg-[#722CF0] text-white"
        : isInsideOpenFolder
          ? "bg-[#EAEAEA] dark:bg-[#000000] text-black dark:text-white"
          : isSelected
            ? language === "python"
              ? "bg-[#722CF0] dark:bg-[#561DBC] text-white dark:text-white"
              : "bg-red-300 dark:bg-red-700 text-black dark:text-white"
            : language === "python"
              ? "bg-[#722CF0] dark:bg-[#561DBC] text-white dark:text-purple-100"
              : "bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800 text-black dark:text-red-100"

  return (
    <li className="list-none">
      <div
        style={toggleStyle ? { paddingLeft: 5 } : undefined}
        className={isOpenFolder ? "bg-[#722CF0] rounded-md p-1" : ""}
      >
        {/* Row */}
        <div
          onClick={() => {
            if (isRenaming) return
            setSelectedNode({ path: node.path, type: node.type })
            if (node.type === "folder") {
              setOpen((o) => !o)
            } else {
              const params = new URLSearchParams()
              params.set("filePath", node.path)
              params.set("fileName", node.name)
              params.set("isReadOnly", String(isReadOnlySection))
              params.set("sourceType", node.sourceType || sectionType)
              router.push(`/${language}?${params.toString()}`)
            }
          }}
          className={`
            h-9 px-2 rounded flex items-center justify-between cursor-pointer group
            ${node.name === projectName ? "font-semibold" : ""}
            ${rowBgClass}
          `}
        >
          {/* LEFT SIDE */}
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            {node.type === "folder" && (
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {open ? (
                  <Folderdown className="w-6 h-6 shrink-0 -ml-[1px]" />
                ) : (
                  <Folderup className="w-5 h-5 shrink-0" />
                )}
              </div>
            )}

            {renderFileIcon()}

            {isRenaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameCommit}
                onKeyDown={handleRenameKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 min-w-0 bg-white dark:bg-zinc-800 text-black dark:text-white
                  text-sm px-1.5 py-0.5 rounded border-2 border-yellow-300 outline-none
                  font-normal truncate"
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>

          {/* RIGHT SIDE */}
          {!isRenaming && (
            <div className="relative" ref={optionsRef}>
              {isReadOnlySection ? (
                node.type === "file" && (           
                  <button
                    onClick={handleAddFileToMyFiles}
                    className="p-1 rounded hover:bg-white/20 transition"
                    title={`Add ${node.name} to My Files`}
                  >
                    <IoMdAddCircleOutline className="text-black dark:text-white w-5 h-5 shrink-0" />
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (showOptions) {
                        setShowOptions(false)
                        setOptionsPos(null)
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setOptionsPos({
                          x: rect.right,
                          y: rect.bottom + 4
                        })
                        setShowOptions(true)
                      }
                    }}
                  
                    className="p-1 rounded hover:bg-white/20 transition"
                  >
                    <SlOptionsVertical className="text-white w-4 h-4 shrink-0" />
                  </button>

                </>
              )}
            </div>
          )}
        </div>
{showOptions && optionsPos && createPortal(
  <div
  ref={portalMenuRef}  
    className="fixed w-36 rounded-md shadow-lg z-[99999] overflow-hidden bg-[#FFDE21]"
    style={{
      top: optionsPos.y,
      left: optionsPos.x - 144,
    }}
    onClick={(e) => e.stopPropagation()}
  >
    {menuItems.map((item) => (
      <button
        key={item.label}
        onClick={(e) => {
          e.stopPropagation()
          item.action(e)
          setShowOptions(false)
          setOptionsPos(null)
        }}
        className="w-full text-left px-1 py-1"
      >
        <div
          className={`rounded px-3 py-2 text-sm transition
            ${item.danger
              ? "text-black hover:bg-[#FF4945] hover:text-white"
              : "text-black hover:bg-white"
            }`}
        >
          {item.label}
        </div>
      </button>
    ))}
  </div>,
  document.body
)}
        {/* CHILDREN */}
        {node.type === "folder" && open && (
  <ul className="pl-3 mt-1 flex flex-col gap-1 rounded-md p-1 bg-[#722CF0]">
    
    {/* ✅ New file input row — appears at top of folder */}
    {isCreatingFile && (
      <li className="list-none">
        <div className="h-9 px-2 rounded flex items-center gap-2 bg-[#561DBC] ring-2 ring-yellow-300">
          {/* file icon */}
          <img src={fileicon} alt="new-file" className="inline-block w-5 h-5 shrink-0" />
          <input
            ref={newFileInputRef}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={handleNewFileCommit}
            onKeyDown={handleNewFileKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 bg-white dark:bg-zinc-800 text-black dark:text-white
              text-sm px-1.5 py-0.5 rounded border-2 border-yellow-300 outline-none
              font-normal truncate"
          />
        </div>
      </li>
    )}

    {/* existing children */}
    {node.children && sortNodes(node.children).map((child) => (
      <ExplorerNode
        key={child.path}
        node={child}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        refresh={refresh}
        projectName={projectName}
        toggleStyle={true}
        language={language}
        triggerToast={triggerToast}
        sectionType={sectionType}
        isInsideOpenFolder={true}
      />
    ))}
  </ul>
)}
      </div>

      {/* DELETE MODAL */}
      <Deletepythonfile
        open={isModalOpen}
        title="Delete File"
        message={`Are you sure you want to permanently delete the saved "${fileToDelete}" from the controller?`}
        onYes={handleConfirmDelete}
        onNo={handleCancelDelete}
      />
    </li>
  )
}