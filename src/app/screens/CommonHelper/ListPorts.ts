import { setKit } from '../../../../store/kitslice'
import { showConfirmModal,showSavePopup } from './Popupfuntionalities';
export const listAvailablePorts = async ({
    setOutput,
    setAvailablePorts,
    setPorts,
    dispatch,
    setBoardName
  }) => {
    console.log("Calling listPorts…");
  
    try {
      const result = await window.api.mpRemote.listPorts();
      console.log("listPorts raw result:", result);
  
      if (!result || !Array.isArray(result.ports)) {
        console.error("result.ports is missing or not an array");
        return;
      }
  
      if (!result.success) {
        setOutput(prev => prev + `\n> Error listing ports: ${result.error}\n`);
        return;
      }
  
      let mode = "";
      let boardName = "";
      let boardPort = "";
  
      const pythonIndex = result.ports.findIndex(
        line => line.includes("303a:817a") || line.includes("2e8a:0005")
      );
  
      if (pythonIndex !== -1) {
        mode = "Python Mode";
        const parts = result.ports[pythonIndex].split(" ");
        boardPort = parts[0];
        boardName = parts[1];
  
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
  
      const comPorts = result.ports.map(line => line.split(" ")[0]);
  
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
    }
  };
  
 export const handlePortRefreshWithPromise = async({
    setPorts
 }) => {
    console.log("Refresh function")
        window.api.mpRemote
      .listPorts()
      .then((result) => {
        console.log('listPorts raw result:', result)

        if (!result || !Array.isArray(result.ports)) {
          console.error('result.ports is missing or not an array')
          return
        }

        if (result.success) {
          const comPorts = result.ports.map((line) => line.split(' ')[0])
          console.log('comPorts:', comPorts)

          const boardLine = result.ports.find((line) => {
            const parts = line.split(' ')
            return parts[1] && parts[1] !== 'None'
          })
          console.log('boardLine:', boardLine)

          const boardPort = boardLine ? boardLine.split(' ')[0] : ''
          const orderedPorts = boardPort
            ? [boardPort, ...comPorts.filter((p) => p !== boardPort)]
            : comPorts

          console.log('orderedPorts:', orderedPorts)

          setPorts(orderedPorts)
        } else {
          console.error('Error listing ports:', result.error)
        }
      })
      .catch((err) => {
        console.error('listPorts threw:', err)
      })
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
  appendOutput,
  navigate
}: {
  activeTab: any;
  updateActiveTabData: any;
  appendOutput: (msg: string, type?: "out" | "err") => void;
  navigate: any;
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

    const result = await window.api.mpRemote.listPorts();

    console.log("listPorts raw result:", result);

    if (!result || !Array.isArray(result.ports)) {
      return {
        boardPort: "",
        mode: "",
        boardName: "",
        ports: [],
        error: "Invalid ports data",
      };
    }

    if (!result.success) {
      return {
        boardPort: "",
        mode: "",
        boardName: "",
        ports: [],
        error: result.error || "Unknown error",
      };
    }

    let mode = "";
    let boardPort = "";
    let boardName = "";
    let kit: string | undefined;

    const pythonIndex = result.ports.findIndex(
      (line: string) =>
        line.includes("303a:817a") ||
        line.includes("2e8a:0005")
    );

    const blocklyIndex = result.ports.findIndex(
      (line: string) =>
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

      const blocklyLine = result.ports[blocklyIndex];
      const parts = blocklyLine.split(" ");

      boardPort = parts[0] || "";
      boardName = parts[1] || "";
    }

    const comPorts = result.ports.map((line: string) => line.split(" ")[0]);

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