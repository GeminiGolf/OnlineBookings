import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import CoachPreviousLessonsTable from "@/components/coach/CoachPreviousLessonsTable"
import { redirect } from "next/navigation"
export default async function CoachLessonsPage() {
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

  const { data: lessons } = await supabase
    .from("bookings")
    .select(`
      *,
      clients (
        id,
        first_name,
        last_name,
        preferred_name,
        phone
      )
    `)
    .eq("coach_id", coach.id)
    .eq("status", "completed")
    .order("lesson_date", { ascending: false })

  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/coach/dashboard"
          className="mb-6 inline-block rounded-lg border bg-white px-4 py-2"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-2xl bg-white p-5 shadow">
          <CoachPreviousLessonsTable
            lessons={lessons || []}
          />
        </div>
      </div>
    </main>
  )
}