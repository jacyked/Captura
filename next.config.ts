/*import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';
let config: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
};

// **Don’t** wrap in withPWA during development
if (!isDev) {
  // dynamically require so TS doesn’t clash
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
  });
  config = withPWA(config);
}

export default config;*/
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // any other Next.js options you need can go here
};

export default nextConfig;