'use client';

import { ReactNode, useEffect, useState } from 'react';

interface Props { children: ReactNode; }

export default function RequireCertInstall({ children }: Props) {
  const [pendingInstall, setPendingInstall] = useState(true);
  const [certDownloaded, setcertDownloaded] = useState(false);
  const [deviceType, setDeviceType] = useState("");

  useEffect(() => {
    // Check localStorage for our “done” flag
    const done = localStorage.getItem('certInstalled') === 'true';
    setPendingInstall(!done);
  }, []);

  const markDone = () => {
    localStorage.setItem('certInstalled', 'true');
    setPendingInstall(false);
    // You can optionally reload here if you want to clear any browser‐bypassed warnings:
    window.location.reload();
  };

  if (pendingInstall) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">1. Security Certificate</h2>
        <p className="mb-6 text-center">
          Please download and install our security certificates to proceed.
        </p>
        <div className={!certDownloaded?'flex flex-row gap-2 items-center justify-center w-full':"hidden"}> 
          <a
            href="/rootCA.crt"
            download="/rootCA.crt"
            onClick={() => {
              setDeviceType("ios");
              setcertDownloaded(true);
              
            }}
            className="px-6 py-3 bg-blue-500 rounded-lg text-lg font-medium hover:bg-blue-600"
          >
            iOS
          </a>
          <a
            href="/rootCA.crt"
            download="/rootCA.crt"
            onClick={() => {
              setDeviceType("android");
              setcertDownloaded(true);
              
            }}
            className="px-6 py-3 bg-blue-500 rounded-lg text-lg font-medium hover:bg-blue-600"
          >
            Android
          </a>
        </div>
        <div className={certDownloaded&&(deviceType === "android")?'flex flex-col gap-2 items-center justify-center w-full':"hidden"}> 
          <p className="mb-6 text-center">
            After downloading, navigate to your Settings app and search for <strong>Certificates</strong>. Select the option to Add a CA and select the certificate file you downloaded - <strong>rootCA.crt</strong>
          </p>
        </div>
        <div className={certDownloaded&&(deviceType === "ios")?'flex flex-col gap-2 items-center justify-center w-full':"hidden"}> 
          <p className="mb-6 text-center">
            If you clicked <strong>Download</strong> and you did not see a popup prompting you to allow the site to download a configuration profile, please open this window in your <strong>Safari</strong> browser and click the IOS download option again. Click allow, then navigate to your Settings app and enable the new profile. You will also need to check off the box for Trusted Apps. 
          </p>
          <p className="mb-6 text-center">
            Click <strong>Allow</strong>, then navigate to your Settings app and enable the new profile. Then, navigate to <strong>About</strong>, scroll to the bottom and select <strong>Certificate Trust Settings</strong>, and check the box for mkcert. 
          </p>
        </div>
        <p className='text-xs items-center'>Need help? Contact support@rima-it.ca</p>
        <p className="text-sm mb-4 text-gray-300 text-center">
          Once you have installed the certificate, click <strong>Next</strong>.
        </p>
        <button
          onClick={markDone}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-lg"
        >
          Next
        </button>
      </div>
    );
  }

  return <>{children}</>;
}