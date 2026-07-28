import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/scrollbar.css'
import { FaSearch } from "react-icons/fa";
import Settings from '../../assets/icons/common/Settings'
import LibraryIcon from '../../assets/icons/common/LibraryIcon'
import TerminalIcon from '../../assets/icons/common/TerminalIcon'
import FolderIcon from '../../assets/icons/common/FolderIcon'
import FontIncreaseIcon from '../../assets/icons/common/FontIncreaseIcon'
import FontDecreaseIcon from '../../assets/icons/common/FontDecreaseIcon'
import SettingModal from '../../components/supporting/SettingModal'
import {Deletepythonfile} from "../../components/supporting/Popups"
import {  useSelector } from 'react-redux';
import { handlePortRefreshWithPromise } from '../../screens/CommonHelper/ListPorts'
import { Tooltip } from '../../components/Tooltip'
import Header from '../../components/Header'
import { UnderdevelopmentPopup } from '../../components/supporting/Popups'
import { CopyToast } from '../../components/supporting/Popups'
import Exampleicon from "../../assets/icons/common/Exampleicon"
import LeftSidebarPanel from "./Sidebar/Pysidebar"
import { useLocation } from 'react-router-dom'
import Terminal from './scaffold/Terminal'
import Topbar from './scaffold/Topbar'
import BackgroundImg from "../../assets/Background.svg?url"
import Swal from 'sweetalert2';
interface Project {
  created: string
  filepath: string
  filename: string
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
  createNewTab,
  setOutput

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
  createNewTab: () => any
  setOutput: () => any
}) {
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [terminalPath, setTerminalPath] = useState('')
  const [rootFolder, setRootFolder] = useState('')
  const themeMode = useSelector((state: any) => state.theme.mode)
  const textColor = themeMode === 'dark' ? 'text-white' : 'text-black'
  const [activeTab, setActiveTab] = useState<'serial' | 'errors'>('serial') 
  const [autoScroll, setAutoScroll] = useState(() => {
    const saved = localStorage.getItem("serial_autoscroll");
    return saved !== null ? JSON.parse(saved) : true;
  });
  //Global Search
  const [showSearchBox, setShowSearchBox] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const [showUnderDev, setShowUnderDev] = useState(false)
  const bgColor = themeMode === 'dark' ? 'bg-[#000000]' : 'bg-[#D6D6D6]'
  const bgtext = themeMode === 'dark' ? 'text-white' : 'text-black'
  const hoverbg = themeMode === 'dark' ? 'bg-[#3A3A3A]' : 'bg-[#F0F0F0]'
  const clickbg = themeMode === 'dark' ? 'bg-[#29CB09]' : 'bg-[#2EED08]'
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const location = useLocation()
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
    localStorage.setItem("serial_autoscroll", JSON.stringify(autoScroll));
  }, [autoScroll]);

  const [examples, setExamples] = useState<any[]>([])
  const [libraries, setLibraries] = useState([])
  const [leftPanel, setLeftPanel] = useState<null | 'Searchall'| 'folder' | 'library' | 'example' | 'board files'>(() => {
    return localStorage.getItem('py_leftPanel') as 'Searchall'|'folder' | 'library' | 'example' | null
  })
  const [showTerminal, setShowTerminal] = useState(() => {
    return localStorage.getItem('py_showTerminal') === 'true'
  })
  const [terminalHeight, setTerminalHeight] = useState(300)
  const isDragging = useRef(false)
  const [searchExecuted, setSearchExecuted] = useState(false);
  // Sidebar resize
  const [sidebarWidth, setSidebarWidth] = useState(270)
  const isResizingSidebar = useRef(false)
  const scrollPosRef = useRef(0);
  const settingsRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  //const [open, setOpen] = useState(false);
  const [open, setOpen] = useState<"save" | "kit" | null>(null);
  const [fileNameResults, setFileNameResults] = useState<any[]>([]);
  const [searchMode, setSearchMode] = useState<'content' | 'filename'>('content');
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
  const handleImport = () => {
    window.api.file.open('python')
      .then((result) => {
  
        if (!result) return;
  
        // Ignore dialog cancel
        if (
          result.success === false &&
          result.error === 'No file selected'
        ) {
          return;
        }
  
        if (result.success) {
          createNewTab(result.fileName, result.data, result.path);
        } else {
          setOutput(`> Error importing file: ${result.error}`);
        }
      })
      .catch((err) => {
        console.error(err);
        setOutput("> Failed to import file");
      });
  };

  const handleGlobalSearch = async (customPath?: string) => {
    if (!searchText.trim()) return

    setSearchResults([])
    setSearchMode("content")
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
  const handleReplaceAll = async () => {
    if (!searchText.trim()) return
    if (!window.monacoEditor) return
  
    const result = await Swal.fire({
      title: "Confirm Replace",
      text: `Replace all "${searchText}" with "${replaceText}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00979C",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, replace",
      cancelButtonText: "Cancel",
    })
  
    if (!result.isConfirmed) return
  
    try {
      const model = window.monacoEditor.getModel()
  
      if (!model) return
  
      const content = model.getValue()
  
      const occurrences = content.split(searchText).length - 1
  
      const updatedContent = content.replaceAll(
        searchText,
        replaceText
      )
  
      model.setValue(updatedContent)
  
      await Swal.fire({
        title: "Success",
        text: `Replaced ${occurrences} occurrences`,
        icon: "success",
        confirmButtonColor: "#00979C",
      })
  
      handleGlobalSearch()
    } catch (err) {
      console.error(err)
  
      await Swal.fire({
        title: "Error",
        text: "An error occurred during replace.",
        icon: "error",
        confirmButtonColor: "#00979C",
      })
    }
  }
  const handleFileNameSearch = async (customPath?: string) => {
    if (!searchText.trim()) return;
    setSearchExecuted(true);
    const folderPath = customPath
      ? customPath
      : projects?.[0]?.filepath
        ? projects[0].filepath.split("\\").slice(0, -1).join("\\")
        : "";  
    try {
      const res = await window.api.file.fetchByPath(folderPath);
      if (!res?.success) {
        setFileNameResults([]);
        return;
      }  
      const matches = res.data.filter((file: any) =>
        file.filename.toLowerCase().includes(searchText.toLowerCase())
      );
      setFileNameResults(matches);
    } catch (err) {
      console.error("Error", err);
    }
  };
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
  function renderHighlightedFileName (fileName: string) {
    const query = searchText.trim();
  
    if (!query) return fileName;
  
    const lowerFileName = fileName.toLowerCase();
    const lowerQuery = query.toLowerCase();
  
    const start = lowerFileName.indexOf(lowerQuery);
  
    if (start === -1) return fileName;
  
    return (
      <>
        {fileName.substring(0, start)}
        <span className="bg-yellow-300 text-black font-semibold">
          {fileName.substring(start, start + query.length)}
        </span>
        {fileName.substring(start + query.length)}
      </>
    );
  };
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
  const [replaceText, setReplaceText] = useState("")
  const toggleLeftPanel = (panel: 'Searchall'|'folder' | 'library' | 'example' | 'board files') => {
    clearSearch()
    setLeftPanel((prev) => {
      const newState = prev === panel ? null : panel
      localStorage.setItem('py_leftPanel', newState ?? '')
      return newState
    })
  }

  const toggleTerminal = () => {
    setShowTerminal((prev) => {
      const newVal = !prev
      localStorage.setItem('py_showTerminal', String(newVal))
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
      localStorage.setItem('py_showTerminal', 'false')
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

  const handleDeleteClick = (file: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening the file
    setFileToDelete(file);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    await window.api.mpRemote.runCommand(['fs', 'rm', fileToDelete]);
    setIsModalOpen(false);
    setFileToDelete(null);
    // Refresh file list
    setTimeout(() => {
      window.api.mpRemote.listBoardFiles();
    }, 400);
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
    const handleBoardFiles = (files: string[]) => {
      setBoardFiles(files);
    };
    window.api.mpRemote.onBoardFiles(handleBoardFiles);
  }, []);


  useEffect(() => {
    if (leftPanel === 'folder') {
      setBoardFiles([]);
      setTimeout(() => {
        window.api.mpRemote.listBoardFiles()
     }, 2000)    }
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

  useEffect(()=>{
    console.log("Output in Scaffold: ", output)
  }, [output])

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

  const refresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 300)); // wait for file to be written
    const res = await window.api.file.fetchDirs('python');
    if (res.success) {
      setFileTree(res.data);
      setTerminalPath(res.rootPath);
      setRootFolder(res.folderName);
    }
  };
const refreshLibraries = async () => {
    const result = await window.api.file.fetchLibraries('python')
    if (result.success && result.data && typeof result.data === 'object') {
      setLibraries(result.data)
    } else {
      console.error('Error fetching library files:', result.error)
    }
  }
  const clearSearch = () => {
    setSearchText("");
    setSearchResults([]);
    setSearchExecuted(false)
    clearEditorHighlights();
    setShowSearchBox(false);
    setFileNameResults([])
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
      setFileNameResults([]);
      clearEditorHighlights();
      return;
    }
  
    const delay = setTimeout(() => {
      if (searchMode === 'content') {
        handleGlobalSearch();
      } else {
        handleFileNameSearch();
      }
    }, 300);
  
    return () => clearTimeout(delay);
  }, [searchText, searchMode]);


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
        localStorage.setItem('py_showTerminal', 'true')
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
      const result = await window.api.file.fetchProject('python')
      if (result.success && result.data && typeof result.data === 'object') {
        setProjects(result.data)
      } else {
        console.error('❌ Error fetching all projects:', result.error)
      }
    }
    fetchAllProjects()
  }, [onSave, onImport, onNewFile])

  // Fetch example files
  useEffect(() => {
    const fetchExamples = async () => {
      const result = await window.api.file.fetchExamples('python')
      if (result.success && result.data && typeof result.data === 'object') {
        setExamples(result.data)
      } else {
        console.error('Error fetching example files:', result.error)
      }
    }
    fetchExamples()
  }, [])
  useEffect(() => {
    const fetchLibraries = async () => {
      const result = await window.api.file.fetchLibraries('python')
      if (result.success && result.data && typeof result.data === 'object') {
        setLibraries(result.data)
      } else {
        console.error('Error fetching library files:', result.error)
      }
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
    { Icon: Settings, label: "Settings" },
  ];

  useEffect(() => {
    const state = location.state as any

    if (!state || !window.monacoEditor) return

    const { searchText, lineNumber } = state

    if (!searchText) return

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
  }, [location.state])

  return (
    <>
    
    <div
  className="absolute inset-0 z-10 animate-moving-bg bg-repeat bg-center bg-contain pointer-events-none opacity-30"
  style={{ backgroundImage: `url(${BackgroundImg})` }}
/>
      <Header />
      <div className="flex flex-col h-screen ">
      {/* Top Toolbar */}
        <Topbar
            ports={ports}
            setPorts={setPorts}
            onExit={onExit}
            setOpen={setOpen}
            open={open}
            onNewFile={onNewFile}
            onOpenFolder={handleImport}
            menuItemClass={menuItemClass}
            setActiveItem={setActiveItem}
            onSave={onSave}
            refresh={refresh}
            setShowTerminal={setShowTerminal}
            onRun={onRun}
            projectName={projectName}
            setProjectName={setProjectName}
            setShowUnderDev={setShowUnderDev}
            items={items}
            bgColor={bgColor}
            onSaveToKit={onSaveToKit}
            onOpenpdf={onOpenpdf}
            selectedkit={selectedkit}
            handlePortRefreshWithPromise={handlePortRefreshWithPromise}
        />

        {/* Body */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            {/* Side Buttons */}
            <div className="flex flex-col h-full sm:w-20 md:w-[85px] lg:w-[100px] bg-[#722CF0] text-white py-0.5 ps-0 items-center justify-center">
              <div className="bg-[#FFFFFF]/25 h-full w-9/12 px-0.5 py-2 rounded-sm gap-2 flex flex-col items-center relative z-[20]">
                <button className='group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200' onClick={() => toggleLeftPanel('Searchall')}>
                  <Tooltip text="Search all" />
                  <FaSearch color="black" className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer rounded-md " />
                </button>
                <button   className="group relative bg-[#F6EC24] p-1.5 rounded-full cursor-pointer hover:border-[2px] border-black transition-transform duration-200" onClick={() => toggleLeftPanel('folder')}>
                  <Tooltip text="Files" />
                  <FolderIcon className="w-8 h-8 lg:w-10 lg:h-10 bg-[#F6EC24] p-1.5 cursor-pointer  rounded-md " />
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
                  renderHighlightedFileName={renderHighlightedFileName}
                  navigate={navigate}
                  onAddNewFolder={onAddNewFolder}
                  handleDeleteClick={handleDeleteClick}
                  onAddNewFile ={onAddNewFile}
                  projects={projects}
                  onOpenBoardFile={onOpenBoardFile}
                  refreshLibraries={refreshLibraries}
                  handleFileNameSearch = {handleFileNameSearch}
                  fileNameResults={fileNameResults}
                  searchMode={searchMode}
                  searchExecuted={searchExecuted}
                  replaceText={replaceText}
                  setReplaceText={setReplaceText}
                  handleReplaceAll={handleReplaceAll}
                />

            {/* Settings Modal */}
            {showSettings && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#BEBEBE]/20">
                <div ref={settingsRef} className="drop-shadow-lg rounded-xl">
                  <SettingModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
                </div>
              </div>
            )}
            {showUnderDev && (
            <UnderdevelopmentPopup onNo={() => setShowUnderDev(false)} />
          )}
            {/* Main Area */}
            <div className="flex-1 flex flex-col relative  overflow-hidden">
            <div className="absolute top-16 right-6 flex flex-col gap-2 z-30 ">
                <button onClick={() => fontFn('decrease')}>
                  <FontDecreaseIcon className="w-10 h-10 p-1 cursor-pointer hover:scale-105 bg-[#F6EC24] rounded-full hover:border-[3px] transition-transform duration-200" />
                </button>
                <button onClick={() => fontFn('increase')}>
                  <FontIncreaseIcon className="w-10 h-10 p-1 cursor-pointer hover:scale-105 bg-[#F6EC24] rounded-full hover:border-[3px] transition-transform duration-200" />
                </button>
              </div>
              <div className="flex-1 flex flex-col relative  overflow-visible  ">
                {/* Remove specific top-level padding if it interferes with the tab bar alignment*/}
                <div className="flex flex-col flex-grow rounded-xl overflow-hidden pl-1 pr-4">
                <div className={`flex-1 relative z-10 ${themeMode === "dark" ? "bg-black" : "bg-white"}`}>{children}</div>                
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
                    serialData={serialData}
                   />
                </div>
              }
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="h-2  w-full text-center text-white text-xs flex-shrink-0 z-10">
            <div className="flex items-center justify-center h-full w-full"></div>
          </div>
        </div>
        <CopyToast show={showCopiedToast} />
        
      </div>
      {isModalOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
    <Deletepythonfile
      open={isModalOpen}
      title="Delete File"
      message={`Are you sure you want to permanently delete the saved "${fileToDelete}" from the controller?`}
      onYes={handleConfirmDelete}
      onNo={handleCancelDelete}
    />
  </div>
)}
    </>
  )
}
