"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Client = {
  id: number
  profile_id: string
  preferred_name: string | null
  first_name: string | null
  last_name: string | null
  name: string
  email: string | null
  phone: string | null
}

type Props = {
  open: boolean
  onClose: () => void
}

export default function AddCoach({
  open,
  onClose,
}: Props) {
  const [search, setSearch] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    loadClients()
  }, [open])

  async function loadClients() {
    setLoading(true)

    const { data } = await supabase
      .from("clients")
      .select(`
        id,
        profile_id,
        preferred_name,
        first_name,
        last_name,
        name,
        email,
        phone
      `)
      .order("name")

    setClients(data ?? [])
    setLoading(false)
  }

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim()

    if (!term) return clients

    return clients.filter((client) =>
      client.name.toLowerCase().includes(term) ||
      (client.preferred_name ?? "")
        .toLowerCase()
        .includes(term) ||
      (client.first_name ?? "")
        .toLowerCase()
        .includes(term) ||
      (client.last_name ?? "")
        .toLowerCase()
        .includes(term) ||
      (client.email ?? "")
        .toLowerCase()
        .includes(term) ||
      (client.phone ?? "")
        .toLowerCase()
        .includes(term)
    )
  }, [clients, search])

  async function promoteClient() {
    if (!selectedClientId) return

    const response = await fetch(
      "/api/admin/coach/create-coach",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: selectedClientId,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      alert(result.error)
      return
    }

    alert("Client promoted to coach.")
    window.location.reload()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 text-black shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Promote to Coach
          </h2>

          <button
            onClick={onClose}
            className="rounded border px-3 py-1 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block font-medium">
              Search Client
            </label>

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedClientId(null)
              }}
              placeholder="Search by name, email or phone..."
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div className="max-h-96 overflow-y-auto rounded-lg border">
            {loading ? (
              <div className="p-6 text-center">
                Loading...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-6 text-center">
                No matching clients found.
              </div>
            ) : (
              filteredClients.map((client) => (
                <label
                  key={client.id}
                  className="flex cursor-pointer items-start gap-4 border-b p-4 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedClientId === client.id
                    }
                    onChange={() =>
                      setSelectedClientId(
                        selectedClientId === client.id
                          ? null
                          : client.id
                      )
                    }
                    className="mt-1 h-5 w-5"
                  />

                  <div className="flex-1">
                    <div className="font-semibold">
                      {client.preferred_name
                        ? `(${client.preferred_name}) ${client.last_name}`
                        : `${client.first_name} ${client.last_name}`}
                    </div>

                    <div className="text-sm text-gray-600">
                      {client.email || "No email"}
                    </div>

                    <div className="text-sm text-gray-600">
                      {client.phone || "No phone"}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          <button
            disabled={!selectedClientId}
            onClick={promoteClient}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Promote
          </button>
        </div>
      </div>
    </div>
  )
}