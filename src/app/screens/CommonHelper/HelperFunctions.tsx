import * as Blockly from "blockly";
import { setKit, setCategory } from '../../../../store/kitslice'
import { showConfirmModal, showSavePopup } from "./Popupfuntionalities";
import { restoreVariableBlocksToToolbox } from "../../blockly/trixblocks/variable";
import { registerPlaceholderAIBlocks } from "../../blockly/suboblocks/ai";
type SaveMode = "save" | "saveAs";

import type { RunStatus } from "../Blocks/hooks/useBlocklyActions"; 

interface SaveParams {
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  fileHandle: FileSystemFileHandle | null;
  setFileHandle: React.Dispatch<React.SetStateAction<FileSystemFileHandle | null>>;
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
  projectName: string;
  selectedCategory: string | null;
  savemode: string;
}

interface ImportFileParams {
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  originalSnapshotRef: React.MutableRefObject<string | null>;
  savedWorkspaceStates: React.MutableRefObject<Record<string, any>>;
  setCode: (code: string) => void;
  fileHandle: FileSystemFileHandle | null;
  setFileHandle: React.Dispatch<React.SetStateAction<FileSystemFileHandle | null>>;
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
  projectName: string | null;
  selectedCategory: string | null;
  modifiedToolboxes: React.MutableRefObject<Record<string, string>>,
  toolboxXmlRef: React.MutableRefObject<string>,
  setToolboxXml: (xml: string) => void,
}

interface NewFileParams {
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  originalSnapshotRef: React.MutableRefObject<string | null>;
  savedWorkspaceStates: React.MutableRefObject<Record<string, any>>;
  setCode: (code: string) => void;
  filePath?: string;
  fileHandle: FileSystemFileHandle | null;
  setFileHandle: React.Dispatch<React.SetStateAction<FileSystemFileHandle | null>>;
  setProjectName: (name: string) => void;
  setOutput: (msg: string) => void;
  setUnsavedChanges: (state: boolean) => void;
  unsavedChanges: boolean;
  setSelectedIcon: (icon: string) => void;
  setIsToolboxVisible: (visible: boolean) => void;
  code: string;
  sendSerialMessage: (msg: string) => void;
  selectedKit: string;
  setrunStatus: React.Dispatch<React.SetStateAction<RunStatus>>;
  importedSnapshotRef: any;
  setShowKits: (state: boolean) => void;
  projectName: string;
}
export const handleSave = async ({
  workspaceRef,
  fileHandle,
  setFileHandle,
  setProjectName,
  projectName,
  setOutput,
  setUnsavedChanges,
  setrunStatus,
  savedWorkspaceStates,
  code,
  sendSerialMessage,
  importedSnapshotRef,
  selectedKit,
  selectedCategory,
  savemode,
}: SaveParams & { savemode?: SaveMode }) => {
  if (workspaceRef.current) {
    try {
      const workspaceJson = Blockly.serialization.workspaces.save(
        workspaceRef.current
      ) as any;

      // Save AI information
      if (window.__aiModels && window.__aiLoadedModels) {
        workspaceJson.aiModels = window.__aiModels;
        workspaceJson.aiLoadedModels = window.__aiLoadedModels;
      }

      // Save board information (same as desktop version)
      workspaceJson.selectedKit = selectedKit;
      workspaceJson.selectedCategory = selectedCategory;

      const jsonText = JSON.stringify(workspaceJson, null, 2);

      let handle = fileHandle;

      if (!handle || savemode !== "save") {
        handle = await (window as any).showSaveFilePicker({
          suggestedName: `${projectName || "Untitled"}.blocks`,
          types: [
            {
              description: "Blockly Project",
              accept: {
                "application/json": [".blocks"],
              },
            },
          ],
        });

        setFileHandle(handle);
      }

      if (!handle) {
        setOutput("> Error saving file: no file selected");
        return;
      }

      const writable = await handle.createWritable();

      await writable.write(jsonText);

      await writable.close();

      const name = handle.name;

      setProjectName(name.replace(/\.[^/.]+$/, ""));

      importedSnapshotRef.current = JSON.stringify(
        Blockly.serialization.workspaces.save(workspaceRef.current)
      );

      setUnsavedChanges(false);

      savedWorkspaceStates.current = {};

      setOutput(`> File saved to ${name}`);

      showSavePopup();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setOutput(`> Error saving file: ${err.message}`);
      }
    }
  } else {
    sendSerialMessage(code);
  }
};

export const handleImport = async ({
  workspaceRef,
  originalSnapshotRef,
  savedWorkspaceStates,
  setCode,
  fileHandle,
  setFileHandle,
  setProjectName,
  setOutput,
  setUnsavedChanges,
  unsavedChanges,
  customGenerator,
  setIsToolboxVisible,
  handleIconClick,
  selectedKit,
  setSelectedIcon,
  dispatch,
  importedSnapshotRef,
  projectName,
  selectedCategory,
  modifiedToolboxes,
  toolboxXmlRef,
  setToolboxXml,
}: ImportFileParams) => {
  const workspace = workspaceRef?.current;

  // Ask to save if there are unsaved changes
  const hasBlocks =
    workspace && workspace.getAllBlocks(false).length > 0;

  if (hasBlocks && unsavedChanges) {
    const popupResult = await showConfirmModal({
      title: fileHandle ? "SAVE THE CHANGES!" : "SAVE YOUR PROJECT!",
      message: fileHandle
        ? "You have unsaved changes. Do you want to save it?"
        : "You haven't saved your file. Do you want to save first?",
      variant: "unsaved",
    });

    if (popupResult.yes) {
      const workspaceJson = Blockly.serialization.workspaces.save(
        workspaceRef.current!
      ) as any;

      if (window.__aiModels && window.__aiLoadedModels) {
        workspaceJson.aiModels = window.__aiModels;
        workspaceJson.aiLoadedModels = window.__aiLoadedModels;
      }

      const jsonText = JSON.stringify(workspaceJson, null, 2);

      try {
        let saveHandle: FileSystemFileHandle;

        if ((window as any).__currentFileHandle) {
          saveHandle = (window as any).__currentFileHandle;
        } else {
          saveHandle = await (window as any).showSaveFilePicker({
            suggestedName: `${projectName || "Untitled"}.blocks`,
            types: [
              {
                description: "Blockly Project",
                accept: {
                  "application/json": [".blocks"],
                },
              },
            ],
          });

          (window as any).__currentFileHandle = saveHandle;
        }

        const writable = await saveHandle.createWritable();
        await writable.write(jsonText);
        await writable.close();

        setOutput(`> File saved to ${saveHandle.name}`);
        originalSnapshotRef.current = jsonText;
        setUnsavedChanges(false);
        savedWorkspaceStates.current = {};
        showSavePopup();
      } catch (err) {
        console.error(err);
        setOutput("> Error saving file");
        return;
      }
    }
  }

  // Open file
  let handle: FileSystemFileHandle;

  try {
    [handle] = await (window as any).showOpenFilePicker({
      multiple: false,
      types: [
        {
          description: "Blockly Project",
          accept: {
            "application/json": [".blocks"],
          },
        },
      ],
    });
  } catch (err: any) {
    if (err.name === "AbortError") return;

    setOutput("> Error opening file");
    return;
  }

  // Store the handle for future Save
  (window as any).__currentFileHandle = handle;

  const file = await handle.getFile();
  const text = await file.text();

  try {
    const workspaceData = JSON.parse(text);

    const fileKit = workspaceData.selectedKit || "Default";
    const fileCategory = workspaceData.selectedCategory || null;

    dispatch(setKit(fileKit));

    if (fileCategory) {
      dispatch(setCategory(fileCategory));
    }

    if (!workspaceRef.current) {
      console.warn("Workspace not initialized. Initializing...");
      await handleIconClick(fileKit);
      setSelectedIcon("Basic");
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (!workspaceRef.current) {
      console.error("Workspace initialization failed.");
      return;
    }

    registerPlaceholderAIBlocks(workspaceData);

    Blockly.serialization.workspaces.load(
      workspaceData,
      workspaceRef.current,
      {
        recordUndo: true,
      }
    );

    restoreVariableBlocksToToolbox({
      workspace: workspaceRef.current,
      modifiedToolboxes,
      toolboxXmlRef,
      setToolboxXml,
    });

    setIsToolboxVisible(true);

    const generatedCode =
      customGenerator.workspaceToCode(workspaceRef.current);

    setCode(generatedCode);

    setOutput(`> File imported from ${handle.name}`);

    // No absolute path available in browsers
    setFileHandle(handle);

    const baseName = handle.name.replace(/\.[^/.]+$/, "");
    setProjectName(baseName);

    const snapshot = JSON.stringify(
      Blockly.serialization.workspaces.save(workspaceRef.current)
    );

    importedSnapshotRef.current = snapshot;
    originalSnapshotRef.current = snapshot;

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
  setFileHandle,
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
  setFileHandle(null);
  setProjectName("untitled");
  setShowKits(true)
  setOutput("> New Blocks project created");
  const emptySnapshot = JSON.stringify(
    Blockly.serialization.workspaces.save(workspaceRef.current!),
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
  fileHandle,
  setFileHandle,
  unsavedChanges,
  selectedKit,
  selectedCategory,
  setOutput,
  router,
  projectName,
}: {
  workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>;
  fileHandle: FileSystemFileHandle | null;
  setFileHandle: (handle: FileSystemFileHandle | null) => void;
  unsavedChanges: boolean;
  selectedKit: string;
  selectedCategory: string;
  setOutput: (msg: string) => void;
  router: any;
  projectName: string;
}) => {
  const workspace = workspaceRef.current;

  const hasBlocks =
    workspace && workspace.getAllBlocks(false).length > 0;

  // Nothing to save → go to home page
  if (!hasBlocks || !unsavedChanges) {
    router.push("/");
    return;
  }

  const isSavedFile = !!fileHandle;

  const res = await showConfirmModal({
    title: isSavedFile
      ? "SAVE THE CHANGES!"
      : "SAVE YOUR PROJECT!",

    message: isSavedFile
      ? "You have unsaved changes. Do you want to save before exiting?"
      : "Are you sure you want to exit before saving your file?",

    variant: "unsaved",
  });

  // User chose NO
  if (!res.yes) {
    router.push("/");
    return;
  }

  // User chose YES
  try {
    const workspaceJson =
      Blockly.serialization.workspaces.save(workspace) as any;

    // Save AI information
    if (window.__aiModels && window.__aiLoadedModels) {
      workspaceJson.aiModels = window.__aiModels;
      workspaceJson.aiLoadedModels = window.__aiLoadedModels;
    }

    // Save board information
    workspaceJson.selectedKit = selectedKit;
    workspaceJson.selectedCategory = selectedCategory;

    const jsonText = JSON.stringify(workspaceJson, null, 2);
    let handle = fileHandle;

    // First save → ask user where to save
    if (!handle) {
      handle = await (window as any).showSaveFilePicker({
        suggestedName: `${projectName || "Untitled"}.blocks`,
        types: [
          {
            description: "Blockly Project",
            accept: {
              "application/json": [".blocks"],
            },
          },
        ],
      });

      setFileHandle(handle);
    }

    if (!handle) {
      setOutput("> Error saving file: no file selected");
      return;
    }

    // Write to the selected file
    const writable = await handle.createWritable();

    await writable.write(jsonText);
    await writable.close();

    setOutput(`> File saved to ${handle.name}`);

    showSavePopup();

    // Go to home page after successful save
    router.push("/");
  } catch (err: any) {
    // User cancelled the save dialog
    if (err?.name === "AbortError") {
      return;
    }

    console.error("Error saving before exit:", err);

    setOutput(
      `> Error saving file: ${err?.message || "Unknown error"}`
    );

    // Don't leave the page if saving failed
    return;
  }
};