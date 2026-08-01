import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import CoachPreviousLessonsTable from "@/components/coach/CoachPreviousLessonsTable"
import { redirect } from "next/navigation"
import DashboardContainer from "@/components/layout/DashboardContainer"
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
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#1F3327]">
      <DashboardContainer>
        <Link
          href="/coach/dashboard"
          className="mb-3 sm:mb-6 inline-flex items-center gap-2 rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[13px] font-light tracking-[0.04em] text-[#1F3327] shadow-sm transition hover:bg-[#F6FAF6]"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-3xl border border-[#3A5D49] bg-white p-5 shadow-md">
          <CoachPreviousLessonsTable
            lessons={lessons || []}
          />
        </div>
      </DashboardContainer>
    </main>
  )
}