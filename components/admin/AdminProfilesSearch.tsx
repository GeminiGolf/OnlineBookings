"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type Profile = {
  id: number
  type: "Coach" | "Client"
  name: string
}

type Props = {
  profiles: Profile[]
}

export default function AdminProfilesSearch({
  profiles,
}: Props) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filteredProfiles = useMemo(() => {
    const term = search.toLowerCase().trim()

    return !term
      ? profiles
      : profiles.filter((profile) =>
          profile.name.toLowerCase().includes(term)
        )
  }, [profiles, search])

  const itemsPerPage = 15

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProfiles.length / itemsPerPage)
  )

  const paginatedProfiles = filteredProfiles.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  return (
    <div className="mt-4">
      <input
        type="text"
        placeholder="Search profiles..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="w-full rounded-lg border bg-white p-3"
      />

      {/* Mobile */}

      <div className="mt-4 space-y-3 md:hidden">
        {paginatedProfiles.map((profile) =>
          profile.type === "Client" ? (
            <Link
              key={`${profile.type}-${profile.id}`}
              href={`/admin/clients/${profile.id}`}
              className="block rounded-xl border bg-white p-4"
            >
              <div className="font-semibold">
                {profile.name}
              </div>

              <div className="mt-1 text-sm text-gray-600">
                {profile.type}
              </div>
            </Link>
          ) : (
            <div
              key={`${profile.type}-${profile.id}`}
              className="rounded-xl border bg-white p-4"
            >
              <div className="font-semibold">
                {profile.name}
              </div>

              <div className="mt-1 text-sm text-gray-600">
                {profile.type}
              </div>
            </div>
          )
        )}

        {filteredProfiles.length === 0 && (
          <div className="rounded-xl border bg-white p-4 text-gray-500">
            No matching profiles found.
          </div>
        )}
      </div>

      {/* Desktop */}

      <div className="mt-6 hidden overflow-x-auto rounded-2xl border bg-white shadow md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">
                Type
              </th>

              <th className="p-4 text-left">
                Name
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedProfiles.map((profile) => (
              <tr
                key={`${profile.type}-${profile.id}`}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4">
                  {profile.type}
                </td>

                <td className="p-4 font-medium">
                  {profile.type === "Client" ? (
                    <Link
                      href={`/admin/clients/${profile.id}`}
                      className="block w-full"
                    >
                      {profile.name}
                    </Link>
                  ) : (
                    profile.name
                  )}
                </td>
              </tr>
            ))}

            {filteredProfiles.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="p-8 text-center text-gray-500"
                >
                  No matching profiles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() =>
            setPage((p) => Math.max(1, p - 1))
          }
          disabled={page === 1}
          className="rounded border px-3 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() =>
            setPage((p) =>
              Math.min(totalPages, p + 1)
            )
          }
          disabled={page === totalPages}
          className="rounded border px-3 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}