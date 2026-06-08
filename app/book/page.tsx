"use client"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabaseClient"

import { DayPicker } from "react-day-picker"

import "react-day-picker/dist/style.css"

type Coach = {
  id: number
  name: string
}

export default function BookPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])

  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const [timeSlots, setTimeSlots] = useState<string[]>([])

  const [selectedTime, setSelectedTime] = useState("")

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCoaches()
  }, [])

  async function fetchCoaches() {
    const { data } = await supabase.from("coaches").select("*")

    if (data) {
      setCoaches(data)
    }
  }

  useEffect(() => {
    generateSlots()
  }, [selectedDate, selectedCoach])

  function formatHour(hour: number) {
    const suffix = hour >= 12 ? "PM" : "AM"

    const formattedHour = hour % 12 || 12

    return `${formattedHour}:00 ${suffix}`
  }

  async function generateSlots() {
    if (!selectedDate || !selectedCoach) {
      setTimeSlots([])

      return
    }

    const day = selectedDate.getDay()

    const year = selectedDate.getFullYear()

    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")

    const dayOfMonth = String(selectedDate.getDate()).padStart(2, "0")

    const formattedDate = `${year}-${month}-${dayOfMonth}`

    const { data: availability } = await supabase
      .from("availability")
      .select("*")
      .eq("coach_id", selectedCoach)
      .eq("day_of_week", day)
      .maybeSingle()

    const { data: dateOverrides } = await supabase
      .from("date_overrides")
      .select("*")
      .eq("coach_id", selectedCoach)
      .eq("lesson_date", formattedDate)

    const slotSet = new Set<string>()

    if (availability) {
      const start = parseInt(availability.start_time.split(":")[0])

      const end = parseInt(availability.end_time.split(":")[0])

      for (let hour = start; hour < end; hour++) {
        slotSet.add(formatHour(hour))
      }
    }

    dateOverrides?.forEach((override) => {
      const hour = parseInt(override.lesson_time.split(":")[0])

      const slot = formatHour(hour)

      if (override.is_available) {
        slotSet.add(slot)
      } else {
        slotSet.delete(slot)
      }
    })

    let availableSlots = Array.from(slotSet)

    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("lesson_time")
      .eq("coach_id", selectedCoach)
      .eq("lesson_date", formattedDate)
      .in("status", ["booked", "completed"])

    const bookedTimes = existingBookings?.map((booking) => booking.lesson_time.trim()) || []

    availableSlots = availableSlots.filter((slot) => !bookedTimes.includes(slot.trim()))

    const { data: weeklyBreaks } = await supabase
      .from("weekly_breaks")
      .select("*")
      .eq("coach_id", selectedCoach)
      .eq("day_of_week", day)

    const breakTimes = weeklyBreaks?.map((item) => formatHour(item.hour)) || []

    availableSlots = availableSlots.filter((slot) => !breakTimes.includes(slot))

    const today = new Date()

    const isToday = selectedDate.toDateString() === today.toDateString()

    if (isToday) {
      availableSlots = availableSlots.filter((slot) => {
        const hour = parseInt(slot.split(":")[0])

        const isPM = slot.includes("PM")

        let militaryHour = hour

        if (isPM && hour !== 12) {
          militaryHour += 12
        }

        if (!isPM && hour === 12) {
          militaryHour = 0
        }

        return militaryHour > today.getHours()
      })
    }

    availableSlots.sort((a, b) => {
      const convert = (time: string) => {
        const hour = parseInt(time)

        if (time.includes("PM") && hour !== 12) {
          return hour + 12
        }

        if (time.includes("AM") && hour === 12) {
          return 0
        }

        return hour
      }

      return convert(a) - convert(b)
    })

    setTimeSlots(availableSlots)
  }

  async function confirmBooking() {
    if (!selectedCoach || !selectedDate || !selectedTime) {
      return
    }

    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // NOT LOGGED IN

    if (!session) {
      localStorage.setItem("redirectAfterLogin", "/book")

      alert("Please login or create an account to confirm your booking.")

      window.location.href = "/login"

      return
    }

    const year = selectedDate.getFullYear()

    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")

    const day = String(selectedDate.getDate()).padStart(2, "0")

    const formattedDate = `${year}-${month}-${day}`
    // DOUBLE BOOKING CHECK

    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("*")
      .eq("coach_id", selectedCoach)
      .eq("lesson_date", formattedDate)
      .eq("lesson_time", selectedTime)
      .eq("status", "booked")
      .maybeSingle()

    if (existingBooking) {
      alert("This slot is already booked.")

      setLoading(false)

      return
    }

    // INSERT BOOKING

    const { data: profile } = await supabase.from("profiles").select("id").eq("id", session.user.id).single()

    if (!profile) {
      alert("Profile not found.")

      setLoading(false)

      return
    }

    const { data: client } = await supabase.from("clients").select("id").eq("profile_id", profile.id).single()

    if (!client) {
      alert("Client record not found.")

      setLoading(false)

      return
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        client_id: client.id,
        coach_id: selectedCoach,
        lesson_date: formattedDate,
        lesson_time: selectedTime,
        status: "booked",
      })
      .select()
      .single()

    if (error) {
      console.error(error)

      alert("Booking failed.")

      setLoading(false)

      return
    }

    const bookingDate = new Date(formattedDate)
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const daysDifference = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDifference <= 1 && booking) {
      await supabase.from("notifications").insert({
        coach_id: selectedCoach,
        client_id: client.id,
        booking_id: booking.id,
        type: "late_booking",
        message: "Late booking requires review.",
        is_urgent: true,
        is_read: false,
      })
    }

    alert("Booking confirmed!")

    setSelectedTime("")

    // REFRESH SLOTS

    await generateSlots()

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10 text-black">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-5xl font-bold">Book a Lesson</h1>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="grid gap-10 md:grid-cols-2">
            {/* COACH */}

            <div>
              <label className="mb-2 block text-lg font-semibold">Select Coach</label>

              <select
                value={selectedCoach ?? ""}
                onChange={(e) => {
                  setSelectedCoach(Number(e.target.value))

                  setSelectedTime("")
                }}
                className="w-full rounded-xl border p-4"
              >
                <option value="">Choose a coach</option>

                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CALENDAR */}

            <div>
              <label className="mb-4 block text-lg font-semibold">Select Date</label>

              <div className="rounded-xl border bg-white p-4">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)

                    setSelectedTime("")
                  }}
                  disabled={[
                    {
                      before: new Date(),
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* TIME SLOTS */}

          <div className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">Available Time Slots</h2>

            {timeSlots.length === 0 ? (
              <p className="text-gray-500">No available slots.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-xl px-6 py-4 font-semibold text-white transition ${
                      selectedTime === time ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
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
              <h3 className="text-2xl font-bold">Selected Booking</h3>

              <p className="mt-4 text-lg">Coach: {coaches.find((coach) => coach.id === selectedCoach)?.name}</p>

              <p className="text-lg">Date: {selectedDate?.toLocaleDateString()}</p>

              <p className="text-lg">Time: {selectedTime}</p>

              <button
                onClick={confirmBooking}
                disabled={loading}
                className="mt-6 rounded-xl bg-black px-8 py-4 text-lg font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
