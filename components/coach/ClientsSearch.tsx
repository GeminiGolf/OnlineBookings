"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import AddClient from "@/components/coach/AddClient"

type Client = {
  id: number
  name: string
  preferred_name: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  email: string | null
  lessons_remaining: number
}
type Props = {
  clients: Client[]
}

export default function ClientsSearch({ clients }: Props) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showAddClient, setShowAddClient] = useState(false)
  const filteredClients = useMemo(() => {
    const term = search.toLowerCase().trim()
    const results =
      !term
        ? clients
        : clients.filter((client) => {
            return (
              client.name?.toLowerCase().includes(term) ||
              client.preferred_name?.toLowerCase().includes(term) ||
              client.first_name?.toLowerCase().includes(term) ||
              client.last_name?.toLowerCase().includes(term) ||
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
    <div className="relative mt-4">
      <div className="mb-6 flex w-full items-center">
        <h1 className="text-[20px] font-light uppercase tracking-[0.12em] text-black">
          My Clients
        </h1>

        <button
          onClick={() => setShowAddClient(true)}
          className="absolute right-0 top-0 rounded-lg bg-[#2F5A43] px-4 py-2 text-[13px] font-light tracking-[0.06em] text-white transition hover:bg-[#3C6A50]"
        >
          Create Client
        </button>
      </div>

      <input
        type="text"
        placeholder="Search name, phone or email..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="w-full rounded-xl border border-[#8D857A] bg-[#FEFDFC] px-4 py-3 text-[15px] font-light tracking-[0.02em] text-black placeholder:text-[#7B746A]"
      />

      <div className="space-y-3 md:hidden mt-4">
        {paginatedClients.map((client) => (
          <details
            key={client.id}
            className="overflow-hidden rounded-2xl border border-[#B9B2A8] bg-[#FEFDFC]"
          >
            <summary className="cursor-pointer list-none p-3 text-[14px] font-light tracking-[0.06em] text-black">
              {client.preferred_name
                ? `(${client.preferred_name}) ${client.last_name}`
                : `${client.first_name} ${client.last_name}`}
            </summary>

            <div className="border-t border-[#B9B2A8] p-3 text-[14px] font-light tracking-[0.05em] text-black">
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
                className="mt-4 inline-block rounded-lg bg-[#2F5A43] px-4 py-2 text-[13px] font-light tracking-[0.06em] text-white transition hover:bg-[#3C6A50]"
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

      <div className="mt-6 hidden overflow-x-auto rounded-3xl border border-[#B9B2A8] bg-[#FEFDFC] shadow-xl md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#B9B2A8] bg-[#F3F0EA]">
              <th className="dashboard-label p-4 text-left">Name</th>
              <th className="dashboard-label p-4 text-left">Phone</th>
              <th className="dashboard-label p-4 text-left">Email</th>
              <th className="dashboard-label p-4 text-left">Lessons Remaining</th>
            </tr>
          </thead>

          <tbody>
            {paginatedClients.map((client) => (
              <tr key={client.id} className="border-b border-[#B9B2A8] hover:bg-[#F7F3EE]">
                <td className="p-4 text-[14px] font-light tracking-[0.04em] text-black">
                  <Link
                    href={`/coach/clients/${client.id}`}
                    className="block w-full"
                  >
                    {client.preferred_name
                      ? `(${client.preferred_name}) ${client.last_name}`
                      : `${client.first_name} ${client.last_name}`}
                  </Link>
                </td>
                <td className="dashboard-value p-4">{client.phone || "-"}</td>
                <td className="dashboard-value p-4">{client.email || "-"}</td>
                <td className="dashboard-value p-4">{client.lessons_remaining}</td>
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
          className="rounded-lg border border-[#8D857A] bg-[#FEFDFC] px-4 py-2 text-[13px] font-light tracking-[0.06em] text-black transition hover:bg-[#F7F3EE] disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-[#8D857A] bg-[#FEFDFC] px-4 py-2 text-[13px] font-light tracking-[0.06em] text-black transition hover:bg-[#F7F3EE] disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <AddClient
        open={showAddClient}
        onClose={() => setShowAddClient(false)}
        onCreated={() => window.location.reload()}
      />
    </div>
  )
}