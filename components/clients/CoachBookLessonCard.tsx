"use client"

import { useEffect, useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  clientId: number
  coachId: number
}

export default function CoachBookLessonCard({ clientId, coachId }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateSlots()
  }, [selectedDate, coachId])

  function formatHour(hour: number) {
    const suffix = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12

    return `${formattedHour}:00 ${suffix}`
  }

  async function generateSlots() {
    if (!selectedDate || !coachId) {
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
      .eq("coach_id", coachId)
      .eq("day_of_week", day)

    const slotSet = new Set<string>()

    availability?.forEach((row) => {
      const start = parseInt(row.start_time.split(":")[0])
      const end = parseInt(row.end_time.split(":")[0])

      for (let hour = start; hour < end; hour++) {
        slotSet.add(formatHour(hour))
      }
    })

    const { data: dateOverrides } = await supabase
      .from("date_overrides")
      .select("*")
      .eq("coach_id", coachId)
      .eq("lesson_date", formattedDate)

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

    const { data: bookings } = await supabase
      .from("bookings")
      .select("lesson_time")
      .eq("coach_id", coachId)
      .eq("lesson_date", formattedDate)
      .in("status", ["booked", "completed"])
    const bookedTimes = bookings?.map((booking) => booking.lesson_time.trim()) || []
    availableSlots = availableSlots.filter((slot) => !bookedTimes.includes(slot.trim()))
    const { data: weeklyBreaks } = await supabase
      .from("weekly_breaks")
      .select("*")
      .eq("coach_id", coachId)
      .eq("day_of_week", day)
    const breakTimes = weeklyBreaks?.map((item) => formatHour(item.hour)) || []
    availableSlots = availableSlots.filter((slot) => !breakTimes.includes(slot))
    const today = new Date()

    if (selectedDate.toDateString() === today.toDateString()) {
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
    if (!selectedDate || !selectedTime) {
      return
    }
    const confirmed = window.confirm(
      `Book lesson?\n\nDate: ${selectedDate.toLocaleDateString()}\nTime: ${selectedTime}`
    )
    if (!confirmed) {
      return
    }
    setLoading(true)

    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
    const day = String(selectedDate.getDate()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("*")
      .eq("coach_id", coachId)
      .eq("lesson_date", formattedDate)
      .eq("lesson_time", selectedTime)
      .eq("status", "booked")
      .maybeSingle()

    if (existingBooking) {
      alert("This slot is already booked.")
      setLoading(false)
      await generateSlots()
      return
    }
    const { error } = await supabase.from("bookings").insert({
      client_id: clientId,
      coach_id: coachId,
      lesson_date: formattedDate,
      lesson_time: selectedTime,
      status: "booked",
    })
    if (error) {
      console.error(error)
      alert("Booking failed.")
      setLoading(false)
      return
    }

    alert("Booking confirmed!")
    setSelectedTime("")
    await generateSlots()
    window.location.reload()
  }

  return (
    <div className="rounded-2xl bg-white p-3 lg:p-8 shadow">
      <h2 className="mb-3 text-[18px] font-bold text-black">Book A Lesson</h2>
      <div className="mx-auto w-fit rounded-xl border px-3 pt-3 pb-0 text-sm overflow-hidden">
        <DayPicker
          className="mt-4 -mb-4 scale-90 lg:scale-90 origin-top"
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

      <div className="mt-6">
        <h3 className="mb-3 font-bold text-black">Available Time Slots</h3>
        {timeSlots.length === 0 ? (
          <p className="text-black">No available slots.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-lg px-3 py-1 text-sm font-medium text-white transition ${
                  selectedTime === time ? "bg-green-700" : "bg-green-600"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTime && (
        <div className="mt-6 rounded-xl bg-gray-100 p-4">
          <p className="font-bold">Date: {selectedDate?.toLocaleDateString()}</p>
          <p className="font-bold">Time: {selectedTime}</p>
          <button onClick={confirmBooking} disabled={loading} className="mt-4 rounded-lg bg-black px-6 py-3 text-white">
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  )
}
