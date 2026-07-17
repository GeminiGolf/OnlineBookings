"use client"

import { useEffect, useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import RequireClient from "@/components/auth/RequireClient"
type Coach = {
  id: number
  name: string
  preferred_name: string | null
}

type ClientData = {
  id: number
  name: string
  preferred_name: string | null
  phone: string | null
  email: string | null
  lessons_remaining: number
  primary_coach_id: number | null
}

export default function ClientDashboard() {
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [previousPage, setPreviousPage] = useState(1)
  const [packagesPage, setPackagesPage] = useState(1)
  const ITEMS_PER_PAGE = 5
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
  const [noShowDates, setNoShowDates] = useState<Date[]>([])
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleLesson, setRescheduleLesson] = useState<any>(null)
  const [rescheduleDate, setRescheduleDate] = useState<Date>()
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([])
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [selectedLessonNote, setSelectedLessonNote] = useState<any>(null)
  const [showClientInfo, setShowClientInfo] = useState(false)
  const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null)
  const [expandedPackageId, setExpandedPackageId] = useState<number | null>(null)
  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !selectedCoach) {
        setTimeSlots([])
        return
      }

      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")

      const formattedDate = `${year}-${month}-${day}`

      const response = await fetch(
        `/api/public-availability?coachId=${selectedCoach}&date=${formattedDate}`
      )

      if (!response.ok) {
        setTimeSlots([])
        return
      }

      const slots = await response.json()

      setTimeSlots(slots)
    }

    loadSlots()
  }, [selectedDate, selectedCoach])
  
  async function loadDashboardData() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: clientRecord, error: clientError } = await supabase.from("clients").select("*").eq("profile_id", session.user.id).maybeSingle()
    console.log("CLIENT", clientRecord); console.log("CLIENT ERROR", clientError)
    if (!clientRecord) return

    const today = new Date().toISOString().split("T")[0]
    const { data: missedLessons } = await supabase.from("bookings").select("id, coach_id, client_id").eq("status", "booked").lt("lesson_date", today)

    if (missedLessons?.length) {
      await supabase.from("bookings").update({ status: "no_show" }).eq("status", "booked").lt("lesson_date", today)
      for (const lesson of missedLessons) {
        const { data: existing } = await supabase.from("notifications").select("id").eq("booking_id", lesson.id).eq("type", "no_show").maybeSingle()
        if (!existing) {
          await supabase.from("notifications").insert({ coach_id: lesson.coach_id, client_id: lesson.client_id, booking_id: lesson.id, type: "no_show", message: "Missed lesson" })
        }
      }
    }
    setClient(clientRecord)

    const { data: upcoming } = await supabase.from("bookings").select("*").eq("client_id", clientRecord.id).eq("status", "booked").order("lesson_date", { ascending: true }).order("lesson_time", { ascending: true })
    const sortedUpcoming = (upcoming || []).sort((a, b) => new Date(`${a.lesson_date} ${a.lesson_time}`).getTime() - new Date(`${b.lesson_date} ${b.lesson_time}`).getTime())
    setUpcomingLessons(sortedUpcoming)

    const { data: previous } = await supabase
      .from("bookings")
      .select(`
        *,
        lesson_packages (
          id,
          transaction_name
        )
      `)
      .eq("client_id", clientRecord.id)
      .in("status", ["completed", "no_show"])
      .order("lesson_date", { ascending: false })

    setPreviousLessons(previous || [])

    setCompletedDates((previous || []).filter((lesson) => lesson.status === "completed").map((lesson) => new Date(lesson.lesson_date)))
    setNoShowDates((previous || []).filter((lesson) => lesson.status === "no_show").map((lesson) => new Date(lesson.lesson_date)))
    setUpcomingDates((upcoming || []).map((lesson) => new Date(lesson.lesson_date)))

    const { data: packageData } = await supabase.from("lesson_packages").select("*").eq("client_id", clientRecord.id).order("purchase_date", { ascending: false })
    setPackages(packageData || [])

    if (clientRecord.primary_coach_id) {
      const { data: coach } = await supabase.from("coaches").select("*").eq("id", clientRecord.primary_coach_id).single()
      if (coach) { setCoaches([coach]); setSelectedCoach(coach.id); }
      return
    }

    const { data: allCoaches } = await supabase.from("coaches").select("*")

    if (allCoaches) {
      setCoaches(allCoaches.filter((coach) => coach.id !== 3))
    }
  }

  function timeTo24Hour(time: string) {
    let hour = parseInt(time);
    if (time.includes("PM") && hour !== 12) hour += 12;
    if (time.includes("AM") && hour === 12) hour = 0;
    return hour;
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

  async function generateRescheduleSlots(date: Date) {
    if (!rescheduleLesson) {
      return
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    const formattedDate = `${year}-${month}-${day}`

    const response = await fetch(
      `/api/public-availability?coachId=${rescheduleLesson.coach_id}&date=${formattedDate}`
    )

    if (!response.ok) {
      setRescheduleSlots([])
      return
    }

    let slots = await response.json()

    // Allow the lesson's current time when rescheduling
    if (
      formattedDate === rescheduleLesson.lesson_date &&
      !slots.includes(rescheduleLesson.lesson_time)
    ) {
      slots.push(rescheduleLesson.lesson_time)
      slots.sort()
    }

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

    const { data: changeData, error: changeError } = await supabase.from("booking_changes").insert({
      booking_id: rescheduleLesson.id,
      action: "rescheduled",
      performed_by: "client",
      old_date: oldDate,
      old_time: oldTime,
      new_date: formattedDate,
      new_time: rescheduleTime,
    })

    const today = new Date()

    const daysDifference = Math.floor(
      (new Date(formattedDate).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    await supabase.from("notifications").insert({
      coach_id: rescheduleLesson.coach_id,
      client_id: rescheduleLesson.client_id,
      booking_id: rescheduleLesson.id,
      type: "client_rescheduled",
      is_urgent: daysDifference <= 1,
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
      if (selectedDate && selectedCoach) {
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
        const day = String(selectedDate.getDate()).padStart(2, "0")

        const formattedDate = `${year}-${month}-${day}`

        const response = await fetch(
          `/api/public-availability?coachId=${selectedCoach}&date=${formattedDate}`
        )

        if (response.ok) {
          setTimeSlots(await response.json())
        }
      }
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

    if (!client.primary_coach_id) {
      const response = await fetch("/api/assign-primary-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: client.id,
          coachId: selectedCoach,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        console.error("Coach assignment failed:", result)
      } else {
        setClient({
          ...client,
          primary_coach_id: selectedCoach,
        })
      }
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
    await fetch("/api/check-double-bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coachId: selectedCoach,
        lessonDate: formattedDate,
        lessonTime: selectedTime,
      }),
    })
    alert("Booking confirmed!")
    setSelectedTime("")
    if (selectedDate && selectedCoach) {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")

      const formattedDate = `${year}-${month}-${day}`

      const response = await fetch(
        `/api/public-availability?coachId=${selectedCoach}&date=${formattedDate}`
      )

      if (response.ok) {
        setTimeSlots(await response.json())
      }
    }
    await loadDashboardData()
    setLoading(false)
  }
  const paginatedUpcoming = upcomingLessons.slice((upcomingPage - 1) * ITEMS_PER_PAGE, upcomingPage * ITEMS_PER_PAGE)
  const paginatedPrevious = previousLessons.slice((previousPage - 1) * ITEMS_PER_PAGE, previousPage * ITEMS_PER_PAGE)

  const paginatedPackages = packages
    .filter((pkg) => (pkg.lessons_added || 0) - (pkg.lessons_used || 0) > 0)
    .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime())
    .slice((packagesPage - 1) * ITEMS_PER_PAGE, packagesPage * ITEMS_PER_PAGE)
  return (
    <RequireClient>
      <main className="min-h-screen bg-gray-100 text-black">
      <div className="mx-auto max-w-5xl p-4 lg:p-8">
        <div className="mt-8">
          {/* Mobile / Small Screen */}
          <div className="lg:hidden rounded-2xl bg-white shadow">
            <button onClick={() => setShowClientInfo(!showClientInfo)} className="w-full p-4 lg:p-6 text-left">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] lg:text-[22px] font-bold text-black">
                  Profile
                </h2>
                <span className="text-[2xl]">{showClientInfo ? "▲" : "▼"}</span>
              </div>
            </button>

            {showClientInfo && (
              <div className="px-4 pb-4 lg:px-8 lg:pb-8">
                <div className="space-y-3 text-sm lg:text-base text-black">
                  <div>
                    <p className="text-sm lg:text-base font-semibold">Name</p>
                    <p>
                      {client?.preferred_name
                        ? `${client.preferred_name} ${client.name?.split(" ").slice(1).join(" ")}`
                        : client?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm lg:text-base font-semibold">Phone</p>
                    <p>{client?.phone || "Not Provided"}</p>
                  </div>

                  {client?.primary_coach_id && (
                    <div>
                      <p className="text-sm lg:text-base font-semibold">Coach</p>
                      <p>{coaches[0]?.preferred_name || coaches[0]?.name}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm lg:text-base font-semibold">Lessons Remaining</p>
                    <p className="text-xl lg:text-xl font-bold">
                      {client?.lessons_remaining ?? 0}
                    </p>

                    <Link
                      href="/client/changepassword"
                      className="mt-3 inline-block font-semibold text-black underline decoration-blue-600 decoration-2 underline-offset-2"
                    >
                      Change Password
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop */}
          <div className="order-1 lg:order-2 hidden lg:block rounded-2xl bg-white shadow">
            <button onClick={() => setShowClientInfo(!showClientInfo)} className="w-full p-3 text-left">
              <div className="flex items-center justify-center gap-8">
                <h2 className="text-[2xl] font-bold text-black">
                  Profile
                </h2>

                <span className="text-[18px]">
                  {showClientInfo ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {showClientInfo && (
              <div className="px-8 pb-8">
                <div className="space-y-4 text-black">
                  <div>
                    <p className="font-semibold">Name</p>
                    <p>
                      {client?.preferred_name
                        ? `${client.preferred_name} ${client.name?.split(" ").slice(1).join(" ")}`
                        : client?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">Phone</p>
                    <p>{client?.phone || "Not Provided"}</p>
                  </div>

                  {client?.primary_coach_id && (
                    <div>
                      <p className="font-semibold">Coach</p>
                      <p>{coaches[0]?.preferred_name || coaches[0]?.name}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">Lessons Remaining</p>
                    <p className="text-xl font-bold">
                      {client?.lessons_remaining ?? 0}
                    </p>

                    <Link
                      href="/client/changepassword"
                      className="mt-3 inline-block font-semibold text-black underline decoration-blue-600 decoration-2 underline-offset-2"
                    >
                      Change Password
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-3 lg:p-8 shadow">
            <h2 className="mb-3 text-[18px] font-bold text-black">Book A Lesson</h2>

            {!client?.primary_coach_id && (
              <select
                value={selectedCoach ?? ""}
                onChange={(e) => setSelectedCoach(e.target.value ? Number(e.target.value) : null)}
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

            <div className="mx-auto w-fit rounded-xl border px-3 pt-3 pb-0 text-sm overflow-hidden">
              <DayPicker
                className="mt-4 -mb-4 scale-90 lg:scale-90 origin-top"
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!selectedCoach) {
                    alert("Please choose a coach")
                    return
                  }

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

            <div className="mt-6">
              <h3 className="mb-3 text-medium font-bold text-black">Available Time Slots</h3>

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
          <div className="rounded-2xl bg-white p-3 lg:p-8 shadow">
            <h2 className="mb-3 text-[17px] font-bold text-black">Upcoming Lessons</h2>

            <div className="space-y-2">
              {paginatedUpcoming.map((lesson) => (
                <div key={lesson.id} className="rounded-lg border p-3">
                  {/* Mobile */}
                  <div className="lg:hidden">
                    <div className="flex items-center justify-between">
                      <div>
                        {formatDate(lesson.lesson_date)} - {formatLessonTime(lesson.lesson_time)}
                        {lesson.booked_by === "coach" && " [Coach]"}
                        {lesson.booked_by === "admin" && " [Admin]"}
                      </div>

                      <button
                        onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}
                        className="rounded bg-blue-600 px-3 py-1 text-white"
                      >
                        Edit
                      </button>
                    </div>

                    {expandedLessonId === lesson.id && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openReschedule(lesson)}
                          className="rounded bg-green-600 px-3 py-1 text-white"
                        >
                          Reschedule
                        </button>

                        <button
                          onClick={() => cancelLesson(lesson)}
                          className="rounded bg-red-600 px-3 py-1 text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:flex items-center justify-between text-sm">
                    <div>
                      {formatDate(lesson.lesson_date)} - {formatLessonTime(lesson.lesson_time)}
                      {lesson.booked_by === "coach" && " [Coach]"}
                      {lesson.booked_by === "admin" && " [Admin]"}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openReschedule(lesson)}
                        className="rounded bg-green-600 px-2 py-1 text-sm text-white"
                      >
                        Reschedule
                      </button>

                      <button onClick={() => cancelLesson(lesson)} className="rounded bg-red-600 px-2 py-1 text-sm text-white">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {upcomingLessons.length === 0 && <p>No upcoming lessons.</p>}
              {upcomingLessons.length > ITEMS_PER_PAGE && (
                <div className="flex h-16 items-center justify-center gap-4">
                  <button
                    onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                    disabled={upcomingPage === 1}
                    className="rounded border px-3 py-1 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span>
                    {upcomingPage} of {Math.ceil(upcomingLessons.length / ITEMS_PER_PAGE)}
                  </span>

                  <button
                    onClick={() =>
                      setUpcomingPage((p) => Math.min(Math.ceil(upcomingLessons.length / ITEMS_PER_PAGE), p + 1))
                    }
                    disabled={upcomingPage >= Math.ceil(upcomingLessons.length / ITEMS_PER_PAGE)}
                    className="rounded border px-3 py-1 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-3 lg:p-8 shadow">
            <h2 className="mb-3 text-[18px] font-bold text-black">Previous Lessons</h2>

            <div className="overflow-hidden rounded-xl border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Method</th>
                    <th className="p-3 text-left">Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedPrevious.map((lesson) => (
                    <tr key={lesson.id} className="border-b">
                      <td className="p-3">{formatDate(lesson.lesson_date)}</td>

                      <td className="p-3">
                        {lesson.lesson_packages?.transaction_name ||
                          lesson.payment_method ||
                          "Other"}
                      </td>

                      <td className="p-3">
                        {lesson.status === "no_show" ? (
                          "No Show"
                        ) : lesson.lesson_notes ? (
                          <button
                            onClick={() => setSelectedLessonNote(lesson)}
                            className="rounded bg-blue-600 px-2 py-1 text-sm text-white"
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
              {previousLessons.length > ITEMS_PER_PAGE && (
                <div className="flex h-16 items-center justify-center gap-4">
                  <button
                    onClick={() => setPreviousPage((p) => Math.max(1, p - 1))}
                    disabled={previousPage === 1}
                    className="rounded border px-3 py-1 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span>
                    {previousPage} of {Math.ceil(previousLessons.length / ITEMS_PER_PAGE)}
                  </span>

                  <button
                    onClick={() =>
                      setPreviousPage((p) => Math.min(Math.ceil(previousLessons.length / ITEMS_PER_PAGE), p + 1))
                    }
                    disabled={previousPage >= Math.ceil(previousLessons.length / ITEMS_PER_PAGE)}
                    className="rounded border px-3 py-1 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-3 lg:p-8 shadow">
            <h2 className="mb-3 text-[18px] font-bold text-black">
              Lessons Remaining ({client?.lessons_remaining ?? 0})
            </h2>

            <div className="mx-auto max-w-md space-y-3">
              {paginatedPackages.map((pkg) => (
                <div key={pkg.id} className="rounded-xl border p-3 text-sm">
                  <button
                    onClick={() =>
                      setExpandedPackageId(
                        expandedPackageId === pkg.id ? null : pkg.id
                      )
                    }
                    className="flex w-full items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-gray-600">
                        Balance
                      </div>

                      <div className="text-[18px] font-bold">
                        {(pkg.lessons_added || 0) - (pkg.lessons_used || 0)}
                      </div>
                    </div>

                    <span className="text-[18px]">
                      {expandedPackageId === pkg.id ? "▲" : "▼"}
                    </span>
                  </button>

                  {expandedPackageId === pkg.id && (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      <div>Purchase: {pkg.transaction_name}</div>
                      <div>Purchased: {formatDate(pkg.purchase_date)}</div>
                      <div>Expiry: {formatDate(pkg.expiration_date)}</div>
                      <div>Method: {pkg.payment_method}</div>
                    </div>
                  )}
                </div>
              ))}

              {paginatedPackages.length === 0 && (
                <div className="rounded-xl border p-4">
                  No active lessons remaining.
                </div>
              )}

              {packages.filter(
                (pkg) =>
                  (pkg.lessons_added || 0) -
                    (pkg.lessons_used || 0) >
                  0
              ).length > ITEMS_PER_PAGE && (
                <div className="flex h-16 items-center justify-center gap-4">
                  <button
                    onClick={() =>
                      setPackagesPage((p) =>
                        Math.max(1, p - 1)
                      )
                    }
                    disabled={packagesPage === 1}
                    className="rounded border px-3 py-1 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span>
                    {packagesPage} of{" "}
                    {Math.ceil(
                      packages.filter(
                        (pkg) =>
                          (pkg.lessons_added || 0) -
                            (pkg.lessons_used || 0) >
                          0
                      ).length / ITEMS_PER_PAGE
                    )}
                  </span>

                  <button
                    onClick={() =>
                      setPackagesPage((p) =>
                        Math.min(
                          Math.ceil(
                            packages.filter(
                              (pkg) =>
                                (pkg.lessons_added || 0) -
                                  (pkg.lessons_used || 0) >
                                0
                            ).length / ITEMS_PER_PAGE
                          ),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      packagesPage >=
                      Math.ceil(
                        packages.filter(
                          (pkg) =>
                            (pkg.lessons_added || 0) -
                              (pkg.lessons_used || 0) >
                            0
                        ).length / ITEMS_PER_PAGE
                      )
                    }
                    className="rounded border px-3 py-1 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
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
                className="scale-90 lg:scale-100 origin-top"
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
      </div>
    </main>
  </RequireClient>
  )
}