import CoachClientProfileClient from "@/components/clients/CoachClientProfileClient"
import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import PreviousLessonsTable from "@/components/clients/PreviousLessonsTable"
import CoachClientPackages from "@/components/clients/CoachClientPackages"
import CoachBookLessonCard from "@/components/clients/CoachBookLessonCard"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function CoachClientProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("profile_id", user.id)
    .single()

  if (!coach) {
    return null
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", Number(id))
    .eq("primary_coach_id", coach.id)
    .single()

  const { data: primaryCoach } = await supabase
    .from("coaches")
    .select("name, preferred_name")
    .eq("id", client?.primary_coach_id)
    .single()

  if (!client) {
    return (
      <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
        <h1 className="text-2xl font-bold">Client Not Found</h1>
      </main>
    )
  }

  const { data: upcomingLessons } = await supabase
    .from("bookings")
    .select("*")
    .eq("client_id", client.id)
    .eq("status", "booked")
    .order("lesson_date", { ascending: true })

  const { data: previousLessons } = await supabase
    .from("bookings")
    .select(`
      *,
      lesson_packages (
        id,
        transaction_name
      )
    `)
    .eq("client_id", client.id)
    .eq("status", "completed")
    .order("lesson_date", { ascending: false })

  const { data: packages } = await supabase
    .from("lesson_packages")
    .select("*")
    .eq("client_id", client.id)
    .order("purchase_date", { ascending: false })

  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/coach/clients"
          className="mb-6 inline-block rounded-lg border bg-white px-4 py-2"
        >
          ← Back to Clients
        </Link>

        <div className="rounded-2xl bg-white p-3 sm:p-4 shadow">
          <details>
            <summary className="relative flex cursor-pointer items-center justify-center list-none">
              <div className="flex items-center gap-4">
                <h1 className="text-[18px] font-bold sm:text-[18px]">
                  {client.name}
                </h1>

                <CoachClientProfileClient
                  clientId={client.id}
                  lessonsRemaining={client.lessons_remaining}
                />
              </div>

              <span className="absolute right-0 text-gray-500">▼</span>
            </summary>

            <div className="mt-4">
              <div className="mt-2 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm sm:text-base">
                    {client.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm sm:text-base">
                    {client.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Lessons Remaining
                  </p>
                  <p className="text-lg font-bold">
                    {client.lessons_remaining}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm sm:text-base">
                  {client.notes || "No notes"}
                </p>
              </div>
            </div>
          </details>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <CoachBookLessonCard
            clientId={client.id}
            coachId={coach.id}
          />

          <div className="rounded-2xl bg-white p-4 shadow">
            <h2 className="mb-4 text-[19px] font-bold">
              Upcoming Lessons
            </h2>

            <div className="space-y-2">
              {(upcomingLessons || []).map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-lg border p-3 text-sm sm:text-[15px]"
                >
                  {new Date(lesson.lesson_date).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    }
                  )}{" "}
                  - {lesson.lesson_time.replace(":00", "")}
                  {lesson.booked_by === "coach" && " [Coach]"}
                  {lesson.booked_by === "admin" && " [Admin]"}
                </div>
              ))}

              {(!upcomingLessons || upcomingLessons.length === 0) && (
                <p className="text-sm sm:text-base text-gray-500">
                  No upcoming lessons.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow">
            <h2 className="mb-4 text-[19px] font-bold">
              Previous Lessons
            </h2>

            <PreviousLessonsTable lessons={previousLessons || []} />
          </div>

          <div className="rounded-2xl bg-white p-4 shadow">
            <h2 className="mb-4 text-[19px] font-bold">
              Lessons Remaining
            </h2>

            <CoachClientPackages
              packages={packages || []}
            />
          </div>
        </div>
      </div>
    </main>
  )
}