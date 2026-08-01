import Image from "next/image";

export default function Home() {
  return (
    <main className="relative h-screen overflow-hidden">
      {/* Mobile */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover lg:hidden"
      >
        <source src="/mobile-hero-video.mp4" type="video/mp4" />
      </video>

      {/* Desktop */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 hidden h-full w-full object-cover lg:block"
      >
        <source src="/hero-video2.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-[#F6F2EA]">
        <Image
          src="/images/gemini-logo-warm.png"
          alt="Gemini Golf Academy"
          width={420}
          height={420}
          priority
          className="mt-[clamp(2rem,5vh,4rem)] h-auto w-[clamp(180px,26vw,420px)] opacity-75"
        />

        <div className="mt-[clamp(0.25rem,0.8vh,0.75rem)] mb-[clamp(0.75rem,2vh,1.25rem)] flex items-center gap-[clamp(0.5rem,1vw,0.75rem)]">
          <div className="h-px w-[clamp(50px,6vw,80px)] bg-[#D8CCB7]" />
          <div className="h-[clamp(5px,0.6vw,8px)] w-[clamp(5px,0.6vw,8px)] rotate-45 bg-[#D8CCB7]" />
          <div className="h-px w-[clamp(50px,6vw,80px)] bg-[#D8CCB7]" />
        </div>

        <p className="mb-[clamp(1.5rem,3vh,2rem)] text-[clamp(10px,0.9vw,13px)] uppercase tracking-[0.45em] text-[#D8CCB7]">
          PRECISION · PERFORMANCE · PURPOSE
        </p>

        <a
          href="/CoachAvailability"
          className="rounded-full border border-[#D8CCB7] bg-[#102418]/70 px-[clamp(2rem,3vw,2.75rem)] py-[clamp(0.65rem,1.2vw,0.9rem)] text-[clamp(13px,1.15vw,17px)] font-light uppercase tracking-[0.18em] text-[#F6F2EA] backdrop-blur-md transition hover:bg-[#183525]/80"
        >
          BOOK A LESSON
        </a>

        <p className="mt-[clamp(2rem,4vh,3rem)] max-w-xl text-lg font-light leading-8 text-[#E9E2D8]">
        </p>
      </div>
    </main>
  );
}