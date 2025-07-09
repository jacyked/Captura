'use client';

import { useState } from 'react';
//import resize from "@/app/api/compressFile";
import UploadResult from './UploadResult';
import usePWAInstalled from '@/hooks/usePWAInstalled';
import useCompressionConcurrency from '@/hooks/useCompressionConcurrency';
import CameraCapture from './CameraCapture';
import { Camera, Folder } from 'lucide-react';
//import DeleteFilesButton from './DeleteFilesButton';


const UploadForm = () => {
    const [files, setFiles] = useState([]);
    const [ uploadStatus , setStatus] = useState('init');
    const [ro, setRO] = useState(null);
    const [failed, setFailed] = useState(null);
    const [progress, setProgress] = useState(null);
    //const [originals, setOriginals] = useState(null);
    const [uploaded, setUploaded] = useState(null);
    //const [isInstalled, setIsInstalled] = useState(false);
    const [mode, setMode] = useState('picker');
    //const [capturedFiles, setCapturedFiles] = useState<File[]>([]);
    const [lightboxUrl, setLightboxUrl] = useState(null);
    //const [inputKey, setInputKey] = useState(0);

    const onCapture = (file) => {
        setFiles((prev) => [...(Array.isArray(prev) ? prev : []), file]);
    };

    const showResult = uploadStatus !== 'init';


    //On file change, change status for notification then set files for upload and originals for tracking progress/deletion
    const handleFileChange = (event) => {
        setStatus('init');
        const selected = event?.target?.files;
        if (selected && selected.length > 0) {
          setFiles(prev => [...prev, ...Array.from(selected)]);
        }
        //event.target.value = null;
      };

    //Repair Order number handler
    const handleROChange = (event) => {
        setRO(event.target.value);
    }

    //Lightbox
    const handleOpenLightbox = (file) => {
      const liveUrl = URL.createObjectURL(file);
      setLightboxUrl(liveUrl);
    };

    const handleCloseLightbox = () => {
      URL.revokeObjectURL(lightboxUrl);
      setLightboxUrl(null);
    }

    const handleRemoveFile = (indexToRemove) => {
      setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const isInstalled = usePWAInstalled();
    const { compressFilesInBatches } = useCompressionConcurrency();

    //submission function, marks status and progress and triggers compression/uploads
    const handleSubmit = async (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if(files){
            //console.log("Submit triggered");
            setStatus('compress');
            
            const formData = new FormData();
            formData.append('ro', ro);
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeigh: 500,
                useWebWorker: true
                
            };
            setProgress(0);
            
            try {
                const formData = await compressFilesInBatches(files, options, setProgress);
                formData.append('ro', ro);
                setStatus('loading');
          
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                });
                const data = await response.json();
                setStatus(data.status);
                if (data.success){
                    setUploaded(data.success);
                }
                if (data.failed) {
                  setFailed(data.failed);
                }
              } catch (error) {
                setStatus('fail');
                console.error(error);
              }
              setFiles([]);
            
        }
    };
//className="flex flex-col gap-1 items-center w-full"
    return (
        <>
            <div
              className={
                `transition-all duration-300 ease-out w-full` +
                (showResult 
                  ? 'opacity-100 translate-y-0 w-full' 
                  : 'opacity-0 -translate-y-4 ')
              }
            >
              <UploadResult uploadStatus={uploadStatus} failed={failed} progress={progress} uploaded={uploaded} installed={isInstalled}/>
            </div>

            <form className="m-2 flex flex-col gap-2 items-center p-4 bg-gray-900 shadow-md rounded-md w-5/6 md:w-96" onSubmit={handleSubmit}>
                <div className="flex flex-col w-full">
                    <label >RO Number: </label>
                    <input className="bg-gray-700 inset-shadow-xs rounded p-2" type="text" id="ro" onChange={handleROChange} required />
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex space-x-2 justify-center mb-4">
                        <label htmlFor="fileInput" className="btn flex items-center px-4 py-2 rounded bg-blue-400 shadow-md text-sm">
                          <Folder className="w-5 h-5 mr-2" /> From Folder
                        </label>
                        <button type="button" onClick={()=>setMode('camera')} className="btn flex items-center rounded px-4 py-2 bg-blue-400 shadow-md text-sm">
                          <Camera className="w-5 h-5 mr-2" /> From Camera
                        </button>
                    </div>
                    {mode === 'picker' ? (
                        <input
                            id="fileInput"
                            type="file"
                            multiple
                            className="hidden"
                            accept=".png,.jpg,.jpeg"
                            onClick={e => {e.currentTarget.value = null;}}
                            onChange={handleFileChange}
                        />
                        ) : (
                        <CameraCapture onCapture={onCapture} onClose={() => setMode('picker')}/>
                    )}
                </div>
                
                {files?.length > 0 && (
                  <>
                  <div className="flex flex-col w-full">
                    <label>Selected: {files?.length}</label>
                  </div>
                  <div className="flex flex-col w-full max-h-[40vh] overflow-y-auto" style={{WebkitOverflowScrolling: 'touch'}}>
                  <div className="grid grid-cols-3 gap-2 mt-1 w-full items-start">
                    {files.map((file, index) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div
                          key={index}
                          className="relative border border-gray-800 shadow-lg rounded overflow-hidden cursor-pointer"
                          style={{ paddingBottom: '100%'}}
                          onClick={() => handleOpenLightbox(file)}
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onLoad={() => URL.revokeObjectURL(url)} // cleanup blob URL
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(index);
                            }}
                            title="Remove photo"
                            className="absolute top-1 right-1 bg-red-600 bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                          >×</button>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                  </>)}
                <button type="submit" disabled={files?.length <1} className={files?.length > 0?"bg-blue-500 text-white mt-4 rounded self-center w-36 p-3 btn-active":"bg-gray-600 text-white mt-4 rounded self-center w-36 p-3 btn"}> Upload {files?.length > 1 ? 'Images' : 'Image'}</button>
            </form>

            {lightboxUrl && (
              <div
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                onClick={() => handleCloseLightbox()}  // clicking backdrop closes
              >
                <img
                  src={lightboxUrl}
                  alt="Full size"
                  className="max-w-full max-h-full rounded shadow-lg"
                  onClick={(e) => e.stopPropagation()}  // clicking image doesn’t close
                />
                <button
                  type="button"
                  onClick={() => handleCloseLightbox()}
                  className="absolute top-4 right-4 text-white text-3xl p-2 bg-black bg-opacity-50 rounded-full"
                >
                  ×
                </button>
              </div>
            )}
        </>
    )

};



export default UploadForm;

