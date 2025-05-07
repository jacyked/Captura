"use client";

import { ReactNode, useEffect, useState } from "react";

interface Props { children: ReactNode; }

export default function ClientOnly({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don’t render anything on the server
  if (!mounted) return null;
  return <>{children}</>;
}