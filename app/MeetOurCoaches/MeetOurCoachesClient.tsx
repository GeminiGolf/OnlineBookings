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
  mobileImagePosition?: string
  mobileImageHeight?: string
}

const coachesData: Coach[] = [
  {
    id: 1,
    label: "COACH 01",
    name: "Francois Van Zyl",
    role: "HEAD COACH",
    philosophy:
      "I believe coaching should be clear, simple and individual to each golfer. \nMy approach is to pinpoint the problem, simplify the solution, and give the player the confidence to own it.",
    specialisations: [
      "Swing Mechanics & Technique",
      "Golf Technology & Swing Analysis",
      "Course-Management & Strategy",
      "Putting & Short Game",
    ],
    photoUrl: "/FVZ/F_2.png",
    imagePosition: "object-[center_25%]",
    mobileImagePosition: "object-top",
    mobileImageHeight: "h-80",
  },
  {
    id: 2,
    label: "COACH 02",
    name: "Siti Shaari",
    role: "PERFORMANCE COACH",
    philosophy:
      "I believe golf is about more than just the swing.\nMy focus is on helping students develop their swing and mental game so they achieve their goals whilst remembering to enjoy the process.",
    specialisations: [
      "Swing Fundamentals & Technique",
      "Course Management & Smart Playing",
      "Mental Game & Confidence",
      "Competitive/Performance Golf"
    ],
    photoUrl: "/OurCoaches/Siti_Action.jpeg",
    imagePosition: "object-center",
    mobileImagePosition: "object-[center_5%]",
    mobileImageHeight: "h-80",
  },
]

export default function MeetOurCoachesClient() {
  return (
    <>
      {/* ========================================================================= */}
      {/*                       1. DESKTOP VERSION (md and up)                     */}
      {/* ========================================================================= */}
      <div className="hidden min-h-screen bg-[#F4F1EA] text-[#2F5A43] md:block">
        {/* Desktop Hero Section */}
        <section className="relative flex min-h-[340px] overflow-hidden border-b border-[#E2DDD3] px-14 pb-10 pt-28 text-[#F2EEE8]">
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

          <div className="relative z-10 mx-auto flex w-full max-w-6xl items-end justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-light uppercase tracking-[0.18em] text-[#F2EEE8]">
                Meet Our Coaches
              </h1>
              <p className="mt-1 text-sm font-light tracking-[0.04em] text-[#E0D8CC]">
                The people behind your golf development.
              </p>
            </div>
          </div>
        </section>

        {/* Desktop Header Divider */}
        <div className="mx-auto my-10 flex max-w-6xl flex-col items-center justify-center px-6">
          <div className="flex w-full items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-[#B89868]/40" />
            <img
              src="/images/logo-warm.png"
              alt="Logo"
              className="h-8 w-auto object-contain"
            />
            <div className="h-[1px] flex-1 bg-[#B89868]/40" />
          </div>
          <h2 className="mt-2 text-sm font-light uppercase tracking-[0.25em] text-[#2F5A43]">
            Our Coaches
          </h2>
        </div>

        {/* Desktop Coaches Rows */}
        <section className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-16">
          {coachesData.map((coach, index) => {
            const isEven = index % 2 === 0

            return (
              <div
                key={coach.id}
                className="grid min-h-[440px] w-full grid-cols-12 items-stretch overflow-hidden rounded-2xl border border-[#E2DDD3] bg-[#FAF8F5] shadow-md lg:min-h-[480px]"
              >
                {/* Desktop Info Side */}
                <div
                  className={`col-span-7 flex h-full flex-col justify-between p-8 lg:col-span-8 lg:p-10 ${
                    isEven ? "order-1" : "order-2"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-light uppercase tracking-[0.16em] text-[#B89868]">
                        {coach.label}
                      </span>
                      <div className="h-[1px] w-12 bg-[#B89868]/50" />
                    </div>

                    <h2 className="mt-2 truncate text-3xl font-light uppercase tracking-[0.12em] text-[#2F5A43]">
                      {coach.name}
                    </h2>
                    <p className="mt-0.5 text-xs font-light uppercase tracking-[0.14em] text-[#B89868]">
                      {coach.role}
                    </p>

                    <div className="mt-6">
                      <h3 className="text-xs font-light uppercase tracking-[0.16em] text-[#2F5A43]/70">
                        Coaching Philosophy
                      </h3>
                      <p className="mt-1 whitespace-pre-line text-sm font-light leading-relaxed tracking-[0.02em] text-[#2F5A43] lg:text-base">
                        {coach.philosophy}
                      </p>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-xs font-light uppercase tracking-[0.16em] text-[#2F5A43]/70">
                        Specialisations
                      </h3>
                      <ul className="mt-1.5 space-y-1">
                        {coach.specialisations.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-sm font-light tracking-[0.02em] text-[#2F5A43]"
                          >
                            <span className="text-[10px] text-[#B89868]">◆</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Desktop Link */}
                  <div className="mt-8 shrink-0">
                    <Link
                      href={`/CoachAvailability?coach=${encodeURIComponent(
                        coach.name.split(" ")[0]
                      )}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#B89868]/70 bg-[#2F5A43] px-6 py-3 text-xs font-semibold uppercase tracking-[0.17em] text-[#F2EEE8] shadow-sm transition-all hover:border-[#B89868] hover:bg-[#244634]"
                    >
                      View Availability →
                    </Link>
                  </div>
                </div>

                {/* Desktop Photo Side */}
                <div
                  className={`relative col-span-5 h-full w-full overflow-hidden bg-[#E7E2D8] lg:col-span-4 ${
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
                      <span className="text-xs font-light uppercase tracking-[0.2em] text-[#2F5A43]/60">
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
        <section className="relative overflow-hidden border-t border-[#E2DDD3] px-10 py-20 text-center text-[#F2EEE8]">
          <img
            src="/OurCoaches/approach.jpg"
            alt="Footer Background"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(to left, rgba(18, 29, 22, 0.95) 0%, rgba(18, 29, 22, 0.8) 30%, rgba(18, 29, 22, 0.5) 60%, rgba(18, 29, 22, 0.2) 80%, transparent 100%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mb-5 flex items-center justify-center gap-4">
              <div className="h-[1px] w-24 bg-[#B89868]/60" />
              <img
                src="/images/logo-warm.png"
                alt="Logo"
                className="h-7 w-auto object-contain"
              />
              <div className="h-[1px] w-24 bg-[#B89868]/60" />
            </div>

            <h2 className="text-xl font-light uppercase tracking-[0.18em] lg:text-xl">
              One Academy.<br></br>One Standard.<br></br>Every Golfer.
            </h2>

            <div className="mt-6">
              <Link
                href="/signup"
                className="inline-block border border-[#B89868] bg-[#121D16]/40 px-6 py-2.5 text-sm font-light uppercase tracking-[0.18em] text-[#F2EEE8] backdrop-blur-sm transition hover:bg-[#B89868] hover:text-[#121D16]"
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
      <div className="block min-h-screen bg-[#F4F1EA] text-[#2F5A43] md:hidden">
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
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(10,18,13,0.85) 100%)",
            }}
          />

          <div className="relative z-10 w-full">
            <h1 className="text-2xl font-light uppercase tracking-[0.18em] text-[#F2EEE8]">
              Meet Our Coaches
            </h1>
            <p className="mt-1 text-xs font-light tracking-[0.04em] text-[#E0D8CC]">
              The people behind your golf development.
            </p>
          </div>
        </section>

        {/* Mobile Section Title with Decorative Lines */}
        <div className="my-8 flex flex-col items-center justify-center px-6">
          <div className="flex w-full items-center justify-center gap-3">
            <div className="h-[1px] flex-1 bg-[#B89868]/40" />
            <img
              src="/images/logo-warm.png"
              alt="Logo"
              className="h-6 w-auto object-contain"
            />
            <div className="h-[1px] flex-1 bg-[#B89868]/40" />
          </div>
          <h2 className="mt-1.5 text-xs font-light uppercase tracking-[0.25em] text-[#2F5A43]">
            Our Coaches
          </h2>
        </div>

        {/* Mobile Coach Cards Stack */}
        <div className="space-y-8 px-4 pb-12">
          {coachesData.map((coach) => (
            <div
              key={coach.id}
              className="overflow-hidden rounded-2xl border border-[#E2DDD3] bg-[#FAF8F5] shadow-md"
            >
              {/* Mobile Image Container */}
              <div
                className={`relative w-full overflow-hidden bg-[#E7E2D8] ${
                  coach.mobileImageHeight || "h-80"
                }`}
              >
                {coach.photoUrl ? (
                  <img
                    src={coach.photoUrl}
                    alt={coach.name}
                    className={`h-full w-full object-cover ${
                      coach.mobileImagePosition || "object-top"
                    }`}
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
                  <p className="mt-1 whitespace-pre-line text-sm font-light leading-relaxed text-[#2F5A43]">
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

                {/* Mobile Link */}
                <div className="mt-6">
                  <Link
                    href={`/CoachAvailability?coach=${encodeURIComponent(
                      coach.name.split(" ")[0]
                    )}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#B89868]/70 bg-[#2F5A43] px-5 py-3 text-xs font-semibold uppercase tracking-[0.17em] text-[#F2EEE8] shadow-sm active:bg-[#244634]"
                  >
                    View Availability →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Footer CTA */}
        <section className="relative overflow-hidden px-6 py-14 text-center text-[#F2EEE8]">
          <img
            src="/OurCoaches/approach.jpg"
            alt="Footer Background"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(to left, rgba(18, 29, 22, 0.95) 0%, rgba(18, 29, 22, 0.8) 40%, rgba(18, 29, 22, 0.5) 70%, transparent 100%)",
            }}
          />

          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-center gap-3 px-4">
              <div className="h-[1px] max-w-[60px] flex-1 bg-[#B89868]/60" />
              <img
                src="/images/logo-warm.png"
                alt="Logo"
                className="h-5 w-auto object-contain"
              />
              <div className="h-[1px] max-w-[60px] flex-1 bg-[#B89868]/60" />
            </div>

            <h2 className="text-sm font-light uppercase tracking-[0.18em]">
              One Academy.<br></br>One Standard.<br></br>Every Golfer.
            </h2>

            <div className="mt-6">
              <Link
                href="/signup"
                className="inline-block border border-[#B89868] bg-[#121D16]/40 px-6 py-2.5 text-xs font-light uppercase tracking-[0.18em] text-[#F2EEE8] backdrop-blur-sm"
              >
                Book A Lesson
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}