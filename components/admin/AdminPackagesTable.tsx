"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useMemo, useState } from "react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import { ChevronDown, ChevronUp } from "lucide-react"
import "react-day-picker/dist/style.css"

export type CoachPackageRow = {
  id: number

  transaction_name: string

  lessons_added: number
  lessons_used: number

  purchase_date: string | null
  expiration_date: string | null

  price: number | null
  payment_method: string | null
  notes: string | null
  receipt_url: string | null

  preferred_name: string
  first_name: string
  last_name: string
  phone: string
  email: string

  client_id: number
  coach_id: number

  client_name: string
  coach_name: string
}

type CoachFilter = {
  id: number
  name: string
}

type Props = {
  packages: CoachPackageRow[]
  coaches: CoachFilter[]
}

export default function AdminPackagesTable({
  packages,
  coaches,
}: Props) {
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)
  const [showActive, setShowActive] = useState(true)
  const [showInactive, setShowInactive] = useState(false)
  const [activePage, setActivePage] = useState(1)
  const [inactivePage, setInactivePage] = useState(1)
  const [sortBy, setSortBy] = useState<"remaining" | "expiry">("remaining")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedCoaches, setSelectedCoaches] = useState<number[]>(
    coaches.map((coach) => coach.id)
  )
  const [editingPackage, setEditingPackage] =
    useState<CoachPackageRow | null>(null)
  const [packageName, setPackageName] = useState("")
  const [lessonsAdded, setLessonsAdded] = useState(0)
  const [lessonsUsed, setLessonsUsed] = useState(0)
  const [purchaseDate, setPurchaseDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const router = useRouter()


  const rowsPerPage = 10
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const query = search.toLowerCase()
      const fullName = [
        pkg.preferred_name,
        pkg.first_name,
        pkg.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        pkg.transaction_name.toLowerCase().includes(query) ||
        fullName.includes(query) ||
        pkg.phone.toLowerCase().includes(query) ||
        pkg.email.toLowerCase().includes(query)
      const purchaseDate = pkg.purchase_date ?? ""
      const matchesStart = !startDate || purchaseDate >= startDate
      const matchesEnd = !endDate || purchaseDate <= endDate
      const matchesCoach =
        selectedCoaches.length === 0 ||
        selectedCoaches.includes(pkg.coach_id)
      return matchesSearch && matchesStart && matchesEnd && matchesCoach
    })
  }, [packages, search, startDate, endDate, selectedCoaches])

  const today = new Date()
  const formatExpiry = (date: string | null) => {
    if (!date) return "-"
    return format(new Date(date), "dd/MM/yy")
  }

  const remainingLessons = (pkg: CoachPackageRow) =>
    pkg.lessons_added - pkg.lessons_used

  async function handleSavePackage() {
    if (!editingPackage) return

    const { error } = await supabase
      .from("lesson_packages")
      .update({
        transaction_name: packageName,
        lessons_added: lessonsAdded,
        lessons_used: lessonsUsed,
        purchase_date: purchaseDate || null,
        expiration_date: expiryDate || null,
      })
      .eq("id", editingPackage.id)

    if (error) {
      alert(error.message)
      return
    }

    setEditingPackage(null)
    router.refresh()
  }

  function handleRemainingSort() {
    if (sortBy === "remaining") {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
    } else {
      setSortBy("remaining")
      setSortDirection("desc")
    }
  }

  function handleExpirySort() {
    if (sortBy === "expiry") {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy("expiry")
      setSortDirection("asc")
    }
  }
  const activePackages = useMemo(() => {
    const active = [...filteredPackages].filter((pkg) => {
      const remaining = remainingLessons(pkg)
      const expired = pkg.expiration_date && new Date(pkg.expiration_date) < today
      return remaining > 0 && !expired
    })

    active.sort((a, b) => {
      if (sortBy === "remaining") {
        return sortDirection === "desc"
          ? remainingLessons(b) - remainingLessons(a)
          : remainingLessons(a) - remainingLessons(b)
      }

      return sortDirection === "asc"
        ? (a.expiration_date ?? "").localeCompare(b.expiration_date ?? "")
        : (b.expiration_date ?? "").localeCompare(a.expiration_date ?? "")
    })

    return active
  }, [filteredPackages, sortBy, sortDirection])

  const inactivePackages = useMemo(() => {
    const inactive = [...filteredPackages].filter((pkg) => {
      const remaining = remainingLessons(pkg)
      const expired = pkg.expiration_date && new Date(pkg.expiration_date) < today
      return remaining <= 0 || expired
    })

    inactive.sort((a, b) => {
      if (sortBy === "remaining") {
        return sortDirection === "desc"
          ? remainingLessons(b) - remainingLessons(a)
          : remainingLessons(a) - remainingLessons(b)
      }

      return sortDirection === "asc"
        ? (a.expiration_date ?? "").localeCompare(b.expiration_date ?? "")
        : (b.expiration_date ?? "").localeCompare(a.expiration_date ?? "")
    })

    return inactive
  }, [filteredPackages, sortBy, sortDirection])

  const activeTotalPages = Math.max(1, Math.ceil(activePackages.length / rowsPerPage))
  const inactiveTotalPages = Math.max(1, Math.ceil(inactivePackages.length / rowsPerPage))
  const paginatedActivePackages = activePackages.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage)
  const paginatedInactivePackages = inactivePackages.slice((inactivePage - 1) * rowsPerPage, inactivePage * rowsPerPage)

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-3 text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
        Packages
      </h1>

      <div className="mb-5 flex flex-wrap gap-4 rounded-3xl border border-[#3A5D49] bg-white p-5">
        {coaches.map((coach) => (
          <label
            key={coach.id}
            className="flex cursor-pointer items-center gap-2 dashboard-value"
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#2F5A43]"
              checked={selectedCoaches.includes(coach.id)}
              onChange={() => {
                setSelectedCoaches((prev) =>
                  prev.includes(coach.id)
                    ? prev.filter((id) => id !== coach.id)
                    : [...prev, coach.id]
                )
                setActivePage(1)
                setInactivePage(1)
              }}
            />

            <span className="dashboard-value">{coach.name}</span>
          </label>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setActivePage(1)
            setInactivePage(1)
          }}
          className="w-[120px] sm:w-[160px] rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[15px] font-light text-[#2F5A43] placeholder:text-[#6D7F72] shadow-sm focus:border-[#2F5A43] focus:outline-none"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowStartCalendar(!showStartCalendar)
              setShowEndCalendar(false)
            }}
            className="rounded-xl border-2 border-[#3A5D49] bg-[#35684C] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#2F5A43]"
          >
            {startDate ? format(new Date(startDate), "dd/MM/yy") : "Start Date"}
          </button>

          {showStartCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-white p-2 shadow-lg">
              <div className="overflow-hidden">
                <DayPicker
                  className="-mb-4 scale-90 origin-top"
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate("")
                        setActivePage(1)
                        setInactivePage(1)
                        setShowStartCalendar(false)
                      }}
                      className="mt-2 w-full rounded border px-3 py-2 text-sm"
                    >
                      Clear Date
                    </button>
                  }
                  onSelect={(date) => {
                    if (!date) return
                    setStartDate(format(date, "yyyy-MM-dd"))
                    setActivePage(1)
                    setInactivePage(1)
                    setShowStartCalendar(false)
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEndCalendar(!showEndCalendar)
              setShowStartCalendar(false)
            }}
            className="rounded-xl border-2 border-[#7F2E2E] bg-[#9B3B3B] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#842F2F]"
          >
            {endDate ? format(new Date(endDate), "dd/MM/yy") : "End Date"}
          </button>

          {showEndCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-white p-2 shadow-lg">
              <div className="overflow-hidden">
                <DayPicker
                  className="-mb-4 scale-90 origin-top"
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        setEndDate("")
                        setActivePage(1)
                        setInactivePage(1)
                        setShowEndCalendar(false)
                      }}
                      className="mt-2 w-full rounded border px-3 py-2 text-sm"
                    >
                      Clear Date
                    </button>
                  }
                  onSelect={(date) => {
                    if (!date) return
                    setEndDate(format(date, "yyyy-MM-dd"))
                    setActivePage(1)
                    setInactivePage(1)
                    setShowEndCalendar(false)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-3xl border border-[#3A5D49] bg-white shadow-md">
        <button
          onClick={() => setShowActive(!showActive)}
          className="flex w-full items-center justify-between border-b border-[#3A5D49] bg-[#E8E1D8] p-4 text-[18px] font-light tracking-[0.02em] text-[#2F5A43]"
        >
          Active Packages
          {showActive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showActive && (
          <>
            <div className="hidden p-5 md:block">
              <table className="hidden w-full table-fixed rounded-2xl border border-[#3A5D49] border-separate border-spacing-0 md:table">
              <thead>
                <tr className="border-b text-left">
                  <th className="dashboard-label border-b border-[#3A5D49] p-4 w-16 text-left">
  Edit
</th>
                  <th className="border-b p-4">
                    <button
                      onClick={handleRemainingSort}
                      className="flex items-center gap-1 dashboard-label text-[#2F5A43]"
                    >
                      Remaining{" "}
                      {sortBy === "remaining"
                        ? sortDirection === "desc"
                          ? "▼"
                          : "▲"
                        : "▶"}
                    </button>
                  </th>
                  <th className="border-b p-4">
                    <button
                      onClick={handleExpirySort}
                      className="flex items-center gap-1 dashboard-label text-[#2F5A43]"
                    >
                      Expiry{" "}
                      {sortBy === "expiry"
                        ? sortDirection === "asc"
                          ? "▲"
                          : "▼"
                        : "▶"}
                    </button>
                  </th>
                  <th className="dashboard-label border-b border-[#3A5D49] p-4 text-left">
                    Package
                  </th>
                  <th className="dashboard-label border-b border-[#3A5D49] p-4 text-left">
                    Name
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedActivePackages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-5 text-center text-gray-500">
                      No active packages.
                    </td>
                  </tr>
                ) : (
                  paginatedActivePackages.map((pkg) => {
                    const remaining = remainingLessons(pkg)

                    return (
                      <tr key={pkg.id}>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              setEditingPackage(pkg)
                              setPackageName(pkg.transaction_name)
                              setLessonsAdded(pkg.lessons_added)
                              setLessonsUsed(pkg.lessons_used)
                              setPurchaseDate(pkg.purchase_date ?? "")
                              setExpiryDate(pkg.expiration_date ?? "")
                            }}
                            className="rounded border px-2 py-1 hover:bg-gray-100"
                          >
                            ✏️
                          </button>
                        </td>
                        <td className="p-4 text-[15px] font-light text-[#2F5A43]">
                          {remaining}
                        </td>
                        <td className="p-4 text-[15px] font-light text-[#2F5A43]">
                          {formatExpiry(pkg.expiration_date)}
                        </td>
                        <td className="p-4 text-[15px] font-light text-[#2F5A43]">
                          {pkg.transaction_name}
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/coach/clients/${pkg.client_id}`}
                            className="text-[15px] font-light text-[#2F5A43] underline decoration-[#2F5A43] underline-offset-2 transition hover:text-[#2F5A43]"
                          >
                            {pkg.client_name}
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              </table>
            </div>

            <div className="md:hidden">
              {paginatedActivePackages.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No active packages.</div>
              ) : (
                paginatedActivePackages.map((pkg) => {
                  const remaining = remainingLessons(pkg)

                  return (
                    <div key={pkg.id} className="border-b px-5 py-1.5 last:border-0">
                      <Link
                        href={`/coach/clients/${pkg.client_id}`}
                        className="dashboard-label text-[#2F5A43] hover:underline"
                      >
                        {pkg.client_name}
                      </Link>

                      <div className="dashboard-value">
                        {pkg.transaction_name} ({remaining})
                      </div>

                      <div className="dashboard-value">
                        Expires {formatExpiry(pkg.expiration_date)}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-center gap-3 border-t py-1.5">
              <button
                onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                disabled={activePage === 1}
                className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm hover:bg-[#F6FAF6] disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-[15px] font-light text-[#2F5A43]">
                Page {activePage} of {activeTotalPages}
              </span>

              <button
                onClick={() => setActivePage((p) => Math.min(activeTotalPages, p + 1))}
                disabled={activePage === activeTotalPages}
                className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm hover:bg-[#F6FAF6] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#3A5D49] bg-white shadow-md">
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="flex w-full items-center justify-between border-b border-[#3A5D49] bg-[#E8E1D8] p-4 text-[18px] font-light tracking-[0.02em] text-[#2F5A43]"
        >
          Inactive Packages
          {showInactive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showInactive && (
          <>
            <div className="hidden p-6 md:block">
              <table className="hidden w-full table-fixed rounded-2xl border border-[#3A5D49] border-separate border-spacing-0 md:table">
              <thead>
                <tr className="border-b text-left">
                  <th className="dashboard-label border-b border-[#3A5D49] p-4 w-16 text-left">
  Edit
</th>
                  <th className="border-b p-4">
                    <button
                      onClick={handleRemainingSort}
                      className="flex items-center gap-1 dashboard-label text-[#2F5A43]"
                    >
                      Remaining{" "}
                      {sortBy === "remaining"
                        ? sortDirection === "desc"
                          ? "▼"
                          : "▲"
                        : "▶"}
                    </button>
                  </th>
                  <th className="border-b p-4">
                    <button
                      onClick={handleExpirySort}
                      className="flex items-center gap-1 dashboard-label text-[#2F5A43]"
                    >
                      Expiry{" "}
                      {sortBy === "expiry"
                        ? sortDirection === "asc"
                          ? "▲"
                          : "▼"
                        : "▶"}
                    </button>
                  </th>
                  <th className="dashboard-label border-b border-[#3A5D49] p-4 text-left">
                    Package
                  </th>
                  <th className="dashboard-label border-b border-[#3A5D49] p-4 text-left">
                    Name
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedInactivePackages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      No inactive packages.
                    </td>
                  </tr>
                ) : (
                  paginatedInactivePackages.map((pkg) => {
                    const remaining = remainingLessons(pkg)

                    return (
                      <tr key={pkg.id} className="border-b last:border-0">
                        <td className="p-4">
                          <button
                            onClick={() => setEditingPackage(pkg)}
                            className="rounded border px-2 py-1 hover:bg-gray-100"
                          >
                            ✏️
                          </button>
                        </td>
                        <td className="p-4 text-[15px] font-light text-[#2F5A43]">
                          {remaining}
                        </td>
                        <td className="p-4 text-[15px] font-light text-[#2F5A43]">
                          {formatExpiry(pkg.expiration_date)}
                        </td>
                        <td className="p-4 text-[15px] font-light text-[#2F5A43]">
                          {pkg.transaction_name}
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/coach/clients/${pkg.client_id}`}
                            className="text-[15px] font-light text-[#2F5A43] underline decoration-[#2F5A43] underline-offset-2 transition hover:text-[#2F5A43]"
                          >
                            {pkg.client_name}
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              </table>
            </div>

            <div className="md:hidden">
              {paginatedInactivePackages.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No inactive packages.</div>
              ) : (
                paginatedInactivePackages.map((pkg) => {
                  const remaining = remainingLessons(pkg)

                  return (
                    <div key={pkg.id} className="border-b px-5 py-1.5 last:border-0">
                      <Link
                        href={`/coach/clients/${pkg.client_id}`}
                        className="dashboard-label text-[#2F5A43] hover:underline"
                      >
                        {pkg.client_name}
                      </Link>

                      <div className="dashboard-value">
                        {pkg.transaction_name} ({remaining})
                      </div>

                      <div className="dashboard-value">
                        Expired {formatExpiry(pkg.expiration_date)}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-center gap-3 border-t py-1.5">
              <button
                onClick={() => setInactivePage((p) => Math.max(1, p - 1))}
                disabled={inactivePage === 1}
                className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm hover:bg-[#F6FAF6] disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-[15px] font-light text-[#2F5A43]">
                Page {inactivePage} of {inactiveTotalPages}
              </span>

              <button
                onClick={() => setInactivePage((p) => Math.min(inactiveTotalPages, p + 1))}
                disabled={inactivePage === inactiveTotalPages}
                className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm hover:bg-[#F6FAF6] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Edit Package</h2>

            <div className="space-y-4">

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Client
                </label>
                <div className="rounded border bg-gray-100 px-3 py-2">
                  {editingPackage.client_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Coach
                </label>
                <div className="rounded border bg-gray-100 px-3 py-2">
                  {editingPackage.coach_name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Package
                </label>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Lessons Added
                </label>
                <input
                  type="number"
                  className="w-full rounded border px-3 py-2"
                  value={lessonsAdded}
                  onChange={(e) => setLessonsAdded(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Lessons Used
                </label>
                <input
                  type="number"
                  className="w-full rounded border px-3 py-2"
                  value={lessonsUsed}
                  onChange={(e) => setLessonsUsed(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setEditingPackage(null)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSavePackage}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
