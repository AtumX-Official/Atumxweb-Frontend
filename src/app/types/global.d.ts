export {};

declare global {
  /** Runtime bridge exposed by the desktop preload script. */
  interface RendererApi {
    [service: string]: any;
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

  interface Window {
    api: RendererApi;
    monacoEditor: any;

    showSaveFilePicker: (
      options?: SaveFilePickerOptions
    ) => Promise<FileSystemFileHandle>;

    showOpenFilePicker: (
      options?: OpenFilePickerOptions
    ) => Promise<FileSystemFileHandle[]>;
  }
}
