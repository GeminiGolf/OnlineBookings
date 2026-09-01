import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import { redirect } from "next/navigation"
import AdminCoachDefaultsCard from "@/components/admin/AdminCoachDefaultsCard"
import AdminCoachContactEditor from "@/components/admin/AdminCoachContactEditor"
import DashboardContainer from "@/components/layout/DashboardContainer"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminCoachProfilePage({
  params,
}: Props) {
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

  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", Number(id))
    .single()

  if (!coach) {
    return (
      <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-black">
        <h1 className="dashboard-heading">
          Coach Not Found
        </h1>
      </main>
    )
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id")
    .eq("primary_coach_id", coach.id)

  // Calculate date cutoff for 3 months ago
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const cutoffDateStr = threeMonthsAgo.toISOString().split("T")[0]

  const { data: completedBookings } = await supabase
    .from("bookings")
    .select("client_id")
    .eq("coach_id", coach.id)
    .eq("status", "completed")
    .gte("lesson_date", cutoffDateStr)

  const activeClients = new Set(
    (completedBookings || []).map(
      (booking) => booking.client_id
    )
  )

  return (
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-black">
      <DashboardContainer>
        <Link
          href="/admin/profiles"
          className="mb-4 inline-block rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[15px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] hover:text-[#2F5A43]"
        >
          ← Back to Profiles
        </Link>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#3A5D49] bg-white p-5 shadow-md lg:px-6 lg:py-5">
            <h2 className="dashboard-heading mb-4">
              Coach Summary
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Name
                </p>

                <p className="dashboard-value">
                  {coach.preferred_name ||
                    coach.name}
                </p>
              </div>

              <AdminCoachContactEditor
                coachId={coach.id}
                profileId={coach.profile_id}
                initialPhone={coach.phone}
                initialEmail={coach.email}
              />

              <div>
                <p className="text-sm text-[#3A5D49]">
                  Total Clients
                </p>

                <p className="dashboard-value">
                  {clients?.length || 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#3A5D49]">
                  Active Clients (Past 3 Months)
                </p>

                <p className="dashboard-value">
                  {activeClients.size}
                </p>
              </div>
            </div>
          </div>

          <AdminCoachDefaultsCard
            coach={coach}
          />
        </div>

        <div className="mt-4 rounded-3xl border border-[#3A5D49] bg-white p-5 shadow-md lg:px-6 lg:py-5">
          <h2 className="dashboard-heading mb-4">
            Specializations
          </h2>

          <p className="dashboard-value">
            {coach.specializations ||
              "No specializations added"}
          </p>
        </div>
      </DashboardContainer>
    </main>
  )
}