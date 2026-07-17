"use client"

import { useMemo, useState } from "react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import "react-day-picker/dist/style.css"
import CoachFilter from "@/components/admin/CoachFilter"

type Booking = {
  id: number
  lesson_date: string
  lesson_time: string
  status: string
  reschedules: number | null

  clients: {
    id: number
    name: string
    preferred_name: string | null
    first_name: string | null
    last_name: string | null
    phone: string | null
    email: string | null
    lessons_remaining: number
  } | null

  coaches: {
    id: number
    name: string
  } | null
}

type Coach = {
  id: number
  name: string
}

type Props = {
  bookings: Booking[]
  coaches: Coach[]
}

export default function BookingsTable({
  bookings,
  coaches,
}: Props) {
  const [search, setSearch] = useState("")

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)

  const [selectedCoachIds, setSelectedCoachIds] =
    useState<number[]>(coaches.map((c) => c.id))

  const [collapsedDates, setCollapsedDates] = useState<
    Record<string, boolean>
  >(() => {
    const state: Record<string, boolean> = {}

    bookings.forEach((booking) => {
      state[booking.lesson_date] = true
    })

    return state
  })

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
  })

const filteredBookings = bookings.filter((booking) => {
  if (
    selectedCoachIds.length &&
    booking.coaches &&
    !selectedCoachIds.includes(booking.coaches.id)
  ) {
    return false
  }

  if (startDate && booking.lesson_date < startDate) {
    return false
  }

  if (endDate && booking.lesson_date > endDate) {
    return false
  }

  if (
    booking.status === "cancelled_client" ||
    booking.status === "cancelled_coach"
  ) {
    return false
  }

  if (!search.trim()) return true

  const value = search.toLowerCase()

  return [
    booking.clients?.preferred_name,
    booking.clients?.first_name,
    booking.clients?.last_name,
    booking.clients?.phone,
    booking.clients?.email,
    booking.coaches?.name,
    booking.status,
  ]
    .filter(Boolean)
    .some((x) => x!.toLowerCase().includes(value))
})

const monthBookings = filteredBookings.filter((booking) => {
  if (startDate || endDate) {
    return true
  }

  const bookingDate = new Date(
    booking.lesson_date + "T12:00:00"
  )

  return (
    bookingDate.getMonth() === currentMonth.getMonth() &&
    bookingDate.getFullYear() === currentMonth.getFullYear()
  )
})

const groupedBookings = monthBookings.reduce<
  Record<string, Booking[]>
>((groups, booking) => {
  if (!groups[booking.lesson_date]) {
    groups[booking.lesson_date] = []
  }

  groups[booking.lesson_date].push(booking)

  return groups
}, {})

const sortedDates = Object.keys(groupedBookings)
  .sort()
  .reverse()

const formatLessonTime = (time: string) => {
  return time
    .replace(":00", "")
    .replace(/\s+/g, " ")
    .trim()
}

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-4 text-[22px] font-bold">
        All Bookings
      </h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">

        <CoachFilter
          coaches={coaches}
          onChange={setSelectedCoachIds}
        />

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[140px] rounded-lg border p-2"
        />
        <div className="flex items-center rounded-lg border">

          <button
            type="button"
            className="px-3 py-2 hover:bg-gray-100"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1
                )
              )
            }
          >
            ◀
          </button>

          <div className="min-w-[150px] text-center font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </div>

          <button
            type="button"
            className="px-3 py-2 hover:bg-gray-100"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1
                )
              )
            }
          >
            ▶
          </button>

        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowStartCalendar(!showStartCalendar)
              setShowEndCalendar(false)
            }}
            className="rounded-lg border border-black bg-green-100 px-4 py-2 hover:bg-green-200"
          >
            {startDate
              ? format(new Date(startDate), "dd/MM/yy")
              : "Start Date"}
          </button>

          {showStartCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-white p-2 shadow-lg">
              <div className="overflow-hidden">
                <DayPicker
                  className="-mb-4 scale-90 origin-top"
                  mode="single"
                  selected={
                    startDate ? new Date(startDate + "T12:00:00") : undefined
                  }
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate("")
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
            {endDate
              ? format(new Date(endDate), "dd/MM/yy")
              : "End Date"}
          </button>

          {showEndCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-white p-2 shadow-lg">
              <div className="overflow-hidden">
                <DayPicker
                  className="-mb-4 scale-90 origin-top"
                  mode="single"
                  selected={
                    endDate ? new Date(endDate + "T12:00:00") : undefined
                  }
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        setEndDate("")
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
                    setShowEndCalendar(false)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">

            {sortedDates.map((date) => (
              <div
                key={date}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >

                <div
                  onClick={() =>
                    setCollapsedDates((prev) => ({
                      ...prev,
                      [date]: !prev[date],
                    }))
                  }
                  className="flex cursor-pointer items-center justify-between bg-gray-100 px-5 py-4 hover:bg-gray-200"
                >

                  <div className="flex items-center gap-3">

                    <span className="text-sm">

                      {collapsedDates[date]
                        ? "▶"
                        : "▼"}

                    </span>

                    <span className="font-semibold">
                      {format(
                        new Date(date + "T12:00:00"),
                        "EEEE dd MMM yyyy"
                      )}
                    </span>

                  </div>

                  <span className="text-sm text-gray-500">
                    {groupedBookings[date].length} bookings
                  </span>

                </div>

                {!collapsedDates[date] && (
  
                <div className="p-4">

                <table className="w-full overflow-hidden rounded-xl border">

                <thead className="bg-gray-100">

                <tr>

                <th className="w-12 border p-2 text-center">
                  ✏️
                </th>

                <th className="border p-2">
                Time
                </th>

                <th className="border p-2">
                Client
                </th>

                <th className="border p-2">
                Coach
                </th>

                <th className="border p-2">
                Status
                </th>

                <th className="border p-2 text-center">
                  RS
                </th>

                </tr>

                </thead>

                <tbody>

                {groupedBookings[date].map((booking) => (

                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="border p-3 text-center">
                      <button
                        className="rounded p-1 hover:bg-gray-100"
                        title="Edit booking"
                      >
                        ✏️
                      </button>
                    </td>

                    <td className="border p-3">
                      {formatLessonTime(booking.lesson_time)}
                    </td>

                    <td className="border p-3">
                      {booking.clients?.preferred_name
                        ? `${booking.clients.preferred_name} ${booking.clients.last_name}`
                        : `${booking.clients?.first_name} ${booking.clients?.last_name}`}
                    </td>

                    <td className="border p-3">
                      {booking.coaches?.name.split(" ")[0]}
                    </td>

                    <td className="border p-3">
                      {booking.status}
                    </td>

                    <td className="border p-3 text-center">
                      {booking.reschedules ?? 0}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    ))}

      {!sortedDates.length && (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          No bookings found.
        </div>
      )}

    </div>

  </div>
  )
}