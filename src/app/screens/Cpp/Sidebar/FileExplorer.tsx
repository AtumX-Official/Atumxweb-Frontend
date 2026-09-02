import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import PythonLogo from '../../../assets/icons/python/PythonLogo'
import { Deletepythonfile, DeletionToast } from "../../../components/supporting/Popups"
import { SlOptionsVertical } from "react-icons/sl"
import { createPortal } from "react-dom"
import Folderup from '../../../components/ui/assets/Folderup'
import Folderdown from '../../../components/ui/assets/Folderdown'
import File from '../../../components/ui/assets/File'
import { useSelector } from 'react-redux'

interface FileNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: FileNode[]
}

interface SelectedNode {
  path: string
  type: "file" | "folder"
}

interface FileExplorerProps {
  data: FileNode[]
  selectedNode: SelectedNode | null
  setSelectedNode: React.Dispatch<React.SetStateAction<SelectedNode | null>>
  refresh: () => void | Promise<void>
  projectName: string
  language: string
  isExample?: boolean
}


interface MenuItem {
  label: string
  danger?: boolean
  action: (e?: React.MouseEvent) => void
}

interface ExplorerNodeProps {
  node: FileNode
  selectedNode: SelectedNode | null
  setSelectedNode: React.Dispatch<React.SetStateAction<SelectedNode | null>>
  refresh: () => void | Promise<void>
  projectName: string
  toggleStyle: boolean
  language: string
  triggerToast: () => void
  isExample: boolean
  isInsideOpenFolder: boolean
}

// HIDDEN
const hiddenFolders = [".pio", "boards", "lib"];
const hiddenFiles = ["TrixL.csv", "platformio.ini","installed-libraries.json"];

// PROTECTED
const nonRenamableFiles = ["main.cpp"];
const nonRenamableFolders = ["src", "include"];
const nonDeletableFolders = ["src", "include"];

const shouldHideNode = (node: FileNode): boolean => {
  if (node.type === "folder") return hiddenFolders.includes(node.name);
  if (node.type === "file") return hiddenFiles.includes(node.name);
  return false;
};

const isRenamable = (node: FileNode): boolean => {
  if (node.type === "file") return !nonRenamableFiles.includes(node.name);
  if (node.type === "folder") return !nonRenamableFolders.includes(node.name);
  return false;
};

const isDeletable = (node: FileNode): boolean => {
  if (node.type === "folder") return !nonDeletableFolders.includes(node.name);
  return true;
};

const sortNodes = (nodes : FileNode[]): FileNode[] => {
  return [...nodes].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "folder" ? -1 : 1;
  });
};

export default function FileExplorer({
  data,
  selectedNode,
  setSelectedNode,
  refresh,
  projectName,
  language,
  isExample = false,
} : FileExplorerProps) {
  const [showToast, setShowToast] = useState(false);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div>
      <ul className="pl-4 mt-1 flex flex-col gap-1">
        {sortNodes(data)
          .filter((node: FileNode) => !shouldHideNode(node))
          .map((node: FileNode) => (
            <ExplorerNode
              key={node.path}
              node={node}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              refresh={refresh}
              projectName={projectName}
              toggleStyle={false}
              language={language}
              triggerToast={triggerToast}
              isExample={isExample}
              isInsideOpenFolder={false}
            />
          ))}
      </ul>

      <DeletionToast show={showToast} message="Deleted Successfully" />
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
  isExample,
  isInsideOpenFolder
} : ExplorerNodeProps) {
  const [open, setOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState("")

  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(node.name)
  const themeMode = useSelector((state: any) => state.theme.mode)

  const navigate = useNavigate()
  const isSelected = selectedNode?.path === node.path
  const [showOptions, setShowOptions] = useState(false)
  const [optionsPos, setOptionsPos] = useState<{ x: number; y: number } | null>(null)
  const portalMenuRef = useRef<HTMLDivElement | null>(null)
  
  if (shouldHideNode(node)) return null;
  useEffect(() => {
    const handleClickOutside = (e : MouseEvent) => {
      if (portalMenuRef.current && !portalMenuRef.current.contains(e.target as Node)) {
        setShowOptions(false)
        setOptionsPos(null)
      }
    }
  
    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside)
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showOptions])
  const isMainCpp = node.type === "file" && node.name === "main.cpp"

const menuItems = [
  // ✅ Rename for folders + files except protected ones
  ...(isRenamable(node)
    ? [
        {
          label: "Rename",
          action: () => {
            setNewName(node.name)
            setIsEditing(true)
          }
        }
      ]
    : []),

  // ✅ Delete ONLY for files (except main.cpp because it has no menu)
  ...(node.type === "file" && !isExample && !isMainCpp
    ? [
        {
          label: "Delete",
          danger: true,
          action: (e : React.MouseEvent) => handleDeleteClick(e)
        }
      ]
    : [])
]
  // DELETE CLICK
  const handleDeleteClick = (e : React.MouseEvent) => {
    e.stopPropagation()
    setFileToDelete(node.name)
    setIsModalOpen(true)
  }
  const handleCancelDelete = () => setIsModalOpen(false)

  // CONFIRM DELETE
  const handleConfirmDelete = async () => {
    try {
      let res;

      if (node.type === "file") {
        res = await window.api.file.delete(node.path)
      } else {
        res = await window.api.file.deleteDir(node.path)
      }

      if (res.success) {
        triggerToast()
        refresh()
      } else {
        alert(res.error)
      }
    } catch (err) {
      console.error(err)
    }

    setIsModalOpen(false)
  }

  // RENAME
  const handleRename = async () => {
    if (!isRenamable(node)) {
      setIsEditing(false)
      return
    }

    if (!newName || newName === node.name) {
      setIsEditing(false)
      return
    }

    try {
      const res = await window.api.file.rename({
        oldPath: node.path,
        newName
      })

      if (res.success) {
        refresh()
      } else {
        alert(res.error)
      }
    } catch (err) {
      console.error(err)
    }

    setIsEditing(false)
  }
  const isDark = themeMode === "dark"

  const rowBgClass =
    isEditing
      ? `${isDark ? "bg-[#2195FF]" : "bg-[#2195FF]"} text-white ring-2 ring-yellow-300`
  
      : open
        ? `${isDark ? "bg-[#2195FF]" : "bg-[#2195FF]"} text-white`
  
      : isInsideOpenFolder
        ? `${isDark ? "bg-[#000000] text-white" : "bg-[#EAEAEA] text-black"}`
  
      : `${isDark
          ? "bg-[#2195FF] text-white"
          : "bg-[#2195FF] text-white"
        }`
  return (
    <li className="list-none">
     <div style={toggleStyle ? { paddingLeft: 5 } : undefined} className={ open ? "bg-[#2195FF] rounded-md p-1": ""}>
        {/* ROW */}
        <div
          onClick={() => {
            if (isEditing) return

            setSelectedNode({ path: node.path, type: node.type })

            if (node.type === "folder") {
              setOpen(o => !o)
            } else {
              navigate(`/${language}`, {
                state: { filePath: node.path, fileName: node.name }
              })
            }
          }}
          className={`
            h-9 px-2 rounded flex items-center justify-between cursor-pointer group
            ${node.name === projectName ? "font-semibold" : ""}
            ${rowBgClass}
          `}
        >

          {/* LEFT */}
          <div className="flex items-center gap-2">

            {node.type === "folder" && ( open
                ? <Folderdown className="w-4 h-4" />
                : <Folderup className="w-4 h-4" />
            )}

            {node.type === "file" && (
              language === "python"
                ? <PythonLogo className="w-4 h-4" />
                : <File className="w-4 h-4" />
            )}

            {/* NAME / INPUT */}
            {isEditing ? (
              <input
                value={newName}
                autoFocus
                onFocus={(e) => e.target.select()}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename()
                  if (e.key === "Escape") {
                    setIsEditing(false)
                    setNewName(node.name)
                  }
                }}
                className="bg-transparent border-b border-gray-400 outline-none text-sm"
              />
            ) : (
              <span>{node.name}</span>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            {menuItems.length > 0 && (
              <button
              className="text-white hover:text-white/80 transition"
                onClick={(e) => {
                  e.stopPropagation()
                  const rect = e.currentTarget.getBoundingClientRect()

                  setOptionsPos({
                    x: rect.right,
                    y: rect.bottom + 4
                  })
                  setShowOptions((prev) => !prev)
                }}
              >
                {/* <SlOptionsVertical size={14} 
                  color={isInsideOpenFolder ? open 
                      ? "text-white" : "text-black dark:text-white" 
                    : "text-white"} /> */}
                      <SlOptionsVertical
                        className={`w-4 h-4 shrink-0 ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      />
              </button>
            )}
          </div>
        </div>

        {/* CHILDREN */}
        {node.type === "folder" && open && node.children && (
          <ul className="pl-4 mt-1 flex flex-col gap-1">
            {sortNodes(node.children)
              .filter(child => !shouldHideNode(child))
              .map(child => (
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
                  isExample={isExample}
                  isInsideOpenFolder={true}
                />
              ))}
          </ul>
        )}
      </div>

      {/* DELETE MODAL */}
     

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
          <Deletepythonfile
            open={isModalOpen}
            title="Delete File"
            message={`Are you sure you want to permanently delete the saved "${fileToDelete}" ?`}
            onYes={handleConfirmDelete}
            onNo={handleCancelDelete}
          />
    </li>
  )
}
