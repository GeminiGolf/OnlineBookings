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
                  className="mb-2 inline-block rounded-lg border border-[#8D857A] bg-[#FEFDFC] px-4 py-2 text-[13px] font-light tracking-[0.06em] text-black transition hover:bg-[#F7F3EE]"
                >
                  ← Back to Dashboard
                </Link>
        <ClientsSearch clients={clients || []} />

      </DashboardContainer>
    </main>
  )
}

