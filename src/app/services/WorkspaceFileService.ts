/**
 * WorkspaceFileService
 *
 * Uses the File System Access API to provide real filesystem operations
 * for the Python editor's Open Folder workflow.
 *
 * All paths are stored as normalized relative paths from the workspace root.
 */

export interface ExplorerNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: ExplorerNode[];
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
}

export interface SearchResult {
  filePath: string;
  fileName: string;
  lineNumber: number;
  lineText: string;
  matchStart: number;
  matchLength: number;
}

// Type for File System Access API options
interface FsPermissionOptions {
  mode?: "read" | "readwrite";
}

const FILE_TREE_CACHE_TTL = 5000;

class WorkspaceFileService {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private rootName: string = "";
  private fileTreeCache: ExplorerNode[] | null = null;
  private fileTreeCacheTime: number = 0;

  private async verifyPermission(
    handle: FileSystemHandle,
    readWrite: boolean
  ): Promise<boolean> {
    const options: FsPermissionOptions = {};
    if (readWrite) {
      options.mode = "readwrite";
    }
    // Check current permission
    const fsHandle = handle as FileSystemHandle & {
      queryPermission?: (opts: FsPermissionOptions) => Promise<string>;
      requestPermission?: (opts: FsPermissionOptions) => Promise<string>;
    };
    if (fsHandle.queryPermission && (await fsHandle.queryPermission(options)) === "granted") {
      return true;
    }
    // Request permission
    if (fsHandle.requestPermission && (await fsHandle.requestPermission(options)) === "granted") {
      return true;
    }
    return false;
  }

  async openFolder(): Promise<{
    success: boolean;
    rootName?: string;
    rootHandle?: FileSystemDirectoryHandle;
    error?: string;
  }> {
    try {
      if (!("showDirectoryPicker" in window)) {
        return {
          success: false,
          error:
            "Folder selection is not supported in this browser. Please use Chrome or Edge.",
        };
      }
      const handle = await (window as unknown as {
        showDirectoryPicker: (opts: { mode: string }) => Promise<FileSystemDirectoryHandle>;
      }).showDirectoryPicker({ mode: "readwrite" });
      const hasPermission = await this.verifyPermission(handle, true);
      if (!hasPermission) {
        return { success: false, error: "Permission denied" };
      }
      this.rootHandle = handle;
      this.rootName = handle.name;
      this.fileTreeCache = null;
      return { success: true, rootName: handle.name, rootHandle: handle };
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name === "AbortError") {
        return { success: false, error: "cancelled" };
      }
      return { success: false, error: err.message || "Failed to open folder" };
    }
  }

  getRootHandle(): FileSystemDirectoryHandle | null {
    return this.rootHandle;
  }

  getRootName(): string {
    return this.rootName;
  }

  isFolderOpen(): boolean {
    return this.rootHandle !== null;
  }

  async buildFileTree(): Promise<ExplorerNode[]> {
    if (
      this.fileTreeCache &&
      Date.now() - this.fileTreeCacheTime < FILE_TREE_CACHE_TTL
    ) {
      return this.fileTreeCache;
    }
    if (!this.rootHandle) return [];
    console.debug("[WorkspaceFileService] building file tree", {
      rootHandleExists: true,
      rootName: this.rootHandle.name,
    });
    const tree = await this.readDirectoryRecursive(this.rootHandle, "");
    this.fileTreeCache = tree;
    this.fileTreeCacheTime = Date.now();
    return tree;
  }

  invalidateCache(): void {
    this.fileTreeCache = null;
    this.fileTreeCacheTime = 0;
  }

  private async readDirectoryRecursive(
    dirHandle: FileSystemDirectoryHandle,
    parentPath: string
  ): Promise<ExplorerNode[]> {
    const nodes: ExplorerNode[] = [];
    const entries: [string, FileSystemHandle][] = [];
    for await (const [name, handle] of (dirHandle as unknown as {
      entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    }).entries()) {
      if (name.startsWith(".")) continue;
      if (
        handle.kind === "directory" &&
        (name === "node_modules" || name === "__pycache__" || name === ".git")
      )
        continue;
      entries.push([name, handle]);
    }
    entries.sort((a, b) => {
      if (a[1].kind !== b[1].kind) {
        return a[1].kind === "directory" ? -1 : 1;
      }
      return a[0].localeCompare(b[0]);
    });
    for (const [name, handle] of entries) {
      const relativePath = parentPath ? `${parentPath}/${name}` : name;
      if (handle.kind === "directory") {
        const dirHandle = handle as FileSystemDirectoryHandle;
        const children = await this.readDirectoryRecursive(dirHandle, relativePath);
        nodes.push({ name, path: relativePath, type: "folder", children, handle: dirHandle });
      } else {
        console.debug("[WorkspaceFileService] tree file handle", {
          filePath: relativePath,
          fileName: handle.name,
          kind: handle.kind,
        });
        nodes.push({ name, path: relativePath, type: "file", handle: handle as FileSystemFileHandle });
      }
    }
    return nodes;
  }

  async readFile(relativePath: string): Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }> {
    if (!this.rootHandle) {
      console.debug("[WorkspaceFileService] readFile: no root directory handle", {
        requestedPath: relativePath,
      });
      return { success: false, error: "No folder open" };
    }
    return this.readFileFromDirectory(this.rootHandle, relativePath);
  }

  async readFileFromDirectory(
    rootHandle: FileSystemDirectoryHandle,
    filePath: string
  ): Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      console.debug("[WorkspaceFileService] readFile", {
        rootHandleExists: Boolean(rootHandle),
        rootName: rootHandle.name,
        requestedPath: filePath,
        normalizedPath,
      });
      const rootPermission = await rootHandle.queryPermission?.({ mode: "read" });
      console.debug("[WorkspaceFileService] root directory permission", {
        rootName: rootHandle.name,
        permission: rootPermission || "unsupported",
      });
      const parts = normalizedPath.split("/").filter(Boolean);
      if (parts.length === 0) {
        return { success: false, error: "Invalid file path" };
      }

      let currentHandle = rootHandle;
      for (let i = 0; i < parts.length - 1; i++) {
        console.debug("[WorkspaceFileService] resolving directory segment", {
          segment: parts[i],
          resolvedPath: parts.slice(0, i + 1).join("/"),
        });
        currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
        console.debug("[WorkspaceFileService] directory handle returned", {
          segment: parts[i],
          name: currentHandle.name,
          kind: currentHandle.kind,
        });
      }

      const fileName = parts[parts.length - 1];
      console.debug("[WorkspaceFileService] resolving file segment", {
        fileName,
        parentPath: parts.slice(0, -1).join("/"),
      });
      const fileHandle = await currentHandle.getFileHandle(fileName);
      if (!fileHandle) {
        return { success: false, error: `File not found: ${normalizedPath}` };
      }
      const treeFileHandle = this.getCachedTreeFileHandle(normalizedPath);
      console.debug("[WorkspaceFileService] resolved file handle", {
        fileName: fileHandle.name,
        kind: fileHandle.kind,
        matchesRequestedName: fileHandle.name === fileName,
        treeHandleExists: Boolean(treeFileHandle),
        treeHandleIsSameObject: treeFileHandle === fileHandle,
      });
      const permission = await fileHandle.queryPermission?.({ mode: "read" });
      console.debug("[WorkspaceFileService] file permission", {
        fileName: fileHandle.name,
        permission: permission || "unsupported",
      });
      if (permission !== "granted") {
        const hasPermission = await this.verifyPermission(fileHandle, false);
        if (!hasPermission) {
          return { success: false, error: `Permission denied: ${normalizedPath}` };
        }
      }
      let file: File | undefined;
      try {
        file = await fileHandle.getFile();
        console.debug("[WorkspaceFileService] getFile succeeded", {
          fileName: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });
      } catch (error: unknown) {
        console.warn("[WorkspaceFileService] retrying stale file handle", {
          fileName: fileHandle.name,
          errorName: (error as { name?: string }).name,
          errorCode: (error as { code?: string }).code,
          error: (error as { message?: string }).message,
        });
        if (treeFileHandle && treeFileHandle !== fileHandle) {
          try {
            file = await treeFileHandle.getFile();
            console.debug("[WorkspaceFileService] tree handle getFile succeeded", {
              fileName: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
            });
          } catch (treeError: unknown) {
            console.warn("[WorkspaceFileService] tree handle getFile failed", {
              fileName: treeFileHandle.name,
              errorName: (treeError as { name?: string }).name,
              error: (treeError as { message?: string }).message,
            });
          }
        }
        if (!file) {
          const refreshedHandle = await this.getFileHandleFromRoot(rootHandle, parts);
          if (!refreshedHandle) {
            throw error;
          }
          file = await refreshedHandle.getFile();
          console.debug("[WorkspaceFileService] refreshed getFile succeeded", {
            fileName: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          });
        }
      }
      if (!file) {
        return { success: false, error: `File could not be read: ${normalizedPath}` };
      }
      const text = await file.text();
      console.debug("[WorkspaceFileService] file content read", {
        fileName: file.name,
        contentLength: text.length,
        textReadSucceeded: true,
      });
      return { success: true, data: text };
    } catch (error: unknown) {
      const message = (error as { message?: string }).message || "Failed to read file";
      console.error("[WorkspaceFileService] readFile failed", {
        filePath,
        errorName: (error as { name?: string }).name,
        error: message,
      });
      return { success: false, error: message };
    }
  }

  async writeFile(
    relativePath: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.rootHandle) {
      return { success: false, error: "No folder open" };
    }
    try {
      const fileHandle = await this.getFileHandle(relativePath);
      if (!fileHandle) {
        return { success: false, error: `File not found: ${relativePath}` };
      }
      const hasPermission = await this.verifyPermission(fileHandle, true);
      if (!hasPermission) {
        return { success: false, error: "Permission denied" };
      }
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      this.invalidateCache();
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: (error as { message?: string }).message || "Failed to write file" };
    }
  }

  async createFile(
    relativePath: string,
    content: string = ""
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    if (!this.rootHandle) {
      return { success: false, error: "No folder open" };
    }
    try {
      const normalizedPath = this.normalizePath(relativePath);
      const { parentHandle, fileName } = await this.resolveParentAndName(normalizedPath);
      if (!parentHandle || !fileName) {
        return { success: false, error: "Invalid path" };
      }
      const hasPermission = await this.verifyPermission(parentHandle, true);
      if (!hasPermission) {
        return { success: false, error: "Permission denied" };
      }
      await parentHandle.getFileHandle(fileName, { create: true });
      if (content) {
        const fileHandle = await parentHandle.getFileHandle(fileName);
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      }
      this.invalidateCache();
      return { success: true, path: normalizedPath };
    } catch (error: unknown) {
      return { success: false, error: (error as { message?: string }).message || "Failed to create file" };
    }
  }

  async createFolder(
    relativePath: string
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    if (!this.rootHandle) {
      return { success: false, error: "No folder open" };
    }
    try {
      const normalizedPath = this.normalizePath(relativePath);
      const { parentHandle, fileName } = await this.resolveParentAndName(normalizedPath);
      if (!parentHandle || !fileName) {
        return { success: false, error: "Invalid path" };
      }
      const hasPermission = await this.verifyPermission(parentHandle, true);
      if (!hasPermission) {
        return { success: false, error: "Permission denied" };
      }
      await parentHandle.getDirectoryHandle(fileName, { create: true });
      this.invalidateCache();
      return { success: true, path: normalizedPath };
    } catch (error: unknown) {
      return { success: false, error: (error as { message?: string }).message || "Failed to create folder" };
    }
  }

  async rename(
    oldRelativePath: string,
    newName: string
  ): Promise<{ success: boolean; newPath?: string; error?: string }> {
    if (!this.rootHandle) {
      return { success: false, error: "No folder open" };
    }
    try {
      const oldPath = this.normalizePath(oldRelativePath);
      const oldFileHandle = await this.getFileHandle(oldPath);
      if (!oldFileHandle) {
        return { success: false, error: `File not found: ${oldPath}` };
      }
      const parentPath = oldPath.includes("/")
        ? oldPath.substring(0, oldPath.lastIndexOf("/"))
        : "";
      const parentHandle = parentPath
        ? await this.getDirectoryHandle(parentPath)
        : this.rootHandle;
      if (!parentHandle) {
        return { success: false, error: "Parent directory not found" };
      }
      const hasPermission = await this.verifyPermission(parentHandle, true);
      if (!hasPermission) {
        return { success: false, error: "Permission denied" };
      }
      // Copy to new name
      const newFileHandle = await parentHandle.getFileHandle(newName, { create: true });
      const oldFile = await oldFileHandle.getFile();
      const content = await oldFile.text();
      const writable = await newFileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      // Delete old file
      await parentHandle.removeEntry(oldPath.split("/").pop()!);
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;
      this.invalidateCache();
      return { success: true, newPath };
    } catch (error: unknown) {
      return { success: false, error: (error as { message?: string }).message || "Failed to rename file" };
    }
  }

  async deleteFile(
    relativePath: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.rootHandle) {
      return { success: false, error: "No folder open" };
    }
    try {
      const normalizedPath = this.normalizePath(relativePath);
      const parentPath = normalizedPath.includes("/")
        ? normalizedPath.substring(0, normalizedPath.lastIndexOf("/"))
        : "";
      const fileName = normalizedPath.includes("/")
        ? normalizedPath.split("/").pop()!
        : normalizedPath;
      const parentHandle = parentPath
        ? await this.getDirectoryHandle(parentPath)
        : this.rootHandle;
      if (!parentHandle) {
        return { success: false, error: "Parent directory not found" };
      }
      const hasPermission = await this.verifyPermission(parentHandle, true);
      if (!hasPermission) {
        return { success: false, error: "Permission denied" };
      }
      await parentHandle.removeEntry(fileName);
      this.invalidateCache();
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: (error as { message?: string }).message || "Failed to delete file" };
    }
  }

  async deleteFolder(
    relativePath: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.rootHandle) {
      return { success: false, error: "No folder open" };
    }
    try {
      const normalizedPath = this.normalizePath(relativePath);
      const parentPath = normalizedPath.includes("/")
        ? normalizedPath.substring(0, normalizedPath.lastIndexOf("/"))
        : "";
      const folderName = normalizedPath.includes("/")
        ? normalizedPath.split("/").pop()!
        : normalizedPath;
      const parentHandle = parentPath
        ? await this.getDirectoryHandle(parentPath)
        : this.rootHandle;
      if (!parentHandle) {
        return { success: false, error: "Parent directory not found" };
      }
      const hasPermission = await this.verifyPermission(parentHandle, true);
      if (!hasPermission) {
        return { success: false, error: "Permission denied" };
      }
      await parentHandle.removeEntry(folderName, { recursive: true });
      this.invalidateCache();
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: (error as { message?: string }).message || "Failed to delete folder" };
    }
  }

  async searchInProject(query: string): Promise<SearchResult[]> {
    if (!this.rootHandle || !query.trim()) {
      return [];
    }
    const results: SearchResult[] = [];
    await this.searchInDirectory(this.rootHandle, "", query, results);
    return results;
  }

  private async searchInDirectory(
    dirHandle: FileSystemDirectoryHandle,
    parentPath: string,
    query: string,
    results: SearchResult[]
  ): Promise<void> {
    for await (const [name, handle] of (dirHandle as unknown as {
      entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    }).entries()) {
      if (name.startsWith(".")) continue;
      if (
        handle.kind === "directory" &&
        (name === "node_modules" || name === "__pycache__" || name === ".git")
      )
        continue;
      const relativePath = parentPath ? `${parentPath}/${name}` : name;
      if (handle.kind === "directory") {
        await this.searchInDirectory(handle as FileSystemDirectoryHandle, relativePath, query, results);
      } else if (this.isTextFile(name)) {
        try {
          const fileHandle = handle as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const text = await file.text();
          const lines = text.split("\n");
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();
            const lowerQuery = query.toLowerCase();
            let searchFrom = 0;
            let matchIndex = lowerLine.indexOf(lowerQuery, searchFrom);
            while (matchIndex !== -1) {
              results.push({
                filePath: relativePath,
                fileName: name,
                lineNumber: i + 1,
                lineText: line,
                matchStart: matchIndex,
                matchLength: query.length,
              });
              searchFrom = matchIndex + query.length;
              matchIndex = lowerLine.indexOf(lowerQuery, searchFrom);
            }
          }
        } catch {
          // Skip files that can't be read
        }
      }
    }
  }

  private isTextFile(name: string): boolean {
    const textExtensions = [
      ".py", ".txt", ".md", ".json", ".js", ".ts", ".tsx", ".jsx",
      ".css", ".html", ".xml", ".csv", ".ini", ".cfg", ".yaml", ".yml",
    ];
    const lower = name.toLowerCase();
    return textExtensions.some((ext) => lower.endsWith(ext));
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  }

  private async getFileHandleFromRoot(
    rootHandle: FileSystemDirectoryHandle,
    parts: string[]
  ): Promise<FileSystemFileHandle | null> {
    try {
      let currentDir = rootHandle;
      for (let i = 0; i < parts.length - 1; i++) {
        currentDir = await currentDir.getDirectoryHandle(parts[i]);
      }
      return await currentDir.getFileHandle(parts[parts.length - 1]);
    } catch {
      return null;
    }
  }

  private getCachedTreeFileHandle(relativePath: string): FileSystemFileHandle | null {
    if (!this.fileTreeCache) return null;
    const normalizedPath = this.normalizePath(relativePath);
    const findFile = (nodes: ExplorerNode[]): FileSystemFileHandle | null => {
      for (const node of nodes) {
        if (node.path === normalizedPath && node.type === "file") {
          return node.handle as FileSystemFileHandle;
        }
        if (node.children) {
          const match = findFile(node.children);
          if (match) return match;
        }
      }
      return null;
    };
    return findFile(this.fileTreeCache);
  }

  private async getFileHandle(relativePath: string): Promise<FileSystemFileHandle | null> {
    if (!this.rootHandle) return null;
    const normalizedPath = this.normalizePath(relativePath);
    const parts = normalizedPath.split("/");
    if (parts.length === 1) {
      try {
        return await this.rootHandle.getFileHandle(parts[0]);
      } catch {
        return null;
      }
    }
    let currentDir = this.rootHandle;
    for (let i = 0; i < parts.length - 1; i++) {
      try {
        currentDir = await currentDir.getDirectoryHandle(parts[i]);
      } catch {
        return null;
      }
    }
    try {
      return await currentDir.getFileHandle(parts[parts.length - 1]);
    } catch {
      return null;
    }
  }

  private async getDirectoryHandle(relativePath: string): Promise<FileSystemDirectoryHandle | null> {
    if (!this.rootHandle) return null;
    const normalizedPath = this.normalizePath(relativePath);
    if (!normalizedPath) return this.rootHandle;
    const parts = normalizedPath.split("/");
    let currentDir = this.rootHandle;
    for (const part of parts) {
      try {
        currentDir = await currentDir.getDirectoryHandle(part);
      } catch {
        return null;
      }
    }
    return currentDir;
  }

  private async resolveParentAndName(relativePath: string): Promise<{
    parentHandle: FileSystemDirectoryHandle | null;
    fileName: string | null;
  }> {
    const parentPath = relativePath.includes("/")
      ? relativePath.substring(0, relativePath.lastIndexOf("/"))
      : "";
    const fileName = relativePath.includes("/")
      ? relativePath.split("/").pop()!
      : relativePath;
    const parentHandle = parentPath
      ? await this.getDirectoryHandle(parentPath)
      : this.rootHandle;
    return { parentHandle, fileName };
  }

  async saveAsDialog(
    code: string,
    suggestedName: string = "untitled.py"
  ): Promise<{ success: boolean; fileName?: string; error?: string }> {
    try {
      if (!("showSaveFilePicker" in window)) {
        return { success: false, error: "File System Access API not supported" };
      }
      const handle = await (window as unknown as {
        showSaveFilePicker: (opts: {
          suggestedName: string;
          types: Array<{ description: string; accept: Record<string, string[]> }>;
        }) => Promise<FileSystemFileHandle>;
      }).showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: "Python File",
            accept: { "text/x-python": [".py"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(code);
      await writable.close();
      return { success: true, fileName: handle.name };
    } catch (error: unknown) {
      if ((error as { name?: string }).name === "AbortError") {
        return { success: false, error: "cancelled" };
      }
      return { success: false, error: (error as { message?: string }).message || "Failed to save file" };
    }
  }
}

const workspaceFileServiceInstance = new WorkspaceFileService();
export default workspaceFileServiceInstance;
