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
  const [page, setPage] = useState(1)
  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim()
    const results =
      !term
        ? clients
        : clients.filter((client) => {
            return (
              client.name?.toLowerCase().includes(term) ||
              client.phone?.toLowerCase().includes(term) ||
              client.email?.toLowerCase().includes(term)
            )
          })

    return results
  }, [clients, search])

  const itemsPerPage = 10
  const totalPages = Math.max(
    1,
    Math.ceil(filteredClients.length / itemsPerPage)
  )
  const paginatedClients = filteredClients.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )
  return (
    <div className="mt-4">
      <input
        type="text"
        placeholder="Search name, phone or email..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="w-full rounded-lg border bg-white p-3"
      />

      <div className="space-y-3 md:hidden mt-4">
        {paginatedClients.map((client) => (
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
            {paginatedClients.map((client) => (
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

            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No matching clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded border px-3 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded border px-3 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}