"use client"

import Link from "next/link"

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
      {/* ================= DARK GREEN TEXT HEADER ================= */}
      <section className="relative bg-[#1b2e23] border-b border-[#24392B] px-6 pt-28 pb-12 text-[#F2EEE8]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-end">
          <span className="text-xs font-light uppercase tracking-[0.25em] text-[#B89868]">
            Head Golf Coach
          </span>
          <h1 className="mt-2 text-3xl font-light uppercase tracking-[0.18em] text-[#F2EEE8] md:text-4xl">
            Francois Van Zyl
          </h1>
          <p className="mt-2 max-w-xl text-xs font-light tracking-[0.04em] text-[#E0D8CC] md:text-sm">
            PGA Professional with 20+ years of teaching experience, swing technology, and custom golf development.
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
                <span className="text-xs font-light uppercase tracking-[0.2em] text-[#B89868]">
                  Coaching Philosophy
                </span>
                
                <p className="mt-3 text-xs font-light leading-relaxed tracking-[0.02em] text-[#2F5A43] md:text-sm">
                  I believe coaching should be clear, simple and individual to each golfer. My approach is to find the root of the problem, simplify the fix, and give players the tools to improve.
                </p>

                <div className="mt-6">
                  <h2 className="text-xs font-light uppercase tracking-[0.16em] text-[#2F5A43]/70">
                    Specialisations
                  </h2>
                  <ul className="mt-2 space-y-1.5">
                    {specialisations.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-xs font-light tracking-[0.02em] text-[#2F5A43] md:text-sm"
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
            
            <div className="space-y-4 lg:col-span-7">
              <span className="text-xs font-light uppercase tracking-[0.2em] text-[#B89868]">
                Background & Approach
              </span>
              <h2 className="text-xl font-light uppercase tracking-[0.14em] text-[#2F5A43] md:text-2xl">
                Personal Coaching Story
              </h2>
              <div className="space-y-3 text-xs font-light leading-relaxed tracking-[0.02em] text-[#2F5A43] md:text-sm">
                <p>
                  Golf has always been about more than just hitting a good shot for me. With over 20 years of teaching experience and a background in professional golf, I believe the best coaching starts with understanding the individual — how they move, how they learn, and what they are trying to achieve.
                </p>
                <p>
                  My approach is simple: understand the problem, simplify the solution, and give the player the confidence to own it. Technology such as TrackMan, HackMotion, Capto and video analysis helps me understand what is happening, but it is never the goal. The goal is to help each golfer understand their game and become a better player.
                </p>
                <p>
                  Today, I bring together my experience as a PGA professional, coach and club fitter to work with golfers of all levels — from players picking up a club for the first time to those looking to compete at their highest level.
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
                  <h4 className="text-xs font-medium tracking-[0.05em] text-[#2F5A43]">
                    {tech.name}
                  </h4>
                  <p className="mt-1 text-[11px] font-light leading-relaxed text-[#2F5A43]/80">
                    {tech.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

      </main>

      {/* FOOTER CTA */}
      <section className="relative overflow-hidden border-t border-[#E2DDD3] px-6 py-14 text-center text-[#F2EEE8]">
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
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-[1px] w-16 bg-[#B89868]/60" />
            <img
              src="/images/logo-warm.png"
              alt="Logo"
              className="h-6 w-auto object-contain"
            />
            <div className="h-[1px] w-16 bg-[#B89868]/60" />
          </div>

          <h2 className="text-lg font-light uppercase tracking-[0.18em]">
            Ready To Elevate Your Game?
          </h2>
          <p className="mt-2 text-xs font-light text-[#E0D8CC]">
            Book a private one-on-one session with Head Coach Francois Van Zyl.
          </p>

          <div className="mt-6">
            <Link
              href="/CoachAvailability?coach=Francois"
              className="inline-block border border-[#B89868] bg-[#121D16]/60 px-6 py-2.5 text-xs font-light uppercase tracking-[0.18em] text-[#F2EEE8] backdrop-blur-sm transition hover:bg-[#B89868] hover:text-[#121D16]"
            >
              Check Availability
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}