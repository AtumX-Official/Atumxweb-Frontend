import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import '../../assets/css/scrollbar.css'
import BookmarkIcon from '@renderer/assets/icons/common/BookmarkIcon'
import DownloadIcon from '@renderer/assets/icons/common/DownloadIcon'
import { FaSearch } from "react-icons/fa";
import EditIcon from '@renderer/assets/icons/common/EditIcon'
import SaveIcon from '@renderer/assets/icons/common/SaveIcon'
import Settings from '@renderer/assets/icons/common/Settings'
import LibraryIcon from '@renderer/assets/icons/common/LibraryIcon'
import TerminalIcon from '@renderer/assets/icons/common/TerminalIcon'
import FolderIcon from '@renderer/assets/icons/common/FolderIcon'
import FontIncreaseIcon from '@renderer/assets/icons/common/FontIncreaseIcon'
import FontDecreaseIcon from '@renderer/assets/icons/common/FontDecreaseIcon'
import PythonLogo from '@renderer/assets/icons/python/PythonLogo'
import { IoHome, IoReloadOutline } from 'react-icons/io5'
import { FaPlay, FaStop } from 'react-icons/fa'
import SettingModal from '../supporting/SettingModal'
import Help from '@renderer/assets/icons/common/Help'
import {Deletepythonfile} from "@renderer/components/supporting/Popups"
import Savedtokit from '@renderer/assets/icons/common/Savetokit'
import {  useSelector } from 'react-redux';
import { handlePortRefreshWithPromise } from '@renderer/screens/CommonHelper/ListPorts'
import serialService from '@renderer/services/Serialservice'
import { Tooltip } from './Tooltip'
import Header from '../Header'
import { CopyToast } from '../supporting/Popups'
import Exampleicon from "@renderer/assets/icons/common/Exampleicon"
import LeftSidebarPanel from "./Sidebar/Pysidebar"
import AutoScroll from "@renderer/assets/AutoScroll"
import Refreshicon from "@renderer/assets/Refresh";
import {  FiX } from "react-icons/fi";
import {FiAlertTriangle,FiTerminal} from "react-icons/fi"
import Backicon from "@renderer/assets/icons/common/Backicon"
interface Project {
  created: string
  filepath: string
  filename: string
}

interface NavigationOptions {
  replace?: boolean
  state?: Record<string, string | number | undefined>
}

export default function PythonScaffold({
  ports,
  setPorts,
  unsavedChanges,
  projectName,
  setProjectName,
  children,
  fontFn,
  onRun,
  onStop,
  output,
  onSave,
  onImport,
  onNewFile,
  serialData,
  onClear,
  selectedkit,
  onSaveToKit,
  onExit,
  onOpenpdf,
  onOpenBoardFile,

}: {
  setIsChangeHappens: (val: boolean) => void
  unsavedChanges: boolean
  ports: Array<string>
  setPorts: () => void
  projectName: string
  setProjectName: (name: string) => void
  children?: React.ReactNode
  fontFn: (size: string) => void
  onRun: () => void
  onStop: () => void
  output;
  onSave: (mode) => void
  onImport: () => void
  onNewFile: () => void
  serialData: string
  onClear: () => void
  selectedkit: string
  onSaveToKit: () => any
  onExit: () => any
  onOpenpdf: () => any
  onOpenBoardFile:(file: string) => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSettings, setShowSettings] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [terminalPath, setTerminalPath] = useState('')
  const [rootFolder, setRootFolder] = useState('')
  const themeMode = useSelector((state: any) => state.theme.mode)
  const textColor = themeMode === 'dark' ? 'text-white' : 'text-black'
  const [activeTab, setActiveTab] = useState<'serial' | 'errors'>('serial') 
   const [runStatus, setRunStatus] = useState<'running' | 'stopped'>('stopped')
  const [autoScroll, setAutoScroll] = useState(() => {
    const saved = window.localStorage.getItem("serial_autoscroll");
    return saved !== null ? JSON.parse(saved) : true;
  });
  //Global Search
  const [showSearchBox, setShowSearchBox] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const bgColor = themeMode === 'dark' ? 'bg-[#000000]' : 'bg-[#D6D6D6]'
  const bgtext = themeMode === 'dark' ? 'text-white' : 'text-black'
  const hoverbg = themeMode === 'dark' ? 'bg-[#3A3A3A]' : 'bg-[#F0F0F0]'
  const clickbg = themeMode === 'dark' ? 'bg-[#29CB09]' : 'bg-[#2EED08]'
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const onNavigate = (path: string, options?: NavigationOptions) => {
    const params = new URLSearchParams()

    Object.entries(options?.state ?? {}).forEach(([key, value]) => {
      if (value !== undefined) params.set(key, String(value))
    })

    const query = params.toString()
    const target = query ? `${path}?${query}` : path

    if (options?.replace) {
      router.replace(target)
    } else {
      router.push(target)
    }
  }
  const menuItemClass = (item: string) =>
    `flex items-center px-2 py-1 rounded-md cursor-pointer transition-colors
     ${
       activeItem === item
         ? `${clickbg} ${bgtext} ml-2 mr-2 mt-1 mb-1 font-bold`
         : `hover:${hoverbg} ${bgtext} ml-2 mr-2 mt-1 mb-1 font-bold`
     }`;


  //File search
  const [showFileSearch, setShowFileSearch] = useState(false);
  const [fileSearchText, setFileSearchText] = useState("");
  const [fileResults, setFileResults] = useState<any[]>([]);
  useEffect(() => {
    window.localStorage.setItem("serial_autoscroll", JSON.stringify(autoScroll));
  }, [autoScroll]);

  const [examples, setExamples] = useState<any[]>([])
  const [libraries, setLibraries] = useState([])
  const [leftPanel, setLeftPanel] = useState<null | 'Searchall'| 'folder' | 'library' | 'example' | 'board files'>(() => {
    return window.localStorage.getItem('py_leftPanel') as 'Searchall'|'folder' | 'library' | 'example' | null
  })
  const [showTerminal, setShowTerminal] = useState(() => {
    return window.localStorage.getItem('py_showTerminal') === 'true'
  })
  const [terminalHeight, setTerminalHeight] = useState(300)
  const isDragging = useRef(false)

  // Sidebar resize
  const [sidebarWidth, setSidebarWidth] = useState(270)
  const isResizingSidebar = useRef(false)
  const scrollPosRef = useRef(0);
  const settingsRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  //const [open, setOpen] = useState(false);
  const [open, setOpen] = useState<"save" | "kit" | null>(null);

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

  const onOpenFolder = async () => {
    const res = await window.api.file.openFolderDialog('python');
    if (res.success) {
      setTerminalPath(res.data)
      refresh()
    } else {
      console.error('Error opening folder:', res.error)
    }
  }

  const handleGlobalSearch = async (customPath?: string) => {
    if (!searchText.trim()) return

    setSearchResults([])

    const folderPath = customPath
      ? customPath
      : projects[0]?.filepath
        ? projects[0].filepath.split("\\").slice(0, -1).join("\\")
        : ""
    const res = await window.api.globalSearch(folderPath, searchText)

    const unsavedResults = unsavedChanges
      ? searchInUnsavedEditor(searchText)
      : []

    if (res?.success) {
      setSearchResults([...unsavedResults, ...res.data])
    } else {
      setSearchResults(unsavedResults)
    }
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
        <span className="bg-yellow-300 text-black font-semibold">
          {text.slice(start, start + length)}
        </span>
        {text.slice(start + length)}
      </>
    );
  }

  const groupedResults = searchResults.reduce((acc: any, r: any) => {
    const key = r.filePath;

    if (!acc[key]) {
      acc[key] = {
        fileName: r.fileName,
        filePath: r.filePath,
        results: []
      };
    }
    acc[key].results.push(r);
    return acc;
  }, {});

    const [fileTree, setFileTree] = useState<any[]>([])
    const [selectedNode, setSelectedNode] = useState<{
      path: string
      type: "file" | "folder"
    } | null>(null)

  const [isFileCreating, setIsFileCreating] = useState(false)
  const [isFolderCreating, setIsFolderCreating] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [boardFiles, setBoardFiles] = useState<string[]>([]);

  const toggleLeftPanel = (panel: 'Searchall'|'folder' | 'library' | 'example' | 'board files') => {
    clearSearch()
    setLeftPanel((prev) => {
      const newState = prev === panel ? null : panel
      window.localStorage.setItem('py_leftPanel', newState ?? '')
      return newState
    })
  }

  const toggleTerminal = () => {
    setShowTerminal((prev) => {
      const newVal = !prev
      window.localStorage.setItem('py_showTerminal', String(newVal))
      if (newVal) setTerminalHeight(300)
      return newVal
    })
  }

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
      window.localStorage.setItem('py_showTerminal', 'false')
      isDragging.current = false
    } else {
      setTerminalHeight(Math.min(newHeight, 500))
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasWebSerial = typeof navigator !== 'undefined' && 'serial' in navigator;
  const reportBoardCommunicationUnavailable = () => {
    const message = hasWebSerial
      ? 'Board file operations need a Web Serial protocol adapter.'
      : 'Board file operations require Chrome or Edge over HTTPS or localhost.';
    console.warn(message);
  };

  const handleDeleteClick = (file: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening the file
    setFileToDelete(file);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    reportBoardCommunicationUnavailable();
    setIsModalOpen(false);
    setFileToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setFileToDelete(null);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowSearchBox(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    // Electron's mpRemote event bridge is unavailable in a browser.
    // Board files will be populated when the Web Serial protocol adapter is connected.
    if (!hasWebSerial) return;
    setBoardFiles([]);
  }, []);


  useEffect(() => {
    if (leftPanel === 'folder') {
      setBoardFiles([]);
      reportBoardCommunicationUnavailable();
    }
  }, [leftPanel]);
  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;
  
    if (autoScroll) {
      // ✅ always stick to bottom
      el.scrollTop = el.scrollHeight;
    } else {
      // ✅ restore previous position
      el.scrollTop = scrollPosRef.current;
    }
  }, [output, serialData, autoScroll]);
  const decorationIdsRef = useRef<string[]>([]);

  // ✅ Track manual scrolling when autoScroll OFF
  const handleScroll = () => {
    if (!autoScroll && terminalRef.current) {
      scrollPosRef.current = terminalRef.current.scrollTop;
    }
  };
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
    setShowSearchBox(false);
    setShowFileSearch(false)

  }

  const onAddNewFolder = () => {
    setIsFolderCreating(true)
    setShowSearchBox(false);
    setShowFileSearch(false)
  }

  const refresh = () => Promise.resolve()

  const clearSearch = () => {
    setSearchText("");
    setSearchResults([]);
    clearEditorHighlights();
    setShowSearchBox(false);

    // remove highlights from editor
    window.monacoEditor?.deltaDecorations([], []);

    // remove saved search state (prevents reopening after navigation)
    sessionStorage.removeItem("py_searchText");
    sessionStorage.removeItem("py_searchOpen");
  };

  const handleFileSearch = async () => {
    if (!fileSearchText.trim()) return;

    const folderPath = projects[0]?.filepath
      ? projects[0].filepath.split("\\").slice(0, -1).join("\\")
      : "";
    const res = await window.api.fileSearch(folderPath, fileSearchText);
    if (res?.success) {
      setFileResults(res.data);
    } else {
      setFileResults([]);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      handleFileSearch();
    }, 250);
    return () => clearTimeout(delay);
  }, [fileSearchText]);

  useEffect(() => {
    const savedSearch = sessionStorage.getItem("py_searchText");
    const shouldOpen = sessionStorage.getItem("py_searchOpen");

    if (savedSearch && shouldOpen === "true") {
      setSearchText(savedSearch);
      setShowSearchBox(true);
      // run search again so matches appear
      //setTimeout(() => handleGlobalSearch(), 200);
      setTimeout(() => {
        handleGlobalSearch();
        highlightWord(savedSearch);  
      }, 300);
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
    const handler = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        toggleTerminal()
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
        await onSave("save")
        refresh()
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
        window.localStorage.setItem('py_showTerminal', 'true')
        onRun()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSave, onImport, onNewFile, onRun, onStop, leftPanel, showSettings, showTerminal])

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
    const fetchAllProjects = async () => {
      console.log('Browser mode: Electron project API is unavailable')
      setProjects([])
    }
    fetchAllProjects()
  }, [onSave, onImport, onNewFile])

  // Fetch example files
  useEffect(() => {
    const fetchExamples = async () => {
      console.log('Browser mode: Electron examples API is unavailable')
      setExamples([])
    }
    fetchExamples()
  }, [])
  useEffect(() => {
    const fetchLibraries = async () => {
      console.log('Browser mode: Electron libraries API is unavailable')
      setLibraries([])
    }
  
    fetchLibraries()
  }, [])
  useEffect(() => {
    const handler = () => setOpen(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);
  
  const handleCopy = () => {
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 1200);
  };

  const items = [
    { Icon: Settings, label: "Settings", onClick: () => setShowSettings(true) },
    { Icon: Help, label: "Python manual", onClick: onOpenpdf }
  ];

  useEffect(() => {
    const searchText = searchParams.get('searchText')
    const lineNumber = Number(searchParams.get('lineNumber'))

    if (!searchText || !window.monacoEditor) return

    setTimeout(() => {

      highlightWord(searchText)

      const editor = window.monacoEditor
      const model = editor.getModel()

      if (!model) return

      editor.setPosition({
        lineNumber: lineNumber || 1,
        column: 1
      })

      editor.revealLineInCenter(lineNumber || 1)

    }, 500) // wait for file to load
  }, [searchParams])

  return (
    <>
      <Header />
      <div className="flex flex-col h-screen ">
        {/* Top Toolbar */}
        <div className="flex px-4 pt-6 pb-4 bg-[#722CF0] w-screen items-end overflow-visible">
          <div
            className="bg-black rounded flex items-center justify-center w-[60px] h-[60px] cursor-pointer"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}            
            onClick={async () => {
              setLogoHovered(false);
              await onExit();
            }}
            
          >
            {logoHovered ? (
              <Backicon className="text-white w-10 h-10" />
              
            ) : (
              <PythonLogo className="w-10 h-10 transition-transform duration-200 hover:scale-110" />
            )}
           <Tooltip text="Back"/>
          </div>

          <div className="flex flex-col justify-center w-full bg-[#722CF0]">
            <div className="flex items-center justify-between w-full relative z-[50]">
              <div className="flex items-center gap-4 px-4 relative">
              <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onNewFile}>
                  <EditIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                  <Tooltip  text='New' />
                </div>
                <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onOpenFolder}>
                  <DownloadIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                  <Tooltip text='Open' />
                </div>
                <div
                  className="group relative inline-block hover:scale-110 transition-transform duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(open === "save" ? null : "save");
                  }}
                >
                <SaveIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                <Tooltip text="Save" />

                  {open === "save" && (
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 rounded-lg ${bgColor} shadow-lg z-50`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className={menuItemClass("save")}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setActiveItem("save");
                          setOpen(null);
                          setActiveItem(null);
                          await onSave("save");
                          refresh()
                        }}
                      >
                        SAVE
                      </div>

                      <div
                        className={menuItemClass("saveAs")}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setActiveItem("saveAs");
                          setOpen(null);
                          setActiveItem(null);
                          //await onSave("save");
                          await onSave("saveAs");
                          refresh()
                        }}
                      >
                        SAVE AS
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onSaveToKit}>
                  <Savedtokit className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                  <Tooltip text='Save to kit' />
                </div>
                <div className="group relative hover:scale-110 transition-transform duration-200" onClick={onOpenpdf}>
                  <BookmarkIcon className="w-12 h-12 bg-[#F6EC24] p-2 cursor-pointer hover:scale-105 rounded hover:border-[3px] border-black transition-transform duration-200" />
                  <Tooltip text='Book' />
                </div>
                {/* RUN or STOP */}
                <div className="flex items-center gap-3">
                  {runStatus === 'stopped' ? (
                    <div
                      className="group relative w-12 h-12 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
                      onClick={() => {
                        setShowTerminal(true);
                        window.localStorage.setItem("py_showTerminal", "true");
                        onRun();
                        setRunStatus('running');
                      }}
                    >
                      <FaPlay size={20} className="text-green-500" />
                      <Tooltip text="Run" />
                    </div>
                  ) : (
                    <div
                      className="group relative w-12 h-12 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
                      onClick={async () => {
                        if (!hasWebSerial) {
                          reportBoardCommunicationUnavailable();
                          return;
                        }

                        try {
                          await serialService.send('\u0003');
                        } catch (error) {
                          console.error('Unable to stop board execution:', error);
                        }
                        setRunStatus('stopped');
                      }}
                    >
                      <FaStop size={26} className="text-red-500" />
                      <Tooltip text='Stop' />
                    </div>
                  )
                  }
                </div>

              </div>

              <div className="flex-1 flex justify-center">
                <div className=" relative w-[300px] max-w-[90vw] sm:w-[280px] md:w-[320px] lg:w-[300px] h-[50px] bg-white rounded-xl flex items-center justify-between px-3 transition-all duration-300 ease-in-out border-1 border-transparent hover:border-black">
                  <div className="relative group flex-1">
                    <input
                      type="text"
                      value={`Project ${projectName}`}
                      onChange={(e) =>
                        setProjectName(e.target.value.replace(/^Project\s*/i, ""))
                      }
                      className="h-10 px-3 font-semibold text-sm text-black bg-transparent border-black focus:outline-none w-full"
                      placeholder="Project Name"
                    />
                    <span className="absolute top-[100%] left-2 mt-2 px-2 py-1 text-black bg-white rounded font-bold border-black text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Project Name
                    </span>
                  </div>
                  <div className=" absolute top-1 right-1 w-[100px] h-[40px]  bg-black border-[2px] border-white shadow-[0_0_6px_rgba(255,255,255,0.6)] flex items-center justify-center cursor-pointer rounded-xl"
                  >
                    <span className="text-white text-xs font-bold tracking-wide uppercase whitespace-nowrap overflow-hidden text-ellipsis px-1">
                      {selectedkit || "No Kit"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-2">
                {/* USB Port Dropdown + Reload inside it */}
                <div className="flex items-center bg-black rounded border-2 border-black hover:border-[#FFFFFF] transition-all duration-200">
                  <select
                    name="ports"
                    className="bg-black text-white focus:outline-none min-w-[120px] h-12 rounded-l px-2 cursor-pointer"
                  >
                    {ports.map((port, idx) => (
                      <option key={idx} value={port}>
                        {port}
                      </option>
                    ))}
                  </select>

                  {/* Reload button INSIDE the port div */}
                  <button
                    className="h-12 w-12 flex items-center justify-center text-white border-l-2 border-black hover:text-[#F6EC24] transition-all duration-200"
                    onClick={() => {
                      handlePortRefreshWithPromise({ setPorts })
                    }}
                  >
                    <IoReloadOutline className="w-6 h-6" />
                  </button>
                </div>

                {/* Remaining Icons (USB, Star, Settings) */}
                {items.map(({ Icon, label, onClick }, i) => (
               <div key={i} className="group relative w-12 h-13 bg-black rounded border-2 border-black hover:border-[#FFFFFF] transition-all duration-200 cursor-pointer flex items-center justify-center"
               onClick={onClick}
               >
               <Icon className="w-8 h-8" />
               <Tooltip text={label} />
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
            <div className="flex flex-col h-full sm:w-20 md:w-[85px] lg:w-[100px] bg-[#722CF0] text-white py-0.5 ps-0 items-center justify-center">
              <div className="bg-[#FFFFFF]/25 h-full w-9/12 px-0.5 py-2 rounded-sm gap-2 flex flex-col items-center">
                <button className='group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200' onClick={() => toggleLeftPanel('Searchall')}>
                  <Tooltip text="Search all" />
                  <FaSearch color="black" className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer rounded-md " />
                </button>
                <button   className="group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200" onClick={() => toggleLeftPanel('folder')}>
                  <Tooltip text="Files" />
                  <FolderIcon color="black" className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer  rounded-md " />
                </button>
                <button  className='group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200' onClick={() => toggleLeftPanel('library')}>
                  <Tooltip text="Library" />
                  <LibraryIcon className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer rounded-md" />
                </button>
                <button className='group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200' onClick={() => toggleLeftPanel('example')}>
                  <Tooltip text="Examples" />
                  <Exampleicon className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer rounded-md" />
                </button>
                <button data-tooltip-id="terminal" className='group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200' onClick={toggleTerminal}>
                  <Tooltip text="Serial" />
                  <TerminalIcon className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer  rounded-md" />
                </button>
              </div>
            </div>
            <LeftSidebarPanel
                  leftPanel={leftPanel}
                  textColor={textColor}
                  selectedNode={selectedNode}
                  setSelectedNode={setSelectedNode}
                  refresh={refresh}
                  projectName={projectName}
                  fileTree={fileTree}
                  libraries={libraries}
                  boardFiles={boardFiles}
                  examples ={examples}
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
                  onNavigate={onNavigate}
                  onAddNewFolder={onAddNewFolder}
                  handleDeleteClick={handleDeleteClick}
                  onAddNewFile ={onAddNewFile}
                  projects={projects}
                  onOpenBoardFile={onOpenBoardFile}
                />

            {/* Settings Modal */}
            {showSettings && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#BEBEBE]/20">
                <div ref={settingsRef} className="drop-shadow-lg rounded-xl">
                  <SettingModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
                </div>
              </div>
            )}
            <Deletepythonfile
              open={isModalOpen}
              title="Delete File"
              message={`Are you sure you want to permanently delete the saved "${fileToDelete}" from the controller?`}
              onYes={handleConfirmDelete}
              onNo={handleCancelDelete}
            />
            {/* Main Area */}
            <div className="flex-1 flex flex-col relative bg-[#722CF0] overflow-hidden">
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button onClick={() => fontFn('decrease')}>
                  <FontDecreaseIcon className="w-10 h-10 p-1 cursor-pointer hover:scale-105 bg-[#F6EC24] rounded-full hover:border-[3px] transition-transform duration-200" />
                </button>
                <button onClick={() => fontFn('increase')}>
                  <FontIncreaseIcon className="w-10 h-10 p-1 cursor-pointer hover:scale-105 bg-[#F6EC24] rounded-full hover:border-[3px] transition-transform duration-200" />
                </button>
              </div>
              <div className="flex-1 flex flex-col relative bg-[#722CF0] overflow-hidden">
                {/* Remove specific top-level padding if it interferes with the tab bar alignment */}
                <div className="flex flex-col flex-grow rounded-xl overflow-hidden pl-1 pr-4">
                  <div className="flex-1 bg-white dark:bg-[#1e1e1e]">{children}</div>
                </div>
              </div>

              {/* Terminal */}
              {showTerminal && (
  <>
    <div
      onMouseDown={handleMouseDown}
      className="h-2 cursor-row-resize bg-[#722CF0] hover:bg-yellow-400 transition-colors duration-200 overflow-auto"
    />
    <div
      style={{ height: terminalHeight }}
      className="text-white pl-2 pr-2 shadow-inner rounded-t-md relative overflow-visible"
    >
      <div className="bg-zinc-950 pl-2 rounded-md h-full w-full flex flex-col">

        {/* Header */}
        <div className="flex justify-between mb-2 shrink-0">

          {/* Tab switcher */}
          <div style={{ position: 'relative', width: 460, height: 45 }}>

{/* SERIAL TAB */}
<button
  onClick={() => setActiveTab('serial')}
  style={{
    width: 150,
    height: activeTab === 'serial' ? 45 : 40,
    background: activeTab === 'serial' ? '#000000' : '#FFDE21',
    color: activeTab === 'serial' ? '#ffffff' : '#000000',
    borderRadius: '6px 6px 0 0',
    border: 'none',
    outline: 'none',
    position: 'absolute',
    bottom: 0,
    // 👇 KEY CHANGE
    left: activeTab === 'serial' ? 0 : 150,
    zIndex: activeTab === 'serial' ? 2 : 1,

    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    fontWeight: 700,
    fontSize: 13,
    transition: 'all 0.2s ease',
  }}
>
  <FiTerminal className="w-4 h-4 shrink-0" />
  Serial Monitor
</button>

{/* ERROR TAB */}
<button
  onClick={() => setActiveTab('errors')}
  style={{
    width: 150,
    height: activeTab === 'errors' ? 45 : 40,
    background: activeTab === 'errors' ? '#000000' : '#FFDE21',
    color: activeTab === 'errors' ? '#ffffff' : '#000000',
    borderRadius: '6px 6px 0 0',
    border: 'none',
    outline: 'none',
    position: 'absolute',
    bottom: 0,

    // 👇 KEY CHANGE
    left: activeTab === 'errors' ? 0 : 150,
    zIndex: activeTab === 'errors' ? 2 : 1,

    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    fontWeight: 700,
    fontSize: 13,
    transition: 'all 0.2s ease',
  }}
>
  <FiAlertTriangle className="w-4 h-4 shrink-0" />
  Error Logger
</button>

</div>
          {/* Right controls */}
          <div className="flex gap-2 items-center mr-2">
            <button
              onClick={() => setAutoScroll(prev => !prev)}
              title={autoScroll ? "Autoscroll ON" : "Autoscroll OFF"}
            >
              <AutoScroll className="w-5 h-5" isSelected={autoScroll} />
            </button>
            <button
              onClick={onClear}
              className="px-2 py-1 text-xs transition-all"
              title="Refresh"
            >
              <Refreshicon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowTerminal(false);
                window.localStorage.setItem('py_showTerminal', 'false');
              }}
              title="Close"
              className="bg-[#EA221F] rounded w-6 h-6 flex items-center justify-center"
            >
              <FiX className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Output area */}
        <div
          id="scrollbar"
          ref={terminalRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto"
        >
          <pre
            id="terminal-output"
            className="whitespace-pre-wrap font-mono text-sm select-text"
            onCopy={handleCopy}
          >
            <div>{terminalPath}</div>

            {activeTab === 'serial' ? (
              <>
                {output
                  .filter(line => line.type !== 'err')
                  .map((line, index) => (
                    <span key={index} className="text-white">
                      {line.text}
                    </span>
                  ))}
                {serialData}
              </>
            ) : (
              output
                .filter(line => line.type === 'err')
                .map((line, index) => (
                  <span key={index} className="text-red-500">
                    {line.text}
                  </span>
                ))
            )}
          </pre>
        </div>

      </div>
    </div>
  </>
)}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="h-2 bg-[#722CF0] w-full text-center text-white text-xs flex-shrink-0 z-10">
            <div className="flex items-center justify-center h-full w-full"></div>
          </div>
        </div>
        <CopyToast show={showCopiedToast} />
        
      </div>
    </>
  )
}
