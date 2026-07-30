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

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <Image
          src="/images/gemini-logo.png"
          alt="Gemini Golf Academy"
          width={420}
          height={420}
          priority
          className="w-[260px] md:w-[380px] lg:w-[450px] h-auto"
        />

        <a
          href="/CoachAvailability"
          className="mt-6 rounded-full border border-white bg-white/10 px-7 py-3 text-base font-semibold backdrop-blur-sm transition hover:bg-white hover:text-black md:mt-8 md:px-10 md:py-4 md:text-lg"
        >
          Book a Lesson
        </a>
      </div>

    </main>
  );
}