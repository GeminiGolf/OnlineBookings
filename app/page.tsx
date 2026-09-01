import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1B2E23]">
      {/* HERO SECTION */}
      <main className="relative min-h-screen w-full flex-grow">
        {/* Mobile Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover lg:hidden"
        >
          <source src="/mobile-hero-video.mp4" type="video/mp4" />
        </video>

        {/* Desktop Video */}
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

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center text-[#F6F2EA]">
          <Image
            src="/images/logo-warm.png"
            alt="Gemini Golf Academy"
            width={420}
            height={420}
            priority
            className="mt-[clamp(3rem,7vh,6rem)] h-auto w-[clamp(60px,10vw,110px)] opacity-75"
          />

          <Image
            src="/images/gemini-logo-text-warm.png"
            alt="Gemini Golf Academy"
            width={420}
            height={420}
            priority
            className="mt-[clamp(0.5rem,1.2vh,1rem)] h-auto w-[clamp(220px,26vw,420px)] opacity-75"
          />

          <div className="mt-[clamp(0.25rem,0.8vh,0.75rem)] mb-[clamp(0.75rem,2vh,1.25rem)] flex items-center gap-[clamp(0.5rem,1vw,0.75rem)]">
            <div className="h-px w-[clamp(50px,6vw,80px)] bg-[#D8CCB7]" />
            <div className="h-[clamp(5px,0.6vw,8px)] w-[clamp(5px,0.6vw,8px)] rotate-45 bg-[#D8CCB7]" />
            <div className="h-px w-[clamp(50px,6vw,80px)] bg-[#D8CCB7]" />
          </div>

          <p className="mb-[clamp(1.5rem,3vh,2rem)] text-[clamp(11px,0.9vw,13px)] uppercase tracking-[0.45em] text-[#D8CCB7]">
            <span className="whitespace-nowrap">One Academy · One Standard ·</span>{" "}
            <span className="whitespace-nowrap">Every Golfer.</span>
          </p>

          <div className="flex w-full max-w-[200px] sm:max-w-md flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <a
              href="/CoachAvailability"
              className="w-full sm:w-1/2 sm:flex-1 whitespace-nowrap rounded-full border border-[#D8CCB7] bg-[#102418]/70 px-2 sm:px-0 py-[clamp(0.5rem,1.2vw,0.9rem)] text-center text-[clamp(11px,1.1vw,14px)] font-light uppercase tracking-[0.08em] sm:tracking-[0.1em] text-[#F6F0E2] backdrop-blur-md transition hover:bg-[#183525]/80"
            >
              BOOK A LESSON
            </a>
            <a
              href="/MeetOurCoaches"
              className="w-full sm:w-1/2 sm:flex-1 whitespace-nowrap rounded-full border border-[#D8CCB7] bg-[#102418]/70 px-2 sm:px-0 py-[clamp(0.5rem,1.2vw,0.9rem)] text-center text-[clamp(11px,1.1vw,14px)] font-light uppercase tracking-[0.08em] sm:tracking-[0.1em] text-[#F6F0E2] backdrop-blur-md transition hover:bg-[#183525]/80"
            >
              MEET OUR COACHES
            </a>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#D8CCB7]/20 bg-[#102418] px-8 py-6 text-[#F6F2EA]">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 md:flex-row md:items-center md:gap-12">
          
          {/* Left Column: Brand & Address */}
          <div className="flex flex-col items-center gap-3 text-center">
            {/* Side-by-Side Logos */}
            <div className="flex items-center gap-0">
              <Image
                src="/images/logo-warm.png"
                alt="Gemini Golf Academy Logo Icon"
                width={40}
                height={40}
                className="h-4 w-auto opacity-100"
              />
              <Image
                src="/images/gemini-logo-text-warm.png"
                alt="Gemini Golf Academy Text Logo"
                width={180}
                height={40}
                className="h-4.5 w-auto opacity-90"
              />
            </div>

            {/* Address & Locate Us */}
            <div className="text-xs font-light leading-snug text-[#D8CCB7]/90">
              <div className="flex items-start justify-center gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D8CCB7]" />
                <div className="flex flex-col items-center">
                  <p>
                    Block A (Level 1), Boulevard 51,<br />
                    Jalan SS9A/18, Seksyen 51a,<br />
                    47300 Petaling Jaya
                  </p>
                  <a
                    href="https://www.google.com/maps/place/Wedge+Range+%E2%80%A2+Petaling+Jaya/@3.088056,101.6245866,20.5z/data=!4m9!1m2!2m1!1sBlock+a+boulevard+51+Jalan+SS9A%2F18+Seksyen+51a+47300+Petaling+Jaya!3m5!1s0x31cc4b98e9f6bd09:0xa0ce29eba27b7783!8m2!3d3.0879459!4d101.6248033!16s%2Fg%2F11vjnslt35?entry=ttu&g_ep=EgoyMDI2MDgyMy4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-block -ml-6 text-[11px] uppercase tracking-wider text-[#D8CCB7] underline opacity-80 hover:opacity-100"                  >
                    Locate Us →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Separator Line (Horizontal on mobile, Vertical on desktop) */}
          <div className="h-px w-24 bg-[#D8CCB7]/30 md:h-20 md:w-px" />

          {/* Right Column: Contact Us */}
          <div className="flex flex-col items-center gap-1 text-center text-xs font-light leading-snug text-[#D8CCB7]/90">
            <h3 className="mb-2 text-[14px] font-normal text-[#D8CCB7]">Contact Us</h3>

            <div className="flex items-center justify-center gap-2.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#D8CCB7]" />
              <a href="mailto:inquiries@geminigolfacademy.com" className="hover:underline">
                hello@geminigolfacademy.com
              </a>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <Phone className="h-3.5 w-3.5 shrink-0 text-[#D8CCB7]" />
              <a href="tel:+60173576747" className="hover:underline">
                +60173576747
              </a>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <svg 
                className="h-3.5 w-3.5 shrink-0 text-[#D8CCB7]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <a 
                href="https://www.instagram.com/GeminiGolfAcademy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline"
              >
                @GeminiGolfAcademy
              </a>
            </div>
          </div>
          
        </div>

        {/* Bottom copyright line */}
        <div className="mt-6 border-t border-[#D8CCB7]/20 pt-4 text-center text-[11px] text-[#D8CCB7]/60">
          © {new Date().getFullYear()} Gemini Golf Academy Sdn Bhd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}