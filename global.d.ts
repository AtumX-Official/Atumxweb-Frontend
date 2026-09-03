export {}

declare global {
  /** Runtime bridge exposed by the desktop preload script. */
  interface RendererApi {
    [service: string]: any
  }

  interface FilePickerAcceptType {
    description?: string
    accept: Record<string, string[]>
  }

  interface FilePickerOptions {
    excludeAcceptAllOption?: boolean
    startIn?: FileSystemHandle | string
    types?: FilePickerAcceptType[]
  }

  interface SaveFilePickerOptions extends FilePickerOptions {
    suggestedName?: string
  }

  interface OpenFilePickerOptions extends FilePickerOptions {
    multiple?: boolean
  }

  interface ElectronVersions {
    electron: string
    chrome: string
    node: string
    [key: string]: string
  }

  interface CreateFileArgs {
    target: 'selection' | 'root'
    selectionPath?: string
    selectionType?: string
    name: string
    language: string
  }

  interface CreateFileResult {
    success: boolean
    path?: string
    error?: string
  }

  interface RenameFileResult {
    success: boolean
    path?: string
    name?: string
    error?: string
  }

  interface RenameArgs {
    oldPath: string
    newName: string
  }

  interface RenameResult {
    success: boolean
    newPath?: string
    error?: string
  }

  interface DeleteFileResult {
    success: boolean
    error?: string
  }

  interface CopyToMyFilesArgs {
    sourcePath: string
    fileName: string
    language: string
    sourceType: string
  }

  interface CopyToMyFilesResult {
    success: boolean
    error?: string
  }

  interface DuplicateFileResult {
    success: boolean
    path?: string
    name?: string
    error?: string
  }

  interface AddFileResult {
    success: boolean
    path?: string
    name?: string
    error?: string
  }

  interface OpenFolderDialogResult {
    success: boolean
    data?: string
    error?: string
  }

  interface FetchDirsResult {
    success: boolean
    data?: any
    rootPath?: string
    folderName?: string
    error?: string
  }

  interface FetchProjectResult {
    success: boolean
    data?: any
    error?: string
  }

  interface FetchExamplesResult {
    success: boolean
    data?: any
    error?: string
  }

  interface FetchLibrariesResult {
    success: boolean
    data?: any
    error?: string
  }

  interface FetchAllResult {
    success: boolean
    data?: any
    error?: string
  }

  interface CreateProjectResult {
    success: boolean
    data?: string
    error?: string
  }

  interface ListPortsResult {
    success: boolean
    ports?: string[]
    error?: string
  }

  interface RunCommandResult {
    success: boolean
    data?: any
    error?: string
  }

  interface FileSaveResult {
    success: boolean
    path?: string
    fileName?: string
    error?: string
  }

  interface FileOpenResult {
    success: boolean
    fileName?: string
    data?: string
    path?: string
    error?: string
  }

  interface GlobalSearchResult {
    success: boolean
    data?: any[]
    error?: string
  }

  interface FileSearchResult {
    success: boolean
    data?: any[]
    error?: string
  }

  interface GlobalReplaceResult {
    success: boolean
    data?: any[]
    totalReplacements?: number
    error?: string
  }

  interface PythonResponse {
    type: 'stdout' | 'stderr' | 'exit'
    data?: string
    code?: number
    success: boolean
    output?: string
    error?: string
  }

  interface SerialOpenOptions {
    baudRate: number
  }

  interface SerialListResult {
    success: boolean
    availablePorts?: any[]
    currentOpenPort?: string | null
    error?: string
  }

  interface FlashBoardResult {
    success: boolean
    error?: string
  }

  interface HandStartResult {
    success: boolean
    error?: string
  }

  interface PoseStartResult {
    success: boolean
    error?: string
  }

  interface AgentGenerateResult {
    success: boolean
    files?: { path: string; content: string }[]
    code?: string
    notes?: string
    unverified?: boolean
    pinWarning?: string
    suggestedName?: string
    libDeps?: string[]
    error?: string
  }

  interface AgentEnsureLibrariesResult {
    added?: string[]
    unresolved?: string[]
  }

  interface AgentCompileAndFixResult {
    compiled?: boolean
    verified?: boolean
    files?: { path: string; content: string }[]
    rounds?: number
    envError?: boolean
  }

  interface AgentFixResult {
    success: boolean
    files?: { path: string; content: string }[]
    error?: string
  }

  interface AgentOutputData {
    type: 'status' | 'tool' | string
    text?: string
  }

  interface CppCompileOutputData {
    code?: number
    args?: string[]
  }

  interface GetInstalledLibrariesResult {
    success: boolean
    libraries?: any[]
    error?: string
  }

  interface SearchLibrariesResult {
    success: boolean
    results?: any[]
    hasMore?: boolean
    error?: string
  }

  interface GetLibraryVersionsResult {
    success: boolean
    versions?: { version: string; size: string; published: string }[]
    error?: string
  }

  interface AddLibraryResult {
    success: boolean
    message?: string
    error?: string
  }

  declare module "*.svg?url" {
    const src: string;
    export default src;
  }

  interface Window {
    api: {
      mpRemote: {
        listPorts: () => Promise<ListPortsResult>
        runCommand: (args: string[]) => Promise<RunCommandResult>
        listBoardFiles: () => void
        onBoardFiles: (callback: (files: string[]) => void) => void
        readBoardFile: (file: string) => void
        onFileContent: (callback: (data: { filename: string; content: string }) => void) => void
        SaveToKit: (filename: string, code: string) => void
        run: (code: string) => Promise<{ success: boolean; error?: string }>
        stop: () => Promise<{ success: boolean; error?: string }>
        onOutput: (callback: (data: { filename: string }) => void) => void
      }

      file: {
        save: (
          path: string | undefined,
          code: string,
          type: string,
          name: string,
          projectName?: string,
          selectedKit?: string
        ) => Promise<FileSaveResult>
        open: (type: string) => Promise<FileOpenResult>
        fileOpen: (path: string) => Promise<FileOpenResult>
        createCodeFile: (args: CreateFileArgs) => Promise<CreateFileResult>
        createCodeDir: (args: CreateFileArgs) => Promise<CreateFileResult>
        renameFile: (path: string, newName: string) => Promise<RenameFileResult>
        rename: (args: RenameArgs) => Promise<RenameResult>
        delete: (path: string) => Promise<DeleteFileResult>
        deleteDir: (path: string) => Promise<DeleteFileResult>
        copyToMyFiles: (args: CopyToMyFilesArgs) => Promise<CopyToMyFilesResult>
        duplicateFile: (path: string, language: string) => Promise<DuplicateFileResult>
        addfile: (path: string) => Promise<AddFileResult>
        openFolderDialog: (type: string) => Promise<OpenFolderDialogResult>
        fetchDirs: (type: string) => Promise<FetchDirsResult>
        fetchProject: (type: string) => Promise<FetchProjectResult>
        fetchExamples: (type: string) => Promise<FetchExamplesResult>
        fetchLibraries: (type: string) => Promise<FetchLibrariesResult>
        fetchAll: () => Promise<FetchAllResult>
        createProject: (name: string) => Promise<CreateProjectResult>
      }

      globalSearch: (folderPath: string, searchText: string) => Promise<GlobalSearchResult>
      fileSearch: (folderPath: string, searchText: string) => Promise<FileSearchResult>
      globalReplace: (
        folderPath: string,
        searchText: string,
        replaceText: string
      ) => Promise<GlobalReplaceResult>

      copyText: (text: string) => Promise<void>
      pasteText: () => Promise<string>

      window: {
        close: () => void
        minimize: () => void
        maximize: () => void
      }

      getWifiName: () => Promise<string | null>

      python: {
        run: (scriptName: string) => void
        onResponse: (callback: (res: PythonResponse) => void) => void
      }

      flashing: {
        flashBoard: () => Promise<FlashBoardResult>
      }

      serial: {
        list: () => Promise<SerialListResult>
        open: (port: string, options: SerialOpenOptions) => Promise<void>
        close: () => Promise<void>
        write: (data: string) => Promise<void>
        onData: (callback: (data: string) => void) => void
      }

      hand?: {
        start: (numHands: number) => Promise<HandStartResult>
        onHandData: (callback: (dataStr: string) => void) => void
        sendFrame: (buf: ArrayBuffer) => void
        stop: () => void
        removeListeners: () => void
      }

      pose?: {
        start: () => Promise<PoseStartResult>
        onPoseData: (callback: (dataStr: string) => void) => void
        sendFrame: (buf: ArrayBuffer) => void
        stop: () => void
        removeListeners: () => void
      }

      agent: {
        onOutput: (callback: (data: AgentOutputData) => void) => void
        removeAllListeners: () => void
        generateCpp: (prompt: string, editContext?: string) => Promise<AgentGenerateResult>
        readProjectFiles: (root: string) => Promise<{ path: string; content: string }[]>
        ensureLibraries: (root: string, libDeps?: string[]) => Promise<AgentEnsureLibrariesResult>
        compileAndFix: (root: string, prompt: string) => Promise<AgentCompileAndFixResult>
        fixCpp: (root: string, buildError: string) => Promise<AgentFixResult>
      }

      cpp: {
        compile: (path: string) => void
        onOutput: (callback: (data: string) => void) => void
        onError: (callback: (data: string) => void) => void
        removeAllListeners: () => void
        getInstalledLibraries: (projectPath: string) => Promise<GetInstalledLibrariesResult>
        searchLibraries: (query: string, page: number) => Promise<SearchLibrariesResult>
        getLibraryVersions: (name: string) => Promise<GetLibraryVersionsResult>
        addLibrary: (iniPath: string, libData: any) => Promise<AddLibraryResult>
      }
    }

    electron: {
      process: {
        versions: ElectronVersions
      }
      ipcRenderer: {
        on: (channel: string, listener: (...args: any[]) => void) => void
        removeListener: (channel: string, listener: (...args: any[]) => void) => void
      }
    }

    monacoEditor: any
  }
}