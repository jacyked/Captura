'use client';

import { useRef, useState, useEffect } from 'react';
import { saveHandle, loadHandle } from '@/lib/fileHandles';

interface Props {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle|null>(null);
  const [stream, setStream] = useState<MediaStream|null>(null);
  const [isFlashing,   setIsFlashing]   = useState(false);
  const [lastPhotoUrl, setLastPhotoUrl] = useState<string|null>(null);


  // Load or prompt for folder handle
  useEffect(() => {
    loadHandle('uploads-dir').then(h => h ? setDirHandle(h) : pickFolder());
  }, []);

  // Start camera
  useEffect(() => {
    if (!stream) {
      const start = navigator.mediaDevices?.getUserMedia.bind(navigator.mediaDevices);
      if (!start) return console.error('Camera API missing');
      start({ video: { facingMode: 'environment' } })
        .then(s => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(console.error);
    }
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [stream]);

  // Folder picker
  const pickFolder = async () => {
    try {
      const h = await window.showDirectoryPicker({ startIn: 'pictures', mode: 'readwrite' });
      const perm = h.requestPermission
        ? await h.requestPermission({ mode: 'readwrite' })
        : 'granted';
      if (perm === 'granted') {
        setDirHandle(h);
        await saveHandle('uploads-dir', h);
      } else {
        alert('Folder access needed to save photos');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Snap & save
  const takePhoto = async () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async blob => {
      if (!blob) return;
      const name = `photo-${Date.now()}.jpg`;
      const file = new File([blob], name, { type: 'image/jpeg' });

      //Set thumbnail
      const url = URL.createObjectURL(file);
      setLastPhotoUrl(url);

      onCapture(file);

      try {
        if (dirHandle) {
          const fh = await dirHandle.getFileHandle(name, { create: true });
          const w  = await fh.createWritable();
          await w.write(await file.arrayBuffer());
          await w.close();
        }
      } catch (err) {
        console.error('Save failed', err);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      
      {/* Flash overlay */}
      {isFlashing && (
       <div className="absolute inset-0 bg-white opacity-70 pointer-events-none transition-opacity" />
      )}

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 pointer-events-auto text-white text-2xl p-2 bg-black bg-opacity-50 rounded-full"
      >
        ✕
      </button>

      {/* Video preview */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="flex-1 w-full object-cover pointer-events-none"
      />

      {/* Shutter button */}
      <div className="p-4 flex justify-center">
        <button
          type="button"
          onClick={takePhoto}
          className="w-16 h-16 z-50 pointer-events-auto bg-white rounded-full border-4 border-gray-300"
        />
      </div>

      {/* last-photo thumbnail */}
      {lastPhotoUrl && (
        <div className="absolute bottom-4 left-4 w-20 h-20 border-2 border-white rounded overflow-hidden z-50">
          <img
          src={lastPhotoUrl}
          className="w-full h-full object-cover"
          onLoad={() => URL.revokeObjectURL(lastPhotoUrl)}
          />
        </div>
        )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}