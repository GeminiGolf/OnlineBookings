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
      "Mental Game",
    ],
    photoUrl: "/OurCoaches/Siti_Action.jpg",
  },
]

export default function MeetOurCoachesPage() {
  return (
    <main className="min-h-screen bg-[#F2EEE8] text-[#2F5A43]">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-between border-b border-[#3A5D49] bg-[#2F5A43] px-6 py-10 text-[#F2EEE8] sm:px-10 lg:px-14 lg:py-16">
        <div className="max-w-2xl">
          <h1 className="text-xl font-light uppercase tracking-[0.18em] sm:text-2xl lg:text-3xl">
            Meet <br />
            Our Coaches
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
      </section>

      {/* Coaches Section - 60/40 Split Layout */}
      <section className="w-full">
        {coachesData.map((coach, index) => {
          const isEven = index % 2 === 0

          return (
            <div
              key={coach.id}
              className="grid grid-cols-5 border-b border-[#3A5D49]"
            >
              {/* Info Block (60% width) */}
              <div
                className={`col-span-3 flex flex-col justify-between bg-[#F2EEE8] p-4 sm:p-6 lg:p-8 ${
                  isEven ? "order-1" : "order-2"
                }`}
              >
                <div>
                  {/* Coach Number Label */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[10px] font-light uppercase tracking-[0.16em] text-[#2F5A43]">
                      {coach.label}
                    </span>
                    <div className="h-[1px] w-8 bg-[#3A5D49]/40 sm:w-12" />
                  </div>

                  {/* Name & Role */}
                  <h2 className="mt-2 text-lg font-light uppercase tracking-[0.12em] text-[#2F5A43] sm:text-xl lg:text-2xl">
                    {coach.name}
                  </h2>
                  <p className="mt-0.5 text-[10px] font-light uppercase tracking-[0.14em] text-[#B89868] sm:text-xs">
                    {coach.role}
                  </p>

                  {/* Philosophy */}
                  <div className="mt-4 sm:mt-6">
                    <h3 className="text-[10px] font-light uppercase tracking-[0.16em] text-[#2F5A43]/70">
                      Coaching Philosophy
                    </h3>
                    <p className="mt-1 text-xs font-light leading-relaxed tracking-[0.02em] text-[#2F5A43] sm:text-sm">
                      {coach.philosophy}
                    </p>
                  </div>

                  {/* Specialisations */}
                  <div className="mt-4 sm:mt-6">
                    <h3 className="text-[10px] font-light uppercase tracking-[0.16em] text-[#2F5A43]/70">
                      Specialisations
                    </h3>
                    <ul className="mt-1.5 space-y-1">
                      {coach.specialisations.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-1.5 text-xs font-light tracking-[0.02em] text-[#2F5A43]"
                        >
                          <span className="text-[8px] font-light">◆</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* View Availability Action */}
                <div className="mt-6 sm:mt-8">
                  <Link
                    href="/CoachAvailability"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#3A5D49] bg-white px-3 py-1.5 text-[10px] font-light uppercase tracking-[0.14em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] sm:px-4 sm:py-2 sm:text-xs"
                  >
                    View Availability →
                  </Link>
                </div>
              </div>

              {/* Photo Block (40% width) */}
              <div
                className={`col-span-2 relative min-h-[240px] w-full bg-[#2F5A43] sm:min-h-[340px] lg:min-h-[420px] ${
                  isEven ? "order-2" : "order-1"
                }`}
              >
                {coach.photoUrl ? (
                  <img
                    src={coach.photoUrl}
                    alt={coach.name}
                    className="h-full w-full object-cover"
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

      {/* Call to Action Footer */}
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