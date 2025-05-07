import { useEffect, useState } from 'react';
export default function usePWAInstalled() {
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    setInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator.standalone === true)
    );
  }, []);
  return installed;
}