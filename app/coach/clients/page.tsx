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

        <div className="mt-6 hidden overflow-x-auto rounded-2xl border bg-white shadow md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Lessons Remaining</th>
              </tr>
            </thead>

            <tbody>
              {(clients || []).map((client) => (
                <tr key={client.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    <Link
                      href={`/coach/clients/${client.id}`}
                      className="block w-full"
                    >
                      {client.name}
                    </Link>
                  </td>

                  <td className="p-4">{client.phone || "-"}</td>
                  <td className="p-4">{client.email || "-"}</td>
                  <td className="p-4">{client.lessons_remaining}</td>
                </tr>
              ))}

              {(!clients || clients.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No clients assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
