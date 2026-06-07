"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

type Client = {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  gov_id: string | null
  lessons_remaining: number | null
  profile_id: string | null
}

export default function AdminClientsPage() {

  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    setLoading(true)

    const { data, error } = await supabase.from("clients").select("*").order("name")

    if (!error && data) {
      setClients(data)
    }

    setLoading(false)
  }

  const filteredClients = clients.filter((client) => {
    const searchTerm = search.toLowerCase()

    return (
      client.name?.toLowerCase().includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm) ||
      client.phone?.toLowerCase().includes(searchTerm) ||
      client.gov_id?.toLowerCase().includes(searchTerm) ||
      client.profile_id?.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-black">Clients</h1>
      </div>

      <input
        type="text"
        placeholder="Search name, phone, email, gov id, profile id..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full rounded-xl border bg-white p-4 text-black placeholder:text-gray-500"
      />

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full text-black">
          <thead className="border-b bg-gray-100">
            <tr>
              <th className="p-4 text-left text-black">Name</th>

              <th className="p-4 text-left text-black">Gov ID</th>

              <th className="p-4 text-left text-black">Phone</th>

              <th className="p-4 text-left text-black">Email</th>

              <th className="p-4 text-left text-black">Lessons</th>

              <th className="p-4 text-left text-black">Open</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-black">
                  Loading...
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-black">
                  No clients found
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="border-b">
                  <td className="p-4 text-black">{client.name}</td>

                  <td className="p-4 text-black">{client.gov_id || "-"}</td>

                  <td className="p-4 text-black">{client.phone || "-"}</td>

                  <td className="p-4 text-black">{client.email || "-"}</td>

                  <td className="p-4 text-black">{client.lessons_remaining ?? 0}</td>

                  <td className="p-4">
                    <Link href={`/admin/clients/${client.id}`} className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
