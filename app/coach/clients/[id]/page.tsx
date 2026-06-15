import CoachClientProfileClient from "@/components/clients/CoachClientProfileClient"
import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import PreviousLessonsTable from "@/components/clients/PreviousLessonsTable"

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
  const { data: coach } = await supabase.from("coaches").select("*").eq("profile_id", user.id).single()
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
        <Link href="/coach/clients" className="mb-6 inline-block rounded-lg border bg-white px-4 py-2">
          ← Back to Clients
        </Link>

        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow">
          <h1 className="text-[22px] font-bold sm:text-[22px]">{client.name}</h1>
          <div className="mt-2 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm sm:text-base">{client.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm sm:text-base">{client.email || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lessons Remaining</p>
              <p className="text-lg font-bold">
                {client.lessons_remaining}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-sm sm:text-base">{client.notes || "No notes"}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-lg bg-green-600 px-4 py-2 text-white">
              Book Lesson
            </button>

            <CoachClientProfileClient
              clientId={client.id}
              lessonsRemaining={client.lessons_remaining}
            />
          </div>
        </div>

        <div className="mt-2 rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-4 text-[19px] font-bold">Upcoming Lessons</h2>
          <div className="space-y-2">
            {(upcomingLessons || []).map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-lg border p-3 text-sm sm:text-[15px]"
              >
                {lesson.lesson_date} - {lesson.lesson_time}
              </div>
            ))}
            {(!upcomingLessons || upcomingLessons.length === 0) && (
              <p className="text-sm sm:text-base text-gray-500">No upcoming lessons.</p>
            )}
          </div>
        </div>

        <div className="mt-2 rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-4 text-[19px] font-bold">Previous Lessons</h2>
          <PreviousLessonsTable lessons={previousLessons || []} />
        </div>

        <div className="mt-2 rounded-2xl bg-white p-8 shadow">
          <h2 className="mb-4 text-[19px] font-bold">Lessons Remaining</h2>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">Balance</th>
                  <th className="p-3 text-left">Purchase</th>
                  <th className="p-3 text-left">Purchased On</th>
                  <th className="p-3 text-left">Expiry</th>
                  <th className="p-3 text-left">Method</th>
                </tr>
              </thead>

              <tbody>
                {(packages || [])
                  .filter((pkg) => (pkg.lessons_added || 0) - (pkg.lessons_used || 0) > 0)
                  .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime())
                  .map((pkg) => (
                    <tr key={pkg.id} className="border-b">
                      <td className="p-3">{(pkg.lessons_added || 0) - (pkg.lessons_used || 0)}</td>
                      <td className="p-3">{pkg.transaction_name}</td>
                      <td className="p-3">{pkg.purchase_date}</td>
                      <td className="p-3">{pkg.expiration_date}</td>
                      <td className="p-3">{pkg.payment_method}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {(!packages ||
              packages.filter((pkg) => (pkg.lessons_added || 0) - (pkg.lessons_used || 0) > 0).length === 0) && (
              <div className="p-4 text-sm sm:text-base text-gray-500">
                No active lessons remaining.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
