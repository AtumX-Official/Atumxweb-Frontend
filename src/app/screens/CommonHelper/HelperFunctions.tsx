import * as Blockly from "blockly";
import { setKit, setCategory } from '../../../../store/kitslice'
import { showConfirmModal, showSavePopup } from "./Popupfuntionalities";
import { restoreVariableBlocksToToolbox } from "../../blockly/trixblocks/variable";
import { registerPlaceholderAIBlocks } from "../../blockly/suboblocks/ai";
type SaveMode = "save" | "saveAs";

interface SaveParams {
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  filePath: string;
  setFilePath: (path: string) => void;
  setProjectName: (name: string) => void;
  setOutput: (msg: string) => void;
  setUnsavedChanges: (state: boolean) => void;
  setrunStatus: React.Dispatch<React.SetStateAction<RunStatus>>
  originalSnapshotRef: React.MutableRefObject<string | null>;
  savedWorkspaceStates: React.MutableRefObject<Record<string, any>>;
  code: string;
  sendSerialMessage: (msg: string) => void;
  selectedKit: string;
  importedSnapshotRef: any;
  projectName: (name: string) => void;
  selectedCategory: string;
  savemode: string;
}

interface ImportFileParams {
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  originalSnapshotRef: React.MutableRefObject<string | null>;
  filePath: string,
  savedWorkspaceStates: React.MutableRefObject<Record<string, any>>;
  setCode: (code: string) => void;
  setFilePath: (path: string) => void;
  setProjectName: (name: string) => void;
  setOutput: (msg: string) => void;
  setUnsavedChanges: (state: boolean) => void;
  unsavedChanges: boolean;
  customGenerator: any;
  setIsToolboxVisible: any;
  handleIconClick: any;
  selectedKit: any,
  setSelectedIcon: any,
  dispatch: any,
  importedSnapshotRef: any,
  projectName: (name: string) => void;
  selectedCategory: string;
  modifiedToolboxes: React.MutableRefObject<Record<string, string>>,
  toolboxXmlRef: React.MutableRefObject<string>,
  setToolboxXml: (xml: string) => void,
}

interface NewFileParams {
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  originalSnapshotRef: React.MutableRefObject<string | null>;
  filePath: string,
  savedWorkspaceStates: React.MutableRefObject<Record<string, any>>;
  setCode: (code: string) => void;
  setFilePath: (path: string) => void;
  setProjectName: (name: string) => void;
  setOutput: (msg: string) => void;
  setUnsavedChanges: (state: boolean) => void;
  unsavedChanges: boolean;
  setSelectedIcon: (icon: string) => void;
  setIsToolboxVisible: (visible: boolean) => void;
  code: string;
  sendSerialMessage: (msg: string) => void;
  selectedKit: string;
  setrunStatus: (status: string) => void;
  importedSnapshotRef: any;
  setShowKits: (state: boolean) => void;
  projectName: (name: string) => void;
}
export const handleSave = ({
  workspaceRef,
  setFilePath,
  setProjectName,
  projectName,
  setOutput,
  setUnsavedChanges,
  setrunStatus,
  savedWorkspaceStates,
  code,
  sendSerialMessage,
  selectedKit,
  importedSnapshotRef,
  selectedCategory,
  filePath,
  savemode
}: SaveParams & { savemode?: SaveMode }) => {
  if (workspaceRef.current) {
    const workspaceJson = Blockly.serialization.workspaces.save(workspaceRef.current) as any;
    if (window.__aiModels && window.__aiLoadedModels) {
      workspaceJson.aiModels = window.__aiModels;
      workspaceJson.aiLoadedModels = window.__aiLoadedModels;
    }
    const jsonText = JSON.stringify(workspaceJson, null, 2);
      // Extract filename from existing path
      const finalPath = savemode === "save" ? filePath : null;
      window.api.file.save(
      finalPath,
      jsonText,
      "blocks",
      projectName,
      selectedKit,
      selectedCategory
    ).then((result: any) => {
      if (result.success) {
        setOutput(`> File saved to ${result.path}`);
        setFilePath(result.path);
    
        const baseName = result.path
          ? result.path.split(/[\\/]/).pop() || "untitled"
          : "untitled";
    
        setProjectName(baseName.replace(/\.[^/.]+$/, ""));
    
        importedSnapshotRef.current = JSON.stringify(
          Blockly.serialization.workspaces.save(workspaceRef.current!)
        );
    
        setUnsavedChanges(false);
        showSavePopup();
    
        savedWorkspaceStates.current = {};
      } else {
        setOutput(`> Error saving file: ${result.error}`);
      }
    });
  } else {
    window.api.serial.onData((data) => {
      if (/PDone/i.test(data)) setrunStatus("Start");
    });
    sendSerialMessage(code);
  }
};

export const handleImport = async ({
  workspaceRef,
  originalSnapshotRef,
  savedWorkspaceStates,
  setCode,
  filePath,
  setFilePath,
  setProjectName,
  setOutput,
  setUnsavedChanges,
  unsavedChanges,
  customGenerator,
  setIsToolboxVisible,
  handleIconClick,   // initializes workspace
  selectedKit,       // selected kit
  setSelectedIcon,   // sets Basic as default
  dispatch,
  importedSnapshotRef,
  projectName,
  selectedCategory,
  modifiedToolboxes,
  toolboxXmlRef,
  setToolboxXml
}: ImportFileParams) => {
  const workspace = workspaceRef?.current;

  const hasBlocks =
    workspace && workspace.getAllBlocks(false).length > 0;
    //sessionStorage.removeItem('blockly_workspace_snapshot')

  if (hasBlocks && unsavedChanges) {

    const popupResult = await showConfirmModal({
      title: filePath ? "SAVE THE CHANGES!" : "SAVE YOUR PROJECT!",
      message: filePath
        ? "You have unsaved changes. Do you want to save it?"
        : "You haven't saved your file. Do you want to save first?",
      variant: "unsaved"

    })


    // SAVE
    if (popupResult.yes) {
      const workspaceJson = Blockly.serialization.workspaces.save(workspaceRef.current!) as any;
      if (window.__aiModels && window.__aiLoadedModels) {
        workspaceJson.aiModels = window.__aiModels;
        workspaceJson.aiLoadedModels = window.__aiLoadedModels;
      }
      const jsonText = JSON.stringify(workspaceJson, null, 2);

      const result = await window.api.file.save(
        filePath,
        jsonText,
        "blocks",
        projectName,
        selectedKit,
        selectedCategory
      );

      if (result.success) {
        setOutput(`> File saved to ${filePath}`);
        originalSnapshotRef.current = jsonText;
        setUnsavedChanges(false);
        savedWorkspaceStates.current = {};
        showSavePopup();
      } else {
        setOutput(`> Error saving file: ${result.error}`);
        return;
      }
    }

  }

  const result = await window.api.file.open("blocks");

  if (!result.success) {
    setOutput(`> Error importing file: ${result.error}`);
    return;
  }

  try {
    const workspaceData = JSON.parse(result.data);
    const fileKit = workspaceData.selectedKit || "Default";
    const fileCategory = workspaceData.selectedCategory || null;
    dispatch(setKit(fileKit));
    if (fileCategory) {
      dispatch(setCategory(fileCategory));   // ✅ RESTORE CATEGORY
    }
    if (!workspaceRef.current) {
      console.warn("Workspace not initialized before import. Initializing now...");
      await handleIconClick(selectedKit || "Default");
      setSelectedIcon("Basic");
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (!workspaceRef.current) {
      console.error("Workspace failed to initialize.");
      return;
    }

    registerPlaceholderAIBlocks(workspaceData);
    Blockly.serialization.workspaces.load(workspaceData, workspaceRef.current, {
      recordUndo: true,
    });
  
      restoreVariableBlocksToToolbox({
        workspace: workspaceRef.current,
        modifiedToolboxes,
        toolboxXmlRef,
        setToolboxXml
      });
    setIsToolboxVisible(true);
    const generatedCode = customGenerator.workspaceToCode(workspaceRef.current);
    setCode(generatedCode);
    setOutput(`> File imported from ${result.path}`);
    setFilePath(result.path);

    const baseName = result.path
      ? result.path.split(/[\\/]/).pop() || "untitled"
      : "untitled";
    setProjectName(baseName.replace(/\.[^/.]+$/, ""));

    // Reset refs
    const snapshot = JSON.stringify(
      Blockly.serialization.workspaces.save(workspaceRef.current!)
    );

    importedSnapshotRef.current = snapshot;
    setUnsavedChanges(false);
    savedWorkspaceStates.current = {};

  } catch (error) {
    console.error("Error loading workspace:", error);
    setOutput("> Error: Could not load the workspace");
  }
};





export const handleNewFileCreation = async ({
  workspaceRef,
  originalSnapshotRef,
  savedWorkspaceStates,
  setCode,
  setFilePath,
  setProjectName,
  setOutput,
  setUnsavedChanges,
  unsavedChanges,
  filePath,
  selectedKit,
  importedSnapshotRef,
  setShowKits,
  projectName
}: NewFileParams) => {

  const workspace = workspaceRef?.current;
  const hasBlocks = workspace && workspace.getAllBlocks(false).length > 0;

  // Only show popup if workspace not empty AND there are unsaved changes
  if (hasBlocks && unsavedChanges) {
    const popupResult = await showConfirmModal({
      title: filePath ? "SAVE THE CHANGES!" : "FILE NOT SAVED!",
      message: filePath
        ? "You have unsaved changes. Do you want to save it?"
        : "You haven't saved your file. Do you want to save first?",
      variant: "unsaved"
    });

    // SAVE
    if (popupResult.yes) {
      const workspaceJson = Blockly.serialization.workspaces.save(workspaceRef.current!);
      const jsonText = JSON.stringify(workspaceJson, null, 2);

      const result = await window.api.file.save(
        filePath,
        jsonText,
        "blocks",
        projectName,
        selectedKit
      );

      if (result.success) {
        setOutput(`> File saved to ${filePath}`);
        originalSnapshotRef.current = jsonText;
        setUnsavedChanges(false);
        showSavePopup();
        savedWorkspaceStates.current = {};
      } else {
        setOutput(`> Error saving file: ${result.error}`);
        return;
      }
    }

  }
  if (workspaceRef.current) {
    workspaceRef.current.clear();
  }
 // modifiedToolboxes.current['VARIABLE'] = `<xml id="toolbox">${Variables.VARIABLE_GENERIC}</xml>`;
  setCode("");
  setFilePath("");
  setProjectName("untitled");
  setShowKits(true)
  setOutput("> New Blocks project created");
  const emptySnapshot = JSON.stringify(
    Blockly.serialization.workspaces.save(workspaceRef.current),
    null,
    2
  );

  importedSnapshotRef.current = JSON.stringify(
    Blockly.serialization.workspaces.save(workspaceRef.current!)
  );
  setUnsavedChanges(false);
  savedWorkspaceStates.current = {};
};

export const handleExitApp = async ({
  workspaceRef,
  filePath,
  unsavedChanges,
  selectedKit,
  setOutput,
  navigate,
  projectName,
  selectedCategory
}: {
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  filePath: string;
  unsavedChanges: boolean;
  selectedKit: string;
  setOutput: (msg: string) => void;
  navigate: any;
  projectName: (name: string) => void;
  selectedCategory: string;
}) => {
  const workspace = workspaceRef.current;
  const hasBlocks = workspace && workspace.getAllBlocks(false).length > 0;

  // CASE: Unsaved changes exist
  if (hasBlocks && unsavedChanges) {
    const isSavedFile = filePath !== "";

    const res = await showConfirmModal({
      title: isSavedFile ? "SAVE THE CHANGES!" : "SAVE YOUR PROJECT!",
      message: isSavedFile
        ? "You have unsaved changes. Do you want to save before exiting?"
        : "Are you sure you want to exit before saving your file?",
      variant: "unsaved"
    });

    if (res.yes) {
      const workspaceJson = Blockly.serialization.workspaces.save(workspace!);
      const jsonText = JSON.stringify(workspaceJson, null, 2);

      const saveResult = await window.api.file.save(
        filePath,
        jsonText,
        "blocks",
        projectName,
        selectedKit,
        selectedCategory
      );

      if (!saveResult.success) {
        setOutput(`> Error saving file: ${saveResult.error}`);
        return;
      }

      showSavePopup();
      setOutput(`> File saved to ${filePath}`);

      navigate("/");
      return;
    }

    navigate("/");
    return;
  }
  navigate("/");
};
