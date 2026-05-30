"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

type Booking = {
  id: number
  lesson_date: string
  lesson_time: string
  status: string
  clients: {
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

type Props = {
  coachName: string
  initialBookings: Booking[]
  selectedDate: string
  availability: Availability | null
  dateOverrides: DateOverride[]
}

export default function CoachDashboardClient({
  coachName,
  initialBookings,
  selectedDate,
  availability,
  dateOverrides,
}: Props) {
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null)

  const hours = []

  for (let hour = 8; hour <= 20; hour++) {
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
    return initialBookings.find((booking) =>
      booking.lesson_time.startsWith(
        String(hour).padStart(2, "0")
      )
    )
  }

  function isAvailableHour(hour: number) {
    if (!availability) {
      return false
    }

    const start = parseInt(
      availability.start_time.split(":")[0]
    )

    const end = parseInt(
      availability.end_time.split(":")[0]
    )

    return hour >= start && hour < end
  }

  function isOverrideClosed(
    hour: number
  ) {
    return dateOverrides.some(
      (override) =>
        override.lesson_time.startsWith(
          String(hour).padStart(2, "0")
        ) &&
        override.is_available === false
    )
  }

  async function toggleSlot(
    hour: number
  ) {
    const booking =
      getBookingForHour(hour)

    if (booking) {
      setSelectedBooking(
        booking
      )
      return
    }

    const override =
      dateOverrides.find(
        (item) =>
          item.lesson_time.startsWith(
            String(hour).padStart(
              2,
              "0"
            )
          )
      )

    const timeString =
      `${String(hour).padStart(
        2,
        "0"
      )}:00:00`

    if (override) {

      const confirmed =
        window.confirm(
          `Make ${formatHour(hour)} available again?`
        )

      if (!confirmed) {
        return
      }

      await supabase
        .from("date_overrides")
        .delete()
        .eq("id", override.id)

      window.location.reload()

      return
    }

    const confirmed =
      window.confirm(
        `Close ${formatHour(hour)}?`
      )

    if (!confirmed) {
      return
    }

    const coachOverride =
      dateOverrides[0]

    await supabase
      .from("date_overrides")
      .insert({
        coach_id:
          coachOverride?.coach_id,
        lesson_date:
          selectedDate,
        lesson_time:
          timeString,
        is_available: false,
      })

    window.location.reload()
  }

  function goToDate(date: string) {
    window.location.href =
      `/coach/schedule?date=${date}`
  }

  function previousDay() {
    const date = new Date(
      selectedDate
    )

    date.setDate(
      date.getDate() - 1
    )

    goToDate(
      date.toISOString().split("T")[0]
    )
  }

  function nextDay() {
    const date = new Date(
      selectedDate
    )

    date.setDate(
      date.getDate() + 1
    )

    goToDate(
      date.toISOString().split("T")[0]
    )
  }

  function today() {
    goToDate(
      new Date()
        .toISOString()
        .split("T")[0]
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-black">

      <div className="mx-auto max-w-7xl">

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Coach Schedule
          </h1>

          <p className="mt-2 text-gray-600">
            Welcome back, {coachName}
          </p>

        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">

          <button
            onClick={previousDay}
            className="rounded-lg border bg-white px-4 py-2 shadow-sm"
          >
            ← Previous
          </button>

          <button
            onClick={today}
            className="rounded-lg border bg-white px-4 py-2 shadow-sm"
          >
            Today
          </button>

          <button
            onClick={nextDay}
            className="rounded-lg border bg-white px-4 py-2 shadow-sm"
          >
            Next →
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              goToDate(
                e.target.value
              )
            }
            className="rounded-lg border bg-white px-4 py-2"
          />

        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-lg">

          <div className="grid grid-cols-[120px_1fr] border-b bg-gray-50">

            <div className="border-r p-4 font-bold">
              Time
            </div>

            <div className="p-4 font-bold">
              Schedule
            </div>

          </div>

          {hours.map((hour) => {

            const booking =
              getBookingForHour(hour)

            const available =
              isAvailableHour(hour)

            const overrideClosed =
              isOverrideClosed(hour)

            let bgClass =
              "bg-gray-300"

            if (available) {
              bgClass =
                "bg-white"
            }

            if (overrideClosed) {
              bgClass =
                "bg-gray-300"
            }

            if (booking) {
              bgClass =
                booking.clients
                  ?.lessons_remaining === 0
                  ? "bg-yellow-200"
                  : "bg-green-200"
            }

            return (

              <div
                key={hour}
                className="grid grid-cols-[120px_1fr] border-b"
              >

                <div className="border-r bg-gray-50 p-4 font-semibold">

                  {formatHour(hour)}

                </div>

                <button
                  onClick={() =>
                    toggleSlot(hour)
                  }
                  className={`h-20 w-full px-4 text-left transition hover:brightness-95 ${bgClass}`}
                >

                  {booking ? (

                    <div>

                      <p className="font-bold">
                        {
                          booking.clients
                            ?.name
                        }
                      </p>

                      <p className="text-sm text-gray-700">
                        Booked Lesson
                      </p>

                    </div>

                  ) : overrideClosed ? (

                    <p className="text-gray-600">
                      Closed (Override)
                    </p>

                  ) : available ? (

                    <p className="text-gray-500">
                      Available
                    </p>

                  ) : (

                    <p className="text-gray-600">
                      Closed
                    </p>

                  )}

                </button>

              </div>

            )
          })}

        </div>

      </div>

      {selectedBooking && (

        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-6">

          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-3xl font-bold">
                Client Details
              </h2>

              <button
                onClick={() =>
                  setSelectedBooking(
                    null
                  )
                }
                className="text-2xl font-bold"
              >
                ×
              </button>

            </div>

            <div className="space-y-4">

              <div>
                <p className="text-sm text-gray-500">
                  Client
                </p>
                <p className="text-xl font-semibold">
                  {selectedBooking.clients?.name}
                </p>
              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  )
}