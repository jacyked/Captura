'use client';

import { ReactNode, useEffect, useState } from 'react';

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface Props { children: ReactNode; }
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function RequireInstall({ children }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showOverlay, setShowOverlay]       = useState(false);
  const [isInstalled, setIsInstalled]       = useState(false);

  const isIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = typeof navigator !== 'undefined' && (
    navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    // If already installed/standalone, skip overlay forever
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // iOS never fires beforeinstallprompt
    if (isIos) {
      setShowOverlay(true);
    }

    // Chrome/Android: capture the beforeinstallprompt event
    const onBefore = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowOverlay(true);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setShowOverlay(false);
    };

    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [standalone, isIos]);

  // If installed, render the app
  if (isInstalled) {
    return <>{children}</>;
  }

  // iOS overlay
  if (showOverlay && isIos) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">Install CapturA</h2>
        <p className="mb-6 text-center">
          In Safari, tap the <strong>Share</strong> icon then select{' '}
          <strong>Add to Home Screen</strong>.
        </p>
        <button
          onClick={() => { setIsInstalled(true); setShowOverlay(false); }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-lg"
        >
          ✔ I’ve Installed It
        </button>
      </div>
    );
  }

  // Android/Chrome overlay
  if (showOverlay && deferredPrompt) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">Install CapturA</h2>
        <button
          onClick={async () => {
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice.outcome === 'accepted') {
              setIsInstalled(true);
              setShowOverlay(false);
            }
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-lg"
        >
          Install App
        </button>
      </div>
    );
  }

  // Default: render the app content
  return <>{children}</>;
}