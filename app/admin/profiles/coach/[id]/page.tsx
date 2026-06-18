import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import AdminCoachDefaultsCard from "@/components/admin/AdminCoachDefaultsCard"
import AdminCoachContactEditor from "@/components/admin/AdminCoachContactEditor"

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

  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", Number(id))
    .single()

  if (!coach) {
    return (
      <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
        <h1 className="text-2xl font-bold">
          Coach Not Found
        </h1>
      </main>
    )
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id")
    .eq("primary_coach_id", coach.id)

  const { data: completedBookings } = await supabase
    .from("bookings")
    .select("client_id")
    .eq("coach_id", coach.id)
    .eq("status", "completed")

  const activeClients = new Set(
    (completedBookings || []).map(
      (booking) => booking.client_id
    )
  )

  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/admin/profiles"
          className="mb-6 inline-block rounded-lg border bg-white px-4 py-2"
        >
          ← Back to Profiles
        </Link>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 text-[22px] font-bold">
              Coach Summary
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Name
                </p>

                <p className="font-medium">
                  {coach.preferred_name ||
                    coach.name}
                </p>
              </div>

              <AdminCoachContactEditor
                coachId={coach.id}
                initialPhone={coach.phone}
                initialEmail={coach.email}
              />

              <div>
                <p className="text-sm text-gray-500">
                  Total Clients
                </p>

                <p className="text-2xl font-bold">
                  {clients?.length || 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Active Clients
                </p>

                <p className="text-2xl font-bold">
                  {activeClients.size}
                </p>
              </div>
            </div>
          </div>

          <AdminCoachDefaultsCard
            coach={coach}
          />
        </div>

        <div className="mt-4 rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 text-[22px] font-bold">
            Specializations
          </h2>

          <p>
            {coach.specializations ||
              "No specializations added"}
          </p>
        </div>
      </div>
    </main>
  )
}