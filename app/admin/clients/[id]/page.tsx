import ClientIDTransactionForm from "@/components/transactions/ClientIDTransactionForm"
import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import { redirect } from "next/navigation"
import PreviousLessonsTable from "@/components/clients/PreviousLessonsTable"
import CoachClientPackages from "@/components/clients/CoachClientPackages"
import AdminClientProfileClient from "@/components/admin/AdminClientProfileClient"
import AdminClientNameEditor from "@/components/admin/AdminClientNameEditor"
import AdminClientContactEditor from "@/components/admin/AdminClientContactEditor"
import ClientNotesCard from "@/components/clients/ClientNotesCard"
import AdminLessonsRemainingEditor from "@/components/admin/AdminLessonsRemainingEditor"
import AdminCoachEditor from "@/components/admin/AdminCoachEditor"
import DashboardContainer from "@/components/layout/DashboardContainer"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminClientProfilePage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    redirect("/login")
  }

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
          href="/admin/profiles"
          className="mb-4 inline-block rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[15px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] hover:text-[#2F5A43]"
        >
          ← Back to Profiles
        </Link>

        <div className="mt-0">
          <div className="rounded-3xl border border-[#3A5D49] bg-white shadow-md">
            <details open>
              <summary className="relative flex cursor-pointer items-center list-none px-6 py-4">
                <h1 className="dashboard-heading min-w-0 flex-1 break-words pr-24">
                  {client.preferred_name
                    ? `${client.preferred_name} ${client.last_name}`
                    : `${client.first_name} ${client.last_name}`}
                </h1>

                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  <ClientIDTransactionForm
                    clientId={client.id}
                    lessonsRemaining={client.lessons_remaining}
                    buttonLabel="$$$"
                    buttonClassName="rounded-2xl bg-[#2F5A43] px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634]"
                  />
                </div>

                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[18px] text-[#2F5A43]">
                  ▼
                </span>
              </summary>

              <div className="px-6 pb-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <AdminClientNameEditor
                    clientId={client.id}
                    initialPreferredName={client.preferred_name}
                    initialFirstName={client.first_name}
                    initialLastName={client.last_name}
                  />

                  <AdminClientContactEditor
                    clientId={client.id}
                    profileId={client.profile_id}
                    initialPhone={client.phone}
                    initialEmail={client.email}
                  />

                  <AdminLessonsRemainingEditor
                    clientId={client.id}
                    initialLessonsRemaining={client.lessons_remaining}
                  />

                  <AdminCoachEditor
                    clientId={client.id}
                    coaches={coaches || []}
                    initialCoachId={primaryCoach?.id ?? null}
                  />
                </div>

                <div className="mt-4">
                  <ClientNotesCard
                    clientId={client.id}
                    initialNotes={client.notes}
                  />
                </div>
              </div>
            </details>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <AdminClientProfileClient
            clientId={client.id}
            coaches={coaches || []}
            initialCoachId={primaryCoach?.id}
          />

          <div className="rounded-3xl border border-[#3A5D49] bg-white p-3 shadow-md lg:px-6 lg:py-5">
            <h2 className="dashboard-heading mb-4">
              Upcoming Lessons
            </h2>

            <div className="space-y-2">
              {(upcomingLessons || []).map((lesson) => (
                <div
                  key={lesson.id}
                  className="dashboard-value rounded-xl border border-[#3A5D49] bg-white p-3 transition hover:bg-[#F6FAF6]"
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
          <div className="rounded-3xl border border-[#3A5D49] bg-white p-3 shadow-md lg:px-6 lg:py-5">
            <h2 className="dashboard-heading mb-4">
              Previous Lessons
            </h2>

            <PreviousLessonsTable
              lessons={previousLessons || []}
            />
          </div>

          <div className="rounded-3xl border border-[#3A5D49] bg-white p-3 shadow-md lg:px-6 lg:py-5">
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