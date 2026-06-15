"use client"
import { useEffect, useRef, useState } from "react"
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
  const [selectedCoachData, setSelectedCoachData] = useState<any>(null)
  const bookingSummaryRef = useRef<HTMLDivElement>(null)
  

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

  useEffect(() => {
    if (selectedTime && bookingSummaryRef.current) {
      bookingSummaryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [selectedTime])

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

    const todayString = new Date().toISOString().split("T")[0]
    const daysDifference = Math.floor(
      (new Date(formattedDate + "T00:00:00").getTime() - new Date(todayString + "T00:00:00").getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (daysDifference <= 1 && booking) {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          coach_id: selectedCoach,
          client_id: client.id,
          booking_id: booking.id,
          type: "late_booking",
          message: "Late booking requires review.",
          is_urgent: true,
          is_read: false,
        })
        .select()

      if (error) {
        alert("NOTIFICATION FAILED:\n\n" + JSON.stringify(error, null, 2))
      }
    }

    alert("Booking confirmed!")
    setSelectedTime("")
    await generateSlots()
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 lg:p-10 text-black">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-center lg:text-left text-2xl lg:text-3xl font-bold">          Book a Lesson
        </h1>

        <div className="rounded-2xl bg-white p-4 lg:p-8 shadow-lg">
          <div className="grid gap-6 lg:gap-10 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-lg font-semibold">Select Coach</label>
              <select
                value={selectedCoach ?? ""}
                onChange={async (e) => {
                  const coachId = Number(e.target.value)
                  setSelectedCoach(coachId)
                  setSelectedTime("")
                  const { data } = await supabase.from("coaches").select("*").eq("id", coachId).single()
                  setSelectedCoachData(data)
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

              {selectedCoachData && (
                <div className="mt-4 rounded-xl border bg-white p-4">
                  {selectedCoachData.photo_url && (
                    <img
                      src={selectedCoachData.photo_url}
                      alt={selectedCoachData.name}
                      className="mb-4 w-[75%] mx-auto rounded-lg"
                    />
                  )}

                  {selectedCoachData.specializations && (
                    <div className="mt-3 whitespace-pre-line">{selectedCoachData.specializations}</div>
                  )}
                </div>
              )}
            </div>

            {/* CALENDAR */}

            <div>
              <label className="mb-4 block text-lg font-semibold">Select Date</label>

              <div className="rounded-xl border pt-4 lg:pt-10 pb-4 px-5 h-fit flex flex-col items-center">
                <DayPicker
                  className="scale-90 lg:scale-90 origin-top -mb-6 lg:mb-0"
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

                <div className="mt-2 lg:mt-6 border-t pt-2 lg:pt-4 min-h-[60px] lg:min-h-[80px] w-full flex flex-col items-center">
                  <h3 className="mb-3 text-base font-semibold text-center">Available Time Slots</h3>

                  {timeSlots.length === 0 ? (
                    <p className="text-sm text-gray-500">No available slots.</p>
                  ) : (
                    <div className="mx-auto max-w-[340px]">
                      <div className="flex flex-wrap justify-center gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                              selectedTime === time
                                ? "bg-green-700 hover:bg-green-800"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BOOKING SUMMARY */}

          {selectedTime && (
            <div
              ref={bookingSummaryRef}
              className="mt-10 rounded-2xl bg-gray-100 p-6"
            >
              <h3 className="text-[16px] font-bold">Selected Booking</h3>
              <p className="mt-4 text-base">Coach: {coaches.find((coach) => coach.id === selectedCoach)?.name}</p>
              <p className="text-base">Date: {selectedDate?.toLocaleDateString()}</p>
              <p className="text-base">Time: {selectedTime}</p>

              <button
                onClick={confirmBooking}
                disabled={loading}
                className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
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
