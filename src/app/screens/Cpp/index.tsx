/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useState, useRef } from 'react'
import CppScaffold from './CppScaffold'
import type { CppScaffoldHandle } from './CppScaffold'
import Editor,{ useMonaco }  from '@monaco-editor/react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation,useNavigate } from 'react-router-dom'
import type { RootState } from "../../../../store/index"
import { setKit } from '../../../../store/kitslice'
import { setPath } from '../../../../store/projectSlice'
import { handleCppSave } from './CppHelper/cpphelper'


interface Tab {
  id: string;
  name: string;
  code: string;
  path: string;
  isUnsaved: boolean;
  originalCode: string;
}
type TerminalLine = {
  text: string;
  type: 'out' | 'err';
};


export default function CppPage() {
  // --- Multi-Tab State ---

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState('');

  const selectedFilePath = useSelector((state: RootState) => state.project.projectPath);


  // Helper to get active tab
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const [options, setOptions] = useState({
    fontSize: 20,
    minimap: { enabled: false, scrollBeyondLastLine: false },
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    automaticLayout: true
  })

  const [output, setOutput] = useState<TerminalLine[]>([]);
  const executionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [serialData, setSerialData] = useState("");
  const [isChangeHappens, setIsChangeHappens] = useState(false)
  const [availablePorts, setAvailablePorts] = useState<string[]>([])
  const [ports, setPorts] = useState<string[]>([])
  const dispatch = useDispatch()
  const [boardName, setBoardName] = useState("");

  const projectPath = useSelector((state: RootState) => state.project.projectPath);

  const [projectName, setProjectName] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const scaffoldRef = useRef<CppScaffoldHandle>(null);
  // #7 — the last failed build's log, surfaced to the chat panel for "fix it with AI".
  const [buildError, setBuildError] = useState('');
  const runLogRef = useRef('');

  const location = useLocation()
  const navigate = useNavigate();
  const importingRef = useRef(false);
  const selectedKit = useSelector((state: RootState) => state.kits.kit)
  const theme = useSelector((state: any) => state.theme.mode)
  const { filePath: incomingFilePath, fileName } = location.state || {}

  // --- Tab Management Logic ---

  const createNewTab = (name = 'untitled', code = '', path = '') => {
    const newId = Date.now().toString();
    const newTab: Tab = {
      id: newId,
      name: name || `project ${tabs.length + 1}`,
      code: code,
      path: path,
      isUnsaved: false,
      originalCode: code
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const tabToClose = tabs.find(t => t.id === id);
    if (tabToClose?.isUnsaved && !window.confirm('Discard unsaved changes?')) return;

    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);

    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };
  const closeAllTabs = () => {
    const hasUnsaved = tabs.some(tab => tab.isUnsaved);

    if (hasUnsaved && !window.confirm('Discard unsaved changes?')) {
      return false;
    }
  
    setTabs([]);
  
    setActiveTabId('');
    return true;
  };
  const updateActiveTabData = (updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const appendOutput = (text: string, type: 'out' | 'err' = 'out') => {
    setOutput(prev => [...prev, { text, type }]);
  };
  const themeMode = useSelector((state: any) => state.theme.mode)


  useEffect(() => {
    const handleSerialData = (data: string) => {
      console.log('Received data from serial:', data);
      setSerialData(prev => prev + data + '\n'); // append new line
    };
    window.api.serial.onData(handleSerialData);
  },[])
  // --- Existing Logic Updated for Tabs ---
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;
  
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#000000",
      },
    });
  
    monaco.editor.defineTheme("custom-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#FFFFFF",
      },
    });
  }, []);
  useEffect(() => {
    if (!incomingFilePath) return;
  
    if (importingRef.current) {
      importingRef.current = false;
      return;
    }
  
    window.api.file.fileOpen(incomingFilePath).then((result) => {
      if (result.success) {
        createNewTab(fileName, result.data, incomingFilePath);
      }
    });
  }, [incomingFilePath]);


  useEffect(() => {
    const init = async () => {
      try {
        const latestPort = await listAvailablePorts();

        if (latestPort) {
          await window.api.serial.open(latestPort, { baudRate: 115200 });

          console.log('Serial opened');

          await new Promise(resolve => setTimeout(resolve, 300));
          await window.api.serial.write(JSON.stringify({ msg: 'cswitch' }) + '\n');

          console.log('Sent switch command');

          await new Promise(resolve => setTimeout(resolve, 300));
        }

        //await window.api.serial.close();

      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!activeTab?.path) return;
  
    if (activeTab.code === activeTab.originalCode) {
      return;
    }
  
    const timer = setTimeout(() => {
      handleCppSave({
        mode: "autosave",
        activeTab,
        updateActiveTabData,
        appendOutput,
        showPopup: false,
      });
    }, 3000);
  
    return () => clearTimeout(timer);
  }, [activeTab?.code, activeTab?.originalCode]);
  const listAvailablePorts = async (): Promise<string> => {
    try {
      console.log("Calling listPorts…");

      const result = await window.api.mpRemote.listPorts();

      console.log("listPorts raw result:", result);

      if (!result || !Array.isArray(result.ports)) {
        console.error("result.ports is missing or not an array");
        return "";
      }

      if (!result.success) {
        console.error("Error listing ports:", result.error);
        appendOutput(`> Error listing ports: ${result.error}\n`, 'err');
        return "";
      }

      let mode = "";
      let boardPort = "";

      const pythonIndex = result.ports.findIndex(
        (line) =>
          line.includes("303a:817a") ||
          line.includes("2e8a:0005")
      );

      const blocklyIndex = result.ports.findIndex(
        (line) =>
          line.includes("303a:1001") ||
          line.includes("2e8a:000a")
      );

      if (pythonIndex !== -1) {
        mode = "Python Mode";

        const pythonLine = result.ports[pythonIndex];
        const parts = pythonLine.split(" ");

        boardPort = parts[0] || "";
        const detectedName = parts[1] || "";

        if (detectedName.includes("CAYO")) {
          dispatch(setKit("cayo"));
          setBoardName("Cayo");
        } else if (detectedName.includes("SUBO")) {
          dispatch(setKit("subo"));
          setBoardName("Subo");
        } else if (detectedName.startsWith("E4650")) {
          dispatch(setKit("snowflake"));
          setBoardName("Snowflake");
        }
      } else if (blocklyIndex !== -1) {
        mode = "Blockly Mode";

        const blocklyLine = result.ports[blocklyIndex];
        const parts = blocklyLine.split(" ");

        boardPort = parts[0] || "";
        const detectedName = parts[1] || "";

        setBoardName(detectedName);
        console.log("Detected Blockly board:", detectedName);
      }

      const comPorts = result.ports.map((line) => line.split(" ")[0]);

      const orderedPorts =
        boardPort !== ""
          ? [boardPort, ...comPorts.filter((p) => p !== boardPort)]
          : comPorts;

      setAvailablePorts(orderedPorts);
      setPorts(orderedPorts);

      if (mode === "Python Mode") {
        appendOutput(
          `\n> Board Detected: ${boardName}\n> Port: ${boardPort}\n> Mode: ${mode}\n`,
          'out'
        );
      }

      return boardPort;
    } catch (err) {
      console.error("listPorts threw:", err);
      return "";
    }
  };

  const handleSave = () => {
    window.api.file.save(activeTab.path, activeTab.code, 'cpp', activeTab.name).then((result) => {
      if (result.success) {
        appendOutput(`> File saved to: ${result.path}\n`, 'out');
        updateActiveTabData({
          path: result.path,
          originalCode: activeTab.code,
          isUnsaved: false
        });
      } else {
        appendOutput(`> Error saving file: ${result.error}\n`, 'err');
      }
    })
  }

  const handleImport = async () => {
    importingRef.current = true;
  
    const result = await window.api.file.open('cpp');
    if (!result.success) return;
  
    const newId = Date.now().toString();
  
    setTabs([
      {
        id: newId,
        name: result.fileName,
        code: result.data,
        path: result.path,
        isUnsaved: false,
        originalCode: result.data,
      },
    ]);
  
    setActiveTabId(newId);
  };
  const handleNewFileCreation = () => {
    createNewTab('project ' + (tabs.length + 1), '', '');
    appendOutput(`> New project created`, 'out');
  }

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to leave without saving?'
        )

        if (!confirmed) {
          event.preventDefault()
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [unsavedChanges])

  // A real PlatformIO project has a platformio.ini at its root. The Cpp page's
  // redux path defaults to the bare cpp/ folder (NOT a project), so we must check.
  const isPlatformioProject = async (root: string): Promise<boolean> => {
    if (!root) return false
    try {
      const r = await window.api.file.fileOpen(`${root}\\platformio.ini`) as any
      return !!r?.success
    } catch {
      return false
    }
  }

  // Turn a name hint (the model's suggestion, or the user's prompt) into a safe folder
  // name: lowercase words joined by underscores, capped to ~6 words / 40 chars so a long
  // prompt yields a clean name (no mid-word truncation). Empty if nothing usable survives
  // — caller then falls back to a timestamp.
  const slugifyName = (s?: string): string => {
    const words = (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    let out = ''
    for (const w of words) {
      const next = out ? `${out}_${w}` : w
      if (next.length > 40 || out.split('_').filter(Boolean).length >= 6) break
      out = next
    }
    return out
  }

  // A PlatformIO source file lives at <root>\src\<file> or <root>\include\<file>; strip the
  // trailing \src\… or \include\… to recover the project root (both path separators).
  const projectRootOfTab = (tabPath?: string): string => {
    if (!tabPath) return ''
    const m = tabPath.match(/^(.*)[\\/](?:src|include)[\\/][^\\/]+$/i)
    return m ? m[1] : ''
  }

  // Path + tab helpers for the multi-file program.
  const winPath = (root: string, rel: string) => `${root}\\${rel.replace(/\//g, '\\')}`
  const samePathEq = (a: string, b: string) =>
    a.replace(/\//g, '\\').toLowerCase() === b.replace(/\//g, '\\').toLowerCase()

  // Heuristic guard for edit mode: is this edit DESTRUCTIVE — i.e. it rewrites an existing
  // file and DROPS a function or shrinks the code a lot? Additive edits (a new module, a
  // new function, more lines) are NOT destructive and apply silently.
  const isDestructiveEdit = (
    current: { path: string; content: string }[],
    next: { path: string; content: string }[],
  ): boolean => {
    const KW = new Set(['if', 'for', 'while', 'switch', 'else', 'do', 'return', 'sizeof'])
    const strip = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ').trim()
    const fnNames = (s: string) =>
      new Set(
        (s.match(/\b([A-Za-z_]\w*)\s*\([^;{)]*\)\s*\{/g) || [])
          .map((m) => m.replace(/\s*\(.*$/, '').trim())
          .filter((n) => n && !KW.has(n)),
      )
    const curMap = new Map(
      current.map((f) => [f.path.replace(/\\/g, '/').toLowerCase(), f.content] as const),
    )
    for (const nf of next) {
      const cur = curMap.get(nf.path.replace(/\\/g, '/').toLowerCase())
      if (cur == null) continue // brand-new file → additive
      const a = strip(cur)
      const b = strip(nf.content)
      if (a.length > 100 && b.length < a.length * 0.6) return true // big shrink
      const nextFns = fnNames(b)
      for (const fn of fnNames(a)) if (!nextFns.has(fn)) return true // lost a function
    }
    return false
  }

  // Write the generated files (config.h + main.cpp) into the project; return main.cpp's path.
  const saveFilesToProject = async (
    root: string,
    files: { path: string; content: string }[],
  ): Promise<string> => {
    let mainPath = `${root}\\src\\main.cpp`
    for (const f of files) {
      const abs = winPath(root, f.path)
      const res = (await window.api.file.save(
        abs, f.content, 'cpp', f.path.split('/').pop() || 'main.cpp', selectedKit, '',
      )) as any
      const saved = res?.success && res.path ? res.path : abs
      if (/main\.cpp$/i.test(f.path)) mainPath = saved
    }
    return mainPath
  }

  // After generation: ensure main.cpp is open + active and shows the new code (config.h is
  // written to disk and visible in Folder View, but not force-opened to avoid clutter).
  const openMainTab = (root: string, files: { path: string; content: string }[], focus: boolean) => {
    const mainFile = files.find((f) => /main\.cpp$/i.test(f.path)) || files[0]
    if (!mainFile) return
    const mainAbs = winPath(root, mainFile.path)
    const existing = tabs.find((t) => t.path && samePathEq(t.path, mainAbs))
    if (existing) {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === existing.id
            ? { ...t, code: mainFile.content, originalCode: mainFile.content, isUnsaved: false }
            : t,
        ),
      )
      if (focus) setActiveTabId(existing.id)
    } else {
      const label = root.split(/[\\/]/).filter(Boolean).pop() || 'main.cpp'
      createNewTab(label, mainFile.content, mainAbs) // createNewTab sets it active
    }
  }

  // After verify/fix (which rewrote files on disk): update the content of any tabs already
  // open for those files. Doesn't open new tabs.
  const refreshOpenTabs = (root: string, files: { path: string; content: string }[]) => {
    setTabs((prev) =>
      prev.map((t) => {
        const f = files.find((ff) => t.path && samePathEq(t.path, winPath(root, ff.path)))
        return f ? { ...t, code: f.content, originalCode: f.content, isUnsaved: false } : t
      }),
    )
  }

  // Build the edit-mode context: ALL the project's source files (config.h, functions.h,
  // functions.cpp, main.cpp, …), with the active tab's (maybe unsaved) content overriding
  // disk so in-editor edits are respected.
  const getEditContext = async (): Promise<string | undefined> => {
    const root = projectRootOfTab(activeTab?.path)
    if (!root) return undefined
    let files: { path: string; content: string }[] = []
    try {
      files = (await window.api.agent.readProjectFiles(root)) || []
    } catch {
      files = []
    }
    if (!files.length) return undefined
    // Override the file matching the active tab with the live editor content.
    if (activeTab?.path) {
      files = files.map((f) =>
        samePathEq(winPath(root, f.path), activeTab.path) ? { ...f, content: activeTab.code } : f,
      )
    }
    return files.map((f) => `===== FILE: ${f.path} =====\n${f.content}`).join('\n\n')
  }

  // True if a file already holds real C++ (ignoring comments/whitespace, so the default
  // "// main.cpp" scaffold counts as empty) — used to decide whether replacing it needs
  // the user's OK.
  const mainHasRealCode = async (mainPath: string): Promise<boolean> => {
    try {
      const r = await window.api.file.fileOpen(mainPath) as any
      if (!r?.success) return false
      const stripped = String(r.data || '')
        .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
        .replace(/\/\/.*$/gm, '')          // line comments
        .trim()
      return stripped.length > 0
    } catch {
      return false
    }
  }

  // Create a fresh, meaningfully-named PlatformIO project (model's suggestion, slugified,
  // with collision handling — create-new-project throws on an existing folder). Returns
  // the project path, or '' on failure (after reporting the error to the terminal).
  const createFreshProject = async (suggestedName?: string): Promise<string> => {
    const base = slugifyName(suggestedName) || `AI_${Date.now()}`
    let name = base
    for (let attempt = 1; attempt <= 20; attempt++) {
      const res = await window.api.file.createProject(name) as any
      if (res?.success && res.data) return res.data
      if (/exist/i.test(String(res?.error || ''))) { name = `${base}_${attempt + 1}`; continue }
      appendOutput(`> Could not create a project for the generated code: ${res?.error || 'unknown error'}\n`, 'err')
      return ''
    }
    // Every slugged name collided — fall back to a guaranteed-unique timestamp.
    const res = await window.api.file.createProject(`AI_${Date.now()}`) as any
    if (res?.success && res.data) return res.data
    appendOutput(`> Could not create a project for the generated code.\n`, 'err')
    return ''
  }

  // AI chat generated a C++ program: auto-save it into a real PlatformIO project's
  // src/main.cpp so the existing Run button can build+flash, then show it in a tab.
  // If a real project is already open we reuse it — but if its main.cpp already holds
  // hand-written code we ASK before replacing it; declining saves into a fresh,
  // meaningfully-named project instead (so the user's work is never silently lost).
  const handleCodeGenerated = async (
    files: { path: string; content: string }[],
    suggestedName?: string,
    libDeps?: string[],
    opts?: { verify?: boolean; prompt?: string; editInPlace?: boolean },
  ) => {
    try {
      if (!files?.length) {
        appendOutput(`> The AI did not return any code.\n`, 'err')
        return
      }
      let root = ''
      let createdNew = false

      // Edit mode: the user is modifying the program they have open → write straight back
      // into that project, no new project. Additive edits apply silently; but if the edit
      // looks DESTRUCTIVE (drops a function / big shrink) we confirm first (option 3).
      if (opts?.editInPlace) {
        const r = projectRootOfTab(activeTab?.path)
        if (await isPlatformioProject(r)) {
          let current: { path: string; content: string }[] = []
          try {
            current = (await window.api.agent.readProjectFiles(r)) || []
          } catch {
            current = []
          }
          if (current.length && isDestructiveEdit(current, files)) {
            const okay = window.confirm(
              `This change removes or significantly shrinks code in "${r.split(/[\\/]/).pop()}".\n\n` +
                `Apply it anyway?\n\nOK = apply the change.    Cancel = keep your current code.`,
            )
            if (!okay) {
              appendOutput(`> Edit cancelled — your code is unchanged.\n`, 'out')
              return
            }
          }
          root = r
        }
      }

      if (!root) {
        // Is a real project open? (the one the active tab belongs to, else the redux path)
        let openRoot = projectRootOfTab(activeTab?.path)
        if (!(await isPlatformioProject(openRoot))) openRoot = selectedFilePath
        const projectOpen = await isPlatformioProject(openRoot)

        if (projectOpen) {
          // Reuse the open project, but get consent before clobbering existing code.
          const openMain = `${openRoot}\\src\\main.cpp`
          const overwriteOk =
            !(await mainHasRealCode(openMain)) ||
            window.confirm(
              `"${openRoot.split(/[\\/]/).pop()}" already has code.\n\n` +
                `Replace it with the AI-generated program?\n\n` +
                `OK = replace it.    Cancel = save into a new project instead.`,
            )
          if (overwriteOk) root = openRoot
        }

        if (!root) {
          // No project open, or the user declined the overwrite → make a fresh one.
          root = await createFreshProject(suggestedName)
          if (!root) return // error already reported to the terminal
          createdNew = true
        }
      }

      // Point Run at this project (build compiles state.project.projectPath).
      dispatch(setPath(root))

      // Write config.h + main.cpp to disk.
      await saveFilesToProject(root, files)

      // Make it buildable: add any non-bundled libraries #included anywhere in the program
      // (scanned across both files on disk) to platformio.ini lib_deps.
      try {
        const libRes = await window.api.agent.ensureLibraries(root, libDeps)
        if (libRes?.added?.length) {
          appendOutput(`> Added libraries to platformio.ini: ${libRes.added.join(', ')}\n> They download automatically on the first Run.\n`, 'out')
        }
        if (libRes?.unresolved?.length) {
          appendOutput(`> Heads up: these includes may need a library that wasn't auto-added — ${libRes.unresolved.join(', ')}. If the build fails, add it from the Library panel.\n`, 'err')
        }
      } catch (e) {
        appendOutput(`> Could not update project libraries: ${e instanceof Error ? e.message : String(e)}\n`, 'err')
      }

      // Show main.cpp (the logic file) in a tab; config.h is on disk + in Folder View.
      openMainTab(root, files, true)
      setUnsavedChanges(false)

      // Refresh the Folder view so new files show up — e.g. an edit that adds a device
      // module (oled_display.h/.cpp). A brand-new project also needs the panel revealed.
      if (createdNew) scaffoldRef.current?.revealProject()
      else scaffoldRef.current?.refresh()

      const fileList = files.map((f) => f.path).join(' + ')
      appendOutput(`> AI code saved to ${root} (${fileList})\n`, 'out')

      // #5 — opt-in "Verify before flashing": compile the project and let the AI auto-fix
      // build errors. The fixed files are written to disk; refresh any open tabs.
      let compiled: boolean | undefined
      if (opts?.verify) {
        try {
          const v = await window.api.agent.compileAndFix(root, opts.prompt || '')
          compiled = v?.compiled
          if (v?.files?.length) refreshOpenTabs(root, v.files)
          scaffoldRef.current?.refresh() // a fix may have added/renamed module files
          appendOutput(
            v?.compiled
              ? `> ✅ Verified: the program compiles.\n> Click Run to flash it.\n`
              : v?.envError
                ? `> ⚠ Build hit a toolchain/environment error (not your code) — often OneDrive locking the .pio folder. Just click Run; if it keeps happening, move your projects out of OneDrive.\n`
                : `> ⚠ Could not fully fix the build after ${v?.rounds ?? 0} attempt(s). Click Run to see the errors.\n`,
            v?.compiled ? 'out' : 'err',
          )
        } catch (e) {
          appendOutput(`> Verify step failed: ${e instanceof Error ? e.message : String(e)}\n`, 'err')
        }
      } else {
        appendOutput(`> Click Run to build & flash it.\n`, 'out')
      }

      return { compiled, verified: opts?.verify ? !!compiled : undefined }
    } catch (err) {
      appendOutput(`> Error loading generated code: ${err instanceof Error ? err.message : String(err)}\n`, 'err')
      return
    }
  }

  // #7 — repair the OPEN project from the last build's errors. The main process reads the
  // project's files, fixes the whole set, and writes them back; we refresh the open tabs.
  const fixBuildErrors = async (): Promise<{ ok: boolean; error?: string }> => {
    const root = projectRootOfTab(activeTab?.path)
    if (!(await isPlatformioProject(root))) {
      appendOutput(`> No open project to fix. Open or generate a project first.\n`, 'err')
      return { ok: false, error: 'No open project to fix.' }
    }
    if (!buildError.trim()) return { ok: false, error: 'No build error to fix.' }

    // Save the active tab first so the fix sees the latest code on disk.
    if (activeTab?.path && activeTab.isUnsaved) {
      try {
        await window.api.file.save(activeTab.path, activeTab.code, 'cpp', activeTab.name)
      } catch {
        /* ignore */
      }
    }

    const res = (await window.api.agent.fixCpp(root, buildError)) as any
    if (res?.success && res.files?.length) {
      refreshOpenTabs(root, res.files)
      scaffoldRef.current?.refresh() // surface any files the fix added/renamed
      setUnsavedChanges(false)
      setBuildError('') // the fix supersedes the previous failure
      appendOutput(`> AI fix applied to the project. Click Run to try again.\n`, 'out')
      return { ok: true }
    }
    appendOutput(`> Could not fix it: ${res?.error || 'unknown error'}\n`, 'err')
    return { ok: false, error: res?.error || 'Could not fix it.' }
  }

  const handleRunUsingMpRemote = async () => {
    if (!selectedFilePath) {
      console.error("No project path found");
      return;
    }

    try {
      // Reset build-error tracking for this run (#7).
      runLogRef.current = "";
      setBuildError("");

      // Persist the active tab first, so the build compiles what's on screen. Without
      // this, manual edits (e.g. changing a pin) sit unsaved and the OLD main.cpp is built.
      if (activeTab?.path && activeTab.isUnsaved) {
        try {
          await window.api.file.save(activeTab.path, activeTab.code, 'cpp', activeTab.name);
          updateActiveTabData({ originalCode: activeTab.code, isUnsaved: false });
        } catch (e) {
          console.log("pre-run save failed (ignored):", e);
        }
      }

      // Switch the board into C++ mode BEFORE building (mirrors the console agent). The
      // board reboots into the C++ partition during the build, so the freshly-flashed
      // program actually runs — without this it boots the default loader and looks for
      // /lfs/prog.bin, so your code never executes.
      try {
        const cswitchPort = await listAvailablePorts();
        if (cswitchPort) {
          try { await window.api.serial.close(); } catch { /* may not be open */ }
          await window.api.serial.open(cswitchPort, { baudRate: 115200 });
          await new Promise(r => setTimeout(r, 300));
          await window.api.serial.write(JSON.stringify({ msg: 'cswitch' }) + '\n');
          await new Promise(r => setTimeout(r, 300));
        }
      } catch (e) {
        console.log("cswitch before build failed (ignored):", e);
      }

      // 1. Close serial before flashing
      await window.api.serial.close();
      console.log("Serial closed for compile/flash");

      // 2. Start build & flash
      window.api.cpp.compile(selectedFilePath);
    } catch (err) {
      console.error("Run error:", err);
    }
  }

  // Accumulate this run's build log and flag a *code* compile failure so the chat can
  // offer to fix it (#7). We deliberately only trigger on real compiler/linker errors
  // ("error:" / "undefined reference") — NOT on toolchain/OneDrive failures (rename/File
  // exists/ProjectEnvsNotAvailable), which the AI can't fix. Cleared on a successful upload.
  const noteRunOutput = (data: string) => {
    runLogRef.current += data;
    if (/Upload successful/i.test(runLogRef.current)) {
      setBuildError("");
      return;
    }
    if (/error:/.test(runLogRef.current) || /undefined reference/i.test(runLogRef.current)) {
      setBuildError(runLogRef.current.slice(-4000));
    }
  };

  useEffect(() => {
    let buffer = "";
  
    window.api.cpp.onOutput(async (data) => {
      console.log("CPP OUT:", data);

      setOutput(prev => [
        ...prev,
        { text: data, type: 'out' }
      ]);
      noteRunOutput(data);

      // 🔥 Detect upload completion reliably
      buffer += data;
  
      if (buffer.includes("Upload successful")) {
        console.log("Upload detected → reopening serial");
  
        buffer = ""; // reset buffer
  
        const port = await listAvailablePorts();
  
        if (port) {
          try {
            // ✅ FIXED
            try {
              await window.api.serial.close();
            } catch (e) {
              console.log("Close failed (ignored):", e);
            }
        
            await new Promise(r => setTimeout(r, 1000));
        
            await window.api.serial.open(port, { baudRate: 115200 });
        
            await new Promise(r => setTimeout(r, 1500));
        
            console.log("Serial reopened after upload");
        
          } catch (err) {
            console.error("Reopen failed:", err);
          }
        }
      }
    });
  
    window.api.cpp.onError((data) => {
      console.error("CPP ERR:", data);

      setOutput(prev => [
        ...prev,
        { text: data, type: 'err' }
      ]);
      noteRunOutput(data);
    });
  
    return () => {
      window.api.cpp.removeAllListeners();
    };
  }, []);
 

  return (
    <div className="flex flex-col h-screen w-screen bg-[#2195FF] text-white">
      <CppScaffold
        ports={ports}
        setPorts={setPorts}
        ref={scaffoldRef}
        setIsChangeHappens={setIsChangeHappens}
        projectName={projectName}
        setProjectName={setProjectName}
        unsavedChanges={tabs.some(t => t.isUnsaved)}
        onSave={(mode: any) => {
          console.log("PARENT onSave MODE:", mode);
          handleCppSave({
            mode,
            activeTab,
            updateActiveTabData,
            appendOutput
          })
        }}
        onOpenProject={() => {
          setTabs([]);
          setActiveTabId('');
        }}      
        onNewFile={handleNewFileCreation}
        fontFn={(size) => setOptions(prev => ({ ...prev, fontSize: size === 'increase' ? prev.fontSize + 2 : prev.fontSize - 2 }))}
        onRun={handleRunUsingMpRemote}
        output={output}
        serialData={serialData}
        onClear={() => {
          setSerialData("");
          setOutput([]);
        }}
        selectedkit={selectedKit}
        chatOpen={chatOpen}
        onToggleChat={() => setChatOpen((v) => !v)}
        onCodeGenerated={handleCodeGenerated}
        buildError={buildError}
        hasOpenCode={!!activeTab?.code?.trim()}
        getEditContext={getEditContext}
        onFixBuild={fixBuildErrors}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* TAB BAR */}
          <div className="flex bg-[#2195FF]  gap-1 overflow-x-auto border-b border-black/10">
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group px-4 py-2 mt-1 cursor-pointer flex items-center gap-2 rounded-t-lg transition-all min-w-[120px] relative z-[20] ${activeTabId === tab.id
                  ? `font-bold ${themeMode === "dark" ? "bg-[#000000] text-white ": "bg-white text-black"}`
                  : 'bg-[#FFDE21] text-black '
                  }`}
              >
                <span className="text-sm truncate">
                  {tab.name}{tab.isUnsaved ? '*' : ''}
                </span>
                <button
                  onClick={(e) => closeTab(e, tab.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 font-bold transition-opacity ml-auto"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className={`flex-grow relative relative z-[20] ${themeMode === "dark" ? "bg-[#000000]" : "bg-white"}`}>

            {tabs.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">

                <h2 className="text-xl font-semibold">No file open</h2>
                <p className="mb-4">Open a File from the Explorer to start editing</p>

              </div>
            ) : (
              tabs.map((tab) => (
                <div
                  key={tab.id}
                  className="absolute inset-0"
                  style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
                >
                  <Editor
                    height="100%"
                    width="100%"
                    defaultLanguage="cpp"
                    value={tab.code}
                    onChange={(val) => {
                      setTabs(prev => prev.map(t => t.id === tab.id ? {
                        ...t,
                        code: val || '',
                        isUnsaved: (val || '') !== t.originalCode
                      } : t));
                    }}
                    theme={theme === 'dark' ? 'custom-dark' : 'custom-light'}
                    options={options}
                  />
                </div>
              ))
            )}

          </div>
        </div>
      </CppScaffold>
    </div>
  )
}