"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

type Client = {
  id: number
  name: string
  phone: string | null
  email: string | null
  lessons_remaining: number
}

type Props = {
  clients: Client[]
}

export default function CoachClientsSearch({ clients }: Props) {
  const [search, setSearch] = useState("")

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim()

    if (!term) {
      return clients.slice(0, 5)
    }

    return clients
      .filter((client) => {
        return (
          client.name?.toLowerCase().includes(term) ||
          client.phone?.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term)
        )
      })
      .slice(0, 5)
  }, [clients, search])

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search name, phone or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full rounded-lg border bg-white p-3"
      />

      <div className="space-y-3 md:hidden">
        {filteredClients.map((client) => (
          <details
            key={client.id}
            className="overflow-hidden rounded-xl border bg-white"
          >
            <summary className="cursor-pointer list-none p-4 font-semibold">
              {client.name}
            </summary>

            <div className="border-t p-4">
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {client.phone || "-"}
              </p>

              <p className="mt-2">
                <span className="font-medium">Email:</span>{" "}
                {client.email || "-"}
              </p>

              <p className="mt-2">
                <span className="font-medium">Lessons Remaining:</span>{" "}
                {client.lessons_remaining}
              </p>

              <Link
                href={`/coach/clients/${client.id}`}
                className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                View Client
              </Link>
            </div>
          </details>
        ))}

        {filteredClients.length === 0 && (
          <div className="rounded-xl border bg-white p-4 text-gray-500">
            No matching clients found.
          </div>
        )}
      </div>
    </div>
  )
}