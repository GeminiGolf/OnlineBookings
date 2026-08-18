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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#3A5D49] bg-[#F2ECE3] p-6 text-black shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[18px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
            Promote to Coach
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-[#2F5A43] transition hover:opacity-70"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-[12px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
              Search Client
            </label>

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedClientId(null)
              }}
              placeholder="Search by name, email or phone..."
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[16px] font-light tracking-[0.04em] text-[#2F5A43] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <div className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-[#3A5D49] bg-[#FCFAF6] p-3">
            {loading ? (
              <div className="p-4 text-center text-[14px] font-light text-[#2F5A43]">
                Loading...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-4 text-center text-[14px] font-light text-[#2F5A43]">
                No matching clients found.
              </div>
            ) : (
              filteredClients.map((client) => (
                <label
                  key={client.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#3A5D49]/30 bg-white p-3 transition hover:bg-[#F2ECE3]/50"
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
                    className="mt-1 h-4 w-4 accent-[#21402E]"
                  />

                  <div className="flex-1">
                    <div className="text-[15px] font-medium text-[#2F5A43]">
                      {client.preferred_name
                        ? `(${client.preferred_name}) ${client.last_name}`
                        : `${client.first_name} ${client.last_name}`}
                    </div>

                    <div className="text-[13px] font-light text-[#6D7F72]">
                      {client.email || "No email"}
                    </div>

                    <div className="text-[13px] font-light text-[#6D7F72]">
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
            className="mt-2 w-full rounded-xl bg-[#21402E] px-6 py-3 text-sm font-light uppercase tracking-[0.18em] text-white transition hover:bg-[#2B533B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Promote
          </button>
        </div>
      </div>
    </div>
  )
}