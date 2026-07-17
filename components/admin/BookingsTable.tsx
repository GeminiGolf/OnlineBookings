"use client"

import { useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import "react-day-picker/dist/style.css"
import CoachFilter from "@/components/admin/CoachFilter"

type Booking = {
  id: number
  lesson_date: string
  lesson_time: string
  status: string
  client_reschedules: number | null

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
  const router = useRouter()

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

  const [editingBooking, setEditingBooking] =
    useState<Booking | null>(null)

  const [editHour, setEditHour] = useState("9")
  const [editMeridiem, setEditMeridiem] =
    useState<"AM" | "PM">("AM")

  const [editDate, setEditDate] = useState("")
  const [editCoachId, setEditCoachId] = useState<number | "">("")
  const [editStatus, setEditStatus] = useState("")
  const [editReschedules, setEditReschedules] = useState(0)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

const deleteBooking = async () => {
  if (!editingBooking) return

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", editingBooking.id)

  if (error) {
    console.error(error)
    alert(error.message)
    return
  }

  setShowDeleteConfirm(false)
  setEditingBooking(null)
  router.refresh()
}

const saveBooking = async () => {
  if (!editingBooking) return

  const { error } = await supabase
    .from("bookings")
    .update({
      lesson_date: editDate,
      lesson_time: `${editHour}:00 ${editMeridiem}`,
      coach_id: editCoachId,
      status: editStatus,
      client_reschedules: editReschedules,
    })
    .eq("id", editingBooking.id)

  if (error) {
    console.error(error)
    alert(error.message)
    return
  }

  setEditingBooking(null)
  router.refresh()
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

<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

  {sortedDates.map((date, index) => (
    <div
      key={date}
      className={index !== 0 ? "border-t border-gray-200" : ""}
    >
      <div
        onClick={() =>
          setCollapsedDates((prev) => ({
            ...prev,
            [date]: !prev[date],
          }))
        }
        className="flex cursor-pointer items-center justify-between bg-white px-5 py-4 hover:bg-gray-50"
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
                  <div className="border-t bg-gray-50 px-6 py-4">

                <table className="w-full overflow-hidden rounded-xl border border-gray-300">

                <thead className="border-b-2 border-gray-300 bg-gray-200">

                <tr>

                <th className="w-12 px-3 py-2 text-center">
                  ✏️
                </th>

                <th className="px-3 py-2 text-left">
                Time
                </th>

                <th className="px-3 py-2 text-left">
                Client
                </th>

                <th className="px-3 py-2 text-left">
                Coach
                </th>

                <th className="px-3 py-2 text-left">
                Status
                </th>

                <th className="px-3 py-2 text-left">
                  RS
                </th>

                </tr>

                </thead>

                <tbody>

                {groupedBookings[date]
                  .sort((a, b) => {
                    const aCancelled =
                      a.status === "cancelled" ||
                      a.status === "cancelled_admin" ||
                      a.status === "cancelled_coach"

                    const bCancelled =
                      b.status === "cancelled" ||
                      b.status === "cancelled_admin" ||
                      b.status === "cancelled_coach"

                    if (aCancelled !== bCancelled) {
                      return Number(aCancelled) - Number(bCancelled)
                    }

                    const parseTime = (time: string) => {
                      const [hourPart, meridiem] = time.split(" ")
                      let hour = Number(hourPart.replace(":00", ""))

                      if (meridiem === "PM" && hour !== 12) hour += 12
                      if (meridiem === "AM" && hour === 12) hour = 0

                      return hour
                    }

                    return parseTime(a.lesson_time) - parseTime(b.lesson_time)
                  })
                  .map((booking) => {
                    const isCancelled =
                      booking.status === "cancelled" ||
                      booking.status === "cancelled_admin" ||
                      booking.status === "cancelled_coach"

                    return (

                  <tr
                    key={booking.id}
                    className={
                      isCancelled
                        ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        : "hover:bg-gray-50"
                    }
                  >

                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBooking(booking)

                          setEditHour(
                            booking.lesson_time
                              .replace(":00", "")
                              .split(" ")[0]
                          )

                          setEditMeridiem(
                            booking.lesson_time.split(" ")[1] as "AM" | "PM"
                          )

                          setEditDate(booking.lesson_date)
                          setEditCoachId(booking.coaches?.id ?? "")
                          setEditStatus(booking.status)
                          setEditReschedules(booking.client_reschedules ?? 0)
                        }}
                        className="rounded p-1 hover:bg-gray-100"
                        title="Edit booking"
                      >
                        ✏️
                      </button>
                    </td>

                    <td className="px-3 py-3">
                      {formatLessonTime(booking.lesson_time)}
                    </td>

                    <td className="px-3 py-3">
                      {booking.clients?.preferred_name
                        ? `${booking.clients.preferred_name} ${booking.clients.last_name}`
                        : `${booking.clients?.first_name} ${booking.clients?.last_name}`}
                    </td>

                    <td className="px-3 py-3">
                      {booking.coaches?.name.split(" ")[0]}
                    </td>

                    <td className="px-3 py-3">
                      {booking.status}
                    </td>

                    <td className="px-3 py-3">
                      {booking.client_reschedules ?? 0}
                    </td>

                  </tr>

                )
              })}

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

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="mb-3 text-2xl font-bold">
              Delete this booking?
            </h2>

            <p className="mb-6 text-gray-600">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border px-5 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteBooking}
                className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-start justify-between">

              <h2 className="text-2xl font-bold">
                Edit Booking
              </h2>

              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="space-y-5">

              <div>

                <label className="mb-1 block text-sm font-semibold">
                  Client
                </label>

                <input
                  disabled
                  value={
                    editingBooking.clients?.preferred_name
                      ? `${editingBooking.clients.preferred_name} ${editingBooking.clients.last_name}`
                      : `${editingBooking.clients?.first_name} ${editingBooking.clients?.last_name}`
                  }
                  className="w-full rounded-lg border bg-gray-100 p-2"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-1 block text-sm font-semibold">
                    Date
                  </label>

                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-lg border p-2"
                  />

                </div>

                <div>

                  <label className="mb-1 block text-sm font-semibold">
                    Time
                  </label>

                  <div className="flex gap-2">

                    <select
                      value={editHour}
                      onChange={(e) => setEditHour(e.target.value)}
                      className="w-24 rounded-lg border p-2"
                    >
                    
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map((hour) => (
                        <option
                          key={hour}
                          value={hour}
                        >
                          {hour}
                        </option>
                      ))}
                    </select>

                    <select
                      value={editMeridiem}
                      onChange={(e) =>
                        setEditMeridiem(e.target.value as "AM" | "PM")
                      }
                      className="w-24 rounded-lg border p-2"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>

                  </div>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-1 block text-sm font-semibold">
                    Coach
                  </label>

                  <select
                    value={editCoachId}
                    onChange={(e) => setEditCoachId(Number(e.target.value))}
                    className="w-full rounded-lg border p-2"
                  >

                    {coaches.map((coach) => (

                      <option
                        key={coach.id}
                        value={coach.id}
                      >
                        {coach.name}
                      </option>

                    ))}

                  </select>

                </div>

                <div>

                  <label className="mb-1 block text-sm font-semibold">
                    Status
                  </label>

                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-lg border p-2"
                  >

                    <option value="booked">
                      booked
                    </option>

                    <option value="completed">
                      completed
                    </option>

                    <option value="no_show">
                      no_show
                    </option>

                    <option value="cancelled">
                      cancelled
                    </option>

                    <option value="cancelled_coach">
                      cancelled_coach
                    </option>

                    <option value="cancelled_admin">
                      cancelled_admin
                    </option>

                  </select>

                </div>

              </div>

              <div>

                <label className="mb-1 block text-sm font-semibold">
                  Reschedules
                </label>

                <input
                  type="number"
                  min={0}
                  value={editReschedules}
                  onChange={(e) => setEditReschedules(Number(e.target.value))}
                  className="w-24 rounded-lg border p-2"
                />

              </div>

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
                >
                  Delete
                </button>

                <button
                  type="button"
                  onClick={saveBooking}
                  className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                >
                  Save
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>

  </div>
  )
}