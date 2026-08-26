/* class FileService {
    async saveFile(data: object, fileName = "Project.atumx") {
      if (!("showSaveFilePicker" in window)) {
        throw new Error("File System Access API not supported.");
      }
  
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "AtumX Project",
            accept: {
              "application/json": [".atumx"],
            },
          },
        ],
      });
  
      const writable = await handle.createWritable();
  
      await writable.write(JSON.stringify(data, null, 2));
  
      await writable.close();
    }
  
    async openFile() {
      if (!("showOpenFilePicker" in window)) {
        throw new Error("File System Access API not supported.");
      }
  
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: "AtumX Project",
            accept: {
              "application/json": [".atumx"],
            },
          },
        ],
      });
  
      const file = await handle.getFile();
  
      const text = await file.text();
  
      return JSON.parse(text);
    }
  }
  
  export default new FileService(); */

  class FileService {
  // =========================
  // ATUMX PROJECT
  // =========================

  async saveFile(data: object, fileName = "Project.atumx") {
    if (!("showSaveFilePicker" in window)) {
      throw new Error("File System Access API not supported.");
    }

    const handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: "AtumX Project",
          accept: {
            "application/json": [".atumx"],
          },
        },
      ],
    });

    const writable = await handle.createWritable();

    await writable.write(JSON.stringify(data, null, 2));

    await writable.close();

    return {
      success: true,
      fileName,
    };
  }

  async openFile() {
    if (!("showOpenFilePicker" in window)) {
      throw new Error("File System Access API not supported.");
    }

    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: [
        {
          description: "AtumX Project",
          accept: {
            "application/json": [".atumx"],
          },
        },
      ],
    });

    const file = await handle.getFile();
    const text = await file.text();

    return JSON.parse(text);
  }


  // =========================
  // PYTHON FILE
  // =========================

  async savePythonFile(
    code: string,
    fileName = "main.py"
  ) {
    if (!("showSaveFilePicker" in window)) {
      throw new Error("File System Access API not supported.");
    }

    const handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: "Python File",
          accept: {
            "text/x-python": [".py"],
          },
        },
      ],
    });

    const writable = await handle.createWritable();

    await writable.write(code);

    await writable.close();

    return {
      success: true,
      fileName,
    };
  }


  // =========================
  // OPEN PYTHON FILE
  // =========================

  async openPythonFile() {
    if (!("showOpenFilePicker" in window)) {
      throw new Error("File System Access API not supported.");
    }

    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: [
        {
          description: "Python File",
          accept: {
            "text/x-python": [".py"],
          },
        },
      ],
    });

    const file = await handle.getFile();

    const code = await file.text();

    return {
      fileName: file.name,
      code,
    };
  }
}

export default new FileService();