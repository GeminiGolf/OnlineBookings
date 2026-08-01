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
  const [completedDates, setCompletedDates] = useState<Date[]>([])
  const [upcomingDates, setUpcomingDates] = useState<Date[]>([])
  const [noShowDates, setNoShowDates] = useState<Date[]>([])

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

  useEffect(() => {
    async function loadLessonDates() {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("lesson_date, status")
        .eq("client_id", clientId)

      if (!bookings) return

      setCompletedDates(
        bookings
          .filter((b) => b.status === "completed")
          .map((b) => new Date(b.lesson_date))
      )

      setUpcomingDates(
        bookings
          .filter((b) => b.status === "booked")
          .map((b) => new Date(b.lesson_date))
      )

      setNoShowDates(
        bookings
          .filter((b) => b.status === "no_show")
          .map((b) => new Date(b.lesson_date))
      )
    }

    loadLessonDates()
  }, [clientId])


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
        booked_by: "coach",
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
    <div className="rounded-3xl border border-[#3A5D49] bg-white p-3 shadow-md lg:px-6 lg:py-5">
      <h2 className="dashboard-heading mb-3">
        Book A Lesson
      </h2>

      <div className="mx-auto w-fit overflow-hidden rounded-2xl border border-[#3A5D49] bg-[#FBF8F3] px-2 pt-2 pb-0 text-sm">
        <DayPicker
          className="coach-calendar mt-2 -mb-8 origin-top scale-90 lg:scale-[0.82]"
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
          modifiers={{
            completedLesson: completedDates,
            upcomingLesson: upcomingDates,
            noShowLesson: noShowDates,
          }}
          modifiersClassNames={{
            completedLesson: "bg-sky-300 text-black rounded-md",
            upcomingLesson: "bg-gray-300 text-black rounded-md",
            noShowLesson: "bg-red-300 text-black rounded-md",
          }}
        />
      </div>

      <div className="mt-3">
        <h3 className="dashboard-heading mb-3">
          Available Time Slots
        </h3>

        {timeSlots.length === 0 ? (
          <p className="dashboard-value text-[#6D7F72]">
            No available slots.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-xl border px-4 py-2 text-[15px] font-light transition ${
                  selectedTime === time
                    ? "border-[#2F5A43] bg-[#2F5A43] text-white"
                    : "border-[#3A5D49] bg-[#FBF8F3] text-[#1F3327] hover:bg-[#F6FAF6]"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTime && (
        <div className="mt-6 rounded-2xl border border-[#3A5D49] bg-white p-5 shadow-sm">
          <p className="dashboard-label">
            Date
          </p>

          <p className="dashboard-value mb-4">
            {selectedDate?.toLocaleDateString()}
          </p>

          <p className="dashboard-label">
            Time
          </p>

          <p className="dashboard-value">
            {selectedTime}
          </p>

          <button
            onClick={confirmBooking}
            disabled={loading}
            className="mt-5 rounded-xl border border-[#3A5D49] bg-[#2F5A43] px-6 py-3 text-[15px] font-light text-white shadow-sm transition hover:bg-[#244634]"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  )
}