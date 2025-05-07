"use client"

import UploadForm from "@/components/UploadForm";
import Image from "next/image";
//import ClientOnly from "@/components/ClientOnly";
//import dynamic from 'next/dynamic';
//import appLogo from "../../public/CLogo_Transparent_Shadow.png";

/*const UploadForm = dynamic(() => import('@/components/UploadForm'), {
  ssr: false,
});*/

export default function Home() {
  return (
    <>
    <div className="md:grid md:grid-rows-[20px_1fr_20px] md:items-center md:justify-items-center md:min-h-screen md:p-8 md:pb-20 md:gap-16 sm:p-20 pt-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center ">
        <Image 
          src="/CLogo_Transparent_Shadow.png"
          width={100}
          height={100}
          priority={true}
          
          alt="CapturA Logo"/>
          <UploadForm />      
      </main>
      
    </div>
    </>
    
  );
}
