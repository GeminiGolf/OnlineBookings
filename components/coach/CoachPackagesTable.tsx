"use client"

import Link from "next/link"
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

  client_name: string
}

type Props = {
  packages: CoachPackageRow[]
}

export default function CoachPackagesTable({ packages }: Props) {
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)
  const [showActive, setShowActive] = useState(true)
  const [showInactive, setShowInactive] = useState(false)
  const [activePage, setActivePage] = useState(1)
  const [inactivePage, setInactivePage] = useState(1)
  const rowsPerPage = 10
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const query = search.toLowerCase()
      const matchesSearch =
        pkg.transaction_name.toLowerCase().includes(query) ||
        pkg.preferred_name.toLowerCase().includes(query) ||
        pkg.first_name.toLowerCase().includes(query) ||
        pkg.last_name.toLowerCase().includes(query) ||
        pkg.phone.toLowerCase().includes(query) ||
        pkg.email.toLowerCase().includes(query)
      const purchaseDate = pkg.purchase_date ?? ""
      const matchesStart = !startDate || purchaseDate >= startDate
      const matchesEnd = !endDate || purchaseDate <= endDate
      return matchesSearch && matchesStart && matchesEnd
    })
  }, [packages, search, startDate, endDate])

  const today = new Date()
  const formatExpiry = (date: string | null) => {
    if (!date) return "-"
    return format(new Date(date), "dd/MM/yy")
  }

  const remainingLessons = (pkg: CoachPackageRow) => pkg.lessons_added - pkg.lessons_used
  const activePackages = useMemo(() => {
    return [...filteredPackages]
      .filter((pkg) => {
        const remaining = remainingLessons(pkg)
        const expired = pkg.expiration_date && new Date(pkg.expiration_date) < today
        return remaining > 0 && !expired
      })
      .sort((a, b) => {
        const remainingA = a.lessons_added - a.lessons_used
        const remainingB = b.lessons_added - b.lessons_used
        if (remainingA !== remainingB) {
          return remainingA - remainingB
        }
        return (a.expiration_date ?? "").localeCompare(b.expiration_date ?? "")
      })
  }, [filteredPackages])

  const inactivePackages = useMemo(() => {
    return [...filteredPackages]
      .filter((pkg) => {
        const remaining = remainingLessons(pkg)
        const expired = pkg.expiration_date && new Date(pkg.expiration_date) < today
        return remaining <= 0 || expired
      })
      .sort((a, b) => (b.expiration_date ?? "").localeCompare(a.expiration_date ?? ""))
  }, [filteredPackages])

  const activeTotalPages = Math.max(1, Math.ceil(activePackages.length / rowsPerPage))
  const inactiveTotalPages = Math.max(1, Math.ceil(inactivePackages.length / rowsPerPage))
  const paginatedActivePackages = activePackages.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage)
  const paginatedInactivePackages = inactivePackages.slice((inactivePage - 1) * rowsPerPage, inactivePage * rowsPerPage)

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-[22px] font-bold">Packages</h1>

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
          className="w-[120px] rounded-lg border border-black bg-white px-3 py-2"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowStartCalendar(!showStartCalendar)
              setShowEndCalendar(false)
            }}
            className="rounded-lg border border-black bg-green-100 px-4 py-2 hover:bg-green-200"
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
            className="rounded-lg border border-black bg-red-100 px-4 py-2 hover:bg-red-200"
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

      <div className="mb-4 overflow-hidden rounded-2xl border bg-white">
        <button
          onClick={() => setShowActive(!showActive)}
          className="flex w-full items-center justify-between border-b p-3 font-semibold"
        >
          Active Packages
          {showActive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showActive && (
          <>
            <div className="hidden p-5 md:block">
              <table className="hidden w-full table-fixed border border-gray-300 rounded-lg border-separate border-spacing-0 md:table">
              <thead>
                <tr className="border-b text-left">
                  <th className="border-b p-4">Remaining</th>
                  <th className="border-b p-4">Expiry</th>
                  <th className="border-b p-4">Package</th>
                  <th className="border-b p-4">Name</th>
                </tr>
              </thead>

              <tbody>
                {paginatedActivePackages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-5 text-center text-gray-500">
                      No active packages.
                    </td>
                  </tr>
                ) : (
                  paginatedActivePackages.map((pkg) => {
                    const remaining = remainingLessons(pkg)

                    return (
                      <tr key={pkg.id}>
                        <td className="p-4 font-semibold">{remaining}</td>
                        <td className="p-4">{formatExpiry(pkg.expiration_date)}</td>
                        <td className="p-4">{pkg.transaction_name}</td>
                        <td className="p-4">
                          <Link
                            href={`/coach/clients/${pkg.client_id}`}
                            className="text-blue-600 hover:underline"
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
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {pkg.client_name}
                      </Link>

                      <div className="text-sm text-gray-600">
                        {pkg.transaction_name} ({remaining})
                      </div>

                      <div className="text-sm">
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
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>

              <span>
                Page {activePage} of {activeTotalPages}
              </span>

              <button
                onClick={() => setActivePage((p) => Math.min(activeTotalPages, p + 1))}
                disabled={activePage === activeTotalPages}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="flex w-full items-center justify-between border-b p-3 font-semibold"
        >
          Inactive Packages
          {showInactive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showInactive && (
          <>
            <div className="hidden p-6 md:block">
              <table className="hidden w-full table-fixed border border-gray-300 rounded-lg border-separate border-spacing-0 md:table">
              <thead>
                <tr className="border-b text-left">
                  <th className="border-b p-4">Remaining</th>
                  <th className="border-b p-4">Expiry</th>
                  <th className="border-b p-4">Package</th>
                  <th className="border-b p-4">Name</th>
                </tr>
              </thead>

              <tbody>
                {paginatedInactivePackages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      No inactive packages.
                    </td>
                  </tr>
                ) : (
                  paginatedInactivePackages.map((pkg) => {
                    const remaining = remainingLessons(pkg)

                    return (
                      <tr key={pkg.id} className="border-b last:border-0">
                        <td className="p-4 font-semibold">{remaining}</td>
                        <td className="p-4">{formatExpiry(pkg.expiration_date)}</td>
                        <td className="p-4">{pkg.transaction_name}</td>
                        <td className="p-4">
                          <Link
                            href={`/coach/clients/${pkg.client_id}`}
                            className="text-blue-600 hover:underline"
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
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {pkg.client_name}
                      </Link>

                      <div className="text-sm text-gray-600">
                        {pkg.transaction_name} ({remaining})
                      </div>

                      <div className="text-sm">
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
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>

              <span>
                Page {inactivePage} of {inactiveTotalPages}
              </span>

              <button
                onClick={() => setInactivePage((p) => Math.min(inactiveTotalPages, p + 1))}
                disabled={inactivePage === inactiveTotalPages}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
