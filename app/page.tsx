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
          className="h-auto w-[230px] md:w-[320px] lg:w-[360px]"
        />


        <div className="my-5 flex items-center gap-4">
          <div className="h-px w-20 bg-[#D8CCB7]" />
          <div className="h-2 w-2 rotate-45 bg-[#D8CCB7]" />
          <div className="h-px w-20 bg-[#D8CCB7]" />
        </div>

        <p className="mb-8 text-sm uppercase tracking-[0.45em] text-[#D8CCB7] md:text-base">
          PRECISION · PERFORMANCE · PURPOSE
        </p>

        <a
          href="/CoachAvailability"
          className="rounded-full border border-[#D8CCB7] bg-[#102418]/80 px-14 py-4 text-lg font-light uppercase tracking-[0.18em] text-[#F6F2EA] backdrop-blur-md transition hover:bg-[#183525]"
        >
          BOOK A LESSON
        </a>

        <p className="mt-10 max-w-xl text-lg font-light leading-8 text-[#E9E2D8]">

        </p>

      </div>

    </main>
  );
}