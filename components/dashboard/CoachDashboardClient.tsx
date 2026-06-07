"use client"

import Link from "next/link"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

type Booking = {
  id: number
  lesson_date: string
  lesson_time: string
  status: string
  payment_method: string | null
  payment_date: string | null
  completion_date: string | null

  clients: {
    id: number
    name: string
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
}

export default function CoachDashboardClient({
  coachId,
  coachName,
  initialBookings,
  selectedDate,
  availability,
  weeklyBreaks,
  dateOverrides,
  rescheduleBooking: initialRescheduleBooking,
}: Props) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(initialRescheduleBooking || null)
  const [moveBooking, setMoveBooking] = useState<Booking | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const hours: number[] = []

  const [showExtendModal, setShowExtendModal] = useState(false)

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

    let display = hour

    if (hour > 12) {
      display = hour - 12
    }

    return `${display}:00 ${suffix}`
  }

  function getBookingForHour(hour: number) {
    return initialBookings.find((booking) => {
      if (booking.status !== "booked" && booking.status !== "completed") {
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

      setRescheduleBooking(null)
      setMoveBooking(null)

      window.location.href = `/coach/schedule?date=${selectedDate}`

      return
    }

    const booking = getBookingForHour(hour)

    if (booking) {
      setSelectedBooking(booking)
      return
    }

    const available = isAvailableHour(hour)

    const override = dateOverrides.find((item) => item.lesson_time.startsWith(String(hour).padStart(2, "0")))

    const timeString = `${String(hour).padStart(2, "0")}:00:00`

    if (override) {
      const confirmed = window.confirm(
        override.is_available ? `Close ${formatHour(hour)}?` : `Open ${formatHour(hour)}?`
      )

      if (!confirmed) {
        return
      }

      await supabase.from("date_overrides").delete().eq("id", override.id)

      window.location.reload()

      return
    }

    if (available) {
      const confirmed = window.confirm(`Close ${formatHour(hour)}?`)

      if (!confirmed) {
        return
      }

      await supabase.from("date_overrides").insert({
        coach_id: coachId,
        lesson_date: selectedDate,
        lesson_time: timeString,
        is_available: false,
      })
    } else {
      const confirmed = window.confirm(`Open ${formatHour(hour)}?`)

      if (!confirmed) {
        return
      }

      await supabase.from("date_overrides").insert({
        coach_id: coachId,
        lesson_date: selectedDate,
        lesson_time: timeString,
        is_available: true,
      })
    }

    window.location.reload()
  }

  function goToDate(date: string) {
    let url = `/coach/schedule?date=${date}`

    if (rescheduleBooking) {
      url += `&reschedule=${rescheduleBooking.id}`
    }

    window.location.href = url
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
    goToDate(new Date().toISOString().split("T")[0])
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
    alert(JSON.stringify(overrides, null, 2))
    await supabase.from("date_overrides").upsert(overrides, {
      onConflict: "coach_id,lesson_date,lesson_time",
    })

    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Coach Schedule</h1>

          <p className="mt-2 text-gray-600">Welcome back, {coachName}</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button onClick={previousDay} className="rounded-lg border bg-white px-4 py-2 shadow-sm">
            ← Previous
          </button>

          <button onClick={today} className="rounded-lg border bg-white px-4 py-2 shadow-sm">
            Today
          </button>

          <button onClick={nextDay} className="rounded-lg border bg-white px-4 py-2 shadow-sm">
            Next →
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => goToDate(e.target.value)}
            className="rounded-lg border bg-white px-4 py-2"
          />

          <button onClick={closeDay} className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
            Close Day
          </button>

          <button
            onClick={() => setShowExtendModal(true)}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
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

        <div className="overflow-hidden rounded-2xl border bg-white shadow-lg">
          <div className="grid grid-cols-[120px_1fr] border-b bg-gray-50">
            <div className="border-r p-4 font-bold">Time</div>

            <div className="p-4 font-bold">Schedule</div>
          </div>

          {hours.map((hour) => {
            const booking = getBookingForHour(hour)

            const available = isAvailableHour(hour)

            const breakHour = isBreakHour(hour)

            const overrideClosed = isOverrideClosed(hour)

            const overrideOpen = isOverrideOpen(hour)

            let bgClass = "bg-gray-300"

            if (available && !breakHour) {
              bgClass = "bg-white"
            }

            if (overrideOpen) {
              bgClass = "bg-white"
            }

            if (overrideClosed) {
              bgClass = "bg-gray-300"
            }
            if (overrideClosed) {
              bgClass = "bg-gray-300"
            }

            if (booking) {
              if (booking.status === "completed") {
                bgClass = "bg-sky-200"
              } else {
                bgClass = booking.clients?.lessons_remaining === 0 ? "bg-yellow-200" : "bg-green-200"
              }
            }

            return (
              <div key={hour} className="grid grid-cols-[120px_1fr] border-b">
                <div className="border-r bg-gray-50 p-4 font-semibold">{formatHour(hour)}</div>

                <button
                  onClick={() => toggleSlot(hour)}
                  className={`h-20 w-full px-4 text-left transition hover:brightness-95 ${bgClass}`}
                >
                  {booking ? (
                    <div>
                      <p className="font-bold">{booking.clients?.name}</p>

                      <p className="text-sm text-gray-700">
                        {booking.status === "completed" ? "Completed Lesson" : "Booked Lesson"}
                      </p>
                    </div>
                  ) : overrideClosed ? (
                    <p className="text-gray-600">Closed (Override)</p>
                  ) : overrideOpen ? (
                    <p className="text-gray-500">Available (Override)</p>
                  ) : breakHour ? (
                    <p className="text-gray-600">Break</p>
                  ) : available ? (
                    <p className="text-gray-500">Available</p>
                  ) : (
                    <p className="text-gray-600">Closed</p>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold">Client Details</h2>

              <button onClick={() => setSelectedBooking(null)} className="text-2xl font-bold">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <Link
                  href={`/coach/clients/${selectedBooking.clients?.id}`}
                  className="text-xl font-semibold underline text-blue-600 hover:text-blue-800"
                >
                  {selectedBooking.clients?.name}
                </Link>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{selectedBooking.clients?.phone || "No phone added"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{selectedBooking.clients?.email || "No email added"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p>{selectedBooking.clients?.notes || "No notes"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Lessons Remaining</p>
                <p className="font-bold">{selectedBooking.clients?.lessons_remaining}</p>
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
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      const today = new Date()

                      const todayString = today.toISOString().split("T")[0]

                      if (selectedBooking.lesson_date !== todayString) {
                        alert("Please reschedule the appointment to today before completing.")
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

                      setShowCompleteModal(true)
                    }}
                    className="rounded-lg bg-sky-400 px-4 py-2 text-white hover:bg-sky-500"
                  >
                    Completed
                  </button>

                  <button
                    onClick={() => {
                      setRescheduleBooking(selectedBooking)
                      setSelectedBooking(null)
                    }}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    Reschedule Lesson
                  </button>

                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    Cancel Lesson
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Complete Lesson</h2>

            {selectedBooking.clients?.lessons_remaining === 0 && (
              <div className="mb-4">
                <p className="mb-2 font-medium">Payment Method</p>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border p-3"
                >
                  <option value="">Select payment method</option>

                  <option value="cash">Cash</option>

                  <option value="card">Card</option>

                  <option value="transfer">Transfer</option>

                  <option value="e-wallet">E-wallet</option>

                  <option value="free lesson">Free Lesson</option>
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCompleteModal(false)
                  setPaymentMethod("")
                }}
                className="rounded-lg border px-4 py-2"
              >
                Close
              </button>

              <button
                onClick={async () => {
                  if (selectedBooking.clients?.lessons_remaining === 0 && !paymentMethod) {
                    alert("Please select a payment method.")

                    return
                  }

                  const todayDate = new Date().toISOString().split("T")[0]

                  await supabase
                    .from("bookings")
                    .update({
                      status: "completed",
                      completion_date: todayDate,
                      payment_method: selectedBooking.clients?.lessons_remaining === 0 ? paymentMethod : null,
                      payment_date: selectedBooking.clients?.lessons_remaining === 0 ? todayDate : null,
                    })
                    .eq("id", selectedBooking.id)

                  if (selectedBooking.clients) {
                    const todayDate = new Date().toISOString().split("T")[0]

                    const { data: packages } = await supabase
                      .from("lesson_packages")
                      .select("*")
                      .eq("client_id", selectedBooking.clients.id)
                      .gte("expiration_date", todayDate)
                      .order("expiration_date", { ascending: true })

                    const packageToUse = packages?.find((pkg) => (pkg.lessons_added || 0) > (pkg.lessons_used || 0))

                    if (packageToUse) {
                      await supabase
                        .from("lesson_packages")
                        .update({
                          lessons_used: (packageToUse.lessons_used || 0) + 1,
                        })
                        .eq("id", packageToUse.id)

                      const { data: updatedPackages } = await supabase
                        .from("lesson_packages")
                        .select("*")
                        .eq("client_id", selectedBooking.clients.id)
                        .gte("expiration_date", todayDate)

                      const lessonsRemaining =
                        updatedPackages?.reduce((total, pkg) => {
                          return total + ((pkg.lessons_added || 0) - (pkg.lessons_used || 0))
                        }, 0) || 0

                      await supabase
                        .from("clients")
                        .update({
                          lessons_remaining: lessonsRemaining,
                        })
                        .eq("id", selectedBooking.clients.id)
                    }

                    const { data: clientData } = await supabase
                      .from("clients")
                      .select("primary_coach_id")
                      .eq("id", selectedBooking.clients.id)
                      .single()

                    if (!clientData?.primary_coach_id) {
                      await supabase
                        .from("clients")
                        .update({
                          primary_coach_id: coachId,
                        })
                        .eq("id", selectedBooking.clients.id)
                    }
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6">
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
