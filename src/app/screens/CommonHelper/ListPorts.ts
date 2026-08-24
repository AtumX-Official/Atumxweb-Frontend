import { setKit } from '../../../../store/kitslice'
import { showConfirmModal,showSavePopup } from './Popupfuntionalities';
import SerialService from '../../services/Serialservice';

const PYTHON_USB_IDS = ["303a:817a", "2e8a:0005"];
const BLOCKLY_USB_IDS = ["303a:1001", "2e8a:000a"];

const getWebSerialPorts = () => SerialService.listPorts();

const isPythonPort = (port: string) =>
  PYTHON_USB_IDS.some((id) => port.includes(id));

const isBlocklyPort = (port: string) =>
  BLOCKLY_USB_IDS.some((id) => port.includes(id));
export const listAvailablePorts = async ({
    setOutput,
    setAvailablePorts,
    setPorts,
    dispatch,
    setBoardName
  }) => {
    console.log("Calling listPorts…");
  
    try {
      const ports = await getWebSerialPorts();
      console.log("listPorts result:", ports);
  
      let mode = "";
      let boardName = "";
      let boardPort = "";
  
      const pythonIndex = ports.findIndex(isPythonPort);
  
      if (pythonIndex !== -1) {
        mode = "Python Mode";
        boardPort = ports[pythonIndex];
        // The Web Serial API only exposes USB IDs, not Electron's board-name metadata.
        boardName = boardPort;
  
        if (boardName.includes("CAYO")) {
  dispatch(setKit("cayo"));
  setBoardName("Cayo");
}

if (boardName.includes("SUBO")) {
  dispatch(setKit("subo"));
  setBoardName("Subo");
}

if (boardName.startsWith("E4650")) {
  dispatch(setKit("snowflake"));
  setBoardName("Snowflake");
}
      }
  
      const comPorts = ports;
  
      const orderedPorts = boardPort
        ? [boardPort, ...comPorts.filter(p => p !== boardPort)]
        : comPorts;
  
      setAvailablePorts(orderedPorts);
      setPorts(orderedPorts);
  
      if (mode === "Python Mode") {
        setOutput(prev =>
          prev +
          `\n> Board Detected: ${boardName}\n> Port: ${boardPort}\n> Mode: ${mode}\n`
        );
      }
  
    } catch (err) {
      console.error("listPorts error:", err);
      setOutput(prev => prev + `\n> Error listing ports: ${err instanceof Error ? err.message : String(err)}\n`);
      setAvailablePorts([]);
      setPorts([]);
    }
  };
  
 export const handlePortRefreshWithPromise = async({
    setPorts
 }) => {
    console.log("Refresh function")
    try {
      const ports = await getWebSerialPorts();
      const boardPort = ports.find((port) => isPythonPort(port) || isBlocklyPort(port));
      const orderedPorts = boardPort
        ? [boardPort, ...ports.filter((port) => port !== boardPort)]
        : ports;

      console.log('orderedPorts:', orderedPorts);
      setPorts(orderedPorts);
    } catch (err) {
      console.error('Error refreshing ports:', err);
      setPorts([]);
    }
  }


  export const handlePythonSave = async ({
  mode = "save",
  activeTab,
  updateActiveTabData,
  appendOutput,
  showPopup = true
}) => {
  const normalizeName = (name: string) =>
    name.replace(/\.py$/i, "").trim();

  const currentName = normalizeName(activeTab.name);

  let pathToSave: string | undefined;

  if (mode === "save") {
    // Normal save: use existing path if available
    pathToSave =
      activeTab.path?.replace(/[^\\/]+$/, `${currentName}.py`);
  } else if (mode === "saveAs") {
    // Save As: force dialog by NOT sending a path
    pathToSave = undefined;
  }

  const result = await window.api.file.save(
    pathToSave,
    activeTab.code,
    "python",
    currentName
  );

  if (result.success) {
    appendOutput(`> File saved to: ${result.path}\n`, "out");

    updateActiveTabData({
      path: result.path,
      name: result.fileName.replace(/\.py$/i, ""),
      originalCode: activeTab.code,
      isUnsaved: false
    });

    if (showPopup) {
      showSavePopup();
    }

    return true;
  } else {
    appendOutput(`> Error saving file: ${result.error}\n`, "err");
    return false;
  }
};
  export const handlePythonImport = async ({
    appendOutput,
    createNewTab
  }) => {
  
    const result = await window.api.file.open("python");
  
    if (result.success) {
      createNewTab(result.fileName, result.data, result.path);
    } else {
      appendOutput(`> Error importing file: ${result.error}\n`, "err");
    }
  };

export const handleExitPythonApp = async ({
  activeTab,
  updateActiveTabData,
  appendOutput
}: {
  activeTab: any;
  updateActiveTabData: any;
  appendOutput: (msg: string, type?: "out" | "err") => void;
}): Promise<boolean> => {

  const code = activeTab?.code || "";
  const originalCode = activeTab?.originalCode || "";

  const hasCode = code.trim().length > 0;
  const isSavedFile = !!activeTab?.path;

  // ✅ NEW FILE (never saved)
  const isNewUnsaved = !isSavedFile && hasCode;

  // ✅ MODIFIED SAVED FILE
  const isModified = isSavedFile && code !== originalCode;

  if (isNewUnsaved || isModified) {
    const res = await showConfirmModal({
      title: isSavedFile ? "SAVE YOUR CHANGES!" : "SAVE YOUR PROJECT!",
      message: isSavedFile
        ? "You have unsaved changes. Do you want to save before exiting?"
        : "You have not saved this project. Do you want to save before exiting?",
      variant: "unsaved"
    });

    if (res.yes) {
      const saveResult = await handlePythonSave({
        mode: "save",
        activeTab,
        updateActiveTabData,
        appendOutput
      });

      if (!saveResult) return false;
      return true;
    }

    return res.no === true;
  }

  return true;
};

export const handleUnsavedBeforeAction = async ({
  tab,
  onSave,
  closeWithoutSaving = false,
}: {
  tab: any;
  onSave: () => Promise<boolean>;
  closeWithoutSaving?: boolean;
}) => {
  const isNewFile = !tab.path && tab.code.trim() !== "";
  const isModifiedFile =
    !!tab.path && tab.code !== tab.originalCode;

  if (!isNewFile && !isModifiedFile) {
    return "proceed";
  }

  const result = await showConfirmModal({
    title: tab.path ? "SAVE THE CHANGES!" : "SAVE YOUR PROJECT!",
    message: tab.path
      ? "You have unsaved changes. Do you want to save it?"
      : "You haven't saved your file. Do you want to save first?",
    variant: "unsaved",
  });

  if (result.no) {
    return closeWithoutSaving ? "proceed" : "cancel";
  }

  if (result.yes) {
    const saved = await onSave();
    return saved ? "proceed" : "cancel";
  }

  return "cancel";
};


type PortResult = {
  boardPort: string;
  mode: string;
  boardName: string;
  ports: string[];
  kit?: string;
  error?: string;
};

export const getboardPort = async (): Promise<PortResult> => {
  try {
    console.log("Calling listPorts…");

    const ports = await getWebSerialPorts();

    console.log("listPorts result:", ports);

    let mode = "";
    let boardPort = "";
    let boardName = "";
    let kit: string | undefined;

    const pythonIndex = ports.findIndex(isPythonPort);
    const blocklyIndex = ports.findIndex(isBlocklyPort);

    if (pythonIndex !== -1) {
      mode = "Python Mode";

      boardPort = ports[pythonIndex];
      const detectedName = boardPort;

      if (detectedName.includes("CAYO")) {
        kit = "cayo";
        boardName = "Cayo";
      } else if (detectedName.includes("SUBO")) {
        kit = "subo";
        boardName = "Subo";
      } else if (detectedName.startsWith("E4650")) {
        kit = "snowflake";
        boardName = "Snowflake";
      } else {
        boardName = detectedName;
      }
    } else if (blocklyIndex !== -1) {
      mode = "Blockly Mode";

      boardPort = ports[blocklyIndex];
      boardName = boardPort;
    }

    const comPorts = ports;

    const orderedPorts =
      boardPort !== ""
        ? [boardPort, ...comPorts.filter((p: string) => p !== boardPort)]
        : comPorts;

    return {
      boardPort,
      mode,
      boardName,
      ports: orderedPorts,
      kit,
    };
  } catch (err) {
    console.error("listPorts threw:", err);

    return {
      boardPort: "",
      mode: "",
      boardName: "",
      ports: [],
      error: "Exception occurred",
    };
  }
};
