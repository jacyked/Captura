'use client';

import { useEffect, useState } from 'react';

// utility to persist handles; you can swap this out for your own IndexedDB logic
async function saveHandle(id: string, handle: FileSystemDirectoryHandle) {
  const serializer = { [id]: handle };
  // @ts-expect-error IndexedDB API methods aren’t typed on Window
  await window.indexedDB?.set('fileHandles', serializer);
}
async function loadHandle(id: string): Promise<FileSystemDirectoryHandle|undefined> {
  // @ts-expect-error IndexedDB API methods aren’t typed on Window
  const rec = await window.indexedDB?.get('fileHandles', id);
  return rec?.[id];
}

export default function DeleteFilesButton({ fileNames }: { fileNames: string[] }) {
    const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle>();
    const [status, setStatus] = useState<string>();
  
    useEffect(() => {
      loadHandle("uploads-dir").then((h) => { if (h) setDirHandle(h); });
    }, []);
  
    const handlePickFolder = async () => {
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        let perm: PermissionState = 'granted';
      
        // Only call it if defined
        if (handle.requestPermission) {
          perm = await handle.requestPermission({ mode: 'readwrite' });
        }
      
        if (perm !== 'granted') {
          throw new Error('Read/write access was denied');
        }
      
        setDirHandle(handle);
        await saveHandle('uploads-dir', handle);
        setStatus('Folder selected and permission granted');
      };
  
    const handleDelete = async () => {
      if (!dirHandle) {
        await handlePickFolder();
        if (!dirHandle) return;
      }
      let allOK = true;
      for (const name of fileNames) {
        try {
          await dirHandle.removeEntry(name);
        } catch (err) {
          console.warn(err);
          allOK = false;
        }
      }
      setStatus(allOK ? "All files deleted 🎉" : "Some files could not be deleted");
    };
  
    return (
      <div className={typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)?"hidden":"m-2 flex flex-col gap-2 items-center p-4 text-center rounded-md w-5/6 md:w-96"}>
        {!dirHandle && (
          <>
          <p className="mt-2">
            Delete uploaded photos from your device?
          </p>
          <p className="mt-2 text-xs">
          Select the folder containing your photos then press Delete.
        </p>
        </>
        )}
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 self-center"
        >
          {!dirHandle?"Select Folder":"Delete"}
        </button>
        {status && <p className="mt-2 text-sm">{status}</p>}
      </div>
    );
  }