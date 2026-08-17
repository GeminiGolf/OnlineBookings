"use client"

import Link from "next/link"

type Coach = {
  id: number
  label: string
  name: string
  role: string
  philosophy: string
  specialisations: string[]
  photoUrl?: string
  imagePosition?: string
  mobileImagePosition?: string // <-- Add this
  mobileImageHeight?: string   // <-- Add this
}

const coachesData: Coach[] = [
  {
    id: 1,
    label: "COACH 01",
    name: "Francois Van Zyl",
    role: "HEAD COACH",
    philosophy:
      "Every golfer is different. My approach is built around understanding how you move, how you learn, and what you want to achieve.",
    specialisations: [
      "Swing Development",
      "Performance",
      "Course Management",
      "Technology & Analysis",
    ],
    photoUrl: "/OurCoaches/Francois_Action.png",
    imagePosition: "object-[center_25%]",
    // Mobile-specific position & height controls:
    mobileImagePosition: "object-top", // Starts pinned right at the top
    mobileImageHeight: "h-80", // Increases vertical height (e.g., h-72, h-80, h-96, or min-h-[350px])
  },
  {
    id: 2,
    label: "COACH 02",
    name: "Siti Shaari",
    role: "PERFORMANCE COACH",
    philosophy:
      "I focus on building repeatable performance under pressure. Golf is as much mental as it is physical.",
    specialisations: [
      "Short Game",
      "Scoring & Strategy",
      "Performance Training",
    ],
    photoUrl: "/OurCoaches/Siti_Action.jpeg",
    imagePosition: "object-center",
    // Mobile-specific position & height controls:
    mobileImagePosition: "object-[center_5%]", // Starts lower down (adjust percentage as needed)
    mobileImageHeight: "h-80", 
  },
]

export default function MeetOurCoachesPage() {
  return (
    <>
      {/* ========================================================================= */}
      {/*                       1. DESKTOP VERSION (md and up)                     */}
      {/* ========================================================================= */}
      <div className="hidden md:block min-h-screen bg-[#121D16] text-[#F2EEE8]">
        {/* Desktop Hero Section */}
        <section className="relative flex min-h-[340px] overflow-hidden border-b border-[#2A3D30] px-14 pb-10 pt-28 text-[#F2EEE8]">
          <img
            src="/OurCoaches/shortgame.jpg"
            alt="Hero Background"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div 
            className="absolute inset-0 z-0"
            style={{
              background: "linear-gradient(to right, rgba(18, 29, 22, 0.95) 0%, rgba(18, 29, 22, 0.8) 30%, rgba(18, 29, 22, 0.5) 60%, rgba(18, 29, 22, 0.2) 80%, transparent 100%)",
            }}
          />

          <div className="relative z-10 mx-auto flex w-full max-w-6xl items-end justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-light uppercase tracking-[0.18em] text-[#F2EEE8]">
                Meet Our Coaches
              </h1>
              <p className="mt-1 text-sm font-light tracking-[0.04em] text-[#E0D8CC]">
                The people behind your golf development.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[12px] font-light uppercase tracking-[0.2em] text-[#E0D8CC]">
              <span>Scroll</span>
              <span>↓</span>
            </div>
          </div>
        </section>

        {/* Desktop Coaches Grid Layout */}
        <section className="mx-auto w-full max-w-6xl border-x border-[#2A3D30]">
          {coachesData.map((coach, index) => {
            const isEven = index % 2 === 0

            let textSpan = "col-span-8"
            let photoSpan = "col-span-4"
            let photoMinHeight = "min-h-[350px]"

            if (coach.id === 1) {
              textSpan = "col-span-8"
              photoSpan = "col-span-4"
              photoMinHeight = "min-h-[350px]"
            } else if (coach.id === 2) {
              textSpan = "col-span-8"
              photoSpan = "col-span-4"
              photoMinHeight = "min-h-[350px]"
            }

            return (
              <div
                key={coach.id}
                className="grid grid-cols-12 border-b border-[#2A3D30] w-full items-stretch"
              >
                {/* Desktop Info Block */}
                <div
                  className={`${textSpan} flex h-full flex-col justify-between bg-[#1B2B20] p-7 overflow-hidden ${
                    isEven ? "order-1" : "order-2"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-light uppercase tracking-[0.16em] text-[#B89868]">
                        {coach.label}
                      </span>
                      <div className="h-[1px] w-12 bg-[#2A3D30]" />
                    </div>

                    <h2 className="mt-2 text-3xl font-light uppercase tracking-[0.12em] text-[#F2EEE8] truncate">
                      {coach.name}
                    </h2>
                    <p className="mt-0.5 text-sm font-light uppercase tracking-[0.14em] text-[#B89868]">
                      {coach.role}
                    </p>

                    <div className="mt-3">
                      <h3 className="text-[12px] font-light uppercase tracking-[0.16em] text-[#E0D8CC]/70">
                        Coaching Philosophy
                      </h3>
                      <p className="mt-0.5 text-base font-light leading-normal tracking-[0.02em] text-[#E0D8CC]">
                        {coach.philosophy}
                      </p>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-[12px] font-light uppercase tracking-[0.16em] text-[#E0D8CC]/70">
                        Specialisations
                      </h3>
                      <ul className="mt-0.5 space-y-0.5">
                        {coach.specialisations.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-1 text-sm font-light tracking-[0.02em] text-[#E0D8CC]"
                          >
                            <span className="text-[8px] font-light text-[#B89868]">◆</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 shrink-0">
                    <Link
                      href="/CoachAvailability"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#3A5D49] bg-[#121D16] px-4 py-2 text-sm font-light uppercase tracking-[0.14em] text-[#F2EEE8] shadow-sm transition hover:bg-[#253A2C] hover:border-[#B89868]"
                    >
                      View Availability →
                    </Link>
                  </div>
                </div>

                {/* Desktop Photo Block */}
                <div
                  className={`${photoSpan} ${photoMinHeight} relative w-full overflow-hidden bg-[#121D16] ${
                    isEven ? "order-2" : "order-1"
                  }`}
                >
                  {coach.photoUrl ? (
                    <img
                      src={coach.photoUrl}
                      alt={coach.name}
                      className={`h-full w-full object-cover ${
                        coach.imagePosition || "object-top"
                      }`}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-4 text-center">
                      <span className="text-[12px] font-light uppercase tracking-[0.2em] text-[#E0D8CC]/60">
                        [ Image Placeholder — {coach.name} ]
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </section>

        {/* Desktop Footer CTA */}
        <section className="bg-[#1B2B20] px-10 py-16 text-center text-[#F2EEE8] border-t border-[#2A3D30]">
          <div className="mx-auto max-w-xl">
            <h2 className="text-2xl font-light uppercase tracking-[0.18em]">
              One Academy. Different Approaches.
            </h2>
            <p className="mt-2.5 text-base font-light leading-relaxed tracking-[0.04em] text-[#E0D8CC]">
              Every golfer learns differently. Our coaches bring their own experience,
              perspective and methodology — united by one goal: helping every player
              become a better version of themselves.
            </p>

            <div className="mt-6">
              <Link
                href="/client/dashboard"
                className="inline-block border border-[#B89868] bg-transparent px-6 py-2.5 text-sm font-light uppercase tracking-[0.18em] text-[#F2EEE8] transition hover:bg-[#B89868] hover:text-[#121D16]"
              >
                Book A Lesson
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/*                       2. MOBILE VERSION (under md)                      */}
      {/* ========================================================================= */}
      <div className="block md:hidden min-h-screen bg-[#F4F1EA] text-[#2F5A43]">
        {/* Mobile Hero Section */}
        <section className="relative flex min-h-[280px] flex-col justify-end overflow-hidden px-6 pb-8 pt-20 text-[#F2EEE8]">
          <img
            src="/OurCoaches/shortgame.jpg"
            alt="Hero Background"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(10,18,13,0.85) 100%)",
            }}
          />

          <div className="relative z-10 w-full">
            <h1 className="text-2xl font-light uppercase tracking-[0.18em] text-[#F2EEE8]">
              Meet Our Coaches
            </h1>
            <p className="mt-1 text-xs font-light tracking-[0.04em] text-[#E0D8CC]">
              The people behind your golf development.
            </p>

            <div className="mt-6 flex flex-col items-start gap-1 text-[12px] font-light uppercase tracking-[0.2em] text-[#B89868]">
              <span>Scroll</span>
              <span>↓</span>
            </div>
          </div>
        </section>

        {/* Mobile Section Title with Decorative Lines */}
        <div className="my-8 flex items-center justify-center gap-4 px-6">
          <div className="h-[1px] flex-1 bg-[#B89868]/40" />
          <h2 className="text-xs font-light uppercase tracking-[0.25em] text-[#2F5A43]">
            Our Coaches
          </h2>
          <div className="h-[1px] flex-1 bg-[#B89868]/40" />
        </div>

        {/* Mobile Coach Cards Stack */}
        <div className="px-4 pb-12 space-y-8">
          {coachesData.map((coach) => (
            <div
              key={coach.id}
              className="overflow-hidden rounded-2xl bg-[#FAF8F5] shadow-md border border-[#E2DDD3]"
            >
              {/* Mobile Image Container */}
              <div className={`relative w-full overflow-hidden bg-[#E7E2D8] ${coach.mobileImageHeight || "h-80"}`}>
                {coach.photoUrl ? (
                  <img
                    src={coach.photoUrl}
                    alt={coach.name}
                    className={`h-full w-full object-cover ${coach.mobileImagePosition || "object-top"}`}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-4 text-center">
                    <span className="text-xs font-light uppercase tracking-[0.2em] text-[#2F5A43]/60">
                      [ Image Placeholder — {coach.name} ]
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile Card Info */}
              <div className="p-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-light uppercase tracking-[0.16em] text-[#B89868]">
                    {coach.label}
                  </span>
                  <div className="h-[1px] w-8 bg-[#B89868]/50" />
                </div>

                <h2 className="mt-1.5 text-xl font-light uppercase tracking-[0.12em] text-[#2F5A43]">
                  {coach.name}
                </h2>
                <p className="mt-0.5 text-xs font-light uppercase tracking-[0.14em] text-[#B89868]">
                  {coach.role}
                </p>

                <div className="mt-4">
                  <h3 className="text-xs font-light uppercase tracking-[0.16em] text-[#2F5A43]/70">
                    Coaching Philosophy
                  </h3>
                  <p className="mt-1 text-sm font-light leading-relaxed text-[#2F5A43]">
                    {coach.philosophy}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-light uppercase tracking-[0.16em] text-[#2F5A43]/70">
                    Specialisations
                  </h3>
                  <ul className="mt-1.5 space-y-1">
                    {coach.specialisations.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm font-light text-[#2F5A43]"
                      >
                        <span className="text-[10px] text-[#B89868]">◆</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Link
                    href="/CoachAvailability"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#121D16] px-5 py-3 text-xs font-light uppercase tracking-[0.16em] text-[#F2EEE8] shadow transition hover:bg-[#1B2B20]"
                  >
                    View Availability →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Footer CTA */}
        <section className="bg-[#121D16] px-6 py-12 text-center text-[#F2EEE8]">
          <h2 className="text-base font-light uppercase tracking-[0.18em]">
            One Academy. Different Approaches.
          </h2>
          <p className="mt-2 text-xs font-light leading-relaxed text-[#E0D8CC]">
            Every golfer learns differently. Our coaches bring their own experience,
            perspective and methodology.
          </p>

          <div className="mt-6">
            <Link
              href="/client/dashboard"
              className="inline-block border border-[#B89868] bg-transparent px-6 py-2.5 text-xs font-light uppercase tracking-[0.18em] text-[#F2EEE8]"
            >
              Book A Lesson
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}