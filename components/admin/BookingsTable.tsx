"use client"

import { useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
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

  const fullName = [
    booking.clients?.preferred_name,
    booking.clients?.first_name,
    booking.clients?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return [
    booking.clients?.phone,
    booking.clients?.email,
    booking.coaches?.name,
    booking.status,
  ]
    .filter(Boolean)
    .some((x) => x!.toLowerCase().includes(value))
    || fullName.includes(value)
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

    await fetch("/api/check-double-bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coachId: editCoachId,
        lessonDate: editDate,
        lessonTime: `${editHour}:00 ${editMeridiem}`,
      }),
    })

    setEditingBooking(null)
    router.refresh()
}

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-3 text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
        All Bookings
      </h1>

      <div className="mb-5 flex flex-wrap items-center gap-3">

        <CoachFilter
          coaches={coaches}
          onChange={setSelectedCoachIds}
        />

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[120px] sm:w-[160px] rounded-xl border border-[#3A5D49] bg-[#F2ECE3] px-4 py-2 text-[15px] font-light text-[#2F5A43] placeholder:text-[#6D7F72] shadow-sm focus:border-[#2F5A43] focus:outline-none"
        />
        <div className="flex items-center rounded-2xl border border-[#3A5D49] bg-[#F2ECE3] shadow-sm">

          <button
            type="button"
            className="px-2 md:px-4 py-2 text-[#2F5A43] transition hover:bg-[#F6FAF6]"
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
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>

          <div className="min-w-[80px] md:min-w-[170px] text-center text-[16px] md:text-[18px] font-light tracking-[0.02em] text-[#2F5A43]">
            <span className="block md:hidden">
              {format(currentMonth, "MMM yy")}
            </span>

            <span className="hidden md:block">
              {format(
                currentMonth,
                window.innerWidth < 768 ? "MMM yy" : "MMMM yyyy"
              )}
            </span>
          </div>

          <button
            type="button"
            className="px-2 md:px-4 py-2 text-[#2F5A43] transition hover:bg-[#F6FAF6]"
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
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>

        </div>

        <div className="relative">
          <>
            <button
              type="button"
              onClick={() => {
                setShowStartCalendar(!showStartCalendar)
                setShowEndCalendar(false)
              }}
              className="hidden md:block rounded-xl border-2 border-[#3A5D49] bg-[#35684C] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#2F5A43]"
            >
              {startDate
                ? format(new Date(startDate), "dd/MM/yy")
                : "Start Date"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowStartCalendar(!showStartCalendar)
                setShowEndCalendar(false)
              }}
              className="block md:hidden rounded-xl border-2 border-[#3A5D49] bg-[#35684C] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#2F5A43]"
            >
              {startDate
                ? format(new Date(startDate), "dd/MM/yy")
                : "Start"}
            </button>
          </>

          {showStartCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-[#F2ECE3] p-2 shadow-lg">
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
          <>
            <button
              type="button"
              onClick={() => {
                setShowEndCalendar(!showEndCalendar)
                setShowStartCalendar(false)
              }}
              className="hidden md:block rounded-xl border-2 border-[#7F2E2E] bg-[#9B3B3B] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#842F2F]"
            >
              {endDate
                ? format(new Date(endDate), "dd/MM/yy")
                : "End Date"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowEndCalendar(!showEndCalendar)
                setShowStartCalendar(false)
              }}
              className="block md:hidden rounded-xl border-2 border-[#7F2E2E] bg-[#9B3B3B] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#842F2F]"
            >
              {endDate
                ? format(new Date(endDate), "dd/MM/yy")
                : "End"}
            </button>
          </>

          {showEndCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-[#F2ECE3] p-2 shadow-lg">
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

<div className="overflow-hidden rounded-3xl border border-[#3A5D49] bg-[#F2ECE3] shadow-md">

  {sortedDates.map((date, index) => (
    <div
      key={date}
      className={index !== 0 ? "border-t border-[#3A5D49]" : ""}
    >
      <div
        onClick={() =>
          setCollapsedDates((prev) => ({
            ...prev,
            [date]: !prev[date],
          }))
        }
        className="flex cursor-pointer items-center justify-between bg-[#E8E1D8] px-5 py-2 hover:bg-[#E3DBD1]"
      >

                  <div className="flex items-center gap-3">

                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#3A5D49] bg-white text-[#2F5A43] transition-all duration-200 hover:bg-[#F6FAF6]">

                      {collapsedDates[date]
                        ? <ChevronRight size={16} strokeWidth={1.5} />
                        : <ChevronDown size={16} strokeWidth={1.5} />}

                    </span>

                    <div className="text-[18px] font-light tracking-[0.12em] text-[#2F5A43]">

                    <div className="hidden md:block">
                      <div className="flex items-center gap-5">

                        <span className="min-w-[130px] flex-shrink-0">
                          {format(
                            new Date(date + "T12:00:00"),
                            "dd MMM yyyy"
                          )}
                        </span>

                        <span className="min-w-[150px]">
                          {format(
                            new Date(date + "T12:00:00"),
                            "EEEE"
                          )}
                        </span>

                      </div>
                    </div>

                    <div className="block md:hidden">
                      <div className="flex items-center">

                        <span className="w-[44px] flex-shrink-0">
                          {format(
                            new Date(date + "T12:00:00"),
                            "dd/MM"
                          )}
                        </span>

                        <span className="ml-3 w-[34px] text-left">
                          {format(
                            new Date(date + "T12:00:00"),
                            "EEE"
                          )}
                        </span>

                      </div>
                    </div>

                  </div>

                  </div>

                  <>
                    <span className="hidden md:block text-[15px] font-light text-[#2F5A43]">
                      {groupedBookings[date].length} bookings
                    </span>

                    <span className="md:hidden text-[14px] font-light text-[#2F5A43]">
                      {groupedBookings[date].length}
                    </span>
                  </>

                </div>

                {!collapsedDates[date] && (
                  <div className="border-t border-[#3A5D49] bg-white px-5 py-5">

                <div className="hidden md:block">

<table className="w-full overflow-hidden rounded-2xl border border-[#3A5D49] border-separate border-spacing-0">

                <thead>

                <tr>

                <th className="dashboard-label border-b border-[#3A5D49] w-12 px-3 py-2 text-center">
                  ✏️
                </th>

                <th className="dashboard-label border-b border-[#3A5D49] px-3 py-2 text-left">
                Time
                </th>

                <th className="dashboard-label border-b border-[#3A5D49] px-3 py-2 text-left">
                Client
                </th>

                <th className="dashboard-label border-b border-[#3A5D49] px-3 py-2 text-left">
                Coach
                </th>

                <th className="dashboard-label border-b border-[#3A5D49] px-3 py-2 text-left">
                Status
                </th>

                <th className="dashboard-label border-b border-[#3A5D49] px-3 py-2 text-left">
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
                        ? "bg-[#E8E1D8] text-[#2F5A43]"
                        : "bg-[#F2ECE3] hover:bg-[#EEE7DD]"
                    }
                  >

                    <td className="px-3 py-2 text-center">
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
                        className="rounded-xl p-1.5 text-[#2F5A43] hover:bg-[#F6FAF6]"
                        title="Edit booking"
                      >
                        ✏️
                      </button>
                    </td>

                    <td className="px-3 py-2 text-[15px] font-light text-[#2F5A43]">
                      {formatLessonTime(booking.lesson_time)}
                    </td>

                    <td className="px-3 py-2 text-[15px] font-light text-[#2F5A43]">
                      {booking.clients?.preferred_name
                        ? `${booking.clients.preferred_name} ${booking.clients.last_name}`
                        : `${booking.clients?.first_name} ${booking.clients?.last_name}`}
                    </td>

                    <td className="px-3 py-2 text-[15px] font-light text-[#2F5A43]">
                      {booking.coaches?.name.split(" ")[0]}
                    </td>

                    <td className="px-3 py-2 text-[15px] font-light text-[#2F5A43]">
                      {booking.status}
                    </td>

                    <td className="px-3 py-2 text-[15px] font-light text-[#2F5A43]">
                      {booking.client_reschedules ?? 0}
                    </td>

                  </tr>

                )
              })}

            </tbody>

            </table>

</div>

<div className="md:hidden">

  <table className="w-full border-separate border-spacing-0">

    <thead>

      <tr>

        <th className="dashboard-label border-b border-[#3A5D49] bg-[#E8E1D8] bg-[#E8E1D8] px-2 py-2 text-center">
          ✏️
        </th>

        <th className="dashboard-label border-b border-[#3A5D49] bg-[#E8E1D8] px-2 py-2 text-left">
          Time
        </th>

        <th className="dashboard-label border-b border-[#3A5D49] bg-[#E8E1D8] px-2 py-2 text-left">
          Client
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
            >

              <td className={`w-10 border-b border-[#3A5D49] ${
                    isCancelled ? "bg-[#E8E1D8]" : "bg-[#F2ECE3]"
                  } py-2 text-center`}>

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
                  className="rounded-xl p-1.5 text-[#2F5A43] hover:bg-[#F6FAF6]"
                >
                  ✏️
                </button>

              </td>

              <td className={`border-b border-[#3A5D49] ${
                    isCancelled ? "bg-[#E8E1D8]" : "bg-[#F2ECE3]"
                  } py-2 text-[15px] font-light text-[#2F5A43]`}>
                {formatLessonTime(booking.lesson_time)}
              </td>

              <td className={`border-b border-[#3A5D49] ${
                    isCancelled ? "bg-[#E8E1D8]" : "bg-[#F2ECE3]"
                  } py-2 text-[15px] font-light text-[#2F5A43]`}>
                {booking.clients?.preferred_name
                  ? `${booking.clients.preferred_name} ${booking.clients.last_name}`
                  : `${booking.clients?.first_name} ${booking.clients?.last_name}`}
              </td>

            </tr>

          )
        })}

    </tbody>

  </table>

</div>

          </div>

        )}

      </div>

    ))}

      {!sortedDates.length && (
        <div className="rounded-3xl border border-[#3A5D49] bg-[#F2ECE3] p-8 text-center text-[15px] font-light text-[#2F5A43]">
          No bookings found.
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">

          <div className="w-full max-w-md rounded-3xl bg-[#F2ECE3] p-6 shadow-xl">

            <h2 className="mb-3 text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
              Delete Booking
            </h2>

            <p className="mb-6 text-[15px] font-light text-[#2F5A43]">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-2xl border border-[#9D3E3E] px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#9D3E3E] hover:bg-[#FDF4F4]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteBooking}
                className="rounded-2xl bg-[#9D3E3E] px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white hover:bg-[#8F3434]"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-full max-w-xl rounded-3xl bg-[#F2ECE3] p-6 shadow-xl">

            <div className="mb-6 flex items-start justify-between">

              <h2 className="text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
                Edit Booking
              </h2>

              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#3A5D49] text-[#2F5A43] hover:bg-[#F6FAF6]"
              >
                ✕
              </button>

            </div>

            <div className="space-y-5">

              <div>

                <label className="dashboard-label mb-1 block">
                  Client
                </label>

                <input
                  disabled
                  value={
                    editingBooking.clients?.preferred_name
                      ? `${editingBooking.clients.preferred_name} ${editingBooking.clients.last_name}`
                      : `${editingBooking.clients?.first_name} ${editingBooking.clients?.last_name}`
                  }
                  className="w-full rounded-2xl border border-[#3A5D49] bg-[#F3F0EA] px-4 py-2 text-[15px] font-light text-[#2F5A43]"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="dashboard-label mb-1 block">
                    Date
                  </label>

                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
                  />

                </div>

                <div>

                  <label className="dashboard-label mb-1 block">
                    Time
                  </label>

                  <div className="flex gap-2">

                    <select
                      value={editHour}
                      onChange={(e) => setEditHour(e.target.value)}
                      className="w-24 rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
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
                      className="w-24 rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>

                  </div>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="dashboard-label mb-1 block">
                    Coach
                  </label>

                  <select
                    value={editCoachId}
                    onChange={(e) => setEditCoachId(Number(e.target.value))}
                    className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
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

                  <label className="dashboard-label mb-1 block">
                    Status
                  </label>

                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
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

                <label className="dashboard-label mb-1 block">
                  Reschedules
                </label>

                <input
                  type="number"
                  min={0}
                  value={editReschedules}
                  onChange={(e) => setEditReschedules(Number(e.target.value))}
                  className="w-24 rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
                />

              </div>

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-2xl bg-[#9D3E3E] px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white hover:bg-[#8F3434]"
                >
                  Delete
                </button>

                <button
                  type="button"
                  onClick={saveBooking}
                  className="rounded-2xl bg-[#2F5A43] px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white hover:bg-[#244634]"
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