import CoachClientProfileClient from "@/components/clients/CoachClientProfileClient"
import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import CoachClientsSearch from "@/components/clients/CoachClientsSearch"
export default async function CoachClientsPage() {
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
  const { data: clients } = await supabase.from("clients").select("*").eq("primary_coach_id", coach.id).order("name")
  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold sm:text-4xl">My Clients</h1>
        <CoachClientsSearch clients={clients || []} />

      </div>
    </main>
  )
}
