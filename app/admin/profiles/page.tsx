import { createClient } from "@/lib/supabaseServer"
import { redirect } from "next/navigation"
import AdminProfilesSearch from "@/components/admin/AdminProfilesSearch"

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
    .select("id, name, preferred_name, first_name, last_name, phone, email")
  const profiles: {
    id: number
    type: "Coach" | "Client"
    name: string
    preferred_name?: string | null
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    email?: string | null
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
    })),
  ].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "Coach" ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Profiles
        </h1>
        <AdminProfilesSearch profiles={profiles} />
      </div>
    </main>
  )
}