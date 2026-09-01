import { showConfirmModal,showSavePopup } from '../../CommonHelper/Popupfuntionalities';
import { browserWorkspace } from '../browserWorkspace'
export const handleCppSave = async ({
  mode = "save",
    activeTab,
    updateActiveTabData,
    appendOutput,
    showPopup = true,
  }) => {
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
  
  try {
    const path = pathToSave
      ? await browserWorkspace.writeFile(pathToSave, activeTab.code)
      : await browserWorkspace.saveAs(`${currentName || 'main'}.cpp`, activeTab.code)
    appendOutput(`> File saved to: ${path}\n`, "out");
  
      updateActiveTabData({
        path: pathToSave || '',
        name: currentName,
        originalCode: activeTab.code,
        isUnsaved: false
      });
  
      if (showPopup) {
        showSavePopup();
      }
  
    return true;
  } catch (error) {
    if ((error as DOMException).name === 'AbortError') {
      return false;
    }
    appendOutput(`> Error saving file: ${error instanceof Error ? error.message : String(error)}\n`, "err");
    return false;
  }
  };
