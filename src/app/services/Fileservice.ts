class FileService {
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
  
  export default new FileService();