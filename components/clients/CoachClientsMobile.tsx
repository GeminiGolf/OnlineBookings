"use client"

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

export default function CoachClientsMobile({ clients }: Props) {
  return (
    <div className="space-y-3 md:hidden">
      {clients.map((client) => (
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
    </div>
  )
}