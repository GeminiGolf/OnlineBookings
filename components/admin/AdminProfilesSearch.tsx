"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type Profile = {
  id: number
  type: "Coach" | "Client"
  name: string
  preferred_name?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
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
          profile.name.toLowerCase().includes(term) ||
          (profile.preferred_name ?? "")
            .toLowerCase()
            .includes(term) ||
          (profile.first_name ?? "")
            .toLowerCase()
            .includes(term) ||
          (profile.last_name ?? "")
            .toLowerCase()
            .includes(term) ||
          (profile.email ?? "")
            .toLowerCase()
            .includes(term) ||
          (profile.phone ?? "")
            .toLowerCase()
            .includes(term)
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
        placeholder="Search name, phone or email..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="w-full rounded-xl border border-[#3A5D49] bg-white px-4 py-3 text-[15px] font-light tracking-[0.02em] text-[#2F5A43] placeholder:text-[#6D7F72] shadow-sm focus:border-[#2F5A43] focus:outline-none"
      />

      <div className="mt-4 space-y-3 md:hidden">
        {paginatedProfiles.map((profile) => (
          <Link
            key={`${profile.type}-${profile.id}`}
            href={
              profile.type === "Coach"
                ? `/admin/profiles/coach/${profile.id}`
                : `/admin/clients/${profile.id}`
            }
            className="block overflow-hidden rounded-2xl border border-[#3A5D49] bg-white"
          >
            <div className="p-3">
              <div className="text-[14px] font-light tracking-[0.06em] text-[#2F5A43]">
                {profile.type === "Client"
                  ? profile.preferred_name
                    ? `(${profile.preferred_name}) ${profile.last_name}`
                    : `${profile.first_name} ${profile.last_name}`
                  : profile.name}
              </div>

              <div className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
                {profile.type}
              </div>
            </div>
          </Link>
        ))}

        {filteredProfiles.length === 0 && (
          <div className="rounded-xl border border-[#3A5D49] bg-white p-4 text-[15px] font-light text-[#2F5A43]">
            No matching profiles found.
          </div>
        )}
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-3xl border border-[#3A5D49] bg-white shadow-md md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#3A5D49] bg-white">
              <th className="dashboard-label p-4 text-left">
                Type
              </th>

              <th className="dashboard-label p-4 text-left">
                Name
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedProfiles.map((profile) => (
              <tr
                key={`${profile.type}-${profile.id}`}
                className="border-b border-[#3A5D49] transition hover:bg-[#F6FAF6]"
              >
                <td className="p-4 text-[15px] font-light text-[#2F5A43]">
                  {profile.type}
                </td>

                <td className="p-4 text-[15px] font-light text-[#2F5A43]">
                  <Link
                    href={
                      profile.type === "Coach"
                        ? `/admin/profiles/coach/${profile.id}`
                        : `/admin/clients/${profile.id}`
                    }
                    className="block w-full text-[#2F5A43]"
                  >
                    {profile.type === "Client"
                      ? profile.preferred_name
                        ? `(${profile.preferred_name}) ${profile.last_name}`
                        : `${profile.first_name} ${profile.last_name}`
                      : profile.name}
                  </Link>
                </td>
              </tr>
            ))}

            {filteredProfiles.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="p-8 text-center text-[15px] font-light text-[#2F5A43]"
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
          className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
        >
          Previous
        </button>

        <span className="dashboard-value">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() =>
            setPage((p) =>
              Math.min(totalPages, p + 1)
            )
          }
          disabled={page === totalPages}
          className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}