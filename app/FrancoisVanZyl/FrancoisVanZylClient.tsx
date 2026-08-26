"use client"

import Link from "next/link"
import { Mail } from "lucide-react"

export default function FrancoisVanZylClient() {
  const specialisations = [
    "Swing Mechanics & Technique",
    "Golf Technology & Swing Analysis (TrackMan & Video)",
    "Course-Management & Strategy",
    "Putting & Short Game",
  ]

  const credentials = [
    "PGA Class A Professional",
    "Over 20+ Years Teaching Experience",
    "Former Professional Tour Player",
    "Certified Master Club Fitter",
    "TrackMan, HackMotion & Capto Specialist",
  ]

  const technologies = [
    {
      name: "TrackMan Launch Monitor",
      desc: "Delivers exact ball flight and club data to pinpoint precise movement mechanics.",
    },
    {
      name: "HackMotion 3D Wrist Sensor",
      desc: "Measures wrist angles throughout the swing to fix face control and contact issues.",
    },
    {
      name: "Capto Precision Putting",
      desc: "Provides deep biomechanical feedback on stroke tempo, face angle, and roll.",
    },
    {
      name: "High-Speed Video Analysis",
      desc: "Offers visual, frame-by-frame clarification so you can see exact areas for growth.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#2F5A43]">
      {/* ================= HERO HEADER WITH IMAGE & GRADIENT ================= */}
      <section className="relative flex min-h-[220px] overflow-hidden border-b border-[#E2DDD3] px-6 pb-6 pt-20 text-[#F2EEE8] md:min-h-[340px] md:px-14 md:pb-12 md:pt-28">
        <img
          src="/OurCoaches/shortgame.jpg"
          alt="Hero Background"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(to right, rgba(18, 29, 22, 0.95) 0%, rgba(18, 29, 22, 0.8) 30%, rgba(18, 29, 22, 0.5) 60%, rgba(18, 29, 22, 0.2) 80%, transparent 100%)",
          }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end">
          <span className="text-xs font-light uppercase tracking-[0.25em] text-[#B89868]">
            Head Golf Coach
          </span>
          <h1 className="mt-1 text-2xl font-light uppercase tracking-[0.18em] text-[#F2EEE8] md:mt-2 md:text-4xl">
            Francois Van Zyl
          </h1>
          <p className="mt-1 max-w-xl text-xs font-light tracking-[0.04em] text-[#E0D8CC] md:mt-2 md:text-sm">
            
          </p>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 md:px-6">
        
        {/* HERO CARD (ASYMMETRIC GALLERY GRID) */}
        <section className="overflow-hidden rounded-3xl border border-[#E2DDD3] bg-[#FAF8F5] p-6 shadow-md md:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* Main Action Shot (Left Column) */}
            <div className="relative min-h-[380px] overflow-hidden rounded-2xl bg-[#E7E2D8] lg:col-span-5 lg:min-h-[480px]">
              <img
                src="/FVZ/Francois_Main.jpg"
                alt="Francois Coaching TrackMan"
                className="h-full w-full object-cover object-center"
              />
            </div>

            {/* Middle Content Column */}
            <div className="flex flex-col justify-between py-2 lg:col-span-4">
              <div>
                <span className="text-[14px] font-light uppercase tracking-[0.2em] text-[#B89868]">
                  Coaching Philosophy
                </span>
                
                <p className="mt-3 text-[13px]] font-light leading-relaxed tracking-[0.02em] text-[#2F5A43] md:text-sm">
                  I believe coaching should be clear, simple and individual to each golfer. <br></br>My approach is to pinpoint the problem, simplify the solution, and give the player the confidence to own it.
                </p>

                <div className="mt-6">
                  <h2 className="text-xs font-light uppercase tracking-[0.16em] text-[#2F5A43]/70">
                    Specialisations
                  </h2>
                  <ul className="mt-2 space-y-1.5">
                    {specialisations.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-[13px] font-light tracking-[0.02em] text-[#2F5A43] md:text-sm"
                      >
                        <span className="text-[10px] text-[#B89868]">◆</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/CoachAvailability?coach=Francois"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#B89868]/80 bg-transparent px-5 py-3 text-xs font-semibold uppercase tracking-[0.17em] text-[#2F5A43] transition-all hover:bg-[#2F5A43] hover:text-[#F2EEE8]"
                >
                  View Availability →
                </Link>
              </div>
            </div>

            {/* Right Photo Column (Stacked Gallery) */}
            <div className="grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-1">
              <div className="h-44 overflow-hidden rounded-2xl bg-[#E7E2D8] lg:h-[230px]">
                <img
                  src="/FVZ/FPutt.png"
                  alt="Francois Junior Coaching"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="h-44 overflow-hidden rounded-2xl bg-[#E7E2D8] lg:h-[230px]">
                <img
                  src="/FVZ/F_Che.png"
                  alt="Francois Club Fitting"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>

          </div>
        </section>

        {/* STORY CARD WITH LANDSCAPE PHOTO */}
        <section className="overflow-hidden rounded-3xl border border-[#E2DDD3] bg-[#FAF8F5] p-6 shadow-md md:p-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            
            <div className="space-y-3 lg:col-span-7">
              <span className="text-xs font-light uppercase tracking-[0.2em] text-[#B89868]">
                Background & Approach
              </span>
              <h2 className="text-[18px] font-light uppercase tracking-[0.14em] text-[#2F5A43] md:text-2xl">
                My Coaching Story
              </h2>
              <div className="space-y-3 text-[13px] font-light leading-relaxed tracking-[0.02em] text-[#2F5A43] md:text-sm">
                <p>
                  "Pinpoint the problem, simplify the solution, and give the player the confidence to own it." 

                </p>
                <p>
                  Golf has always been about more than just hitting a good shot for me. After 20 years of coaching, I believe the best results start with understanding the individual - how they move, how they learn, and what they are trying to achieve.
                </p>
                <p>
                  
                  I utilize technology such as TrackMan, HackMotion, Capto and video analysis to make the learning process more visual. It helps my students see changes in their swing and shows a clearer path to what we are working towards.
                </p>
                <p>
                  Today, I bring together my experience as a PGA professional, coach and club fitter to work with golfers of all levels - from players picking up a club for the first time to those looking to compete at their highest level.
                </p>
              </div>
            </div>

            {/* Outdoor / Putting Green Action Shot */}
            <div className="h-64 overflow-hidden rounded-2xl bg-[#E7E2D8] lg:col-span-5 lg:h-[340px]">
              <img
                src="/FVZ/FCO.png"
                alt="Francois Putting Green Analysis"
                className="h-full w-full object-cover object-center"
              />
            </div>

          </div>
        </section>

        {/* CREDENTIALS & TECH GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Credentials Card */}
          <section className="rounded-3xl border border-[#E2DDD3] bg-[#FAF8F5] p-6 shadow-md md:p-8">
            <span className="text-xs font-light uppercase tracking-[0.2em] text-[#B89868]">
              Background & Experience
            </span>
            <h3 className="mt-1 text-lg font-light uppercase tracking-[0.12em] text-[#2F5A43]">
              Credentials
            </h3>
            <ul className="mt-4 space-y-2.5">
              {credentials.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-xs font-light tracking-[0.02em] text-[#2F5A43] md:text-sm"
                >
                  <span className="text-[#B89868]">◆</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Coaching Tech Card */}
          <section className="rounded-3xl border border-[#E2DDD3] bg-[#FAF8F5] p-6 shadow-md md:p-8">
            <span className="text-xs font-light uppercase tracking-[0.2em] text-[#B89868]">
              Data-Driven Improvement
            </span>
            <h3 className="mt-1 text-lg font-light uppercase tracking-[0.12em] text-[#2F5A43]">
              Coaching Technology
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {technologies.map((tech) => (
                <div
                  key={tech.name}
                  className="rounded-xl border border-[#E2DDD3]/60 bg-[#F4F1EA]/50 p-3"
                >
                  <h4 className="text-[13px] font-medium tracking-[0.06em] text-[#2F5A43]">
                    {tech.name}
                  </h4>
                  <p className="mt-1 text-[12px] font-light leading-relaxed text-[#2F5A43]/80">
                    {tech.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

      </main>

      {/* FOOTER CONTACT */}
      <section className="relative overflow-hidden border-t border-[#E2DDD3] px-6 pb-6 pt-14 text-center text-[#F2EEE8]">
        <img
          src="/OurCoaches/approach.jpg"
          alt="Footer Background"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(to right, rgba(18, 29, 22, 0.95) 0%, rgba(18, 29, 22, 0.8) 50%, rgba(18, 29, 22, 0.95) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-xl">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-[1px] w-16 bg-[#B89868]/60" />
            <img
              src="/images/logo-warm.png"
              alt="Logo"
              className="h-6 w-auto object-contain"
            />
            <div className="h-[1px] w-16 bg-[#B89868]/60" />
          </div>

          <div className="flex flex-col items-center justify-center gap-4 text-xs font-light tracking-[0.14em] uppercase text-[#E0D8CC] sm:flex-row sm:gap-8">
            
            <div className="flex items-center gap-2.5 transition hover:text-[#F2EEE8]">
              <svg 
                className="h-3.5 w-3.5 shrink-0 text-[#B89868]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.75" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <a
                href="https://www.instagram.com/FVZgolf"
                target="_blank"
                rel="noopener noreferrer"
              >
                @FVZgolf
              </a>
            </div>
            <div className="flex items-center gap-2.5 transition hover:text-[#F2EEE8]">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#B89868]" />
              <a href="mailto:francois@geminigolfacademy.com">
                francois@geminigolfacademy.com
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-[#D8CCB7]/20 pt-4 text-[11px] font-light text-[#E0D8CC]/60">
            © {new Date().getFullYear()} Gemini Golf Academy Sdn Bhd. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  )
}