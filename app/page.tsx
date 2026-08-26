"use client";

import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { LeftSidebar } from "@/components/left-sidebar";
import ImageGenerationLoading from "@/components/image-generation";
import { AIPromptInput } from "@/components/prompt-input";
import { RightSidebar } from "@/components/right-sidebar";
import { useRef, useState } from "react";
import { globalState } from "./store/GlobalState";

export default function Home() {

  const fileimginputref = useRef<HTMLInputElement>(null);
  // const [image, setImage] = useState("")
  const { image, setImage } = globalState()


  //* getting the image from the input file
  const handleimageupload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgfile = e.target.files?.[0];

    //* Read img the file
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setImage(result as string);
    };

    reader.readAsDataURL(imgfile as File);
  }

  return (
    <>
      <div className="w-full h-dvh flex flex-col overflow-hidden bg-[#09090B] ">
        <input type="file" accept="image/*" className="hidden" ref={fileimginputref} onChange={handleimageupload} />

        <Navbar />
        <div className="flex-1 flex min-h-0 overflow-hidden  "   >
          {/* LEFT COLUMN */}
          <LeftSidebar />

          {/* MIDDLE COLUMN */}
          <main className="flex-1 flex flex-col min-w-0  relative  "    >
            {/* CANVAS AREA */}
            <div className="flex-1 relative overflow-hidden w-full h-full ">
              {/* BACKGROUND PATTERN */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#a78bfa 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              ></div>

              {/* MAIN EDITOR SCREEN */}
              <div className="w-full h-full flex items-center justify-center p-6 md:p-10">
                {!image ? (
                  <div className="text-center space-y-6 max-w-sm z-10 ">
                    <div className="w-24 h-24  rounded-3xl border border-zinc-800 flex items-center justify-center mx-auto shadow-2xl shadow-yellow-900/10">
                      <Image
                        src={"/logo.png"}
                        width={500}
                        height={500}
                        alt="logo"
                        className=""
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#F4F4F5]">
                        Start Creating
                      </h3>
                      <p className="text-[#A1A1AA] text-sm mt-3 leading-relaxed">
                        Upload an image to unlock the full potential of{" "}
                        <span className="text-[#8B5CF6] font-medium">
                          Coder&apos;s Banana
                        </span>{" "}
                        AI tools.
                      </p>
                    </div>
                    <Button
                      onClick={() => fileimginputref.current?.click()}
                      className="w-full h-11 bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#F4F4F5] font-bold rounded-xl transition-all hover:scale-[1.02]"
                    >
                      Select Image
                    </Button>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={image}
                      alt="Uploaded Image"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* render when image in generating */}
              {/* <ImageGenerationLoading /> */}
            </div>

            {/* PROMPT INPUT AREA */}
            <div className="shrink-0 bg-zinc-950 border-t border-zinc-800 p-4 lg:p-6 z-40">
              <AIPromptInput />
            </div>
          </main>


          {/* RIGHT COLUMNS EDIT HISTORY */}
          <RightSidebar />
        </div>
      </div>
    </>
  );
}
