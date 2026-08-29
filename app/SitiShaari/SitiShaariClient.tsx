"use client"

import Link from "next/link"
import { Mail } from "lucide-react"

export default function SitiShaariClient() {
  const specialisations = [
    "Swing Technique & Movement Understanding",
    "Mental Game & On-Course Confidence",
    "Women's Golf  Development",
    "Junior Golf Coaching",
  ]

  const credentials = [
    "PGAM Member",
    "Over 20+ years of competitive golf experience",
    "Represented Malaysia’s national team for nearly a decade",
    "Former collegiate golfer at the University of South Alabama",
    "5+ years of coaching experience",
  ]

  const coachingFocusAreas = [
    {
      title: "Beginner & Junior Development",
      desc: "Building strong fundamentals, core mechanics, and game enjoyment early in a golfer's journey.",
    },
    {
      title: "Women's Golf Progression",
      desc: "Creating an encouraging environment focused on swing efficiency, distance gain, and course confidence.",
    },
    {
      title: "Movement Understanding",
      desc: "Helping players make sense of their swing dynamics instead of forcing a rigid, copy-cat technique.",
    },
    {
      title: "Effective Independent Practice",
      desc: "Teaching golfers how to practice with clarity so they can self-diagnose and own their development.",
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
            Player Development Coach
          </span>
          <h1 className="mt-1 text-2xl font-light uppercase tracking-[0.18em] text-[#E0D8CC] md:mt-2 md:text-4xl">
            Siti Shaari
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
                src="/OurCoaches/Siti_Action.jpeg"
                alt="Siti Shaari Wedge Gemini Golf Academy"
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
                  I believe golfers learn best when they understand what they are doing and why they are doing it.<br></br>My coaching centers around building strong foundations and helping each player understand their own movement.
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
                  src="/SS/SCP.jpg"
                  alt="Siti Coaching Children"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="h-44 overflow-hidden rounded-2xl bg-[#E7E2D8] lg:h-[230px]">
                <img
                  src="/SS/SMayb.jpg"
                  alt="Siti Shaari Maybank Tournament"
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
                  Golf has been a big part of my life for over 20 years. From competing for my college and state, to being a pro golfer. Those experiences shaped my understanding of the game and my passion for helping others improve. 
                </p>
                <p>
                  My interest in coaching came from wanting to better understand why swings work and how to adapt them to better my abilities. Over time, I found that I enjoyed breaking down those ideas and helping other golfers make sense of what they are doing.
                </p>
                <p>
                  I want my students to understand their golf and practice it effectively, not just follow instructions. My goal is to give them the knowledge, clarity and confidence to keep developing their game and enjoy the process along the way.
                </p>
                
              </div>
            </div>

            {/* Outdoor / Putting Green Action Shot */}
            <div className="h-64 overflow-hidden rounded-2xl bg-[#E7E2D8] lg:col-span-5 lg:h-[340px]">
              <img
                src="/SS/SLa.jpg"
                alt="Siti Shaari Womens Coaching"
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

          {/* Core Specialisations Card */}
          <section className="rounded-3xl border border-[#E2DDD3] bg-[#FAF8F5] p-6 shadow-md md:p-8">
            <span className="text-xs font-light uppercase tracking-[0.2em] text-[#B89868]">
              Coaching Focus
            </span>
            <h3 className="mt-1 text-lg font-light uppercase tracking-[0.12em] text-[#2F5A43]">
              Core Specialisations
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {coachingFocusAreas.map((area) => (
                <div
                  key={area.title}
                  className="rounded-xl border border-[#E2DDD3]/60 bg-[#F4F1EA]/50 p-3"
                >
                  <h4 className="text-[13px] font-medium tracking-[0.06em] text-[#2F5A43]">
                    {area.title}
                  </h4>
                  <p className="mt-1 text-[12px] font-light leading-relaxed text-[#2F5A43]/80">
                    {area.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

      </main>

{/* FOOTER CONTACT */}
      <section className="relative overflow-hidden border-t border-[#E2DDD3] px-6 py-10 text-[#F2EEE8]">
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

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            {/* Left: Brand Identity */}
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex items-center gap-4">
                <img
                  src="/images/logo-warm.png"
                  alt="Logo"
                  className="h-4.5 w-auto object-contain"
                />
                <span className="text-sm font-light uppercase tracking-[0.2em] text-[#E0D8CC]">
                  Siti Shaari
                </span>
              </div>
              <p className="mt-1 text-xs font-light tracking-[0.05em] text-[#B89868]">
                Player Development Coach • Gemini Golf Academy
              </p>
            </div>

            {/* Center Vertical Divider */}
            <div className="h-px w-24 bg-[#B89868]/30 sm:h-10 sm:w-px" />

            {/* Right: Direct Contacts */}
            <div className="flex flex-col items-center gap-2 text-xs font-light text-[#E0D8CC] sm:items-end">
              <a
                href="mailto:siti@geminigolfacademy.com"
                className="flex items-center gap-2 transition hover:text-[#B89868]"
              >
                <span>siti@geminigolfacademy.com</span>
                <Mail className="h-3.5 w-3.5 text-[#B89868]" />
              </a>
              <a
                href="https://www.instagram.com/sitishaari.golf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition hover:text-[#B89868]"
              >
                <span>@sitishaari.golf</span>
                <svg
                  className="h-3.5 w-3.5 text-[#B89868]"
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
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-[#D8CCB7]/20 pt-4 text-center text-[11px] font-light text-[#E0D8CC]/50">
            © {new Date().getFullYear()} Gemini Golf Academy Sdn Bhd. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  )
}