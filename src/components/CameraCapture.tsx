'use client';

import { useRef, useState, useEffect } from 'react';
import { saveHandle, loadHandle } from '@/lib/fileHandles';
import { SwitchCamera } from 'lucide-react';

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
  const [isClicked, setIsClicked] = useState(false);
  const [cameraMode, setCameraMode] = useState<'environment'|'user'>('environment');
  const [hasFrontCamera, setHasFrontCamera] = useState(false);


  // Load or prompt for folder handle
  useEffect(() => {
    loadHandle('uploads-dir').then(h => h ? setDirHandle(h) : pickFolder());
  }, []);

  // Start camera
  /*useEffect(() => {
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
  }, [stream]);*/

  const toggleCamera = () => {
    setCameraMode(prev => prev === 'environment' ? 'user' : 'environment');

  }

  // Whenever facingMode changes (or on mount), start the camera
  useEffect(() => {
      async function startCamera() {
        //console.log("Start Cam");
        // stop old tracks
        stream?.getTracks().forEach(t => t.stop());
  
        try {
          const s = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: cameraMode },
          });
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
  
          // inspect capabilities to see if 'user' is supported
          const track = s.getVideoTracks()[0];
          const caps = track.getCapabilities();
          if(caps.facingMode){
            setHasFrontCamera(true);
          }
          else{
            setHasFrontCamera(false);
          }
         
        } catch (err) {
          console.error('Error accessing camera:', err);
          setHasFrontCamera(false);
        }
      }
  
      startCamera();
      // cleanup on unmount
      return () => stream?.getTracks().forEach(t => t.stop());
    }, [cameraMode]);

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

  const shutterClick = async () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 100);
  }

  // Snap & save
  const takePhoto = async () => {
    shutterClick();
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
      <div className="p-4 flex justify-center items-center">
        <div className="bottom-4 top-4 flex w-20 h-20 items-center justify-center">
        <button
          type="button"
          onClick={takePhoto}
          className={isClicked?"w-16 h-16 z-50 pointer-events-auto bg-gray-800 rounded-full border-4 border-gray-300":"w-16 h-16 z-50 pointer-events-auto bg-white rounded-full border-4 border-gray-300"}
        />
        </div>
      </div>
      {/*Flip Camera Toggle*/}
      {hasFrontCamera && <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full overflow-hidden z-50 md:hidden">
          <button
          type="button"
           onClick={toggleCamera}
           className="w-full h-full flex items-center justify-center text-center rounded-full object-contain"
           >
            <SwitchCamera size={40}/>
          </button>

        </div>}

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