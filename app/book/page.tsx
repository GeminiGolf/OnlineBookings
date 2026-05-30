"use client"

import { useEffect, useState } from "react"

import { createClient }
from "@/lib/supabaseClient"

import { DayPicker }
from "react-day-picker"

import "react-day-picker/dist/style.css"

const supabase =
  createClient()

type Coach = {
  id: number
  name: string
}

export default function BookPage() {

  const [coaches, setCoaches] =
    useState<Coach[]>([])

  const [selectedCoach, setSelectedCoach] =
    useState<number | null>(null)

  const [selectedDate, setSelectedDate] =
    useState<Date | undefined>()

  const [timeSlots, setTimeSlots] =
    useState<string[]>([])

  const [selectedTime, setSelectedTime] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {

    fetchCoaches()

  }, [])

  async function fetchCoaches() {

    const {
      data,
    } = await supabase
      .from("coaches")
      .select("*")

    if (data) {

      setCoaches(data)
    }
  }

  useEffect(() => {

    generateSlots()

  }, [selectedDate, selectedCoach])

  function formatHour(
    hour: number
  ) {

    const suffix =
      hour >= 12
        ? "PM"
        : "AM"

    const formattedHour =
      hour % 12 || 12

    return `${formattedHour}:00 ${suffix}`
  }

  async function generateSlots() {

    if (
      !selectedDate ||
      !selectedCoach
    ) {

      setTimeSlots([])

      return
    }

    const day =
      selectedDate.getDay()

    // SUNDAY CLOSED

    if (day === 0) {

      setTimeSlots([])

      return
    }

    const slots: string[] = []

    // MONDAY-SATURDAY
    // 8AM - 8PM

    for (
      let hour = 8;
      hour < 20;
      hour++
    ) {

      slots.push(
        formatHour(hour)
      )
    }

    // FORMAT DATE

    const formattedDate =
      selectedDate
        .toISOString()
        .split("T")[0]

    // GET EXISTING BOOKINGS

    const {
      data: existingBookings,
    } = await supabase
      .from("bookings")
      .select("lesson_time")
      .eq(
        "coach_id",
        selectedCoach
      )
      .eq(
        "lesson_date",
        formattedDate
      )

    const bookedTimes =
      existingBookings?.map(
        (booking) =>
          booking.lesson_time
      ) || []

    // REMOVE BOOKED TIMES

    let availableSlots =
      slots.filter(
        (slot) =>
          !bookedTimes.includes(slot)
      )

    // REMOVE PAST TIMES FOR TODAY

    const today =
      new Date()

    const selectedDayString =
      selectedDate.toDateString()

    const todayString =
      today.toDateString()

    const isToday =
      selectedDayString ===
      todayString

    if (isToday) {

      availableSlots =
        availableSlots.filter(
          (slot) => {

            const hour =
              parseInt(
                slot.split(":")[0]
              )

            const isPM =
              slot.includes("PM")

            let militaryHour =
              hour

            if (
              isPM &&
              hour !== 12
            ) {

              militaryHour += 12
            }

            if (
              !isPM &&
              hour === 12
            ) {

              militaryHour = 0
            }

            return (
              militaryHour >
              today.getHours()
            )
          }
        )
    }

    setTimeSlots(
      availableSlots
    )
  }

  async function confirmBooking() {

    if (
      !selectedCoach ||
      !selectedDate ||
      !selectedTime
    ) {

      return
    }

    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // NOT LOGGED IN

    if (!session) {

      localStorage.setItem(
        "redirectAfterLogin",
        "/book"
      )

      alert(
        "Please login or create an account to confirm your booking."
      )

      window.location.href =
        "/login"

      return
    }

    const formattedDate =
      selectedDate
        .toISOString()
        .split("T")[0]

    // DOUBLE BOOKING CHECK

    const {
      data: existingBooking,
    } = await supabase
      .from("bookings")
      .select("*")
      .eq(
        "coach_id",
        selectedCoach
      )
      .eq(
        "lesson_date",
        formattedDate
      )
      .eq(
        "lesson_time",
        selectedTime
      )
      .maybeSingle()

    if (existingBooking) {

      alert(
        "This slot is already booked."
      )

      setLoading(false)

      return
    }

    // INSERT BOOKING

    const {
      error,
    } = await supabase
      .from("bookings")
      .insert({
        client_id: 1,
        coach_id: selectedCoach,
        lesson_date: formattedDate,
        lesson_time: selectedTime,
        status: "booked",
      })

    if (error) {

      console.error(error)

      alert(
        "Booking failed."
      )

      setLoading(false)

      return
    }

    alert(
      "Booking confirmed!"
    )

    setSelectedTime("")

    // REFRESH SLOTS

    await generateSlots()

    setLoading(false)
  }

  return (

    <main className="min-h-screen bg-gray-100 p-10 text-black">

      <div className="mx-auto max-w-5xl">

        <h1 className="mb-8 text-5xl font-bold">

          Book a Lesson

        </h1>

        <div className="rounded-2xl bg-white p-8 shadow-lg">

          <div className="grid gap-10 md:grid-cols-2">

            {/* COACH */}

            <div>

              <label className="mb-2 block text-lg font-semibold">

                Select Coach

              </label>

              <select
                value={
                  selectedCoach ?? ""
                }
                onChange={(e) => {

                  setSelectedCoach(
                    Number(
                      e.target.value
                    )
                  )

                  setSelectedTime("")
                }}
                className="w-full rounded-xl border p-4"
              >

                <option value="">
                  Choose a coach
                </option>

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

            {/* CALENDAR */}

            <div>

              <label className="mb-4 block text-lg font-semibold">

                Select Date

              </label>

              <div className="rounded-xl border bg-white p-4">

                <DayPicker
                  mode="single"
                  selected={
                    selectedDate
                  }
                  onSelect={(date) => {

                    setSelectedDate(date)

                    setSelectedTime("")
                  }}
                  disabled={[
                    {
                      before:
                        new Date(),
                    },
                    {
                      dayOfWeek: [0],
                    },
                  ]}
                />

              </div>

            </div>

          </div>

          {/* TIME SLOTS */}

          <div className="mt-10">

            <h2 className="mb-4 text-2xl font-bold">

              Available Time Slots

            </h2>

            {timeSlots.length === 0 ? (

              <p className="text-gray-500">

                No available slots.

              </p>

            ) : (

              <div className="flex flex-wrap gap-4">

                {timeSlots.map((time) => (

                  <button
                    key={time}
                    onClick={() =>
                      setSelectedTime(time)
                    }
                    className={`rounded-xl px-6 py-4 font-semibold text-white transition ${
                      selectedTime === time
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >

                    {time}

                  </button>

                ))}

              </div>

            )}

          </div>

          {/* BOOKING SUMMARY */}

          {selectedTime && (

            <div className="mt-10 rounded-2xl bg-gray-100 p-6">

              <h3 className="text-2xl font-bold">

                Selected Booking

              </h3>

              <p className="mt-4 text-lg">

                Coach:{" "}

                {
                  coaches.find(
                    (coach) =>
                      coach.id ===
                      selectedCoach
                  )?.name
                }

              </p>

              <p className="text-lg">

                Date:{" "}

                {
                  selectedDate?.toLocaleDateString()
                }

              </p>

              <p className="text-lg">

                Time: {selectedTime}

              </p>

              <button
                onClick={confirmBooking}
                disabled={loading}
                className="mt-6 rounded-xl bg-black px-8 py-4 text-lg font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >

                {
                  loading
                    ? "Booking..."
                    : "Confirm Booking"
                }

              </button>

            </div>

          )}

        </div>

      </div>

    </main>
  )
}