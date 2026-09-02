import { showConfirmModal,showSavePopup } from '../../CommonHelper/Popupfuntionalities';

interface CppTabData {
  path?: string
  name: string
  code: string
  originalCode?: string
  isUnsaved?: boolean
}

interface HandleCppSaveArgs {
  mode?: 'save' | 'saveAs' | 'autosave'
  activeTab: CppTabData
  updateActiveTabData: (data: Partial<CppTabData>) => void
  appendOutput: (msg: string, type?: 'out' | 'err') => void
  showPopup?: boolean
}


export const handleCppSave = async ({
  mode = "save",
    activeTab,
    updateActiveTabData,
    appendOutput,
    showPopup = true,
  }: HandleCppSaveArgs): Promise<boolean> => {
    const normalizeName = (name: string) =>
      name.replace(/\.cpp$/i, "").trim();
  
    const currentName = normalizeName(activeTab.name);
    console.log("Save Mode : ",mode)
    let pathToSave: string | undefined;
  
    if (mode === "save") {
      // Normal Save: write to the file's ACTUAL path as-is. Do NOT rebuild the filename
      // from the tab's display name — AI-generated project tabs are labelled with the
      // project name, but the source file must stay main.cpp. Deriving the name wrote a
      // duplicate <project>.cpp into src/, which broke the build (two setup()/loop()).
      pathToSave = activeTab.path || undefined;
    } else if (mode === "saveAs") {
      // Save As: ALWAYS open dialog
      pathToSave = undefined;
    }else if (mode === "autosave") {
      // Autosave only works for already-saved files
      if (!activeTab.path) {
        return false;
      }
    
      pathToSave = activeTab.path;
    }
  
    const result = await window.api.file.save(
      pathToSave,
      activeTab.code,
      "cpp",
      currentName
    );
  
    if (result.success && result.path && result.fileName) {
      appendOutput(`> File saved to: ${result.path}\n`, "out");
  
      updateActiveTabData({
        path: result.path,
        name: result.fileName.replace(/\.cpp$/i, ""),
        originalCode: activeTab.code,
        isUnsaved: false
      });
  
      if (showPopup) {
        showSavePopup();
      }
  
      return true;
    }
  
    // Optional: don't show error on cancel
    if (result.error === "Save cancelled") {
      return false;
    }
  
    appendOutput(`> Error saving file: ${result.error}\n`, "err");
    return false;
  };