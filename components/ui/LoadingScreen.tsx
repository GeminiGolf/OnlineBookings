"use client";

import Image from "next/image";

type LoadingScreenProps = {
  text?: string;
};

export default function LoadingScreen({
  text = "Loading...",
}: LoadingScreenProps) {
  return (
    <main className="min-h-screen bg-[#F2EEE8] flex items-center justify-center px-6">
      <div className="flex flex-col items-center">
        <Image
          src="/images/gemini-logo-warm.png"
          alt="Gemini Golf Academy"
          width={170}
          height={170}
          priority
          className="animate-luxury-fade select-none"
        />

        <p className="mt-6 text-[15px] font-light tracking-[0.08em] text-[#8C7968]">
          {text}
        </p>
      </div>
    </main>
  );
}