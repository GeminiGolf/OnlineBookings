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
    imagePosition: "object-[center_25%]",
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
    <main className="min-h-screen bg-[#121D16] text-[#F2EEE8]">
      {/* Short Panoramic Hero Section with Navbar Clearance & Height Dictation */}
      <section className="relative flex min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] overflow-hidden border-b border-[#2A3D30] px-6 pb-6 pt-20 sm:px-10 sm:pb-8 sm:pt-24 lg:px-14 lg:pb-10 lg:pt-28 text-[#F2EEE8]">
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
            <h1 className="text-xl font-light uppercase tracking-[0.18em] sm:text-2xl lg:text-3xl text-[#F2EEE8]">
              Meet Our Coaches
            </h1>
            <p className="mt-1 text-[13px] font-light tracking-[0.04em] text-[#E0D8CC] sm:text-sm">
              The people behind your golf development.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[12px] font-light uppercase tracking-[0.2em] text-[#E0D8CC]">
            <span>Scroll</span>
            <span>↓</span>
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="mx-auto w-full max-w-6xl border-x border-[#2A3D30]">
        {coachesData.map((coach, index) => {
          const isEven = index % 2 === 0

          // Independent per-coach layouts
          let textSpan = "col-span-7 sm:col-span-7"
          let photoSpan = "col-span-5 sm:col-span-5"
          let photoMinHeight = "min-h-[340px] sm:min-h-[380px]"

          if (coach.id === 1) {
            textSpan = "col-span-7 sm:col-span-8"
            photoSpan = "col-span-5 sm:col-span-4"
            photoMinHeight = "min-h-[300px] sm:min-h-[350px]"
          } else if (coach.id === 2) {
            textSpan = "col-span-7 sm:col-span-8"
            photoSpan = "col-span-5 sm:col-span-4"
            photoMinHeight = "min-h-[300px] sm:min-h-[350px]"
          }

          return (
            <div
              key={coach.id}
              className="grid grid-cols-12 border-b border-[#2A3D30] w-full items-stretch"
            >
              {/* Info Block */}
              <div
                className={`${textSpan} flex h-full flex-col justify-between bg-[#1B2B20] p-3 sm:p-5 lg:p-7 overflow-hidden ${
                  isEven ? "order-1" : "order-2"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[12px] font-light uppercase tracking-[0.16em] text-[#B89868]">
                      {coach.label}
                    </span>
                    <div className="h-[1px] w-4 sm:w-12 bg-[#2A3D30]" />
                  </div>

                  <h2 className="mt-1 sm:mt-2 text-base sm:text-2xl lg:text-3xl font-light uppercase tracking-[0.12em] text-[#F2EEE8] truncate">
                    {coach.name}
                  </h2>
                  <p className="mt-0.5 text-[12px] sm:text-sm font-light uppercase tracking-[0.14em] text-[#B89868]">
                    {coach.role}
                  </p>

                  <div className="mt-1.5 sm:mt-3">
                    <h3 className="text-[12px] font-light uppercase tracking-[0.16em] text-[#E0D8CC]/70">
                      Coaching Philosophy
                    </h3>
                    <p className="mt-0.5 text-[13px] sm:text-sm lg:text-base font-light leading-snug sm:leading-normal tracking-[0.02em] text-[#E0D8CC]">
                      {coach.philosophy}
                    </p>
                  </div>

                  <div className="mt-1.5 sm:mt-3 hidden min-[480px]:block">
                    <h3 className="text-[12px] font-light uppercase tracking-[0.16em] text-[#E0D8CC]/70">
                      Specialisations
                    </h3>
                    <ul className="mt-0.5 space-y-0.5">
                      {coach.specialisations.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-1 text-[12px] sm:text-sm font-light tracking-[0.02em] text-[#E0D8CC]"
                        >
                          <span className="text-[8px] font-light text-[#B89868]">◆</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-2 sm:mt-4 shrink-0">
                  <Link
                    href="/CoachAvailability"
                    className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-[#3A5D49] bg-[#121D16] px-2.5 py-1.5 sm:px-4 sm:py-2 text-[12px] sm:text-sm font-light uppercase tracking-[0.14em] text-[#F2EEE8] shadow-sm transition hover:bg-[#253A2C] hover:border-[#B89868]"
                  >
                    View Availability →
                  </Link>
                </div>
              </div>

              {/* Photo Block */}
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

      {/* Footer CTA */}
      <section className="bg-[#1B2B20] px-6 py-12 text-center text-[#F2EEE8] sm:px-10 lg:py-16 border-t border-[#2A3D30]">
        <div className="mx-auto max-w-xl">
          <h2 className="text-lg font-light uppercase tracking-[0.18em] sm:text-xl lg:text-2xl">
            One Academy. Different Approaches.
          </h2>
          <p className="mt-2.5 text-[13px] font-light leading-relaxed tracking-[0.04em] text-[#E0D8CC] sm:text-sm lg:text-base">
            Every golfer learns differently. Our coaches bring their own experience,
            perspective and methodology — united by one goal: helping every player
            become a better version of themselves.
          </p>

          <div className="mt-5 sm:mt-6">
            <Link
              href="/client/dashboard"
              className="inline-block border border-[#B89868] bg-transparent px-5 py-2 text-[12px] font-light uppercase tracking-[0.18em] text-[#F2EEE8] transition hover:bg-[#B89868] hover:text-[#121D16] sm:px-6 sm:py-2.5 sm:text-sm"
            >
              Book A Lesson
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}