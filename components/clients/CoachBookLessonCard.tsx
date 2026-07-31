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
    <div className="rounded-3xl border border-[#B9B2A8] bg-[#FEFDFC] p-4 lg:p-8 shadow-xl">
      <h2 className="mb-4 text-[18px] font-light tracking-[0.04em] text-black">
        Book A Lesson
      </h2>
      <div className="mx-auto w-fit overflow-hidden rounded-2xl border border-[#B9B2A8] bg-[#FEFDFC] px-3 pt-3 pb-0">
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
          modifiers={{
            completedLesson: completedDates,
            upcomingLesson: upcomingDates,
            noShowLesson: noShowDates,
          }}
          modifiersClassNames={{
            completedLesson: "bg-[#D6EAF4] text-black rounded-md",
            upcomingLesson: "bg-[#D6D1C8] text-black rounded-md",
            noShowLesson: "bg-[#F1D7D7] text-black rounded-md",
          }}
        />
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-[15px] font-light uppercase tracking-[0.12em] text-black">
          Available Time Slots
        </h3>

        {timeSlots.length === 0 ? (
          <p className="dashboard-value">
            No available slots.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-lg px-3 py-2 text-[13px] font-light tracking-[0.06em] text-white transition ${
                  selectedTime === time
                    ? "bg-[#244634]"
                    : "bg-[#2F5A43] hover:bg-[#3C6A50]"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedTime && (
        <div className="mt-6 rounded-2xl border border-[#B9B2A8] bg-[#F3F0EA] p-5">
          <p className="dashboard-value">
            Date: {selectedDate?.toLocaleDateString()}
          </p>
          <p className="dashboard-value">
            Time: {selectedTime}
          </p>
          <button
            onClick={confirmBooking}
            disabled={loading}
            className="mt-4 rounded-lg bg-[#486B8A] px-6 py-3 text-[13px] font-light tracking-[0.06em] text-white transition hover:bg-[#3C6A50]"
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