import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import ClientsSearch from "@/components/coach/ClientsSearch"
import AddClient from "@/components/coach/AddClient"
import { redirect } from "next/navigation"
import DashboardContainer from "@/components/layout/DashboardContainer"
export default async function CoachClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }
  const { data: coach } = await supabase.from("coaches").select("*").eq("profile_id", user.id).single()
  if (!coach) {
    redirect("/login")
  }
  const { data: clients } = await supabase.from("clients").select("*").eq("primary_coach_id", coach.id).order("name")
  return (
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-black">
      <DashboardContainer>
                <Link
                  href="/coach/dashboard"
                  className="mb-3 sm:mb-6 inline-block rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[13px] font-light tracking-[0.04em] text-[#1F3327] shadow-sm transition hover:bg-[#F6FAF6]"
                >
                  ← Back to Dashboard
                </Link>
        <ClientsSearch clients={clients || []} />

      </DashboardContainer>
    </main>
  )
}

