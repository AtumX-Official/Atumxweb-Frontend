export {};

declare global {
  /** Runtime bridge exposed by the desktop preload script. */
  interface RendererApi {
    [service: string]: unknown;
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
    monacoEditor: unknown;
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
