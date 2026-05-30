import Link from "next/link"

export default function CoachDashboardPage() {

  return (

    <main className="min-h-screen bg-gray-100 p-10">

      <div className="mx-auto max-w-5xl">

        <h1 className="text-6xl font-black text-black">
          Coach Dashboard
        </h1>

        <p className="mt-4 text-2xl text-gray-600">
          Manage your coaching business.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {/* MANAGE SCHEDULE */}

          <Link
            href="/coach/mapschedule"
            className="rounded-3xl bg-white p-8 shadow-lg transition hover:scale-[1.02]"
          >

            <h2 className="text-3xl font-bold text-black">
              Map Schedule
            </h2>

            <p className="mt-3 text-lg text-gray-600">
              Edit your weekly coaching availability.
            </p>

          </Link>

          {/* PREVIOUS LESSONS */}

          <Link
            href="/coach/lessons"
            className="rounded-3xl bg-white p-8 shadow-lg transition hover:scale-[1.02]"
          >

            <h2 className="text-3xl font-bold text-black">
              Previous Lessons
            </h2>

            <p className="mt-3 text-lg text-gray-600">
              View lesson history and past clients.
            </p>

          </Link>

        </div>

      </div>

    </main>
  )
}