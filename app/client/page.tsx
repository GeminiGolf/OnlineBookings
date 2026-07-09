"use client"

import { useEffect, useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { supabase } from "@/lib/supabaseClient"
import { getAvailability } from "@/lib/getAvailability"
import { generateTimeSlots } from "@/lib/generateTimeSlots"

type Coach = {
  id: number
  name: string
}

type Booking = {
  coach_id: number
  lesson_time: string
}

type Availability = {
  day_of_week: number
  start_time: string
  end_time: string
}

export default function ClientPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])

  const [bookings, setBookings] = useState<Booking[]>([])

  const [times, setTimes] = useState<string[]>([])

  const [availability, setAvailability] = useState<Availability[]>([])

  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [selectedTime, setSelectedTime] = useState("")

  function formatTime(time: string) {
    const [hourString] = time.split(":")

    const hour = parseInt(hourString)

    const suffix = hour >= 12 ? "PM" : "AM"

    const formattedHour = hour % 12 === 0 ? 12 : hour % 12

    return `${formattedHour}:00 ${suffix}`
  }

  function isPastTime(time: string) {
    if (!selectedDate) return false

    const now = new Date()

    const selected = new Date(selectedDate)

    const isToday = now.toDateString() === selected.toDateString()

    if (!isToday) return false

    const currentHour = now.getHours()

    const slotHour = parseInt(time.split(":")[0])

    return slotHour <= currentHour
  }

  useEffect(() => {
    async function fetchCoaches() {
      const { data, error } = await supabase.from("coaches").select("*")

      if (error) {
        console.error(error)
      } else {
        setCoaches(data)
      }
    }

    async function fetchBookings() {
      const { data, error } = await supabase.from("bookings").select("*")

      if (error) {
        console.error(error)
      } else {
        setBookings(data)
      }
    }

    fetchCoaches()
    fetchBookings()
  }, [])

  useEffect(() => {
    if (!selectedCoach || !selectedDate) return

    const selectedDay = selectedDate.getDay()

    const matchingAvailability = availability.filter((item) => item.day_of_week === selectedDay)

    if (matchingAvailability.length === 0) {
      setTimes([])

      return
    }

    let allSlots: string[] = []

    matchingAvailability.forEach((item) => {
      const slots = generateTimeSlots(item.start_time, item.end_time)

      allSlots = [...allSlots, ...slots]
    })

    const uniqueSlots = [...new Set(allSlots)]

    uniqueSlots.sort()

    setTimes(uniqueSlots)
  }, [selectedDate, selectedCoach, availability])

  async function loadAvailability(coachId: number) {
    const data = await getAvailability(coachId)

    setAvailability(data)

    setTimes([])
  }

  async function createBooking(coachId: number) {
    if (!selectedDate) return

    const year = selectedDate.getFullYear()

    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")

    const day = String(selectedDate.getDate()).padStart(2, "0")

    const formattedDate = `${year}-${month}-${day}`

    const { error } = await supabase.from("bookings").insert([
      {
        client_id: 1,
        coach_id: coachId,
        lesson_date: formattedDate,
        lesson_time: selectedTime,
        status: "booked",
      },
    ])

    if (error) {
      console.error(error)

      alert("Booking failed")
    } else {
      alert("Booking successful!")

      const { data } = await supabase.from("bookings").select("*")

      if (data) {
        setBookings(data)
      }

      setSelectedTime("")
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-3 text-5xl font-bold text-black">Book A Lesson</h1>

        <p className="mb-10 text-lg text-gray-700">Choose your coach, date, and time.</p>

        {/* COACH */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-3xl font-bold text-black">Choose Coach</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {coaches.map((coach) => (
              <button
                key={coach.id}
                onClick={() => {
                  setSelectedCoach(coach)

                  setSelectedDate(null)

                  setSelectedTime("")

                  loadAvailability(coach.id)
                }}
                className={`rounded-xl border-2 p-6 text-left text-2xl font-bold transition ${
                  selectedCoach?.id === coach.id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                {coach.name}
              </button>
            ))}
          </div>
        </div>

        {/* CALENDAR */}
        {selectedCoach && (
          <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-3xl font-bold text-black">Select Date</h2>

            <div className="flex justify-center">
              <Calendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
                minDate={new Date()}
                className="rounded-xl border p-4"
              />
            </div>

            {selectedDate && (
              <p className="mt-6 text-center text-2xl font-bold text-blue-700">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        )}

        {/* TIMES */}
        {selectedCoach && selectedDate && (
          <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-3xl font-bold text-black">Available Times</h2>

            {times.length === 0 ? (
              <p className="text-center text-xl font-semibold text-red-600">No availability for this day</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {times
                  .filter((time) => {
                    const booked = bookings.some(
                      (booking) => booking.coach_id === selectedCoach.id && booking.lesson_time === time
                    )

                    const past = isPastTime(time)

                    return !booked && !past
                  })
                  .map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-xl p-5 text-xl font-bold transition ${
                        selectedTime === time
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-900 hover:bg-green-200"
                      }`}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
              </div>
            )}

            {selectedTime && (
              <button
                onClick={() => createBooking(selectedCoach.id)}
                className="mt-8 w-full rounded-xl bg-black p-5 text-2xl font-bold text-white transition hover:bg-gray-800"
              >
                Confirm Booking
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
