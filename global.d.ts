// global.d.ts
export {}; // make this an external module

declare global {
  interface Window {
    showDirectoryPicker(options?: any): Promise<FileSystemDirectoryHandle>;
  }
  
  interface FileSystemHandle {
    /**
     * Ask the user to grant read or readwrite permission.
     * @param descriptor.mode "read" or "readwrite"
     * @returns "granted" | "denied" | "prompt"
     */
    requestPermission?(descriptor?: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;

    /**
     * Check current permission state.
     * @param descriptor.mode "read" or "readwrite"
     * @returns "granted" | "denied" | "prompt"
     */
    queryPermission?(descriptor?: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
  }
}