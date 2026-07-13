"use client"

import { useEffect, useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { supabase } from "@/lib/supabaseClient"
import { generateSlots } from "@/lib/scheduling/generateSlots"

type Props = {
  clientId: number
  coachId: number
}

export default function CoachBookLessonCard({
  clientId,
  coachId,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !coachId) {
        setTimeSlots([])
        return
      }

      const slots = await generateSlots(
        supabase,
        coachId,
        selectedDate
      )

      setTimeSlots(slots)
    }

    loadSlots()
  }, [selectedDate, coachId])


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
      if (selectedDate) {
        const slots = await generateSlots(
          supabase,
          coachId,
          selectedDate
        )

        setTimeSlots(slots)
      }
      return
    }

    const { error } = await supabase
      .from("bookings")
      .insert({
        client_id: clientId,
        coach_id: coachId,
        lesson_date: formattedDate,
        lesson_time: selectedTime,
        status: "booked",
        booked_by: "admin",
      })

    if (error) {
      console.error(error)
      alert("Booking failed.")
      setLoading(false)
      return
    }

    alert("Booking confirmed!")

    setSelectedTime("")
    if (selectedDate) {
      const slots = await generateSlots(
        supabase,
        coachId,
        selectedDate
      )

      setTimeSlots(slots)
    }

    window.location.reload()
  }

  return (
    <div>
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
        <h3 className="mb-3 font-bold text-black">
          Available Time Slots
        </h3>

        {timeSlots.length === 0 ? (
          <p className="text-black">
            No available slots.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-lg px-3 py-1 text-sm font-medium text-white transition ${
                  selectedTime === time
                    ? "bg-green-700"
                    : "bg-green-600"
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
          <p className="font-bold">
            Date: {selectedDate?.toLocaleDateString()}
          </p>

          <p className="font-bold">
            Time: {selectedTime}
          </p>

          <button
            onClick={confirmBooking}
            disabled={loading}
            className="mt-4 rounded-lg bg-black px-6 py-3 text-white"
          >
            {loading
              ? "Booking..."
              : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  )
}