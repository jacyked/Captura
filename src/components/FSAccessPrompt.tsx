'use client';

import { useState, useEffect } from 'react';
import { saveHandle, loadHandle } from '@/lib/fileHandles';

export default function FSAccessPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if we already have a saved handle
    loadHandle('uploads-dir').then((handle) => {
      if (!handle) {
        // Show prompt only after install if no handle
        const onInstalled = () => setVisible(true);
        window.addEventListener('appinstalled', onInstalled);
        return () => window.removeEventListener('appinstalled', onInstalled);
      }
    });
  }, []);

  const handleEnable = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const perm = dirHandle.requestPermission
        ? await dirHandle.requestPermission({ mode: 'readwrite' })
        : 'granted';
      if (perm === 'granted') {
        await saveHandle('uploads-dir', dirHandle);
        setVisible(false);
      } else {
        alert('You must grant read/write access to delete photos.');
      }
    } catch (err) {
      console.error('Directory access error:', err);
      alert('File access was cancelled or denied.');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 p-4 rounded shadow-lg flex items-center space-x-4 w-11/12 max-w-md">
      <span className="text-yellow-900 flex-1">
        Enable file access to allow photo deletion.
      </span>
      <button
        onClick={handleEnable}
        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Enable
      </button>
    </div>
  );
}