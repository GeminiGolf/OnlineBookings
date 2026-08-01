import ClientIDTransactionForm from "@/components/transactions/ClientIDTransactionForm"
import Link from "next/link"
import DashboardContainer from "@/components/layout/DashboardContainer"
import { createClient } from "@/lib/supabaseServer"
import { redirect } from "next/navigation"
import PreviousLessonsTable from "@/components/clients/PreviousLessonsTable"
import CoachClientPackages from "@/components/clients/CoachClientPackages"
import CoachBookLessonCard from "@/components/clients/CoachBookLessonCard"
import ClientNotesCard from "@/components/clients/ClientNotesCard"
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
    redirect("/login")
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("profile_id", user.id)
    .single()

  if (!coach) {
    redirect("/login")
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
        <h1 className="text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
          Client Not Found
        </h1>
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
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-black">
      <DashboardContainer>
        <Link
          href="/coach/clients"
          className="mb-3 sm:mb-6 inline-block rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[13px] font-medium tracking-[0.04em] text-[#1F3327] shadow-sm transition hover:bg-[#F6FAF6]"
        >
          ← Back to Clients
        </Link>

        <div className="rounded-3xl border border-[#3A5D49] bg-white p-4 sm:p-5 shadow-md">
          <details>
            <summary className="relative flex cursor-pointer items-center justify-center list-none">
              <div className="flex items-center gap-4">
                <h1 className="text-[20px] font-light normal-case tracking-[0.02em] text-[#2F5A43]">
                  {client.preferred_name
                    ? `(${client.preferred_name}) ${client.first_name} ${client.last_name}`
                    : `${client.first_name} ${client.last_name}`}
                </h1>

                <ClientIDTransactionForm
                  clientId={client.id}
                  lessonsRemaining={client.lessons_remaining}
                />
              </div>

              <span className="absolute right-0 text-[#8D857A]">▼</span>
            </summary>

            <div className="mt-4">
              <div className="mt-2 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="dashboard-label">Phone</p>
                  <p className="dashboard-value">
                    {client.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="dashboard-label">Email</p>
                  <p className="dashboard-value">
                    {client.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="dashboard-label">
                    Lessons Remaining
                  </p>
                  <p className="text-[18px] font-light text-[#1F3327]">
                    {client.lessons_remaining}
                  </p>
                </div>
              </div>

              <ClientNotesCard
                clientId={client.id}
                initialNotes={client.notes}
              />
            </div>
          </details>
        </div>

        <div className="mt-4 grid gap-2 lg:gap-4 lg:grid-cols-2">
          <CoachBookLessonCard
            clientId={client.id}
            coachId={coach.id}
          />

          <div className="rounded-3xl border border-[#3A5D49] bg-white p-5 shadow-md">
            <h2 className="dashboard-heading mb-4">
              Upcoming Lessons
            </h2>

            <div className="space-y-3">
              {(upcomingLessons || []).map((lesson) => (
                <div
                  key={lesson.id}
                  className="dashboard-value rounded-xl border border-[#3A5D49] bg-white p-3 transition hover:bg-[#F6FAF6]"
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
                <p className="dashboard-value text-[#6D7F72]">
                  No upcoming lessons.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 grid gap-2 lg:gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#3A5D49] bg-white p-5 shadow-md">
            <h2 className="dashboard-heading mb-4">
              Previous Lessons
            </h2>

            <PreviousLessonsTable lessons={previousLessons || []} />
          </div>

          <div className="rounded-3xl border border-[#3A5D49] bg-white p-5 shadow-md">
            <h2 className="dashboard-heading mb-4">
              Lessons Remaining
            </h2>

            <CoachClientPackages
              packages={packages || []}
            />
          </div>
        </div>
      </DashboardContainer>
    </main>
  )
}