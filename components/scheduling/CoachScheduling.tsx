"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import AddTransactionForm from "@/components/clients/AddTransactionForm"
import { getMalaysiaDate } from "@/lib/date"
import DashboardContainer from "@/components/layout/DashboardContainer"

type Booking = {
  id: number
  lesson_date: string
  lesson_time: string
  status: string
  payment_method: string | null
  payment_date: string | null
  completion_date: string | null
  is_new: boolean

  clients: {
    id: number
    name: string
    preferred_name: string | null
    first_name: string | null
    last_name: string | null
    phone: string | null
    email: string | null
    notes: string | null
    lessons_remaining: number
  } | null
}

type Availability = {
  day_of_week: number
  start_time: string
  end_time: string
}

type DateOverride = {
  id: number
  coach_id: number
  lesson_date: string
  lesson_time: string
  is_available: boolean
  notes: string | null
}

type WeeklyBreak = {
  id: number
  coach_id: number
  day_of_week: number
  hour: number
}

type Props = {
  coachId: number
  coachName: string
  initialBookings: Booking[]
  selectedDate: string
  availability: Availability | null
  weeklyBreaks: WeeklyBreak[]
  dateOverrides: DateOverride[]
  rescheduleBooking?: Booking | null
  headerContent?: React.ReactNode
}

export default function CoachDashboard({
  coachId,
  coachName,
  initialBookings,
  selectedDate,
  availability,
  weeklyBreaks,
  dateOverrides,
  rescheduleBooking: initialRescheduleBooking,
  headerContent,
}: Props) {
  const router = useRouter()
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(initialRescheduleBooking || null)
  const [moveBooking, setMoveBooking] = useState<Booking | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const hours: number[] = []
  const [showExtendModal, setShowExtendModal] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel(`coach-schedule-${coachId}-${selectedDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          router.refresh()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_changes",
        },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [coachId, selectedDate, router])

  const [extendStartHour, setExtendStartHour] = useState("8")
  const [extendStartPeriod, setExtendStartPeriod] = useState("AM")
  const [extendEndHour, setExtendEndHour] = useState("7")
  const [extendEndPeriod, setExtendEndPeriod] = useState("PM")
  let earliestHour = 8
  let latestHour = 20

  if (availability) {
    earliestHour = parseInt(availability.start_time.split(":")[0])
    latestHour = parseInt(availability.end_time.split(":")[0]) - 1
  }

  dateOverrides.forEach((override) => {
    if (!override.is_available) {
      return
    }

    const hour = parseInt(override.lesson_time.split(":")[0])
    if (hour < earliestHour) {
      earliestHour = hour
    }
    if (hour > latestHour) {
      latestHour = hour
    }
  })

  for (let hour = earliestHour; hour <= latestHour; hour++) {
    hours.push(hour)
  }

  function formatHour(hour: number) {
    const suffix = hour >= 12 ? "PM" : "AM"
    let display = hour % 12

    if (display === 0) {
      display = 12
    }

    return `${display} ${suffix}`
  }
  function getBookingForHour(hour: number) {
    return initialBookings.find((booking) => {
      if (booking.status !== "booked" && booking.status !== "completed" && booking.status !== "no_show") {
        return false
      }
      const time = booking.lesson_time.trim().toUpperCase()
      let bookingHour = 0
      if (time.includes("PM")) {
        bookingHour = parseInt(time)
        if (bookingHour !== 12) {
          bookingHour += 12
        }
      } else {
        bookingHour = parseInt(time)
        if (bookingHour === 12) {
          bookingHour = 0
        }
      }
      return bookingHour === hour
    })
  }

  function isAvailableHour(hour: number) {
    if (!availability) {
      return false
    }
    const start = parseInt(availability.start_time.split(":")[0])
    const end = parseInt(availability.end_time.split(":")[0])
    return hour >= start && hour < end
  }

  function isBreakHour(hour: number) {
    return weeklyBreaks.some((item) => item.hour === hour)
  }

  function isOverrideClosed(hour: number) {
    return dateOverrides.some(
      (override) => override.lesson_time.startsWith(String(hour).padStart(2, "0")) && override.is_available === false
    )
  }

  function isOverrideOpen(hour: number) {
    return dateOverrides.some(
      (override) => override.lesson_time.startsWith(String(hour).padStart(2, "0")) && override.is_available === true
    )
  }

  async function toggleSlot(hour: number) {
    if (rescheduleBooking || moveBooking) {
      const activeBooking = moveBooking || rescheduleBooking

      if (!activeBooking) {
        return
      }
      const available = (isAvailableHour(hour) || isOverrideOpen(hour)) && !isBreakHour(hour) && !isOverrideClosed(hour)
      if (!available) {
        const confirmed = window.confirm("This is a closed slot.\n\nConfirming will open it.")
        if (!confirmed) {
          return
        }
      }

      const newTime = formatHour(hour)
      const formatDisplayDate = (dateString: string) => {
        const date = new Date(dateString)
        const day = String(date.getDate()).padStart(2, "0")
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const year = String(date.getFullYear()).slice(-2)
        return `${day}/${month}/${year}`
      }
      const formatDisplayTime = (timeString: string) => {
        return timeString.replace(":00", "")
      }
      const firstName = activeBooking?.clients?.name?.split(" ")[0] || "Client"
      const confirmed = window.confirm(
        `Move ${firstName} from ${formatDisplayDate(activeBooking.lesson_date)} ${formatDisplayTime(
          activeBooking.lesson_time
        )} to ${formatDisplayDate(selectedDate)} ${formatDisplayTime(newTime)}?`
      )

      if (!confirmed) {
        return
      }

      await supabase
        .from("bookings")
        .update({
          lesson_date: selectedDate,
          lesson_time: newTime,
        })
        .eq("id", activeBooking.id)

      await supabase.from("booking_changes").insert({
        booking_id: activeBooking.id,
        action: "rescheduled",
        performed_by: "coach",
        old_date: activeBooking.lesson_date,
        old_time: activeBooking.lesson_time,
        new_date: selectedDate,
        new_time: newTime,
      })

    // await supabase.from("notifications").insert({
    //   coach_id: coachId,
    //   client_id: activeBooking.clients?.id,
    //   booking_id: activeBooking.id,
    //   type: "coach_rescheduled",
    //   message: "Coach rescheduled lesson",
    // })

      setRescheduleBooking(null)
      setMoveBooking(null)
      const params = new URLSearchParams()
      params.set("date", selectedDate)
      router.push(`/coach/schedule?${params.toString()}`)
      return
    }

    const booking = getBookingForHour(hour)
    if (booking && !rescheduleBooking && !moveBooking) {
      setSelectedBooking(booking)
      return
    }

    const overrideOpen = isOverrideOpen(hour)
    const overrideClosed = isOverrideClosed(hour)
    const breakHour = isBreakHour(hour)
    const available = isAvailableHour(hour)

    const timeString = `${String(hour).padStart(2, "0")}:00:00`

    // Open Override -> Break / Available
    if (overrideOpen) {
      const confirmed = window.confirm(`Close ${formatHour(hour)}?`)
      if (!confirmed) return

      await supabase
        .from("date_overrides")
        .delete()
        .eq("coach_id", coachId)
        .eq("lesson_date", selectedDate)
        .eq("lesson_time", timeString)

      window.location.reload()
      return
    }

    // Closed Override -> Available
    if (overrideClosed) {
      const confirmed = window.confirm(`Open ${formatHour(hour)}?`)
      if (!confirmed) return

      await supabase
        .from("date_overrides")
        .delete()
        .eq("coach_id", coachId)
        .eq("lesson_date", selectedDate)
        .eq("lesson_time", timeString)

      window.location.reload()
      return
    }

    // Break -> Open Override
    if (breakHour) {
      const confirmed = window.confirm(`Open ${formatHour(hour)}?`)
      if (!confirmed) return

      await supabase.from("date_overrides").insert({
        coach_id: coachId,
        lesson_date: selectedDate,
        lesson_time: timeString,
        is_available: true,
      })

      window.location.reload()
      return
    }

    // Available -> Closed Override
    if (available) {
      const confirmed = window.confirm(`Close ${formatHour(hour)}?`)
      if (!confirmed) return

      await supabase.from("date_overrides").insert({
        coach_id: coachId,
        lesson_date: selectedDate,
        lesson_time: timeString,
        is_available: false,
      })

      window.location.reload()
      return
    }

    // Closed -> Open Override
    const confirmed = window.confirm(`Open ${formatHour(hour)}?`)
    if (!confirmed) return

    await supabase.from("date_overrides").insert({
      coach_id: coachId,
      lesson_date: selectedDate,
      lesson_time: timeString,
      is_available: true,
    })

    window.location.reload()
  }

  function goToDate(date: string) {
    const params = new URLSearchParams()
    params.set("date", date)

    if (rescheduleBooking) {
      params.set("reschedule", String(rescheduleBooking.id))
    }

    router.push(`/coach/schedule?${params.toString()}`)
  }

  function previousDay() {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    goToDate(date.toISOString().split("T")[0])
  }

  function nextDay() {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    goToDate(date.toISOString().split("T")[0])
  }

  function today() {
    goToDate(getMalaysiaDate())
  }

  async function closeDay() {
    const activeBookings = initialBookings.filter((booking) => booking.status === "booked")
    if (activeBookings.length > 0) {
      alert("Please reschedule or cancel bookings first.")
      return
    }

    const overrides = []
    if (!availability) {
      dateOverrides.forEach((override) => {
        const hour = parseInt(override.lesson_time.split(":")[0])
        overrides.push({
          coach_id: coachId,
          lesson_date: selectedDate,
          lesson_time: `${String(hour).padStart(2, "0")}:00:00`,
          is_available: false,
        })
      })

    } else {
      const start = parseInt(availability.start_time.split(":")[0])
      const end = parseInt(availability.end_time.split(":")[0])
      for (let hour = start; hour < end; hour++) {
        overrides.push({
          coach_id: coachId,
          lesson_date: selectedDate,
          lesson_time: `${String(hour).padStart(2, "0")}:00:00`,
          is_available: false,
        })
      }
    }

    const confirmed = window.confirm("Close entire day?")
    if (!confirmed) {
      return
    }
    await supabase.from("date_overrides").delete().eq("coach_id", coachId).eq("lesson_date", selectedDate)
    await supabase.from("date_overrides").insert(overrides)
    window.location.reload()
  }

  async function extendDay() {
    const convertTo24Hour = (hourString: string, period: string) => {
      let hour = parseInt(hourString)
      if (period === "AM" && hour === 12) {
        return 0
      }
      if (period === "PM" && hour !== 12) {
        return hour + 12
      }
      return hour
    }
    const start = convertTo24Hour(extendStartHour, extendStartPeriod)
    const end = convertTo24Hour(extendEndHour, extendEndPeriod)
    if (start >= end) {
      alert("End time must be after start time.")
      return
    }
    const overrides = []
    for (let hour = start; hour < end; hour++) {
      overrides.push({
        coach_id: coachId,
        lesson_date: selectedDate,
        lesson_time: `${String(hour).padStart(2, "0")}:00:00`,
        is_available: true,
      })
    }

    await supabase
      .from("date_overrides")
      .delete()
      .eq("coach_id", coachId)
      .eq("lesson_date", selectedDate)
      .eq("is_available", false)
    await supabase.from("date_overrides").upsert(overrides, {
      onConflict: "coach_id,lesson_date,lesson_time",
    })
    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-[#ECE8E1] px-4 pt-8 pb-3 sm:p-10 text-black">
      <DashboardContainer>
        <h1 className="text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
          Schedule
        </h1>
        <div className="mb-1 mt-1">
          {headerContent ?? (
            <p className="mt-1 text-[15px] font-light tracking-[0.02em] text-[#2F5A43]">
              Welcome back, {coachName}
            </p>
          )}
        </div>
        <div className="mb-3 sm:mb-3 flex flex-wrap items-center gap-3">
          <button
            onClick={previousDay}
            className="rounded-lg border border-[#3A5D49] bg-[#FBF8F3] px-3 py-2 text-[13px] font-light tracking-[0.06em] text-[#1F3327] transition sm:px-5"
          >
            <span className="hidden sm:inline">← Previous</span>
            <span className="sm:hidden">←</span>
          </button>

          <button
            onClick={today}
            className="rounded-lg border border-[#3A5D49] bg-[#FBF8F3] px-3 py-2 text-[13px] font-light tracking-[0.06em] text-[#1F3327] transition sm:px-5"
          >
            Today
          </button>

          <button
            onClick={nextDay}
            className="rounded-lg border border-[#3A5D49] bg-[#FBF8F3] px-3 py-2 text-[13px] font-light tracking-[0.06em] text-[#1F3327] transition sm:px-5"
          >
            <span className="hidden sm:inline">Next →</span>
            <span className="sm:hidden">→</span>
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => goToDate(e.target.value)}
            className="rounded-lg border border-[#3A5D49] bg-[#FBF8F3] px-3 py-2 text-[13px] font-light tracking-[0.06em] text-[#1F3327] sm:px-5"
          />

          <button
            onClick={closeDay}
            className="rounded-lg bg-[#8F3434] px-3 py-2 text-[13px] font-light tracking-[0.06em] text-white transition hover:bg-[#A34A4A] sm:px-5"
          >
            Close Day
          </button>

          <button
            onClick={() => setShowExtendModal(true)}
            className="rounded-lg bg-[#2F5A43] px-3 py-2 text-[13px] font-light tracking-[0.06em] text-white transition hover:bg-[#3C6A50] sm:px-5"
          >
            Extend Day
          </button>
        </div>

        {(rescheduleBooking || moveBooking) && (
          <div className="mb-4 rounded-xl border border-green-300 bg-green-100 p-4">
            <p className="font-bold">
              {moveBooking
                ? `Moving Completed Lesson: ${moveBooking.clients?.name}`
                : `Rescheduling: ${rescheduleBooking?.clients?.name}`}
            </p>

            <p className="text-sm">
              {moveBooking
                ? "Choose an empty slot on today's schedule."
                : "Navigate to any day and click an available slot."}
            </p>

            <button
              onClick={() => {
                setRescheduleBooking(null)
                setMoveBooking(null)
              }}
              className="mt-2 rounded bg-gray-700 px-3 py-1 text-white"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-[#3A5D49] bg-[#FEFDFC] shadow-md">
          <div className="grid grid-cols-[82px_1fr] border-b border-[#3A5D49] bg-[#E8E1D8]">
            <div className="dashboard-label flex items-center border-r border-[#3A5D49] bg-[#E8E1D8] p-4">
              Time
            </div>

            <div className="dashboard-label flex items-center bg-[#E8E1D8] p-4">
              Schedule
            </div>
          </div>

          {hours.map((hour) => {
            const booking = getBookingForHour(hour)
            console.log({
              hour,
              available: isAvailableHour(hour),
              breakHour: isBreakHour(hour),
              overrideOpen: isOverrideOpen(hour),
              overrideClosed: isOverrideClosed(hour),
            })
            const available =
              (isAvailableHour(hour) && !isBreakHour(hour)) ||
              isOverrideOpen(hour)
            const breakHour = isBreakHour(hour)
            const overrideClosed = isOverrideClosed(hour)
            const overrideOpen = isOverrideOpen(hour)
            let bgClass = "bg-[#D6D1C8]"
            if (available && !breakHour) {
              bgClass = "bg-[#FBF8F3]"
            }
            if (overrideOpen) {
              bgClass = "bg-[#FBF8F3]"
            }
            if (overrideClosed) {
              bgClass = "bg-[#D6D1C8]"
            }
            if (overrideClosed) {
              bgClass = "bg-[#D6D1C8]"
            }
            if (booking) {
              if (booking.status === "completed") {
                bgClass = "bg-[#D6EAF4]"
              } else if (booking.status === "no_show") {
                bgClass = "bg-[#F1D7D7]"
              } else if (booking.is_new) {
                bgClass = "bg-[#E7DCF3]"
              } else {
                bgClass = booking.clients?.lessons_remaining === 0 ? "bg-yellow-200" : "bg-[#DDEEDB]"
              }
            }

            return (
              <div key={hour} className="grid grid-cols-[82px_1fr] border-b border-[#3A5D49]">
                <div className="flex items-center whitespace-nowrap border-r border-[#3A5D49] bg-[#FBF8F3] px-3 py-2 text-[14px] font-light text-[#1F3327]">
                  {formatHour(hour)}
                </div>

                <button
                  onClick={() => toggleSlot(hour)}
                  className={`min-h-[52px] w-full px-4 py-2 text-left transition hover:brightness-95 ${bgClass}`}
                >
                  {booking ? (
                    <div className="flex flex-col justify-center gap-0.5 leading-tight">
                      <p className="text-[16px] font-light tracking-[0.02em] leading-none text-[#1F3327]">
                        {booking.clients?.preferred_name
                          ? `(${booking.clients.preferred_name}) ${booking.clients.first_name} ${booking.clients.last_name}`
                          : `${booking.clients?.first_name} ${booking.clients?.last_name}`}
                      </p>

                      <p className="text-[13px] font-light tracking-[0.02em] leading-none text-[#1F3327]">
                        {booking.status === "completed"
                          ? "Completed Lesson"
                          : booking.status === "no_show"
                            ? "No Show"
                            : "Booked Lesson"}
                      </p>
                    </div>
                  ) : overrideClosed ? (
                    <p className="text-[14px] font-light tracking-[0.02em] text-[#1F3327]">
                      Closed (Override)
                    </p>
                  ) : overrideOpen ? (
                    <p className="text-[14px] font-light tracking-[0.02em] text-[#1F3327]">
                      Available (Override)
                    </p>
                  ) : breakHour ? (
                    <p className="text-[14px] font-light tracking-[0.02em] text-[#1F3327]">
                      Break
                    </p>
                  ) : available ? (
                    <p className="text-[14px] font-light tracking-[0.02em] text-[#1F3327]">
                      Available
                    </p>
                  ) : (
                    <p className="text-[14px] font-light tracking-[0.02em] text-[#1F3327]">
                      Closed
                    </p>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </DashboardContainer>

      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-md rounded-2xl bg-[#FEFDFC] p-6">
            <h2 className="mb-4 text-2xl font-bold">Extend Day</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-medium">Start Time</p>
                <div className="flex gap-2">
                  <select
                    value={extendStartHour}
                    onChange={(e) => setExtendStartHour(e.target.value)}
                    className="rounded border p-2"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <option key={hour} value={String(hour)}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <select
                    value={extendStartPeriod}
                    onChange={(e) => setExtendStartPeriod(e.target.value)}
                    className="rounded border p-2"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="mb-2 font-medium">End Time</p>
                <div className="flex gap-2">
                  <select
                    value={extendEndHour}
                    onChange={(e) => setExtendEndHour(e.target.value)}
                    className="rounded border p-2"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <option key={hour} value={String(hour)}>
                        {hour}
                      </option>
                    ))}
                  </select>

                  <select
                    value={extendEndPeriod}
                    onChange={(e) => setExtendEndPeriod(e.target.value)}
                    className="rounded border p-2"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowExtendModal(false)} className="rounded border px-4 py-2">
                  Cancel
                </button>

                <button onClick={extendDay} className="rounded bg-green-600 px-4 py-2 text-white">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-xl rounded-3xl border border-[#B9B2A8] bg-[#FEFDFC] p-8 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-[26px] font-light tracking-[0.04em] text-black">
                Client Details
              </h2>

              <button
                onClick={() => setSelectedBooking(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3A5D49] bg-[#FEFDFC] text-xl transition hover:bg-[#F7F3EE]"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-4">
                  <p className="dashboard-label">Client</p>

                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBooking.is_new}
                      onChange={async (e) => {
                        const checked = e.target.checked

                        const { error } = await supabase
                          .from("bookings")
                          .update({ is_new: checked })
                          .eq("id", selectedBooking.id)

                        if (error) {
                          alert(error.message)
                          return
                        }

                        setSelectedBooking({
                          ...selectedBooking,
                          is_new: checked,
                        })

                        router.refresh()
                      }}
                    />
                    New
                  </label>
                </div>

                <Link
                  href={`/coach/clients/${selectedBooking.clients?.id}`}
                  className="text-[18px] font-light text-[#2F5A43] underline transition hover:text-[#3C6A50]"
                >
                  {selectedBooking.clients?.preferred_name
                    ? `(${selectedBooking.clients.preferred_name}) ${selectedBooking.clients.first_name} ${selectedBooking.clients.last_name}`
                    : `${selectedBooking.clients?.first_name} ${selectedBooking.clients?.last_name}`}
                </Link>
              </div>

              <div>
                <p className="dashboard-label">Phone</p>
                <p className="dashboard-value">
                  {selectedBooking.clients?.phone || "No phone added"}
                </p>
              </div>

              <div>
                <p className="dashboard-label">Email</p>
                <p className="dashboard-value">
                  {selectedBooking.clients?.email || "No email added"}
                </p>
              </div>

              <div>
                <p className="dashboard-label">Notes</p>
                <p className="dashboard-value">
                  {selectedBooking.clients?.notes || "No notes"}
                </p>
              </div>

              <div>
                <p className="dashboard-label">Lessons Remaining</p>
                <p className="dashboard-value">
                  {selectedBooking.clients?.lessons_remaining}
                </p>
              </div>

              {selectedBooking.status === "completed" ? (
                <button
                  onClick={() => {
                    setMoveBooking(selectedBooking)
                    setSelectedBooking(null)
                  }}
                  className="rounded-lg bg-sky-400 px-4 py-2 text-white hover:bg-sky-500"
                >
                  Move Lesson
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-4 sm:flex">
                  <button
                    onClick={() => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)

                      const lessonDate = new Date(selectedBooking.lesson_date)
                      lessonDate.setHours(0, 0, 0, 0)

                      if (lessonDate > today) {
                        alert("Future lessons cannot be marked as completed.")
                        return
                      }
                      const lessonTime = selectedBooking.lesson_time.trim().toUpperCase()
                      let lessonHour = parseInt(lessonTime)
                      if (lessonTime.includes("PM") && lessonHour !== 12) {
                        lessonHour += 12
                      }
                      if (lessonTime.includes("AM") && lessonHour === 12) {
                        lessonHour = 0
                      }
                      const lessonStart = new Date()
                      lessonStart.setHours(lessonHour, 0, 0, 0)
                      const completionAllowedTime = new Date(lessonStart.getTime() + 30 * 60 * 1000)
                      if (today < completionAllowedTime) {
                        const confirmed = window.confirm(`This lesson starts at ${selectedBooking.lesson_time}`)
                        if (!confirmed) {
                          return
                        }
                      }
                      if (
                        selectedBooking.clients?.lessons_remaining === 0
                      ) {
                        alert(
                          "No lessons remaining. Please add a transaction first."
                        )
                        return
                      }

                      setShowCompleteModal(true)
                    }}
                   className="rounded-xl bg-[#7DC9F5] px-4 py-2 text-[14px] font-light tracking-[0.03em] text-white transition hover:bg-[#6BBDEB]"
                  >
                    Completed
                  </button>

                  <button
                    onClick={() => {
                      setShowTransactionForm(true)
                    }}
                    className="rounded-xl bg-[#3B82F6] px-4 py-2 text-[14px] font-light tracking-[0.03em] text-white transition hover:bg-[#2563EB]"
                  >
                    Add Transaction
                  </button>

                  <button
                    onClick={() => {
                      setRescheduleBooking(selectedBooking)
                      setSelectedBooking(null)
                    }}
                    className="rounded-xl bg-[#2F5A43] px-4 py-2 text-[14px] font-light tracking-[0.03em] text-white transition hover:bg-[#3C6A50]"
                  >
                    Reschedule Lesson
                  </button>

                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="rounded-xl bg-[#8F3434] px-4 py-2 text-[14px] font-light tracking-[0.03em] text-white transition hover:bg-[#A04545]"
                  >
                    Cancel Lesson
                  </button>
                </div>
              )}
              {showTransactionForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-6">
                  <div className="w-full max-w-md rounded-2xl bg-[#FEFDFC] p-6 shadow-2xl">
                    <AddTransactionForm
                      clientId={selectedBooking.clients!.id}
                      lessonsRemaining={
                        selectedBooking.clients!.lessons_remaining
                      }
                      onSaved={() => {
                        setShowTransactionForm(false)
                        window.location.reload()
                      }}
                      onCancel={() => {
                        setShowTransactionForm(false)
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-[#FEFDFC] p-6">
            <h2 className="mb-4 text-2xl font-bold">
              Complete Lesson
            </h2>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setShowCompleteModal(false)
                }
                className="rounded-lg border px-4 py-2"
              >
                Close
              </button>

              <button
                onClick={async () => {
                  const todayDate =
                    new Date()
                      .toISOString()
                      .split("T")[0]

                  await supabase
                    .from("bookings")
                    .update({
                      status: "completed",
                      completion_date:
                        todayDate,
                    })
                    .eq(
                      "id",
                      selectedBooking.id
                    )

                  if (
                    selectedBooking.clients
                  ) {
                    const {
                      data: packages,
                    } = await supabase
                      .from(
                        "lesson_packages"
                      )
                      .select("*")
                      .eq(
                        "client_id",
                        selectedBooking.clients.id
                      )
                      .gte(
                        "expiration_date",
                        todayDate
                      )
                      .order(
                        "expiration_date",
                        {
                          ascending: true,
                        }
                      )

                    const packageToUse =
                      packages?.find(
                        (pkg) =>
                          (pkg.lessons_added ||
                            0) >
                          (pkg.lessons_used ||
                            0)
                      )

                    if (
                      packageToUse
                    ) {
                      await supabase
                        .from(
                          "lesson_packages"
                        )
                        .update({
                          lessons_used:
                            (packageToUse.lessons_used ||
                              0) + 1,
                        })
                        .eq(
                          "id",
                          packageToUse.id
                        )

                      await supabase
                        .from("bookings")
                        .update({
                          lesson_package_id:
                            packageToUse.id,
                        })
                        .eq(
                          "id",
                          selectedBooking.id
                        )
                    }

                    await supabase
                      .from("clients")
                      .update({
                        lessons_remaining: Math.max(
                          0,
                          (selectedBooking.clients?.lessons_remaining || 0) - 1
                        ),
                      })
                      .eq(
                        "id",
                        selectedBooking.clients.id
                      )                    
                  }

                  window.location.reload()
                }}
                className="rounded-lg bg-sky-500 px-4 py-2 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-[#FEFDFC] p-6">
            <h2 className="mb-4 text-2xl font-bold">Cancel Lesson</h2>
            <p className="mb-4 text-gray-600">A cancellation reason is required.</p>

            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={4}
              className="w-full rounded-lg border p-3"
              placeholder="Enter cancellation reason..."
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancellationReason("")
                }}
                className="rounded-lg border px-4 py-2"
              >
                Close
              </button>

              <button
                onClick={async () => {
                  if (!cancellationReason.trim()) {
                    alert("Cancellation reason is required.")
                    return
                  }
                  await supabase
                    .from("bookings")
                    .update({
                      status: "cancelled_coach",
                      cancellation_reason: cancellationReason,
                    })
                    .eq("id", selectedBooking.id)

                  await supabase.from("notifications").insert({
                    coach_id: coachId,
                    client_id: selectedBooking.clients?.id,
                    booking_id: selectedBooking.id,
                    type: "coach_cancelled",
                    message: cancellationReason,
                  })
                  await supabase
                    .from("notifications")
                    .delete()
                    .eq("booking_id", selectedBooking.id)
                    .eq("type", "late_booking")
                  setShowCancelModal(false)
                  setSelectedBooking(null)
                  setCancellationReason("")
                  window.location.reload()
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
