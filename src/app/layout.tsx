

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";
//import InstallPrompt from '@/components/InstallPrompt';
//import FSAccessPrompt from "@/components/FSAccessPrompt";
import RequireInstall from '@/components/RequireInstall';
import RequireCertInstall from "@/components/RequireCertInstall";




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Captura",
  description: "Autoshop image upload integrated solution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0a0a0a"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#0a0a0a"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RequireCertInstall>
        <RequireInstall>
         <RegisterSW />
         {children}
        </RequireInstall>
        </RequireCertInstall>
      </body>
    </html>
  );
}
