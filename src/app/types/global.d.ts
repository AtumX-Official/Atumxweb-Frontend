export {};

declare global {
  interface Window {
    showSaveFilePicker: (
      options?: SaveFilePickerOptions
    ) => Promise<FileSystemFileHandle>;

    showOpenFilePicker: (
      options?: OpenFilePickerOptions
    ) => Promise<FileSystemFileHandle[]>;
  }
}