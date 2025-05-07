'use client';
import DeleteFilesButton from './DeleteFilesButton';

export default function UploadResult({
  uploadStatus,
  failed,
  progress,
  uploaded,
  installed
}) {
    if (uploadStatus === 'success') {
        return <div className="flex flex-col gap-1 items-center w-full"><p className="m-2 flex flex-col items-center border p-4 bg-green-900 text-center border-gray-600 rounded-md w-5/6 md:w-96">✅ Images uploaded successfully!</p><DeleteFilesButton fileNames={uploaded} /></div>;
    } else if (uploadStatus === 'some') {
        return <div className="flex flex-col gap-1 items-center w-full"><p className="m-2 flex flex-col items-center border p-4 bg-yellow-900 text-center border-gray-600 rounded-md w-5/6 md:w-96">⚠️ Some images failed: {failed.toString()}</p><DeleteFilesButton fileNames={uploaded} /></div>;
    }else if (uploadStatus === 'net') {
        return <div className="flex flex-col gap-1 items-center w-full"><p className="m-2 flex flex-col items-center border p-4 bg-yellow-900 text-center border-gray-600 rounded-md w-5/6 md:w-96">❗ Unable to reach upload destination. Please check your network connection. </p> <p className="flex flex-col gap-2 text-center items-center">If the error persists, please email support@rima-it.ca </p></div>;
    }
     else if (uploadStatus === 'fail') {
        return <div className="flex flex-col gap-1 items-center w-full"><p className="m-2 flex flex-col items-center border p-4 bg-red-900 text-center border-gray-600 rounded-md w-5/6 md:w-96">❌ Image upload failed: {failed.toString()}</p></div>;
    } else if (uploadStatus === 'loading') {
        return <div className="flex flex-col gap-1 items-center w-full"><p className="m-2 flex flex-col items-center border p-4 bg-gray-900 text-center border-gray-600 rounded-md w-5/6 md:w-96">⏳ Uploading...</p></div>;
    } else if (uploadStatus === 'compress') {
        return <div className="flex flex-col gap-1 items-center w-full"><div className="m-2 flex flex-col items-center border p-4 bg-gray-900 border-gray-600 rounded-md w-5/6 md:w-96"><p className="flex flex-col items-center text-center">⏳ Compressing...</p><progress className="flex flex-col gap-2 bg-white items-center text-center" value={progress}/></div></div>;
    } else {
        return null;
    }
}
/*
const Result = ({ uploadStatus, failed, progress, uploaded, installed }) => {
    
    if (uploadStatus === 'success') {
        return <><p className="m-2 flex flex-col gap-2 items-center border p-4 bg-green-900 text-center border-gray-600 rounded-md w-5/6 md:w-96">✅ File uploaded successfully!</p><DeleteFilesButton fileNames={uploaded} /></>;
    } else if (uploadStatus === 'some') {
        return <><p className="m-10 flex flex-col gap-2 items-center border p-4 bg-yellow-900 text-center border-gray-600 rounded-md w-5/6 md:w-96">⚠️ Some files failed: {failed.toString()}</p><DeleteFilesButton fileNames={uploaded} /></>;
    }else if (uploadStatus === 'net') {
        return <div className="m-10 flex flex-col gap-2 items-center border p-4 bg-yellow-900 border-gray-600 rounded-md w-5/6 md:w-96"><p className="flex flex-col gap-2 items-center text-center">❗ Unable to reach upload destination. Please check your network connection. </p> <p className="flex flex-col gap-2 text-center items-center">If the error persists, please email support@rima-it.ca </p></div>;
    }
     else if (uploadStatus === 'fail') {
        return <p className="m-10 flex flex-col gap-2 items-center border p-4 bg-red-900 text-center border-gray-600 rounded-md w-5/6 md:w-96">❌ File upload failed: {failed.toString()}</p>;
    } else if (uploadStatus === 'loading') {
        return <p className="m-10 flex flex-col gap-2 items-center border p-4 bg-gray-900 text-center border-gray-600 rounded-md w-5/6 md:w-96">⏳ Uploading...</p>;
    } else if (uploadStatus === 'compress') {
        return <div className="m-10 flex flex-col gap-2 items-center border p-4 bg-gray-900 border-gray-600 rounded-md w-5/6 md:w-96"><p className="flex flex-col gap-2 items-center text-center">⏳ Compressing...</p><progress className="flex flex-col gap-2 bg-white items-center text-center" value={progress}/></div>;
    } else {
        return null;
    }
};
*/