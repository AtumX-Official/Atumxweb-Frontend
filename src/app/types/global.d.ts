export {};

declare global {
  // ---------------------------------------------------------------------------
  // Desktop bridge (preload) types
  //
  // window.api is injected at runtime by the desktop preload script, which lives
  // outside this repository. The declarations below describe that existing bridge
  // exactly as the app already calls it - they add no behaviour, they only give
  // the call sites real types instead of "unknown".
  // ---------------------------------------------------------------------------

  /** Every bridge call resolves to an IPC envelope with this shape. */
  interface BridgeResult {
    success: boolean;
    error?: string;
  }

  /** A node of the file-explorer tree returned by the file service. */
  interface BridgeFileNode {
    name: string;
    path: string;
    type: "file" | "folder";
    children?: BridgeFileNode[];
  }

  /** A project / example entry listed by the file service. */
  interface BridgeProjectEntry {
    filename: string;
    filepath: string;
    created: string;
    modified?: string;
    category?: string;
    isDirectory?: boolean;
  }

  /** A single hit returned by the search services. */
  interface BridgeSearchResult {
    file?: string;
    filePath?: string;
    fileName?: string;
    line?: number;
    lineNumber?: number;
    text?: string;
    preview?: string;
    start?: number;
    length?: number;
  }

  /** A file the AI agent produced, or read back from a project. */
  interface BridgeCodeFile {
    path: string;
    content: string;
  }

  interface BridgeSerialPortInfo {
    path: string;
    manufacturer?: string;
    vendorId?: string;
    productId?: string;
  }

  interface BridgeLibraryVersion {
    version: string;
    size: string;
    published: string;
  }

  interface BridgeLibrary {
    name: string;
    version: string;
    description: string;
    published: string;
    [key: string]: unknown;
  }

  interface BridgeCreateNodeOptions {
    target: "selection" | "root";
    selectionPath: string;
    selectionType: string;
    name: string;
    language: string;
  }

  interface BridgeFileService {
    save(
      filePath: string,
      content: string,
      language: string,
      name: string,
      kit?: string,
      category?: string
    ): Promise<BridgeResult & { path?: string; fileName?: string }>;

    /** Open a file by absolute path. */
    fileOpen(filePath: string): Promise<BridgeResult & { data?: string }>;

    /** Open the OS file dialog for a language and read the chosen file. */
    open(
      language: string
    ): Promise<BridgeResult & { data?: string; fileName?: string; path?: string }>;

    openFolderDialog(
      language: string
    ): Promise<
      BridgeResult & {
        data?: string;
        rootPath?: string;
        folderName?: string;
      }
    >;

    fetchDirs(
      language: string
    ): Promise<
      BridgeResult & {
        data?: BridgeFileNode[];
        rootPath?: string;
        folderName?: string;
      }
    >;

    fetchProject(
      language: string
    ): Promise<BridgeResult & { data?: BridgeProjectEntry[] }>;

    fetchExamples(
      language: string
    ): Promise<BridgeResult & { data?: BridgeProjectEntry[] }>;

    /** All projects, keyed by category. */
    fetchAll(): Promise<
      BridgeResult & { data?: Record<string, BridgeProjectEntry[]> }
    >;

    createProject(name: string): Promise<BridgeResult & { data?: string }>;

    createCodeFile(
      options: BridgeCreateNodeOptions
    ): Promise<BridgeResult & { path?: string }>;

    createCodeDir(
      options: BridgeCreateNodeOptions
    ): Promise<BridgeResult & { path?: string }>;

    rename(options: {
      oldPath: string;
      newName: string;
    }): Promise<BridgeResult & { newPath?: string }>;

    delete(filePath: string): Promise<BridgeResult>;

    deleteDir(dirPath: string): Promise<BridgeResult>;

    copyToMyFiles(options: {
      sourcePath: string;
      fileName: string;
      language: string;
      sourceType: string;
    }): Promise<BridgeResult & { path?: string }>;

    onLoadExample(
      callback: (payload: { filePath: string; fileName: string }) => void
    ): void;
  }

  interface BridgeSerialService {
    list(): Promise<
      BridgeResult & {
        availablePorts?: BridgeSerialPortInfo[];
        currentOpenPort?: string | null;
      }
    >;
    open(path: string, options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    write(data: string): Promise<void>;
    onData(callback: (data: string) => void): void;
    onError(callback: (error: string) => void): void;
    onClosed(callback: () => void): void;
  }

  interface BridgeCppService {
    compile(filePath: string): void;
    onOutput(callback: (data: string) => void): void;
    onError(callback: (data: string) => void): void;
    removeAllListeners(): void;
    getInstalledLibraries(
      projectPath: string
    ): Promise<BridgeResult & { libraries?: BridgeLibrary[] }>;
    searchLibraries(
      query: string,
      page: number
    ): Promise<BridgeResult & { results?: BridgeLibrary[]; hasMore?: boolean }>;
    getLibraryVersions(
      name: string
    ): Promise<BridgeResult & { versions?: BridgeLibraryVersion[] }>;
    addLibrary(
      iniPath: string,
      library: BridgeLibrary
    ): Promise<BridgeResult & { message?: string }>;
  }

  interface BridgeAgentService {
    onOutput(callback: (data: { type?: string; text?: string }) => void): void;
    removeAllListeners(): void;
    generateCpp(
      prompt: string,
      editContext?: string
    ): Promise<
      BridgeResult & {
        files?: BridgeCodeFile[];
        code?: string;
        notes?: string;
        unverified?: boolean;
        pinWarning?: string;
        suggestedName?: string;
        libDeps?: string[];
      }
    >;
    fixCpp(
      root: string,
      buildError: string
    ): Promise<BridgeResult & { files?: BridgeCodeFile[] }>;
    readProjectFiles(root: string): Promise<BridgeCodeFile[]>;
    ensureLibraries(
      root: string,
      libDeps?: string[]
    ): Promise<{ added?: string[]; unresolved?: string[] }>;
    compileAndFix(
      root: string,
      prompt: string
    ): Promise<{
      compiled?: boolean;
      files?: BridgeCodeFile[];
      envError?: boolean;
      rounds?: number;
    }>;
  }

  interface BridgeMpRemoteService {
    listPorts(): Promise<BridgeResult & { ports?: string[] }>;
    run(code: string): Promise<BridgeResult & { output?: string }>;
  }

  interface BridgePythonService {
    run(scriptName: string): void;
    onResponse(
      callback: (response: {
        type: string;
        data: string;
        code?: number;
      }) => void
    ): void;
  }

  interface BridgeWindowService {
    close(): void;
    minimize(): void;
    maximize(): void;
  }

  /** Runtime bridge exposed by the desktop preload script. */
  interface RendererApi {
    file: BridgeFileService;
    serial: BridgeSerialService;
    cpp: BridgeCppService;
    agent: BridgeAgentService;
    mpRemote: BridgeMpRemoteService;
    python: BridgePythonService;
    window: BridgeWindowService;

    fileSearch(
      folderPath: string,
      query: string
    ): Promise<BridgeResult & { data?: BridgeSearchResult[] }>;

    globalSearch(
      targetPath: string,
      query: string
    ): Promise<BridgeResult & { data?: BridgeSearchResult[] }>;

    globalReplace(
      targetPath: string,
      searchText: string,
      replaceText: string
    ): Promise<
      BridgeResult & {
        data?: BridgeSearchResult[];
        totalReplacements?: number;
      }
    >;

    openExampleFile(filePath: string, fileName: string): void;

    getWifiName(): Promise<string | null>;
  }

  /** Process metadata exposed by the desktop preload script. */
  interface ElectronBridge {
    process: {
      versions: Record<string, string>;
    };
  }

  interface FilePickerAcceptType {
    description?: string;
    accept: Record<string, string[]>;
  }

  interface FilePickerOptions {
    excludeAcceptAllOption?: boolean;
    startIn?: FileSystemHandle | string;
    types?: FilePickerAcceptType[];
  }

  interface SaveFilePickerOptions extends FilePickerOptions {
    suggestedName?: string;
  }

  interface OpenFilePickerOptions extends FilePickerOptions {
    multiple?: boolean;
  }

  interface DirectoryPickerOptions {
    id?: string;
    mode?: "read" | "readwrite";
    startIn?: FileSystemHandle | string;
  }

  // File System Access API type augmentations
  interface FileSystemHandlePermissionOptions {
    mode?: "read" | "readwrite";
  }

  interface FileSystemHandle {
    queryPermission?: (
      options?: FileSystemHandlePermissionOptions
    ) => Promise<PermissionState>;
    requestPermission?: (
      options?: FileSystemHandlePermissionOptions
    ) => Promise<PermissionState>;
  }

  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle>;
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    keys(): AsyncIterableIterator<string>;
  }

  interface Window {
    api: RendererApi;
    electron: ElectronBridge;
    monacoEditor: import("monaco-editor").editor.IStandaloneCodeEditor | null;
    __workspaceFileTree?: unknown;
    __workspaceRootName?: string;

    showSaveFilePicker?: (
      options?: SaveFilePickerOptions
    ) => Promise<FileSystemFileHandle>;

    showOpenFilePicker?: (
      options?: OpenFilePickerOptions
    ) => Promise<FileSystemFileHandle[]>;

    showDirectoryPicker?: (
      options?: DirectoryPickerOptions
    ) => Promise<FileSystemDirectoryHandle>;
  }
}
