/**
 * Open (or create) the IndexedDB database and object store.
 */
async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('file-handles', 1);
  
      request.onupgradeneeded = () => {
        // Create an object store named "handles" on first run
        request.result.createObjectStore('handles');
      };
  
      request.onsuccess = () => {
        resolve(request.result);
      };
  
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  /**
   * Save a FileSystemDirectoryHandle under a given key.
   * @param id     A string key (e.g. 'uploads-dir')
   * @param handle The directory handle returned from showDirectoryPicker()
   */
  export async function saveHandle(
    id: string,
    handle: FileSystemDirectoryHandle
  ): Promise<void> {
    const db = await openDB();
    const tx = db.transaction('handles', 'readwrite');
    const store = tx.objectStore('handles');
    store.put(handle, id);
  
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);
    });
  }
  
  /**
   * Load a previously saved FileSystemDirectoryHandle.
   * @param id The string key you used when saving.
   * @returns The handle or undefined if not found.
   */
  export async function loadHandle(
    id: string
  ): Promise<FileSystemDirectoryHandle | undefined> {
    const db = await openDB();
    const tx = db.transaction('handles', 'readonly');
    const store = tx.objectStore('handles');
    const request = store.get(id);
  
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result as FileSystemDirectoryHandle | undefined);
      };
      request.onerror = () => reject(request.error);
    });
  }