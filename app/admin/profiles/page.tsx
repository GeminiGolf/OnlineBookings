import { createClient } from "@/lib/supabaseServer"
import { redirect } from "next/navigation"
import Link from "next/link"
import AdminProfilesSearch from "@/components/admin/AdminProfilesSearch"
import CreateProfileButton from "@/components/admin/AddDeleteProfiles/CreateProfileButton"
import DashboardContainer from "@/components/layout/DashboardContainer"
export default async function AdminProfilesPage() {
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
  const { data: coaches } = await supabase
    .from("coaches")
    .select("id, name, preferred_name")
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, preferred_name, first_name, last_name, phone, email, primary_coach_id")
  const coachLookup = new Map(
    (coaches || []).map((coach) => [coach.id, coach.name])
  )

  const profiles: {
    id: number
    type: "Coach" | "Client"
    name: string
    preferred_name?: string | null
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    email?: string | null
    coach_name?: string | null
  }[] = [
    ...(coaches || []).map((coach) => ({
      id: coach.id,
      type: "Coach" as const,
      name: coach.preferred_name || coach.name,
    })),
    ...(clients || []).map((client) => ({
      id: client.id,
      type: "Client" as const,
      name: client.name,
      preferred_name: client.preferred_name,
      first_name: client.first_name,
      last_name: client.last_name,
      phone: client.phone,
      email: client.email,
      coach_name: coachLookup.get(client.primary_coach_id) ?? "",
    })),
  ].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "Coach" ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })

  
  return (
    
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#2F5A43]">
      <DashboardContainer>
        <Link
          href="/admin"
          className="mb-3 inline-block rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[15px] font-light text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] hover:text-[#2F5A43] sm:mb-6"
          style={{ color: "#2F5A43" }}
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
            Profiles
          </h1>

          <CreateProfileButton />
        </div>

        <AdminProfilesSearch profiles={profiles} />
      </DashboardContainer>
    </main>
  )
}