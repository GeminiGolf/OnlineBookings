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
    imagePosition: "object-top",
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
    photoUrl: "/OurCoaches/Siti_Action.jpg",
    imagePosition: "object-center",
  },
]

export default function MeetOurCoachesPage() {
  return (
    <main className="min-h-screen bg-[#F2EEE8] text-[#2F5A43]">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-between overflow-hidden border-b border-[#3A5D49] px-6 py-10 text-[#F2EEE8] sm:px-10 lg:px-14 lg:py-16">
        <img
          src="/OurCoaches/shortgame.jpg"
          alt="Hero Background"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div 
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(to right, rgba(27, 46, 35, 0.9) 0%, rgba(27, 46, 35, 0.7) 30%, rgba(27, 46, 35, 0.45) 60%, rgba(27, 46, 35, 0.2) 80%, transparent 100%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <h1 className="text-xl font-light uppercase tracking-[0.18em] sm:text-2xl lg:text-3xl">
              Meet Our Coaches
            </h1>
            <p className="mt-3 text-xs font-light tracking-[0.04em] text-[#E0D8CC] sm:text-sm">
              The people behind your golf development.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between text-[10px] font-light uppercase tracking-[0.2em] text-[#E0D8CC]">
            <div className="flex flex-col items-center gap-1">
              <span>Scroll</span>
              <span>↓</span>
            </div>
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="mx-auto w-full max-w-6xl border-x border-[#3A5D49]/20">
        {coachesData.map((coach, index) => {
          const isEven = index % 2 === 0

          return (
            <div
              key={coach.id}
              /* 
                - grid-cols-5 keeps text and photo strictly side-by-side on all screens.
                - h-[50vw] max-h-[500px] ensures it shrinks on smaller screens and caps at a fixed max height on wide screens.
              */
              className="grid grid-cols-5 border-b border-[#3A5D49] w-full h-[50vw] max-h-[500px] min-h-[360px]"
            >
              {/* Info Block (3/5 width) */}
              <div
                className={`col-span-3 flex h-full flex-col justify-between bg-[#F2EEE8] p-3 sm:p-6 lg:p-8 overflow-hidden ${
                  isEven ? "order-1" : "order-2"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[9px] sm:text-[10px] font-light uppercase tracking-[0.16em] text-[#2F5A43]">
                      {coach.label}
                    </span>
                    <div className="h-[1px] w-6 sm:w-12 bg-[#3A5D49]/40" />
                  </div>

                  <h2 className="mt-1 sm:mt-2 text-sm sm:text-xl lg:text-2xl font-light uppercase tracking-[0.12em] text-[#2F5A43]">
                    {coach.name}
                  </h2>
                  <p className="mt-0.5 text-[9px] sm:text-xs font-light uppercase tracking-[0.14em] text-[#B89868]">
                    {coach.role}
                  </p>

                  <div className="mt-2 sm:mt-5">
                    <h3 className="text-[9px] sm:text-[10px] font-light uppercase tracking-[0.16em] text-[#2F5A43]/70">
                      Coaching Philosophy
                    </h3>
                    <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-sm font-light leading-snug sm:leading-relaxed tracking-[0.02em] text-[#2F5A43] line-clamp-3 sm:line-clamp-none">
                      {coach.philosophy}
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-5 hidden min-[400px]:block">
                    <h3 className="text-[9px] sm:text-[10px] font-light uppercase tracking-[0.16em] text-[#2F5A43]/70">
                      Specialisations
                    </h3>
                    <ul className="mt-1 space-y-0.5">
                      {coach.specialisations.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-1.5 text-[10px] sm:text-xs font-light tracking-[0.02em] text-[#2F5A43]"
                        >
                          <span className="text-[6px] sm:text-[8px] font-light">◆</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-2 sm:mt-6">
                  <Link
                    href="/CoachAvailability"
                    className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-[#3A5D49] bg-white px-2.5 py-1 sm:px-4 sm:py-2 text-[9px] sm:text-xs font-light uppercase tracking-[0.14em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6]"
                  >
                    View Availability →
                  </Link>
                </div>
              </div>

              {/* Photo Block (2/5 width) */}
              <div
                className={`col-span-2 relative h-full w-full overflow-hidden ${
                  isEven ? "order-2" : "order-1"
                }`}
              >
                {coach.photoUrl ? (
                  <img
                    src={coach.photoUrl}
                    alt={coach.name}
                    className={`h-full w-full object-cover ${
                      coach.imagePosition || "object-center"
                    }`}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-4 text-center">
                    <span className="text-[10px] font-light uppercase tracking-[0.2em] text-[#E0D8CC]/60">
                      [ Image Placeholder — {coach.name} ]
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </section>

      {/* Footer CTA */}
      <section className="bg-[#2F5A43] px-6 py-12 text-center text-[#F2EEE8] sm:px-10 lg:py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-base font-light uppercase tracking-[0.18em] sm:text-lg lg:text-xl">
            One Academy. Different Approaches.
          </h2>
          <p className="mt-2.5 text-xs font-light leading-relaxed tracking-[0.04em] text-[#E0D8CC] sm:text-sm">
            Every golfer learns differently. Our coaches bring their own experience,
            perspective and methodology — united by one goal: helping every player
            become a better version of themselves.
          </p>

          <div className="mt-5 sm:mt-6">
            <Link
              href="/client/dashboard"
              className="inline-block border border-[#E0D8CC] bg-transparent px-5 py-2 text-[10px] font-light uppercase tracking-[0.18em] text-[#F2EEE8] transition hover:bg-[#F2EEE8] hover:text-[#2F5A43] sm:px-6 sm:py-2.5 sm:text-xs"
            >
              Book A Lesson
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}