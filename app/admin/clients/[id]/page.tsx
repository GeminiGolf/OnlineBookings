import CoachClientProfileClient from "@/components/clients/CoachClientProfileClient"
import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import PreviousLessonsTable from "@/components/clients/PreviousLessonsTable"
import CoachClientPackages from "@/components/clients/CoachClientPackages"
import CoachBookLessonCard from "@/components/clients/CoachBookLessonCard"
import AdminClientProfileClient from "@/components/admin/AdminClientProfileClient"
import AdminCoachSelector from "@/components/admin/AdminCoachSelector"
import AdminClientContactEditor from "@/components/admin/AdminClientContactEditor"
import ClientNotesCard from "@/components/clients/ClientNotesCard"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminClientProfilePage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", Number(id))
    .single()

  if (!client) {
    return (
      <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
        <h1 className="text-2xl font-bold">Client Not Found</h1>
      </main>
    )
  }

  const { data: primaryCoach } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", client.primary_coach_id)
    .single()

  const { data: coaches } = await supabase
    .from("coaches")
    .select("*")
    .order("name")

  const { data: upcomingLessons } = await supabase
    .from("bookings")
    .select("*")
    .eq("client_id", client.id)
    .eq("status", "booked")
    .order("lesson_date", { ascending: true })

  const { data: previousLessons } = await supabase
    .from("bookings")
    .select("*")
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
          href="/admin/profiles"
          className="mb-6 inline-block rounded-lg border bg-white px-4 py-2"
        >
          ← Back to Profiles
        </Link>

        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow">
          <h1 className="text-[22px] font-bold">
            {client.name}
          </h1>

          <div className="mt-2 grid gap-4 md:grid-cols-2">
            <AdminClientContactEditor
              clientId={client.id}
              initialPhone={client.phone}
              initialEmail={client.email}
            />

            <div>
              <p className="text-sm text-gray-500">
                Lessons Remaining
              </p>
              <p className="text-lg font-bold">
                {client.lessons_remaining}
              </p>
            </div>
          </div>

          <ClientNotesCard
            clientId={client.id}
            initialNotes={client.notes}
          />

          <div className="mt-8 flex flex-wrap gap-3">
            <CoachClientProfileClient
              clientId={client.id}
              lessonsRemaining={client.lessons_remaining}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <AdminClientProfileClient
            clientId={client.id}
            coaches={coaches || []}
            initialCoachId={primaryCoach?.id}
          />

          <div className="rounded-2xl bg-white p-4 shadow">
            <h2 className="mb-4 text-[19px] font-bold">
              Upcoming Lessons
            </h2>

            <div className="space-y-2">
              {(upcomingLessons || []).map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-lg border p-3 text-sm sm:text-[14px]"
                >
                  {new Date(
                    lesson.lesson_date
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                  {" - "}
                  {lesson.lesson_time.replace(":00", "")}
                  {lesson.booked_by === "coach" &&
                    " [Coach]"}
                  {lesson.booked_by === "admin" &&
                    " [Admin]"}
                </div>
              ))}

              {(!upcomingLessons ||
                upcomingLessons.length === 0) && (
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

            <PreviousLessonsTable
              lessons={previousLessons || []}
            />
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