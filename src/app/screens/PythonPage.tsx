/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useState, useRef } from 'react'
import PythonScaffold from '../components/ui/PythonScaffold'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { IoIosStar } from 'react-icons/io'
import controlSuggestions from '../blockly/python/control'
import eventSuggestions from '../blockly/python/event'
import pinsSuggestions from '../blockly/python/pins'
import logicSuggestions from '../blockly/python/logic'
import sensorSuggestions from '../blockly/python/sensor'
import serialSuggestions from '../blockly/python/serial'
import standardSuggestions from '../blockly/python/standardSuggestions'
import { setKit } from '../../../store/kitslice'
import { SaveToKitPopup } from './Elements/SavetokitPopup'
import {Savetokitpop} from '../components/supporting/Popups'
import { handlePythonImport,handlePythonSave,handleExitPythonApp,handleUnsavedBeforeAction } from '../screens/CommonHelper/ListPorts'
import PDFComponent from './Elements/Topbar/Pdfcomponent'
import samplePdf from './Elements/Topbar/Code App (V1) - Python User Manual.pdf';
import { DndContext } from "@dnd-kit/core";
import {DeletionToast,FlashSuccessPopup,PressResetPopup} from '../components/supporting/Popups'
import pythonHoverInfo from '../assets/Misc Data/pythonHoverInfo.json'

interface Tab {
  id: string;
  name: string;
  code: string;
  path: string;
  isUnsaved: boolean;
  originalCode: string;
  isReadOnly: boolean
  source: 'user' | 'library' | 'example' | 'board'
}
type TerminalLine = {
  text: string;
  type: 'out' | 'err';
};


export default function PythonPage() {
  // --- Multi-Tab State ---
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'initial', name: 'untitled', code: '', path: '', isUnsaved: false, originalCode: '',source:'user',isReadOnly:false }
  ]);
  const [activeTabId, setActiveTabId] = useState('initial');

  // Helper to get active tab
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
    const [pdfPosition, setPdfPosition] = useState({ x: 0, y: 0 });

    const [options, setOptions] = useState({
      fontSize: 20,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
      automaticLayout: true,
      contextmenu: false,
      copyWithSyntaxHighlighting: true,
      domReadOnly: false
    });

  const [output, setOutput] = useState<TerminalLine[]>([]);
  const executionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [serialData, setSerialData] = useState("");
  const [availablePorts, setAvailablePorts] = useState<string[]>([])
  const [ports, setPorts] = useState<string[]>([])
  const [isChangeHappens, setIsChangeHappens] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [showSavetokitpop, setSavetokitpop] = useState(false)

  const location = useLocation()
  const dispatch = useDispatch()
  const theme = useSelector((state: any) => state.theme.mode)
  const { filePath: incomingFilePath, fileName } = location.state || {}
  const filePath = location.state?.filePath
const isReadOnly = location.state?.isReadOnly ?? false
const sourceType = location.state?.sourceType ?? "user"
  const [Savetokitpopup, ShowSavetokitpop] = useState(false)
  // --- Tab Management Logic ---
  const navigate = useNavigate()
  const [showPDF, setShowPDF] = useState(false);
  const [showToast, setShowToast] = useState(false);
const [contextMenu, setContextMenu] = useState<{ 
  x: number; 
  y: number;
  editor: any; // ✅ store editor instance directly
} | null>(null);const contextMenuRef = useRef<HTMLDivElement>(null);

const editorMenuItems = (editor: any) => [
  {
    label: 'Cut',
    action: async () => {
      if (!editor) return;

      const sel = editor.getSelection();
      const model = editor.getModel();

      if (!sel || !model) return;

      const text = model.getValueInRange(sel);

      if (text) {
        await window.api.copyText(text);

        editor.executeEdits('custom-cut', [
          {
            range: sel,
            text: '',
            forceMoveMarkers: true
          }
        ]);

        editor.focus();
      }
    }
  },
  {
    label: 'Copy',
    action: async () => {
      if (!editor) return;

      const sel = editor.getSelection();
      const model = editor.getModel();

      if (!sel || !model) return;

      const text = model.getValueInRange(sel);

      if (text) {
        await window.api.copyText(text);
      }

    }
  },
  {
    label: 'Paste',
    action: async () => {
      if (!editor) return;

      const sel = editor.getSelection();
      if (!sel) return;

      const text = await window.api.pasteText(); // ✅ IMPORTANT await

      if (text) {
        editor.executeEdits('custom-paste', [
          {
            range: sel,
            text,
            forceMoveMarkers: true
          }
        ]);

        editor.focus();
      }
    }
  }
];
const handleBoardFileOpen = async (file: string) => {
  window.api.mpRemote.readBoardFile(file)
}

const handleOpenBoardFile = (file: string) => {
  window.api.mpRemote.readBoardFile(file)
}
useEffect(() => {
  const handleBoardFileRead = (data: { filename: string; content: string }) => {
    const tabId = `board-${data.filename}`

    setTabs(prevTabs => {
      const existingTab = prevTabs.find(tab => tab.id === tabId)

      if (existingTab) {
        setActiveTabId(existingTab.id)
        return prevTabs
      }

      const newTab: Tab = {
        id: tabId,
        name: data.filename,
        code: data.content,
        path: `board:/${data.filename}`,
        isUnsaved: false,
        originalCode: data.content,
        source: 'board',
        isReadOnly: false,
      }

      setActiveTabId(tabId)
      return [...prevTabs, newTab]
    })
  }

  window.api.mpRemote.onFileContent(handleBoardFileRead)
}, [])
  const createNewTab = (name = 'untitled', code = '', path = '') => {
    const newId = Date.now().toString();
    const newTab: Tab = {
      id: newId,
      name: name || `untitled`,
      code: code,
      path: path,
      isUnsaved: false,
      originalCode: code,
      source: sourceType || 'user',
      isReadOnly: !!isReadOnly
        
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };
  const handleNewFileCreation = () => {
    createNewTab('untitled ', '', '');
    appendOutput(`> New project created`, 'out');
  }
  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      handleNewFileCreation(); // Reset if last tab
      return;
    }
    const tabToClose = tabs.find(t => t.id === id);
    if (!tabToClose) return;

    const result =  handleUnsavedBeforeAction({
      tab: tabToClose,
      onSave: async () => {
        return await handlePythonSave({
          activeTab: tabToClose,
          updateActiveTabData,
          appendOutput
        });
      }
    });
  
    if (result === "cancel") return;
  
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const updateActiveTabData = (updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  const [unsavedChanges, setUnsavedChanges] = useState(true);
  const appendOutput = (text: string, type: 'out' | 'err' = 'out') => {
    setOutput(prev => [...prev, { text, type }]);
  };

  // --- Existing Logic Updated for Tabs ---

  useEffect(() => {
    if (incomingFilePath) {
      window.api.file.fileOpen(incomingFilePath).then((result) => {
        if (result.success) {
          const existingTab = tabs.find(t => t.path === incomingFilePath);
          if (existingTab) {
            setActiveTabId(existingTab.id);
          } else {
            createNewTab(fileName, result.data, incomingFilePath);
          }
        } else {
          appendOutput(`> Error loading file: ${result.error}\n`, 'err');
        }
      })
    }
  }, [incomingFilePath, fileName]);
  const [flashSuccessOpen, setFlashSuccessOpen] = useState(false);
  const [pressResetOpen, setPressResetOpen] = useState(false);

  const handleExitAndFlash = async () => {
    const canExit = await handleExitPythonApp({
      activeTab,
      updateActiveTabData,
      appendOutput,
      navigate,
    });
  
    if (!canExit) return;
  
    try {
      const res = await window.api.flashing.flashBoard();
  
      if (!res) {
        console.log("flashBoard returned undefined");
        return;
      }
  
      if (res.success) {
        navigate("/", {
          state: { showResetPopup: true }
        });
          } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Flash error:", err);
    }
  };

  const handleFlashOk = () => {
    setFlashSuccessOpen(false);
    navigate("/", {
      replace: true,
      state: { showResetPopup: true }
    });
    };

  // OK handler for PressResetPopup
  const handlePressResetOk = () => {
    setPressResetOpen(false);
  };


  const handleFontSize = (size: string) => {
    setOptions((prev) => ({
      ...prev,
      fontSize: size === 'increase' ? prev.fontSize + 2 : prev.fontSize - 2
    }))
  }

  const [boardName, setBoardName] = useState("");
  const listAvailablePorts = () => {
    console.log("Calling listPorts…");
    window.api.mpRemote
      .listPorts()
      .then((result) => {
        console.log("listPorts raw result:", result);

        if (!result || !Array.isArray(result.ports)) {
          console.error("result.ports is missing or not an array");
          return;
        }

        if (!result.success) {
          console.error("Error listing ports:", result.error);
          appendOutput(`> Error listing ports: ${result.error}\n`, 'err');
          return;
        }
        let mode = "";
        let boardPort = "";


        const pythonIndex = result.ports.findIndex(
          (line) =>
            line.includes("303a:817a") ||
            line.includes("2e8a:0005")
        );
        const blocklyIndex = result.ports.findIndex(
          line =>
            line.includes("303a:1001") ||
            line.includes("2e8a:000a")
        );

        if (pythonIndex !== -1) {
          mode = "Python Mode";
        
          const pythonLine = result.ports[pythonIndex];
          const parts = pythonLine.split(" ");
        
          boardPort = parts[0] || "";
          const detectedName = parts[1] || "";
        
          //setBoardName(detectedName);
        
          console.log("Detected Python board:", detectedName);
        
          if (detectedName.includes("CAYO")) {
            dispatch(setKit("cayo"));
            setBoardName("Cayo")
          } else if (detectedName.includes("SUBO")) {
            dispatch(setKit("subo"));
            setBoardName("Subo")
          } else if (detectedName.startsWith("E4650")) {
            dispatch(setKit("snowflake"));
            setBoardName("Snowflake")
          }
        }
        else if (blocklyIndex !== -1) {
          mode = "Blockly Mode";
          const blocklyLine = result.ports[blocklyIndex];
          const parts = blocklyLine.split(" ");
          boardPort = parts[0];
          const detectedName = parts[1] || "";
          setBoardName(detectedName);          
          console.log("Detected Blockly board:", detectedName);
        }


        const comPorts = result.ports.map((line) => line.split(" ")[0]);
        console.log("comPorts:", comPorts);

        const orderedPorts =
          boardPort !== ""
            ? [boardPort, ...comPorts.filter((p) => p !== boardPort)]
            : comPorts;

        console.log("orderedPorts:", orderedPorts);
        setAvailablePorts(orderedPorts);
        setPorts(orderedPorts);
        if (mode === "Python Mode") {
          appendOutput(`\n> Board Detected: ${boardName}\n> Port: ${boardPort}\n> Mode: ${mode}\n`, 'out');
        }
      })
      .catch((err) => {
        console.error("listPorts threw:", err);
      });
  };

// ✅ Stable ref so closure is never stale
const setContextMenuRef = useRef(setContextMenu);
useEffect(() => {
  setContextMenuRef.current = setContextMenu;
}, [setContextMenu]);
  const handleRunUsingMpRemote = () => {
    window.api.mpRemote.run(activeTab.code).then((result) => {
      if (result.success) {
        appendOutput(`> Running script...\n`, 'out');
      } else {
        appendOutput(`> Error:\n${result.error}`, 'err')
      }
    })
  }
  
  const handleSaveToKit = (filename: string) => {
    //if (!activeTab.name) return;
    console.log("File name front : ", filename)
    window.api.mpRemote.SaveToKit(filename, activeTab.code);
    setSavetokitpop(true)
    setTimeout(() => setSavetokitpop(false), 2500);  
        setTimeout(() => {
      window.api.mpRemote.listBoardFiles();
    }, 500);
  };

  const handleStop = () => {
    if (executionTimeoutRef.current) {
      clearTimeout(executionTimeoutRef.current)
      executionTimeoutRef.current = null
    }
    appendOutput(`>Execution stopped`, 'out');
    setIsRunning(false)
  }
  const isMicroPythonError = (text: string) => {
    return (
      text.includes('Traceback (most recent call last):') ||
      text.includes('Error:') ||
      text.includes('Exception') ||
      text.includes('ImportError') ||
      text.includes('ModuleNotFoundError')
    );
  };
  const getUnsavedState = () => {
    const isNewFile = !activeTab.path && activeTab.code.trim() !== "";
    const isModifiedFile =
      !!activeTab.path && activeTab.code !== activeTab.originalCode;
  
    if (isNewFile) {
      return "new";
    }
  
    if (isModifiedFile) {
      return "modified";
    }
  
    return "none";
  };
  

  const staticSuggestions = [
    ...standardSuggestions, ...controlSuggestions, ...eventSuggestions,
    ...pinsSuggestions, ...logicSuggestions, ...sensorSuggestions, ...serialSuggestions
  ];

  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.languages.register({ id: 'python' })
      monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: (model) => {
          const code = model.getValue()
          const dynamicSuggestions: any[] = []
          const functionMatches = [...code.matchAll(/def\s+(\w+)\s*\(/g)]
          for (const match of functionMatches) {
            dynamicSuggestions.push({
              label: match[1],
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: `${match[1]}($1)`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            })
          }
          return { suggestions: [...staticSuggestions, ...dynamicSuggestions] }
        }
      });
      monaco.languages.registerHoverProvider('python', {
        provideHover: function (model, position) {

          const word = model.getWordAtPosition(position);
          if (!word) return null;

          const keyword = word.word;

          

          if (pythonHoverInfo[keyword]) {
            return {
              range: new monaco.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn
              ),
              contents: [
                { value: `**${keyword}**` },
                { value: pythonHoverInfo[keyword] }
              ]
            };
          }

          return null;
        }
      });

    })
  }, [])

  useEffect(() => {
    const onOutput = (_: any, data: string) => {
      console.log("OUT:", data);

      setOutput(prev => [
        ...prev,
        {
          text: data,
          type: isMicroPythonError(data) ? 'err' : 'out'
        }
      ]);
    };

    const onError = (_: any, data: string) => {
      console.error("ERR:", data);

      setOutput(prev => [
        ...prev,
        { text: data, type: 'err' }
      ]);
    };

    const onExit = (_: any, data: { code: number; args: string[] }) => {
      console.log("EXIT:", data);
    
      // Detect deletion command
      if (data.code === 0 && data.args.includes('rm')) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    };

    window.electron.ipcRenderer.on('mpremote-output', onOutput);
    window.electron.ipcRenderer.on('mpremote-error', onError);
    window.electron.ipcRenderer.on('mpremote-exit', onExit);

    listAvailablePorts();

    return () => {
      window.electron.ipcRenderer.removeListener('mpremote-output', onOutput);
      window.electron.ipcRenderer.removeListener('mpremote-error', onError);
      window.electron.ipcRenderer.removeListener('mpremote-exit', onExit);
    };
  }, []);
  useEffect(() => {
    const handler = (data) => {
      const { filename, content } = data;
  
      setTabs(prevTabs => {
        const existing = prevTabs.find(t => t.name === filename);
  
        if (existing) {
          setActiveTabId(existing.id);
          return prevTabs;
        }
  
        const newId = Date.now().toString();
  
        const newTab = {
          id: newId,
          name: filename,
          code: content,
          originalCode: content,
          isUnsaved: false,
          path: ''
        };
  
        setActiveTabId(newId);
  
        return [...prevTabs, newTab];
      });
    };
  
    window.api.mpRemote.onFileContent(handler);
  
    
  }, []);
  useEffect(() => {
    const deleteHandler = (data) => {
      const { filename } = data;
  
      setTabs(prevTabs =>
        prevTabs.map(tab => {
          if (tab.name === filename) {
            return {
              ...tab,
              name: "untitled",
              path: "",
              isUnsaved: true
            };
          }
          return tab;
        })
      );
    };
  
    window.api.mpRemote.onOutput(deleteHandler);
  
  }, []);

  // const theme = useSelector((state: any) => state.theme.mode)

  return (
     <DndContext
              onDragEnd={({ delta }) => {
                setPdfPosition(prev => ({
                  x: prev.x + delta.x,
                  y: prev.y + delta.y,
                }));
              }}
            >
    <div className="flex flex-col h-screen w-screen bg-[#722CF0] text-white">
      <PythonScaffold
        setIsChangeHappens={setIsChangeHappens}
        ports={ports}
        setPorts={setPorts}
        projectName={activeTab.name}
        unsavedChanges={tabs.some(t => t.isUnsaved)}
        setProjectName={(name) =>
          updateActiveTabData({
            name,
            isUnsaved: true   
          })
        }        
        onSave={(mode: any) => {
          if (activeTab?.isReadOnly) {
            return
          }
        
          handlePythonSave({
            mode,
            activeTab,
            updateActiveTabData,
            appendOutput
          })
        }}
        onImport={() =>
          handlePythonImport({
            appendOutput,
            createNewTab,
          })
        }      
        onNewFile={handleNewFileCreation}        
        fontFn={(size) => setOptions(prev => ({ ...prev, fontSize: size === 'increase' ? prev.fontSize + 2 : prev.fontSize - 2 }))}
        onRun={handleRunUsingMpRemote}
        onStop={handleStop}
        output={output}
        serialData={serialData}
        onClear={() => {
          setSerialData("");
          setOutput([]);
        }}
        selectedkit={boardName}
        onSaveToKit={() => ShowSavetokitpop(true)}
        onExit={handleExitAndFlash}
        onOpenpdf={() => setShowPDF(true)}
        onOpenBoardFile={handleOpenBoardFile} 
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* TAB BAR */}
          <div className="flex items-end bg-[#722CF0] pt-2 gap-1 overflow-x-auto border-b border-black/10 ">
  {tabs.map(tab => (
    <div
      key={tab.id}
      onClick={() => setActiveTabId(tab.id)}
      className={`group px-4 py-2 cursor-pointer flex items-center gap-2 rounded-t-lg transition-all min-w-[120px] ${
        activeTabId === tab.id
          ? 'bg-black text-white dark:bg-white dark:text-black font-bold border-white'
          : 'bg-[#FFDE21] text-black border-transparent'
      }`}
    >
       <span className="text-sm truncate flex items-center gap-1">
        {tab.source === 'board' && (
  <IoIosStar className={`w-5 h-5 ${ activeTabId === tab.id ? 'text-white dark:text-black': 'text-black'}`}/>)}
        <span className="truncate">
          {tab.name}{tab.isUnsaved ? '*' : ''}
        </span>
      </span>

      <button
        onClick={(e) => closeTab(e, tab.id)}
        className="opacity-0 group-hover:opacity-100 hover:text-red-500 font-bold transition-opacity ml-auto"
      >
        ×
      </button>
    </div>
  ))}

  <button
    onClick={() => createNewTab()}
    className="h-8 px-3 mb-1 flex items-center justify-center rounded-md bg-white text-black font-bold hover:bg-gray-100 transition-all"
  >
    +
  </button>
</div>

          {/* EDITORS - One for each tab, visibility toggled */}
          <div className="flex-grow relative bg-white dark:bg-[#1e1e1e]">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className="absolute inset-0"
                style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
              >
                <Editor
                  height="100%"
                  width="100%"
                  defaultLanguage="python"
                  value={tab.code}
                  onChange={(val) => {
                    if (tab.isReadOnly) return
                  
                    setTabs(prev =>
                      prev.map(t =>
                        t.id === tab.id
                          ? {
                              ...t,
                              code: val || '',
                              isUnsaved: (val || '') !== t.originalCode
                            }
                          : t
                      )
                    )
                  }}
                  theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                  options={{
                    ...options,
                    readOnly: !!tab.isReadOnly,
                    domReadOnly: !!tab.isReadOnly
                  }}                  
                  onMount={(editor) => {
                    window.monacoEditor = editor;
                    editor.focus();
                    if (activeTabId === tab.id) editor.focus();
                  
                    editor.updateOptions({ contextmenu: false });
                  
                    // ✅ Small delay ensures DOM node is ready for new/unsaved tabs
                    setTimeout(() => {
                      const editorDom = editor.getDomNode();
                      if (!editorDom) return;
                  
                      editorDom.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenuRef.current({ x: e.clientX, y: e.clientY,editor:editor });
                      });
                    }, 100);
                  
                    editor.onMouseDown(() => {
                      setContextMenuRef.current(null);
                    });
                  }}
                  
                />
              </div>
            ))}
          </div>
        </div>
        <SaveToKitPopup
          open={Savetokitpopup}
          projectName={activeTab.name}
          onClose={() => ShowSavetokitpop(false)}
          onConfirm={(name) => {
            ShowSavetokitpop(false);
            handleSaveToKit(name);
          }}
        />
  {
            showSavetokitpop && (
              <Savetokitpop type={"save"}/>
            )
          }
 {showPDF && (
            <PDFComponent pdfUrl={samplePdf} position={pdfPosition} onClose={() => setShowPDF(false)} title={"Python User Manual"} />
          )}
          {/* ✅ Custom Monaco Context Menu */}
{contextMenu && (
  <div
    ref={contextMenuRef}
    className="fixed z-[9999] w-36 rounded-md shadow-lg overflow-hidden bg-[#FFDE21]"
    style={{ top: contextMenu.y, left: contextMenu.x }}
    onClick={(e) => e.stopPropagation()}
    // ✅ Close on outside click
    onMouseLeave={() => setContextMenu(null)}
  >
    {editorMenuItems(contextMenu.editor).map((item) => (
      <button
        key={item.label}
        onClick={(e) => {
          e.stopPropagation();
          item.action();
          setContextMenu(null);
        }}
        className="w-full text-left px-1 py-1"
      >
        <div className="rounded px-3 py-2 text-sm transition text-black hover:bg-white">
          {item.label}
        </div>
      </button>
    ))}
  </div>
)}
            <DeletionToast
        show={showToast}
        message="Deleted Successfully"
      />

<FlashSuccessPopup
        open={flashSuccessOpen}
        rightCornerImage="" // empty string
        onOk={handleFlashOk}
      />

      <PressResetPopup
        open={pressResetOpen}
        onOk={handlePressResetOk}
      />
      </PythonScaffold>
    </div>
    </DndContext>
  )
}
