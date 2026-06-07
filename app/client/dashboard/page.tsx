"use client"

import { useEffect, useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { supabase } from "@/lib/supabaseClient"

type Coach = {
  id: number
  name: string
  preferred_name: string | null
}

type ClientData = {
  id: number
  name: string
  phone: string | null
  email: string | null
  lessons_remaining: number
  primary_coach_id: number | null
}

export default function ClientDashboard() {
  const [client, setClient] = useState<ClientData | null>(null)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([])
  const [previousLessons, setPreviousLessons] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [completedDates, setCompletedDates] = useState<Date[]>([])
  const [upcomingDates, setUpcomingDates] = useState<Date[]>([])
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleLesson, setRescheduleLesson] = useState<any>(null)
  const [rescheduleDate, setRescheduleDate] = useState<Date>()
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([])
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [selectedLessonNote, setSelectedLessonNote] = useState<any>(null)
  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    generateSlots()
  }, [selectedDate, selectedCoach])

  async function loadDashboardData() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return
    }

    const { data: clientRecord } = await supabase.from("clients").select("*").eq("profile_id", session.user.id).single()

    if (!clientRecord) {
      return
    }

    setClient(clientRecord)

    const { data: upcoming } = await supabase
      .from("bookings")
      .select("*")
      .eq("client_id", clientRecord.id)
      .eq("status", "booked")
      .order("lesson_date", { ascending: true })

    setUpcomingLessons(upcoming || [])

    const { data: previous } = await supabase
      .from("bookings")
      .select("*")
      .eq("client_id", clientRecord.id)
      .eq("status", "completed")
      .order("lesson_date", { ascending: false })

    setPreviousLessons(previous || [])

    const completedLessonDates = (previous || []).map((lesson) => new Date(lesson.lesson_date))

    setCompletedDates(completedLessonDates)

    const upcomingLessonDates = (upcoming || []).map((lesson) => new Date(lesson.lesson_date))

    setUpcomingDates(upcomingLessonDates)

    const { data: packageData } = await supabase
      .from("lesson_packages")
      .select("*")
      .eq("client_id", clientRecord.id)
      .order("purchase_date", { ascending: false })

    setPackages(packageData || [])

    if (clientRecord.primary_coach_id) {
      const { data: coach } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", clientRecord.primary_coach_id)
        .single()

      if (coach) {
        setCoaches([coach])
        setSelectedCoach(coach.id)
      }

      return
    }

    const { data: allCoaches } = await supabase.from("coaches").select("*")

    if (allCoaches) {
      setCoaches(allCoaches)
    }
  }

  function timeTo24Hour(time: string) {
    let hour = parseInt(time)

    const isPM = time.includes("PM")
    const isAM = time.includes("AM")

    if (isPM && hour !== 12) {
      hour += 12
    }

    if (isAM && hour === 12) {
      hour = 0
    }

    return hour
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)

    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = String(date.getFullYear()).slice(-2)

    return `${day}/${month}/${year}`
  }

  function formatLessonTime(time: string) {
    return time.replace(":00", "")
  }
  function canCancelLesson(lessonDate: string, lessonTime: string) {
    const [year, month, day] = lessonDate.split("-").map(Number)

    let hour = parseInt(lessonTime)

    if (lessonTime.toUpperCase().includes("PM") && hour !== 12) {
      hour += 12
    }

    if (lessonTime.toUpperCase().includes("AM") && hour === 12) {
      hour = 0
    }

    const lessonDateTime = new Date(year, month - 1, day, hour, 0, 0)

    const cutoff = new Date(lessonDateTime.getTime() - 12 * 60 * 60 * 1000)

    return new Date() <= cutoff
  }

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
      .eq("coach_id", selectedCoach)
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
      .eq("coach_id", selectedCoach)
      .eq("lesson_date", formattedDate)
      .in("status", ["booked", "completed"])

    const bookedTimes = bookings?.map((booking) => booking.lesson_time.trim()) || []

    availableSlots = availableSlots.filter((slot) => !bookedTimes.includes(slot.trim()))

    const { data: weeklyBreaks } = await supabase
      .from("weekly_breaks")
      .select("*")
      .eq("coach_id", selectedCoach)
      .eq("day_of_week", day)

    const breakTimes = weeklyBreaks?.map((item) => formatHour(item.hour)) || []

    availableSlots = availableSlots.filter((slot) => !breakTimes.includes(slot))

    const today = new Date()

    if (selectedDate.toDateString() === today.toDateString()) {
      availableSlots = availableSlots.filter((slot) => {
        const hour = parseInt(slot)

        return hour > today.getHours()
      })
    }

    setTimeSlots(availableSlots)
  }

  async function generateRescheduleSlots(date: Date) {
    if (!rescheduleLesson) {
      return
    }

    const coachId = rescheduleLesson.coach_id

    const day = date.getDay()

    const year = date.getFullYear()

    const month = String(date.getMonth() + 1).padStart(2, "0")

    const dayOfMonth = String(date.getDate()).padStart(2, "0")

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

    const { data: bookings } = await supabase
      .from("bookings")
      .select("lesson_time")
      .eq("coach_id", coachId)
      .eq("lesson_date", formattedDate)
      .eq("status", "booked")

    const bookedTimes = bookings?.map((booking) => booking.lesson_time.trim()) || []

    const slots = Array.from(slotSet).filter((slot) => !bookedTimes.includes(slot.trim()))

    setRescheduleSlots(slots)
  }

  async function openReschedule(lesson: any) {
    if ((lesson.client_reschedules || 0) >= 3) {
      alert("This lesson has been rescheduled 3 times.\n\nPlease contact your coach or cancel your lesson.")

      return
    }

    setRescheduleLesson(lesson)
    setRescheduleDate(undefined)
    setRescheduleTime("")
    setRescheduleSlots([])
    setShowRescheduleModal(true)
  }

  async function confirmReschedule() {
    if (!rescheduleLesson || !rescheduleDate || !rescheduleTime) {
      return
    }

    const confirmed = window.confirm("Confirm reschedule?")

    if (!confirmed) {
      return
    }

    const oldDate = rescheduleLesson.lesson_date

    const oldTime = rescheduleLesson.lesson_time

    const year = rescheduleDate.getFullYear()

    const month = String(rescheduleDate.getMonth() + 1).padStart(2, "0")

    const day = String(rescheduleDate.getDate()).padStart(2, "0")

    const formattedDate = `${year}-${month}-${day}`

    const { error } = await supabase
      .from("bookings")
      .update({
        lesson_date: formattedDate,
        lesson_time: rescheduleTime,
        client_reschedules: (rescheduleLesson.client_reschedules || 0) + 1,
      })
      .eq("id", rescheduleLesson.id)

    if (error) {
      alert("Unable to reschedule lesson.")

      return
    }

    await supabase.from("booking_changes").insert({
      booking_id: rescheduleLesson.id,

      action_type: "rescheduled",

      performed_by: "client",

      old_date: oldDate,

      old_time: oldTime,

      new_date: formattedDate,

      new_time: rescheduleTime,
    })

    await supabase.from("notifications").insert({
      coach_id: rescheduleLesson.coach_id,

      client_id: rescheduleLesson.client_id,

      booking_id: rescheduleLesson.id,

      type: "client_rescheduled",
      is_urgent: false,
      message: `Client rescheduled lesson.\n\nOld:\n${oldDate} ${oldTime}\n\nNew:\n${formattedDate} ${rescheduleTime}`,
    })

    alert("Lesson rescheduled.")

    window.location.reload()
  }

  async function cancelLesson(lesson: any) {
    if (!canCancelLesson(lesson.lesson_date, lesson.lesson_time)) {
      alert("Cancellations within 12 hours of a lesson aren't available.\n\nPlease contact your coach.")

      return
    }

    const reason = window.prompt("Reason for cancellation:")

    if (!reason || !reason.trim()) {
      alert("Please type your reason for cancellation.")

      return
    }

    const confirmed = window.confirm("Cancel this lesson?")

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: reason.trim(),
      })
      .eq("id", lesson.id)

    if (error) {
      alert("Unable to cancel lesson.")

      return
    }

    await supabase.from("notifications").insert({
      coach_id: lesson.coach_id,

      client_id: lesson.client_id,

      booking_id: lesson.id,

      type: "client_cancelled",
      is_urgent: false,

      message: `Client cancelled lesson.\n\nDate: ${lesson.lesson_date}\nTime: ${lesson.lesson_time}\n\nReason:\n${reason.trim()}`,
    })

    alert("Lesson cancelled.")

    window.location.reload()
  }

  async function confirmBooking() {
    if (!client || !selectedCoach || !selectedDate || !selectedTime) {
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
      .eq("coach_id", selectedCoach)
      .eq("lesson_date", formattedDate)
      .eq("lesson_time", selectedTime)
      .eq("status", "booked")
      .maybeSingle()

    if (existingBooking) {
      alert("This slot is already booked.")
      setLoading(false)
      generateSlots()
      return
    }

    const { data: newBooking, error } = await supabase
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

    let isLateBooking = false

    const today = new Date()

    const bookingDate = new Date(formattedDate)

    const diffDays = Math.floor(
      (bookingDate.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      const { data: todayBookings } = await supabase
        .from("bookings")
        .select("lesson_time")
        .eq("coach_id", selectedCoach)
        .eq("lesson_date", formattedDate)
        .eq("status", "booked")

      if (todayBookings && todayBookings.length > 1) {
        const hours = todayBookings.map((b) => timeTo24Hour(b.lesson_time)).sort((a, b) => a - b)
        const lastHour = hours[hours.length - 2]
        const newHour = timeTo24Hour(selectedTime)

        if (newHour >= lastHour + 2) {
          isLateBooking = true
        }
      }
    }

    if (!isLateBooking && diffDays >= 0 && diffDays <= 2) {
      const { data: dayBookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("coach_id", selectedCoach)
        .eq("lesson_date", formattedDate)
        .eq("status", "booked")

      if ((dayBookings?.length || 0) <= 1) {
        isLateBooking = true
      }
    }

    if (isLateBooking && newBooking) {
      await supabase.from("notifications").insert({
        coach_id: selectedCoach,

        client_id: client.id,

        booking_id: newBooking.id,

        type: "late_booking",

        is_urgent: true,

        message: `Late booking requires review.\n\nDate: ${formattedDate}\nTime: ${selectedTime}`,
      })
    }

    alert("Booking confirmed!")

    setSelectedTime("")

    await generateSlots()

    await loadDashboardData()

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10 text-black">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="mb-6 text-3xl font-bold text-black">Book A Lesson</h2>

          {coaches.length > 1 && (
            <select
              value={selectedCoach ?? ""}
              onChange={(e) => setSelectedCoach(Number(e.target.value))}
              className="mb-6 w-full rounded-xl border p-4"
            >
              <option value="">Choose Coach</option>

              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.preferred_name || coach.name}
                </option>
              ))}
            </select>
          )}

          <div className="rounded-xl border p-4">
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
              modifiers={{
                completedLesson: completedDates,
                upcomingLesson: upcomingDates,
              }}
              modifiersClassNames={{
                completedLesson: "bg-sky-300 text-black rounded-md",
                upcomingLesson: "bg-gray-300 text-black rounded-md",
              }}
            />
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-lg font-bold text-black">Available Time Slots</h3>

            {timeSlots.length === 0 ? (
              <p className="text-black">No available slots.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-lg px-4 py-2 text-white ${
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

              <button
                onClick={confirmBooking}
                disabled={loading}
                className="mt-4 rounded-lg bg-black px-6 py-3 text-white"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="mb-6 text-3xl font-bold text-black">Client Information</h2>

          <div className="space-y-4 text-black">
            <div>
              <p className="font-semibold">Name</p>
              <p>{client?.name || "-"}</p>
            </div>

            <div>
              <p className="font-semibold">Phone</p>
              <p>{client?.phone || "Not Provided"}</p>
            </div>

            <div>
              <p className="font-semibold">Coach</p>
              <p>{coaches[0]?.preferred_name || coaches[0]?.name || "Unassigned"}</p>
            </div>

            <div>
              <p className="font-semibold">Lessons Remaining</p>

              <p className="text-3xl font-bold">{client?.lessons_remaining ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-8 shadow">
        <h2 className="mb-4 text-3xl font-bold text-black">Upcoming Lessons</h2>

        <div className="space-y-2">
          {upcomingLessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                {formatDate(lesson.lesson_date)} - {formatLessonTime(lesson.lesson_time)}
              </div>

              <div className="flex gap-2">
                <button onClick={() => openReschedule(lesson)} className="rounded bg-green-600 px-3 py-1 text-white">
                  Reschedule
                </button>

                <button onClick={() => cancelLesson(lesson)} className="rounded bg-red-600 px-3 py-1 text-white">
                  Cancel
                </button>
              </div>
            </div>
          ))}

          {upcomingLessons.length === 0 && <p>No upcoming lessons.</p>}
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-8 shadow">
        <h2 className="mb-4 text-3xl font-bold text-black">Previous Lessons</h2>

        <div className="overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Notes</th>
              </tr>
            </thead>

            <tbody>
              {previousLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b">
                  <td className="p-3">{formatDate(lesson.lesson_date)}</td>

                  <td className="p-3">
                    {lesson.lesson_notes ? (
                      <button
                        onClick={() => setSelectedLessonNote(lesson)}
                        className="rounded bg-blue-600 px-3 py-1 text-white"
                      >
                        View Note
                      </button>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {previousLessons.length === 0 && <div className="p-4">No previous lessons.</div>}
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-8 shadow">
        <h2 className="mb-4 text-3xl font-bold text-black">Lessons Remaining</h2>

        <div className="overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Balance</th>
                <th className="p-3 text-left">Purchase</th>
                <th className="p-3 text-left">Purchased On</th>
                <th className="p-3 text-left">Expiry</th>
                <th className="p-3 text-left">Method</th>
              </tr>
            </thead>

            <tbody>
              {packages
                .filter((pkg) => (pkg.lessons_added || 0) - (pkg.lessons_used || 0) > 0)
                .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime())
                .map((pkg) => (
                  <tr key={pkg.id} className="border-b">
                    <td className="p-3">{(pkg.lessons_added || 0) - (pkg.lessons_used || 0)}</td>

                    <td className="p-3">{pkg.transaction_name}</td>

                    <td className="p-3">{formatDate(pkg.purchase_date)}</td>

                    <td className="p-3">{formatDate(pkg.expiration_date)}</td>

                    <td className="p-3">{pkg.payment_method}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {packages.filter((pkg) => (pkg.lessons_added || 0) - (pkg.lessons_used || 0) > 0).length === 0 && (
            <div className="p-4">No active lessons remaining.</div>
          )}
        </div>
      </div>
      {showRescheduleModal && rescheduleLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Reschedule Lesson</h2>

            <div className="mb-4">
              <p>
                <strong>Current Lesson:</strong> {formatDate(rescheduleLesson.lesson_date)}
                {" - "}
                {formatLessonTime(rescheduleLesson.lesson_time)}
              </p>

              <p className="mt-2">
                <strong>Reschedules Used:</strong> {rescheduleLesson.client_reschedules || 0}
                {" / 3"}
              </p>
            </div>

            <DayPicker
              mode="single"
              selected={rescheduleDate}
              onSelect={(date) => {
                setRescheduleDate(date)

                setRescheduleTime("")

                if (date) {
                  generateRescheduleSlots(date)
                }
              }}
              disabled={(date) => {
                const start = new Date()

                start.setHours(0, 0, 0, 0)

                const end = new Date(rescheduleLesson.lesson_date)

                end.setDate(end.getDate() + 7)

                return date < start || date > end
              }}
            />

            <div className="mt-6 flex flex-wrap gap-2">
              {rescheduleSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setRescheduleTime(time)}
                  className={`rounded px-3 py-2 text-white ${
                    rescheduleTime === time ? "bg-green-700" : "bg-green-600"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowRescheduleModal(false)} className="rounded border px-4 py-2">
                Close
              </button>

              <button onClick={confirmReschedule} className="rounded bg-black px-4 py-2 text-white">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLessonNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-2xl font-bold">Lesson Notes</h3>

            <div className="min-h-[250px] rounded-lg border p-4 whitespace-pre-wrap">
              {selectedLessonNote.lesson_notes}
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={() => setSelectedLessonNote(null)} className="rounded border px-4 py-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
