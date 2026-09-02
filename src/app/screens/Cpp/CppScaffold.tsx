'use client'

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useRouter } from 'next/navigation'
import '../../assets/css/scrollbar.css'
import BookIcon from './icons/common/BookIcon'
import DownloadIcon from './icons/common/DownloadIcon'
import EditIcon from './icons/common/EditIcon'
import SaveIcon from './icons/common/SaveIcon'
import Settings from './icons/common/Settings'
import LibraryIcon from './icons/common/LibraryIcon'
import SearchIcon from './icons/common/SearchIcon'
import TerminalIcon from './icons/common/TerminalIcon'
import FolderIcon from './icons/common/FolderIcon'
import FontIncreaseIcon from '../../assets/icons/common/FontIncreaseIcon'
import FontDecreaseIcon from '../../assets/icons/common/FontDecreaseIcon'
import CppLogo from '../../assets/icons/cplusplus/CppLogo'
import { TbFolderPlus } from 'react-icons/tb'
import FileIcon from "./icons/common/FileIcon"
import Folderup from '../../components/ui/assets/Folderup'
import File from '../../components/ui/assets/File'
import { IoReloadOutline } from 'react-icons/io5'
import ChatPanel from './ChatPanel'
import SettingModal from '../../components/supporting/SettingModal'
import ArrowIcon from "./icons/ArrowIcon";
import Swal from "sweetalert2";
import { IoTerminal } from "react-icons/io5";
import { FiX } from "react-icons/fi";
import { Tooltip } from '../../components/Tooltip'
import Header from '../../components/Header'
import FileExplorer from './Sidebar/FileExplorer'
import { CopyToast } from '../../components/supporting/Popups'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../../../store'
import { setPath } from "../../../../store/projectSlice";
import LibraryBrowser from './Sidebar/Library/LibraryBrowser'
import Terminal from './Sidebar/Terminal'
import GlobalSearch from './Sidebar/GlobalSearch'
import FileSearch from './Sidebar/FileSearch'
import { DeletionToast } from "../../components/supporting/Popups"
import Backicon from "../../assets/icons/common/Backicon"
import BackgroundImg from "../../assets/Background.svg?url"
import SerialMonitor from './Sidebar/SerialMonitor'
import {
  PressBootResetPopup,
  Savetokitpop,
} from '../../components/supporting/Popups'
import { browserWorkspace } from './browserWorkspace'
import serialService from '../../services/Serialservice'
import Savedtokit from '../../assets/icons/common/Savetokit'
import { SaveToKitPopup } from '../Elements/SavetokitPopup'


interface Project {
  created: string
  filepath: string
  filename: string
}

interface Example {
  filepath: string
  filename: string
}

// Imperative handle the Cpp page uses after AI generation to surface the (possibly
// freshly-created) project in the Folder view — which is otherwise hidden until a
// manual re-open.
export interface CppScaffoldHandle {
  refresh: () => void
  revealProject: () => void
}

interface CppScaffoldProps {
  setIsChangeHappens: (val: boolean) => void
  unsavedChanges: boolean
  projectName: string
  setProjectName: (name: string) => void
  children?: React.ReactNode
  fontFn: (size: string) => void
  onRun: () => void
  output: any
  onSave: (mode: "save" | "saveAs") => void | Promise<boolean>
  onImport: () => void
  onNewFile: (name?: string) => void
  serialData: string
  onSerialData: (data: string) => void
  onClear: () => void
  selectedkit: string
  chatOpen: boolean
  onToggleChat: () => void
  ports: Array<string>
  setPorts: (ports: string[]) => void
  onCodeGenerated: (
    files: { path: string; content: string }[],
    suggestedName?: string,
    libDeps?: string[],
    opts?: { verify?: boolean; prompt?: string; editInPlace?: boolean },
  ) => Promise<{ compiled?: boolean; verified?: boolean } | void>
  buildError: string
  hasOpenCode: boolean
  getEditContext: () => Promise<string | undefined>
  onFixBuild: () => Promise<{ ok: boolean; error?: string }>
  activeTabName?: string
  onAppendOutput?: (text: string, type?: 'out' | 'err') => void
  onOpenProject?: () => void
  onOpenWorkspaceFile?: (path: string, name: string) => Promise<void>
}

const CppScaffold = forwardRef<CppScaffoldHandle, CppScaffoldProps>(function CppScaffold({
  ports,
  setPorts,
  unsavedChanges,
  projectName,
  setProjectName,
  children,
  fontFn,
  onRun,
  output,
  onSave,
  onImport,
  onNewFile,
  serialData,
  onSerialData,
  onClear,
  selectedkit,
  chatOpen,
  onToggleChat,
  onCodeGenerated,
  buildError,
  hasOpenCode,
  getEditContext,
  onFixBuild,
  onOpenProject,
  onOpenWorkspaceFile,
  activeTabName,
  onAppendOutput
}, ref) {
  const router = useRouter()
  const dispatch = useDispatch()
  const [showSettings, setShowSettings] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [terminalPath, setTerminalPath] = useState('')
  const [rootFolder, setRootFolder] = useState('')

  const [isImported, setIsImported] = useState(false);

  const [runStatus, setRunStatus] = useState<'running' | 'stopped'>('stopped')

  //Global Search
  const [searchText, setSearchText] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const [examples, setExamples] = useState<Example[]>([])
  const [leftPanel, setLeftPanel] = useState<null | 'folder' | 'library' | 'example' | 'search' | 'filesearch'>(() => {
    return typeof window === 'undefined' ? null : window.localStorage.getItem('cpp_leftPanel') as 'folder' | 'library' | 'search' | 'filesearch' | 'example' | null
  })
  const [showTerminal, setShowTerminal] = useState(() => {
    return typeof window !== 'undefined' && window.localStorage.getItem('cpp_showTerminal') === 'true'
  })
  const [showSerialTerminal, setShowSerialTerminal] = useState(() => {
    return typeof window !== 'undefined' && window.localStorage.getItem('cpp_showSerialTerminal') === 'true'
  })
  const [terminalHeight, setTerminalHeight] = useState(300)
  const isDragging = useRef(false)

  // Sidebar resize
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const isResizingSidebar = useRef(false)

  const settingsRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  //unsaved file search feature
  const searchInUnsavedEditor = (query: string) => {

    //console.log("Monaco:", window.monacoEditor);

    if (!window.monacoEditor || !query) return [];

    const model = window.monacoEditor.getModel();
    if (!model) return [];

    const matches = model.findMatches(
      query,
      true,
      false,
      false,
      null,
      true
    );

    return matches.map(m => {
      const lineContent = model.getLineContent(m.range.startLineNumber);

      return {
        fileName: "*Unsaved File",
        filePath: "__unsaved__",
        lineNumber: m.range.startLineNumber,
        lineText: lineContent,
        matchStart: m.range.startColumn - 1,
        matchLength: query.length
      };
    }
    );
  };
  const themeMode = useSelector((state: any) => state.theme.mode)
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const bgColor = themeMode === 'dark' ? 'bg-[#000000]' : 'bg-[#D6D6D6]'
  const bgtext = themeMode === 'dark' ? 'text-white' : 'text-black'
  const hoverbg = themeMode === 'dark' ? 'bg-[#3A3A3A]' : 'bg-[#F0F0F0]'
  const clickbg = themeMode === 'dark' ? 'bg-[#29CB09]' : 'bg-[#2EED08]'
  const [showResetandBootpopup, setShowResetandBootpopup] = useState(false)
  // Save to Kit — mirrors the Python editor's modal + success toast flow.
  const [showSaveToKitPopup, setShowSaveToKitPopup] = useState(false)
  const [showSavetokitpop, setShowSavetokitpop] = useState(false)
  const menuItemClass = (item: string) =>
    `flex items-center px-2 py-1 rounded-md cursor-pointer transition-colors
     ${activeItem === item
      ? `${clickbg} ${bgtext} ml-2 mr-2 mt-1 mb-1 font-bold`
      : `hover:${hoverbg} ${bgtext} ml-2 mr-2 mt-1 mb-1 font-bold`
    }`;
    // New Project: open a centered "Create New Project" modal so the user picks a
  // name before we create anything. The project is only created once a valid
  // name is entered — we never create an untitled project immediately.
  const onNewProject = () => {
    setNewProjectName("")
    setShowNewProjectModal(true)
  }

  const handleCloseProjectModal = () => {
    setShowNewProjectModal(false)
    setNewProjectName("")
  }

  const handleCreateProject = () => {
    const trimmed = newProjectName.trim()
    if (!trimmed) return

    setIsImported(true)
    setProjectName(trimmed)
    setRootFolder(trimmed)
    setTerminalPath('')
    setFileTree([])
    onOpenProject?.()
    onNewFile(trimmed)
    setShowNewProjectModal(false)
  }

  // Save to Kit handler — reuses the Python editor's exact browser flow:
  // report the (currently browser-unsupported) operation to the terminal and
  // show the green "SAVED TO KIT" success toast.
  const handleSaveToKit = (filename: string) => {
    console.log('File name front : ', filename)
    onAppendOutput?.(`> Save to kit is not available in the browser yet: ${filename}\n`, 'err')
    setShowSavetokitpop(true)
    setTimeout(() => setShowSavetokitpop(false), 2500)
  }

  const handleImport = async () => {
    // onOpenFolder now reports back whether a folder was actually picked, so
    // pressing Cancel on the OS dialog no longer toggles isImported and
    // doesn't make the loaded tree disappear.
    const picked = await onOpenFolder()
    if (picked) setIsImported(true)
  }

  const onOpenFolder = async (): Promise<boolean> => {
    try {
      const res = await browserWorkspace.openProject()
      onOpenProject?.()
      setLeftPanel('folder')
      window.localStorage.setItem('cpp_leftPanel', 'folder')
      setFileTree(res.tree)
      setTerminalPath(res.rootName)
      setProjectName(res.rootName)
      setRootFolder(res.rootName)
      router.push('/cpp')
      return true
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') console.error('Could not open project:', error)
      return false
    }
  };

  const handleGlobalSearch = async () => {
    if (!searchText.trim()) return

    setSearchResults([])

    const folderPath = terminalPath

    // unsaved editor search
    const unsavedResults = unsavedChanges
      ? searchInUnsavedEditor(searchText)
      : [];

    if (!browserWorkspace.hasProject()) return setSearchResults(unsavedResults)
    try { setSearchResults([...unsavedResults, ...(await browserWorkspace.search(searchText))]) }
    catch (error) { console.error('Project search failed:', error); setSearchResults(unsavedResults) }
  }

  function renderHighlightedLine(
    text: string,
    start: number,
    length: number
  ) {
    if (start === -1 || start == null) return text;

    return (
      <>
        {text.slice(0, start)}
        <span className="bg-yellow-300 text-black font-semibold ">
          {text.slice(start, start + length)}
        </span>
        {text.slice(start + length)}
      </>
    );
  }

  const [fileTree, setFileTree] = useState<any[]>([])
  const [selectedNode, setSelectedNode] = useState<{
    path: string
    type: "file" | "folder"
  } | null>(null)

  const [isFileCreating, setIsFileCreating] = useState(false)
  const [isFolderCreating, setIsFolderCreating] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [isSwitchingOta, setIsSwitchingOta] = useState(false);
  const selectedPort = useSelector((state: RootState) => state.comPort.selectedComPort);
  const [activeTab, setActiveTab] = useState<'terminal' | 'errors'>('terminal')
  const toggleLeftPanel = (panel: 'folder' | 'library' | 'example' | 'search' | 'filesearch') => {
    setLeftPanel((prev) => {
      const newState = prev === panel ? null : panel
      window.localStorage.setItem('cpp_leftPanel', newState ?? '')
      return newState
    })
  }

  const toggleTerminal = (tab: 'terminal' | 'errors') => {
    setActiveTab(tab);
  
    const shouldOpen = !showTerminal || activeTab !== tab;
  
    setShowTerminal(shouldOpen);
  
    if (shouldOpen) {
      setShowSerialTerminal(false);
      setTerminalHeight(300);
    }
  
    window.localStorage.setItem('cpp_showTerminal', String(shouldOpen));
    window.localStorage.setItem('cpp_showSerialTerminal', 'false');
  };
  
  const toggleSerial = () => {
    const shouldOpen = !showSerialTerminal;
  
    setShowSerialTerminal(shouldOpen);
  
    if (shouldOpen) {
      setShowTerminal(false);
      setTerminalHeight(300);
    }
  
    window.localStorage.setItem('cpp_showSerialTerminal', String(shouldOpen));
    window.localStorage.setItem('cpp_showTerminal', 'false');
  };
  const handleMouseDown = () => {
    isDragging.current = true
  }

  const handleSidebarMouseDown = () => {
    isResizingSidebar.current = true
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return
    const newHeight = window.innerHeight - e.clientY
    if (newHeight < 50) {
      setShowTerminal(false)
      window.localStorage.setItem('cpp_showTerminal', 'false')
      isDragging.current = false
    } else {
      setTerminalHeight(Math.min(newHeight, 500))
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const decorationIdsRef = useRef<string[]>([]);

  function highlightWord(word: string) {
    if (!window.monacoEditor) return;

    const model = window.monacoEditor.getModel();
    if (!model) return;

    const matches = model.findMatches(word, true, false, false, null, true);

    const decorations = matches.map(match => ({
      range: match.range,
      options: { inlineClassName: "myHighlight" }
    }));

    decorationIdsRef.current = window.monacoEditor.deltaDecorations(
      decorationIdsRef.current,
      decorations
    );
  }

  function clearEditorHighlights() {
    if (!window.monacoEditor) return;

    decorationIdsRef.current = window.monacoEditor.deltaDecorations(
      decorationIdsRef.current,
      []
    );
  }

  const onAddNewFile = () => {
    setIsFileCreating(true)
  }

  const onAddNewFolder = () => {
    setIsFolderCreating(true)
  }

  const refresh = async () => {
    const res = await browserWorkspace.refresh()
    setFileTree(res.tree)
    setTerminalPath(res.rootName)
    setProjectName(res.rootName)
    setRootFolder(res.rootName)
  }

  // Let the Cpp page drive the Folder view after AI generation: open the panel, mark a
  // project as imported (so the tree renders, not the "Import project!" placeholder), and
  // reload the directory listing — which now points at the freshly-created project because
  // create-new-project updated the main process's SELECTED_FOLDER_PATH_CPP.
  useImperativeHandle(ref, () => ({
    refresh,
    revealProject: () => {
      setLeftPanel('folder')
      window.localStorage.setItem('cpp_leftPanel', 'folder')
      setIsImported(true)
      refresh()
    },
  }))

  const clearSearch = () => {
    setSearchText("");
    setSearchResults([]);
    clearEditorHighlights();

    // remove highlights from editor
    window.monacoEditor?.deltaDecorations([], []);

    // remove saved search state (prevents reopening after navigation)
    sessionStorage.removeItem("cpp_searchText");
    sessionStorage.removeItem("cpp_searchOpen");
  };

  useEffect(() => {
    const savedSearch = sessionStorage.getItem("cpp_searchText");
    const shouldOpen = sessionStorage.getItem("cpp_searchOpen");

    if (savedSearch && shouldOpen === "true") {
      setSearchText(savedSearch);

      // run search again so matches appear
      setTimeout(() => handleGlobalSearch(), 200);
    }
  }, []);

  useEffect(() => {
    if (!searchText.trim()) {
      clearEditorHighlights();

    }
  }, [searchText]);

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizingSidebar.current) return

      const newWidth = Math.min(Math.max(e.clientX, 180), 400)
      setSidebarWidth(newWidth)
    }

    const handleResizeUp = () => {
      isResizingSidebar.current = false
    }

    window.addEventListener('mousemove', handleResizeMove)
    window.addEventListener('mouseup', handleResizeUp)

    return () => {
      window.removeEventListener('mousemove', handleResizeMove)
      window.removeEventListener('mouseup', handleResizeUp)
    }
  }, [])

  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      clearEditorHighlights();
      return;
    }

    const delay = setTimeout(() => {
      handleGlobalSearch();
    }, 300);

    return () => clearTimeout(delay);
  }, [searchText]);


  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        toggleTerminal('terminal')
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        toggleLeftPanel('folder')
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        toggleLeftPanel('library')
      }
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        onSave('save')
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        onImport()
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        onNewFile()
      }
      if (e.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false)
        } else if (leftPanel) {
          setLeftPanel(null)
        } else if (showTerminal) {
          setShowTerminal(false)
        }
      }
      if (e.key === 'F5') {
        e.preventDefault()
        setShowTerminal(true)
        window.localStorage.setItem('cpp_showTerminal', 'true')
        onRun()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSave, onImport, onNewFile, onRun, leftPanel, showSettings, showTerminal])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettings])

  useEffect(() => {
    // Browser build: the project list lives in browserWorkspace / FileExplorer,
    // so there is nothing to fetch here (the old Electron window.api.file.fetchAll
    // call was removed with it). Keep the list cleared.
    const fetchAllProjects = async () => {
      setProjects([])
    }
    fetchAllProjects()
  }, [onSave, onImport, onNewFile])

  // Fetch example files
  useEffect(() => {
    // Browser build: examples are opened via browserWorkspace (see the left
    // panel's example list) — nothing to fetch from a native API here.
    const fetchExamples = async () => {
      setExamples([])
    }
    fetchExamples()
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])
  const handleCopy = () => {
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 1200);
  };

  const connectAuthorizedCppBoard = async (port?: SerialPort) => {
    try {
      if (port) {
        await serialService.connectPort(port);
      } else {
        const board = await serialService.detectBoardMode();

        if (!board?.port) {
          console.warn("No board found to connect for C++ mode");
          return;
        }

        await serialService.connectPort(board.port);
      }

      // Put the board on the C++ runtime (no-op when it already is — the mode
      // is owned by SerialService.switchToMode, so we never send 'cswitch'
      // twice).
      await serialService.switchToMode("Cpp Mode");
      console.log("[Cpp] Board connected, C++ runtime ensured");
    } catch (error) {
      console.warn("Could not connect the board for C++ mode:", error);
    }
  };

  useEffect(() => {
    const handleSerial = async () => {
      try {
        if (showSerialTerminal) {
          const board = await serialService.detectBoardMode();

          if (board?.port) {
            await serialService.connectPort(board.port);
            // Keep the board on the C++ runtime so the serial monitor talks to
            // the right firmware (no-op when it already is).
            await serialService.switchToMode("Cpp Mode");
          } else {
            console.warn("No board port found");
          }
        } else {
          await serialService.disconnect();
        }
      } catch (err) {
        console.error("Serial error:", err);
      }
    };

    void handleSerial();

    return () => {
      void serialService.disconnect();
    };
  }, [showSerialTerminal]);

  useEffect(() => {
    // Mid-session plug-in: quietly ensure the freshly-connected board is on the
    // C++ runtime. switchToMode() no-ops when nothing needs to change.
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      return;
    }

    const serial = navigator.serial as unknown as EventTarget

    const handleConnect = () => {
      void serialService.switchToMode("Cpp Mode").catch((error) => {
        console.warn('[Cpp] Could not prepare board for C++ mode:', error)
      })
    }

    serial.addEventListener('connect', handleConnect)

    return () => serial.removeEventListener('connect', handleConnect)
  }, [])

  useEffect(() => {
    dispatch(setPath(terminalPath))
  }, [terminalPath])
  const [showToast, setShowToast] = useState(false);
  const [serialDropdownOpen, setSerialDropdownOpen] = useState(false)
  const [serialPorts, setSerialPorts] = useState<SerialPort[]>([])
  const [selectedSerialPort, setSelectedSerialPort] = useState<SerialPort | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const refreshSerialPorts = async () => {
    try {
      const ports = await serialService.getAuthorizedPorts();
      setSerialPorts(ports);
    } catch (error) {
      console.error('Failed to get serial ports:', error);
      setSerialPorts([]);
    }
  };

  const handleAddSerialDevice = async () => {
    try {
      const port = await serialService.requestPort();

      if (!port) {
        return;
      }

      setSelectedSerialPort(port);
      await connectAuthorizedCppBoard(port);
      await refreshSerialPorts();
      setSerialDropdownOpen(false); 
      console.log('Serial device connected');
    } catch (error) {
      console.error('Serial connection failed:', error);
    }
  };

  useEffect(() => {
    refreshSerialPorts();
  }, []);

  const [editedName, setEditedName] = useState(projectName)
  useEffect(() => {
    setEditedName(projectName)
  }, [projectName])
  useEffect(() => {
    if (!output?.length) return;
  
    if (!showTerminal) {
      setShowTerminal(true);
      setShowSerialTerminal(false);
  
     window.localStorage.setItem('cpp_showTerminal', 'true');
     window.localStorage.setItem('cpp_showSerialTerminal', 'false');
    }
  }, [output]);
  useEffect(() => {
    if (!serialData?.trim()) return;
  
    if (!showSerialTerminal) {
      setShowSerialTerminal(true);
      setShowTerminal(false);
  
      window.localStorage.setItem('cpp_showSerialTerminal', 'true');
      window.localStorage.setItem('cpp_showTerminal', 'false');
    }
  }, [serialData]);
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmed = editedName.trim()
      if (!trimmed) return
      try {
        const newPath = await browserWorkspace.rename(terminalPath, trimmed)
        if (newPath) {
          setProjectName(trimmed)
          setTerminalPath(trimmed)
          refresh()
          setShowToast(true)
          setTimeout(() => setShowToast(false), 2000);
        }
      } catch (err) {
        console.error("Rename failed:", err)
      }
    }
  }
  const [librarySearchOpen, setLibrarySearchOpen] = useState(false);
  useEffect(() => {
    console.log("showResetandBootpopup:", showResetandBootpopup);
  }, [showResetandBootpopup]);
  const handleBootResetConfirmed = async () => {
    setShowResetandBootpopup(false);
    setIsSwitchingOta(true);
  
    try {
    
  
      window.localStorage.clear();
  
      router.push('/')
    } catch (error) {
      console.error('Failed to switch OTA mode:', error);
  
      await Swal.fire({
        title: 'Error',
        text: 'Failed to enter boot mode. Please try again.',
        icon: 'error',
      });
    } finally {
      setIsSwitchingOta(false);
    }
  };
  return (
    <>
      <div
        className="absolute inset-0 z-10 animate-moving-bg bg-repeat bg bg-center bg-contain pointer-events-none opacity-30"
        style={{ backgroundImage: `url(${BackgroundImg})` }}
      />
      
      <div className="relative z-[20]">
        <Header />
      </div>

      <div className="flex flex-col h-screen ">
        {/* Top Toolbar */}
        <div className={`flex px-4 pt-6 pb-4 w-screen items-end overflow-visible ${themeMode === "dark" ? "bg-[#2195FF]" : "bg-[#2195FF]"}`}>
          <div className="bg-black rounded flex items-center justify-center w-[60px] h-[60px] cursor-pointer relative z-[20]"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            onClick={async () => {
              setLogoHovered(false);
              console.log("Back icon clicked")
            
              if (unsavedChanges) {
                const confirmed = window.confirm(
                  'You have unsaved changes. Are you sure you want to leave without saving?'
                );
                if (!confirmed) return;
              }
            
              setShowResetandBootpopup(true);
            }}
          >
            {logoHovered ? (
              <Backicon className="text-white w-10 h-10" />
            ) : (
              <CppLogo className="w-10 h-10 transition-transform duration-200 hover:scale-110" />
            )}
          </div>

          <div className={`flex flex-col justify-center w-full ${themeMode === "dark" ? "bg-[#2195FF]" : "bg-[#2195FF]"}`}>
            <div className="flex items-center justify-between w-full relative z-[999]">
              <div className="flex items-center gap-4 px-4 relative z-[999]">
                
                <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onNewProject}>
                  <EditIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                  <Tooltip text='New Project' />
                </div>
                <div className="group relative hover:scale-110 transition-transform duration-200" onClick={handleImport}>
                  <DownloadIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                  <Tooltip text='Open Project' />
                </div>

                <div className="group relative hover:scale-110 transition-transform duration-200" onClick={() => setOpen((prev) => !prev)}>
                  <SaveIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                  <Tooltip text='Save' />
                </div>

                <div className="group relative hover:scale-110 transition-transform duration-200" onClick={() => setShowSaveToKitPopup(true)}>
                  <Savedtokit className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                  <Tooltip text='Save to Kit' />
                </div>

                <div className="group relative hover:scale-110 transition-transform duration-200">
                  <BookIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                  <Tooltip text='Book' />
                </div>

                {/* <div className="group relative hover:scale-110">
                  <VerifyIcon size={50} />
                  <Tooltip text='Verify' />
                </div> */}

                {/* RUN or STOP */}
                <div className="flex items-center">
               <div className='group relative w-10 hover:scale-110 cursor-pointer'
                  onClick={() => {
                    setShowTerminal(true);
                    setShowSerialTerminal(false);
                    window.localStorage.setItem("cpp_showTerminal", "true");
                    onRun();
                     }}
                     >
                  <ArrowIcon size={50} />
                  <Tooltip text="Run" />
                  </div>
                </div>

                {/* AI ASSISTANT */}
                {/* <div
                  className={`group relative hover:scale-110 transition-transform duration-200 rounded cursor-pointer ${chatOpen ? 'ring-[3px] ring-black' : ''}`}
                  onClick={onToggleChat}
                >
                  <FaRobot className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer rounded hover:border-[3px] border-black transition-transform duration-200 text-black" />
                  <Tooltip text="AI Assistant" />
                </div> */}
              </div>

              <div className="absolute left-[53%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
              <div className={`relative w-[300px] max-w-[90vw] sm:w-[280px] md:w-[320px] lg:w-[300px] h-[50px] bg-white rounded-xl flex items-center justify-between px-3 transition-all duration-300 ease-in-out border-1 border-transparent hover:border-black`}>
                  <div className="relative group flex-1">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-10 px-3 font-semibold text-sm text-black bg-transparent border-black focus:outline-none w-full"
                      placeholder="Project Name"
                    />

                    <span className="absolute top-[100%] left-2 mt-2 px-2 py-1 text-black bg-white rounded font-bold border-black text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Project Name
                    </span>
                  </div>
                  <div className={`absolute top-1 right-1 w-[100px] h-[40px]  border-[2px] border-white shadow-[0_0_6px_rgba(255,255,255,0.6)] flex items-center justify-center cursor-pointer rounded-xl   ${
      themeMode === "dark"
        ? "bg-[#000000] border-white"
        : "bg-black border-white"
    }`}>
                    <span className={`text-white text-xs font-bold tracking-wide uppercase whitespace-nowrap overflow-hidden text-ellipsis px-1 ${themeMode === "dark" ? "bg-[#000000]" : "bg-black"}`}>
                      {selectedkit || "No Kit"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-2 relative">
                <div className="relative">
                  <button
                    onClick={async () => {
                      setSerialDropdownOpen((prev) => !prev);
                      await refreshSerialPorts();
                    }}
                    className="w-[175px] h-12 bg-black text-white rounded-lg border-2 border-black hover:border-white flex items-center justify-between px-3 transition-all"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-purple-400">🔌</span>
                      <span className="text-xs font-bold truncate">
                        {selectedSerialPort ? serialService.getPortName(selectedSerialPort, 0) : 'Select Serial Port'}
                      </span>
                    </div>
                    <span>{serialDropdownOpen ? '▲' : '▼'}</span>
                  </button>

                  {serialDropdownOpen && (
                    <div className="absolute right-0 top-14 w-[300px] bg-[#0b0b0b] text-white rounded-xl shadow-2xl border border-[#333] z-[9999] overflow-hidden">
                      <button
                        onClick={async () => {
                          await refreshSerialPorts();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-purple-400 hover:bg-[#222] border-b border-[#333]"
                      >
                        <IoReloadOutline className="w-5 h-5" />
                        <span className="font-semibold">Refresh</span>
                      </button>

                      {serialPorts.length > 0 ? (
                        serialPorts.map((port, index) => {
                          const name = serialService.getPortName(port, index);

                          return (
                            <button
                              key={`${name}-${index}`}
                              onClick={async () => {
                                try {
                                  setSelectedSerialPort(port);
                                  await connectAuthorizedCppBoard(port);
                                  setSerialDropdownOpen(false);
                                  console.log('Connected:', name);
                                } catch (error) {
                                  console.error('Failed to connect:', error);
                                }
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#222] border-b border-[#333]"
                            >
                              <span className="text-purple-400">🔌</span>
                              <span className="text-sm">{name}</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-4 text-gray-400 text-sm">No authorized devices</div>
                      )}

                      <button
                        onClick={handleAddSerialDevice}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-purple-400 hover:bg-[#222] border-t border-[#333]"
                      >
                        <span className="text-xl">＋</span>
                        <span className="font-semibold">Add Serial Device</span>
                      </button>
                    </div>
                  )}
                </div>
                {/* Remaining Icons (USB, Star, Settings) */}
                {[Settings].map((Icon, i) => (
                  <div
                    key={i}
                    className="group w-12 h-13 bg-black dark:bg-[#000000] rounded border-2 border-black dark:border-[#000000] hover:border-[#F6EC24] transition-all duration-200 cursor-pointer flex items-center justify-center"
                    onClick={() =>  setShowSettings(true)}
                  >
                    <Icon className="w-8 h-8 stroke-white group-hover:stroke-[#F6EC24]" />
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            {/* Side Buttons */}
            <div className={`flex flex-col h-full sm:w-20 md:w-[85px] lg:w-[100px] text-white py-0.5 ps-0 items-center justify-center ${themeMode === "dark" ? "bg-[#2195FF]" : "bg-[#2195FF]"}`}>
              <div className={`${themeMode ==="dark" ? "bg-black/25":"bg-white/25"} h-full w-9/12 px-0.5 py-2 rounded-sm gap-2 flex flex-col items-center relative z-[20]`}>

                <button  className='group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200' onClick={() => toggleLeftPanel('folder')}>
                  <Tooltip text="Files" />
                  <FolderIcon className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer rounded-md" />
                </button>

                <button  className='group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200' onClick={() => toggleLeftPanel('library')}>
                  <Tooltip text="Library" />
                  <LibraryIcon className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer rounded-md" />
                </button>

                <button className='group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200'  onClick={() => toggleSerial()}>
                  <Tooltip text="Serial" />
                  <TerminalIcon className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer  rounded-md" />
                </button>
                <button data-tooltip-id="terminal"  className="group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200"
                 onClick={() => toggleTerminal('terminal')}>
             <Tooltip     text="Terminal"    />
              <IoTerminal   className={`w-8 h-8 lg:w-10 lg:h-10 p-1 rounded-md scale-110 ${themeMode === "dark" ? "text-[#000000]" : "text-black"}`}/>
                </button>
                <button className='group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200' onClick={() => toggleLeftPanel('search')}>
                  <Tooltip    text="Search all" />
                  <SearchIcon className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer rounded-md" />
                </button>

                {/* <button className='group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200'>
                  <Tooltip text="Examples" />
                  <Exampleicon className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer rounded-md" />
                </button> */}

              </div>
            </div>
            {/* Sidebar */}
            {leftPanel && (
              <div
                style={{ width: sidebarWidth }}
                className={`text-white rounded-md shadow-lg border-black pe-1 flex-shrink-0  relative z-[20] ${themeMode === "dark" ? "bg-[#000000]" : "bg-[#2195FF]"}`}
              >
                {/* Drag handle */}
                <div 
                  onMouseDown={handleSidebarMouseDown}
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-yellow-400"
                />

                <div className={`rounded-md h-full w-full relative custom-scrollbar overflow-y-auto overflow-x-hidden ${themeMode === "dark" ? "bg-[#000000]" : "bg-[#FFFFFF]"}`}>                  
                  <div className={`h-full w-full flex flex-col gap-4 p-4 rounded-sm ${themeMode === "dark" ? "bg-[#000000]" : "bg-[#FFFFFF]"}`}>
                  <div className={`px-1 py-1 rounded-md  font-semibold  ${themeMode === "dark" ? "bg-[#000000] text-white" : "bg-[#FFFFFF] text-black"}`}>
                    {leftPanel === 'folder'
                      ? (
                        <div className="flex items-center">
                          Folder View

                          {isImported && (
    <div className="flex items-center gap-2 ml-auto">
      <button onClick={onAddNewFile} className="ml-1">
        <Tooltip text="New File" />
        <FileIcon
          className={`inline-block w-5 h-5 ${
            themeMode === "dark" ? "text-white" : "text-black"
          }`}
        />
      </button>

      <button onClick={onAddNewFolder} className="ml-1">
        <Tooltip text="New Folder" />
        <TbFolderPlus
          className={`inline-block w-6 h-6 ${
            themeMode === "dark" ? "text-white" : "text-black"
          }`}
        />
      </button>
    </div>
  )}

                        </div>

                      ) : leftPanel === 'library'
                        ? null

                        : leftPanel === 'search'
                          ? 'Global Search'
                          : 'File Search'}
                  </div>


                  {/* Body */}

                  {leftPanel === 'folder' ? (
                    <div className={` text-sm  ${themeMode === "dark" ? "text-white": "text-black"}`}>
                      <div className='font-black pb-2'>
                        {isImported ? rootFolder : "Import project!"}
                      </div>

                      {isFileCreating && (
                        <div className="flex mb-2">
                          <File className="w-4 h-4" />
                          <input
                            className="bg-neutral-secondary-medium text-xs px-2 py-1 border border-black rounded w-full focus:border-black focus:outline-none focus:ring-0"
                            autoFocus
                            onBlur={() => setIsFileCreating(false)}
                            onKeyDown={async (e) => {
                              if (e.key !== "Enter") return

                              const name = e.currentTarget.value.trim()
                              if (!name) {
                                setIsFileCreating(false)
                                return
                              }

                              const pathToUse = selectedNode?.path ?? terminalPath
                              const typeToUse = selectedNode?.type ?? "folder"
                              const parent = typeToUse === 'file' ? pathToUse.split('/').slice(0, -1).join('/') : pathToUse
                              await browserWorkspace.createFile(parent, name)

                              setIsFileCreating(false)
                              refresh()
                            }}
                          />
                        </div>
                      )}

                      {isFolderCreating && (
                        <div className="flex mb-2">
                          <Folderup className="inline-block w-5 h-5 mr-1" />
                          <input
                            className="bg-neutral-secondary-medium text-xs px-2 py-1 border border-black rounded w-full focus:border-black focus:outline-none focus:ring-0"
                            autoFocus
                            onBlur={() => setIsFolderCreating(false)}
                            onKeyDown={async (e) => {
                              if (e.key !== "Enter") return

                              const name = e.currentTarget.value.trim()
                              if (!name) {
                                setIsFolderCreating(false)
                                return
                              }

                              const pathToUse = selectedNode?.path ?? terminalPath
                              const typeToUse = selectedNode?.type ?? "folder"
                              const parent = typeToUse === 'file' ? pathToUse.split('/').slice(0, -1).join('/') : pathToUse
                              await browserWorkspace.createFolder(parent, name)

                              setIsFolderCreating(false)
                              refresh()
                            }}
                          />
                        </div>
                      )}

                      {isImported && <FileExplorer
                        data={fileTree}
                        selectedNode={selectedNode}
                        setSelectedNode={setSelectedNode}
                        refresh={refresh}
                        projectName={projectName}
                        language={'cpp'}
                        onOpenFile={onOpenWorkspaceFile}
                      />}

                    </div>
                  )
                    : leftPanel === 'search' ? (
                      <GlobalSearch
                        renderHighlightedLine={renderHighlightedLine}
                        unsavedChanges={unsavedChanges}
                        highlightWord={highlightWord}
                        searchBoxRef={searchBoxRef}
                        searchInUnsavedEditor={searchInUnsavedEditor}
                      />
                    )
                      : leftPanel === "filesearch" ? (
                        <div>
                          {leftPanel === 'filesearch' && (
                            <FileSearch
                              terminalPath={terminalPath}
                              unsavedChanges={unsavedChanges}
                            />
                          )}
                        </div>
                      )
                        : leftPanel === 'library' ? (
                          <div className="">
                            <LibraryBrowser
                              showSearch={librarySearchOpen}
                              setShowSearch={setLibrarySearchOpen}
                            />
                          </div>
                        ) : (
                          <div className={`text-sm  ${themeMode === "dark" ? "text-white":"text-black"}`}>
                            {examples.length > 0 ? (
                              <ul className="gap-1 flex flex-col">
                                {examples.map((example) => (
                                  <button
                                    key={example.filename}
                                    onClick={() => {
                                      if (unsavedChanges) {
                                        const confirmed = window.confirm(
                                          'You have unsaved changes. Are you sure you want to leave without saving?'
                                        );
                                        if (!confirmed) return;
                                      }

                                      void onOpenWorkspaceFile?.(example.filepath, example.filename)
                                    }}
                                  >
                                    <li
                                      className={`py-1 px-2 rounded flex items-center gap-2 cursor-pointer ${example.filename === projectName
                                        ? 'bg-red-300 font-semibold'
                                        : 'bg-red-100'
                                        }`}
                                      key={example.filename}
                                    >
                                      <CppLogo className="inline-block w-4 h-4" />
                                      {example.filename}
                                    </li>
                                  </button>
                                ))}
                              </ul>
                            ) : (
                              <div>No projects found</div>
                            )}

                          </div>
                        )
                  }
                </div>
                </div>
              </div>
            )}

            {/* Settings Modal */}
  {showSettings && (
                            <SettingModal onClose={() => setShowSettings(false)} />
                          )}

            {/* Main Area */}
            <div className={`flex-1 flex flex-col relative overflow-hidden ${themeMode === "dark" ? "bg-[#2195FF]" : "bg-[#2195FF]"} `}>
              <div className="absolute top-15 right-8 flex flex-col gap-2 z-30">
                <button onClick={() => fontFn('decrease')}>
                  <FontDecreaseIcon className="w-10 h-10 p-1 cursor-pointer hover:scale-105 bg-[#F6EC24] rounded-full hover:border-[3px] transition-transform duration-200" />
                </button>
                <button onClick={() => fontFn('increase')}>
                  <FontIncreaseIcon className="w-10 h-10 p-1 cursor-pointer hover:scale-105 bg-[#F6EC24] rounded-full hover:border-[3px] transition-transform duration-200" />
                </button>
              </div>

         
                         <div className="flex-1 flex flex-col relative overflow-hidden">
  <div
    className={`
      flex flex-col flex-grow rounded-xl overflow-hidden pl-1 pr-4 ml-1

    `}
  >
    <div className="flex-1 flex overflow-hidden">
      <div className={`flex-1 overflow-hidden ${themeMode === "dark" ? "bg-[#1e1e1e]":"bg-white"}`}>
        {children}
      </div>
      <ChatPanel
        open={chatOpen}
        onClose={onToggleChat}
        onGenerated={onCodeGenerated}
        buildError={buildError}
        hasOpenCode={hasOpenCode}
        getEditContext={getEditContext}
        onFixBuild={onFixBuild}
      />
    </div>
  </div>
</div>

              {/* Terminal */}
              {showTerminal &&
                <div className=" px-2 pr-4">
                  <Terminal
                    handleMouseDown={handleMouseDown}
                    terminalHeight={terminalHeight}
                    terminalRef={terminalRef}
                    setShowTerminal={setShowTerminal}
                    onClear={onClear}
                    handleCopy={handleCopy}
                    terminalPath={terminalPath}
                    output={output}
                    activeTab = {activeTab}
                    setActiveTab = {setActiveTab}
                  />
                </div>

              }
            {
              showSerialTerminal  && 
              <div className='px-2 pr-4'>
                <SerialMonitor
                 handleMouseDown={handleMouseDown}
                 terminalHeight={terminalHeight}
                 terminalRef={terminalRef}
                 setShowSerialTerminal={setShowSerialTerminal}
                 onClear={onClear}
                 handleCopy={handleCopy}
                 serialData={serialData}
                 />
                </div>
            }
           
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`h-2 w-full text-center text-white text-xs flex-shrink-0 z-10 ${themeMode === "dark" ? "bg-[#2195FF]" : "bg-[#2195FF]"}`}>
            <div className="flex items-center justify-center h-full w-full"></div>
          </div>
        </div>
        <CopyToast show={showCopiedToast} />
        {open && (
          <div className={`absolute left-30 top-[11%] ml-10 w-30 rounded-lg ${bgColor} shadow-lg z-50`}>
            <div
              className={menuItemClass("save")}
              onClick={() => {
                setActiveItem("save");
                onSave("save");
                setOpen(false);
                setActiveItem(null);
              }}
            >
              SAVE
            </div>

            <div
              className={menuItemClass("saveAs")}
              onClick={() => {
                setActiveItem("saveAs");
                onSave('saveAs');
                setOpen(false);
                setActiveItem(null);
              }}
            >
              SAVE AS
            </div>
          </div>
        )}
        <DeletionToast
          show={showToast}
          message="Project Renamed Successfully"
        />
        <PressBootResetPopup
  open={showResetandBootpopup}
  onOk={handleBootResetConfirmed}
  onClose={() => setShowResetandBootpopup(false)}
/>
        <SaveToKitPopup
          open={showSaveToKitPopup}
          projectName={activeTabName || projectName}
          onClose={() => setShowSaveToKitPopup(false)}
          onConfirm={(name) => {
            setShowSaveToKitPopup(false)
            handleSaveToKit(name)
          }}
        />
        {showSavetokitpop && (
          <Savetokitpop type="save" />
                )}
        {showNewProjectModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className={`relative w-[420px] rounded-xl shadow-2xl border-2 border-black ${
              themeMode === 'dark' ? 'bg-[#1E1E1E] text-white' : 'bg-white text-black'
            }`}>
              {/* Red X close button */}
              <button
                onClick={handleCloseProjectModal}
                className="absolute top-3 right-3 text-red-500 hover:text-red-600 hover:scale-110 transition-transform z-10"
                aria-label="Close"
              >
                <FiX className="w-6 h-6" />
              </button>

              {/* Title */}
              <div className="px-6 py-5 border-b border-gray-400">
                <h2 className="text-xl font-bold">Create New Project</h2>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateProject()
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      handleCloseProjectModal()
                    }
                  }}
                  placeholder="Enter project name..."
                  className={`w-full px-4 py-2 rounded-md border-2 border-black text-sm focus:outline-none ${
                    themeMode === 'dark'
                      ? 'bg-[#000000] text-white'
                      : 'bg-[#D6D6D6] text-black'
                  }`}
                  autoFocus
                />
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-400 flex justify-end">
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className={`px-6 py-2 rounded-md font-bold transition-colors border-2 border-black ${
                    newProjectName.trim()
                      ? 'bg-[#F6EC24] hover:bg-[#e0d020] text-black'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
{isSwitchingOta && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div
      className={`px-8 py-6 rounded-xl shadow-lg ${
        themeMode === 'dark'
          ? 'bg-[#1E1E1E] text-white'
          : 'bg-white text-black'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="text-lg font-medium">
          Loading...
        </div>

        <div className="flex gap-1">
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </>
  )
})

export default CppScaffold
