"use client"

import { useEffect, useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import RequireClient from "@/components/auth/RequireClient"
import { getMalaysiaDate } from "@/lib/date"
import DashboardContainer from "@/components/layout/DashboardContainer"
import LoadingScreen from "@/components/ui/LoadingScreen"
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
  const [loadingPage, setLoadingPage] = useState(true)
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
    setLoadingPage(true)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setLoadingPage(false)
      return
    }

    const { data: clientRecord } = await supabase
      .from("clients")
      .select("*")
      .eq("profile_id", session.user.id)
      .maybeSingle()

    if (!clientRecord) {
      setLoadingPage(false)
      return
    }

    const today = getMalaysiaDate()
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

    setLoadingPage(false)
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

    slots.sort((a: string, b: string) => {
      const to24Hour = (time: string) => {
        const [hourString, period] = time.split(" ")
        let hour = parseInt(hourString, 10)

        if (period === "PM" && hour !== 12) hour += 12
        if (period === "AM" && hour === 12) hour = 0

        return hour
      }

      return to24Hour(a) - to24Hour(b)
    })

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

    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        coach_id: lesson.coach_id,
        client_id: lesson.client_id,
        booking_id: lesson.id,
        type: "client_cancelled",
        is_urgent: false,
        message: `Client cancelled lesson.\n\nDate: ${lesson.lesson_date}\nTime: ${lesson.lesson_time}\n\nReason:\n${reason.trim()}`,
      })
      .select()
      .single()

    if (!notificationError && notification) {
      await fetch("/api/coach/notifications/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: notification.id,
        }),
      })
    }

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

    const response = await fetch(
      `/api/public-last-booked?coachId=${selectedCoach}&date=${formattedDate}&before=${selectedTime}`
    )

    const lastBooking = response.ok ? await response.json() : null

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

    // bookedTimes was already fetched before creating the booking

    let isLateBooking = false

    const today = new Date()

    const bookingDate = new Date(formattedDate + "T00:00:00")

    const daysDifference = Math.floor(
      (bookingDate.getTime() -
        new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (daysDifference >= 0 && daysDifference <= 1) {
      const newHour = timeTo24Hour(selectedTime)

      if (!lastBooking) {
        isLateBooking = true
      } else {
        const previousHour = timeTo24Hour(lastBooking.lesson_time)

        if (newHour >= previousHour + 2) {
          isLateBooking = true
        }
      }
    }

    if (isLateBooking && newBooking) {
      const { data: notification, error: notificationError } = await supabase
        .from("notifications")
        .insert({
          coach_id: selectedCoach,
          client_id: client.id,
          booking_id: newBooking.id,
          type: "late_booking",
          is_urgent: true,
          message: `Late booking requires review.\n\nDate: ${formattedDate}\nTime: ${selectedTime}`,
        })
        .select()
        .single()

      if (!notificationError && notification) {
        await fetch("/api/coach/notifications/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId: notification.id,
          }),
        })
      }
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
      <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#2F5A43]">
        <DashboardContainer>
        <div className="mt-8">
          {/* Mobile / Small Screen */}
          <div className="lg:hidden rounded-3xl border border-[#3A5D49] bg-white shadow-md">
            <button onClick={() => setShowClientInfo(!showClientInfo)} className="w-full px-4 py-3 lg:px-6 lg:py-2 text-left">
              <div className="flex items-center justify-between">
                <h2 className="dashboard-heading text-[20px]">

                  Profile
                </h2>
                <span className="text-[18px] text-[#2F5A43]">
                 {showClientInfo ? "▲" : "▼"}
                </span> 
              </div>
            </button>

            {showClientInfo && (
              <div className="px-4 pb-3 lg:px-6 lg:pb-5">
                <div className="space-y-4 text-[#2F5A43]">
                  <div>
                    <p className="dashboard-label">Name</p>
                    <p className="dashboard-value">
                      {client?.preferred_name
                        ? `${client.preferred_name} ${client.name?.split(" ").slice(1).join(" ")}`
                        : client?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="dashboard-label">Phone</p>
                    <p className="dashboard-value">
                      {client?.phone || "Not Provided"}
                    </p>
                  </div>

                  {client?.primary_coach_id && (
                    <div>
                      <p className="dashboard-label">Coach</p>
                      <p className="dashboard-value">
                        {coaches[0]?.preferred_name || coaches[0]?.name}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="dashboard-label">Lessons Remaining</p>
                    <p className="dashboard-value">
                      {client?.lessons_remaining ?? 0}
                    </p>

                    <Link
                      href="/client/changepassword"
                      className="dashboard-value mt-4 inline-block text-[#5874A6] underline decoration-[#5874A6] underline-offset-2 transition hover:text-[#45628F]"
                    >
                      Change Password
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop */}
          <div className="order-1 hidden rounded-3xl border border-[#3A5D49] bg-white shadow-md lg:order-2 lg:block">
            <button onClick={() => setShowClientInfo(!showClientInfo)} className="w-full px-6 py-2 text-left">
              <div className="flex items-center justify-center gap-8">
                <h2 className="dashboard-heading text-[20px]">
                  Profile
                </h2>

                <span className="text-[18px] text-[#2F5A43]">
                  {showClientInfo ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {showClientInfo && (
              <div className="px-6 pb-5">
                <div className="space-y-4 text-black">
                  <div>
                    <p className="dashboard-label">Name</p>
                    <p className="dashboard-value">
                      {client?.preferred_name
                        ? `${client.preferred_name} ${client.name?.split(" ").slice(1).join(" ")}`
                        : client?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="dashboard-label">Phone</p>
                    <p className="dashboard-value">
                      {client?.phone || "Not Provided"}
                    </p>
                  </div>

                  {client?.primary_coach_id && (
                    <div>
                      <p className="dashboard-label">Coach</p>
                      <p className="dashboard-value">
                        {coaches[0]?.preferred_name || coaches[0]?.name}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="dashboard-label">Lessons Remaining</p>
                    <p className="dashboard-value">
                      {client?.lessons_remaining ?? 0}
                    </p>

                    <Link
                      href="/client/changepassword"
                      className="dashboard-value mt-4 inline-block text-[#5874A6] underline decoration-[#5874A6] underline-offset-2 transition hover:text-[#45628F]"
                    >
                      Change Password
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:mt-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#3A5D49] bg-white p-3 shadow-md lg:px-6 lg:py-5">
            <h2 className="dashboard-heading mb-3">
              Book A Lesson
            </h2>

            {!client?.primary_coach_id && (
              <select
                value={selectedCoach ?? ""}
                onChange={(e) => setSelectedCoach(e.target.value ? Number(e.target.value) : null)}
                className="mb-6 w-full rounded-xl border border-[#3A5D49] bg-white px-4 py-3 text-[15px] font-light text-[#2F5A43] shadow-sm focus:border-[#2F5A43] focus:outline-none"
              >
                <option value="">Choose Coach</option>

                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.preferred_name || coach.name}
                  </option>
                ))}
              </select>
            )}

            <div className="mx-auto w-fit overflow-hidden rounded-2xl border border-[#3A5D49] bg-[#FBF8F3] px-2 pt-2 pb-0 text-sm">
              <DayPicker
                className="mt-2 -mb-8 scale-90 lg:scale-[0.82] origin-top"
                styles={{
                  weekday: {
                    color: "#2F5A43",
                  },
                  day: {
                    color: "#2F5A43",
                  },
                  caption_label: {
                    color: "#2F5A43",
                  },
                  chevron: {
                    fill: "#2F5A43",
                  },
                  selected: {
                    backgroundColor: "#2F5A43",
                    color: "#FFFFFF",
                    borderRadius: "9999px",
                  },
                }}
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

            <div className="mt-3 flex flex-col items-center">
              <h3 className="dashboard-heading mb-3 text-center">
                Available Time Slots
              </h3>

              {timeSlots.length === 0 ? (
                <p className="text-center text-[15px] font-light text-[#2F5A43]">
                  No available slots.
                </p>
              ) : (
                <div className="flex w-fit flex-wrap justify-center gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-xl border px-4 py-2 text-[15px] font-light transition ${
                        selectedTime === time
                          ? "border-[#2F5A43] bg-[#2F5A43] text-white"
                          : "border-[#3A5D49] bg-[#FBF8F3] text-[#2F5A43] hover:bg-[#F6FAF6]"
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
          <div className="rounded-3xl border border-[#3A5D49] bg-white p-3 shadow-md lg:px-6 lg:py-5">
            <h2 className="dashboard-heading mb-3">
              Upcoming Lessons
            </h2>

            <div className="space-y-2">
              {paginatedUpcoming.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-[#3A5D49] bg-white p-3 transition hover:bg-[#F6FAF6]"
                >
                  {/* Mobile */}
                  <div className="lg:hidden">
                    <div className="flex items-center justify-between">
                      <div className="dashboard-value">
                        {formatDate(lesson.lesson_date)} - {formatLessonTime(lesson.lesson_time)}
                        {lesson.booked_by === "coach" && " [Coach]"}
                        {lesson.booked_by === "admin" && " [Admin]"}
                      </div>

                      <button
                        onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}
                        className="rounded-xl border border-[#4E6FA8] bg-[#4E6FA8] px-3 py-1.5 text-[14px] font-light text-white shadow-sm transition hover:bg-[#3F5E92]"
                      >
                        Edit
                      </button>
                    </div>

                    {expandedLessonId === lesson.id && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openReschedule(lesson)}
                          className="rounded-xl border border-[#3A5D49] bg-[#2F5A43] px-4 py-2 text-[14px] font-light text-white shadow-sm transition hover:bg-[#244634]"
                        >
                          Reschedule
                        </button>

                        <button
                          onClick={() => cancelLesson(lesson)}
                          className="rounded-xl border border-[#7F2E2E] bg-[#9B3B3B] px-4 py-2 text-[14px] font-light text-white shadow-sm transition hover:bg-[#842F2F]"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="hidden items-center justify-between lg:flex">
                    <div className="dashboard-value">
                      {formatDate(lesson.lesson_date)} - {formatLessonTime(lesson.lesson_time)}
                      {lesson.booked_by === "coach" && " [Coach]"}
                      {lesson.booked_by === "admin" && " [Admin]"}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openReschedule(lesson)}
                        className="rounded-xl border border-[#3A5D49] bg-[#2F5A43] px-4 py-2 text-[14px] font-light text-white shadow-sm transition hover:bg-[#244634]"
                      >
                        Reschedule
                      </button>

                      <button onClick={() => cancelLesson(lesson)} className="rounded-lg bg-[#A34A4A] px-3 py-1.5 text-sm font-light text-white transition hover:bg-[#B95B5B]">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {upcomingLessons.length === 0 && (
                <p className="text-[15px] font-light text-[#2F5A43]">
                  No upcoming lessons.
                </p>
              )}
              {upcomingLessons.length > ITEMS_PER_PAGE && (
                <div className="flex h-16 items-center justify-center gap-4">
                  <button
                    onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                    disabled={upcomingPage === 1}
                    className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="dashboard-value">
                    {upcomingPage} of {Math.ceil(upcomingLessons.length / ITEMS_PER_PAGE)}
                  </span>

                  <button
                    onClick={() =>
                      setUpcomingPage((p) => Math.min(Math.ceil(upcomingLessons.length / ITEMS_PER_PAGE), p + 1))
                    }
                    disabled={upcomingPage >= Math.ceil(upcomingLessons.length / ITEMS_PER_PAGE)}
                    className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:mt-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#3A5D49] bg-white p-3 shadow-md lg:px-6 lg:py-5">
            <h2 className="dashboard-heading mb-3">
              Previous Lessons
            </h2>

            <div className="overflow-hidden rounded-2xl border border-[#3A5D49]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#3A5D49] bg-[#F3F0EA]">
                    <th className="dashboard-label p-4 text-left">
                      Date
                    </th>

                    <th className="dashboard-label p-4 text-left">
                      Method
                    </th>

                    <th className="dashboard-label p-4 text-left">
                      Notes
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedPrevious.map((lesson) => (
                    <tr
                      key={lesson.id}
                      className="last:border-b-0 border-b border-[#3A5D49] hover:bg-[#F6FAF6]"
                    >
                      <td className="dashboard-value p-4 text-[#2F5A43]">
                        {formatDate(lesson.lesson_date)}
                      </td>

                      <td className="dashboard-value p-4 text-[#2F5A43]">
                        {lesson.lesson_packages?.transaction_name ||
                          lesson.payment_method ||
                          "Other"}
                      </td>

                      <td className="dashboard-value p-4 text-[#2F5A43]">
                        {lesson.status === "no_show" ? (
                          "No Show"
                        ) : lesson.lesson_notes ? (
                          <button
                            onClick={() => setSelectedLessonNote(lesson)}
                            className="rounded-xl border border-[#4E6FA8] bg-[#4E6FA8] px-3 py-1.5 text-[14px] font-light text-white shadow-sm transition hover:bg-[#3F5E92]"
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

              {previousLessons.length === 0 && (
                <div className="p-4 text-[15px] font-light text-[#2F5A43]">
                  No previous lessons.
                </div>
              )}

              {previousLessons.length > ITEMS_PER_PAGE && (
                <div className="flex h-16 items-center justify-center gap-4">
                  <button
                    onClick={() => setPreviousPage((p) => Math.max(1, p - 1))}
                    disabled={previousPage === 1}
                    className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="dashboard-value">
                    {previousPage} of {Math.ceil(previousLessons.length / ITEMS_PER_PAGE)}
                  </span>

                  <button
                    onClick={() =>
                      setPreviousPage((p) => Math.min(Math.ceil(previousLessons.length / ITEMS_PER_PAGE), p + 1))
                    }
                    disabled={previousPage >= Math.ceil(previousLessons.length / ITEMS_PER_PAGE)}
                    className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-3xl border border-[#3A5D49] bg-white p-3 shadow-md lg:px-6 lg:py-5">
            <h2 className="dashboard-heading mb-3">
              Lessons Remaining ({client?.lessons_remaining ?? 0})
            </h2>

            <div className="mx-auto max-w-md space-y-3">
              {paginatedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-xl border border-[#3A5D49] bg-[#FBF8F3] p-4 transition hover:bg-[#F6FAF6]"
                >
                  <button
                    onClick={() =>
                      setExpandedPackageId(
                        expandedPackageId === pkg.id ? null : pkg.id
                      )
                    }
                    className="flex w-full items-center justify-between"
                  >
                    <div>
                      <div className="dashboard-label">
                        Balance
                      </div>

                      <div className="dashboard-value text-[22px]">
                        {(pkg.lessons_added || 0) - (pkg.lessons_used || 0)}
                      </div>
                    </div>

                    <span className="text-[18px] text-[#2F5A43]">
                      {expandedPackageId === pkg.id ? "▲" : "▼"}
                    </span>
                  </button>

                  {expandedPackageId === pkg.id && (
                    <div className="mt-4 space-y-3 border-t border-[#3A5D49] pt-4">
                      <div>
                        <p className="dashboard-label">Package</p>
                        <p className="dashboard-value">{pkg.transaction_name}</p>
                      </div>

                      <div>
                        <p className="dashboard-label">Purchased</p>
                        <p className="dashboard-value">{formatDate(pkg.purchase_date)}</p>
                      </div>

                      <div>
                        <p className="dashboard-label">Expiry</p>
                        <p className="dashboard-value">{formatDate(pkg.expiration_date)}</p>
                      </div>

                      <div>
                        <p className="dashboard-label">Method</p>
                        <p className="dashboard-value">{pkg.payment_method}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {paginatedPackages.length === 0 && (
                <div className="rounded-xl border border-[#3A5D49] bg-[#FBF8F3] p-4">
                  <p className="text-[15px] font-light text-[#2F5A43]">
                    No active lessons remaining.
                  </p>
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
                    className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="dashboard-value">
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
                    className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
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
            <div className="w-full max-w-2xl rounded-2xl bg-white px-4 pt-4 pb-0 sm:p-6">
              <div className="origin-top -mb-4 scale-[0.94] sm:mb-0 sm:scale-100">
              <div className="mb-2 sm:mb-5 flex items-center justify-between">
                <h2 className="text-[16px] font-bold uppercase tracking-[0.12em] text-[#2F5A43] sm:text-[20px]">
                  <span className="sm:hidden">Reschedule Lesson [RS]</span>
                  <span className="hidden sm:inline">Reschedule Lesson</span>
                </h2>

                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3A5D49] bg-[#FBF8F3] text-[22px] font-light leading-none text-[#2F5A43] transition hover:bg-[#F6FAF6]"
                >
                  ×
                </button>
              </div>

              <div className="mb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-1 text-[13px] font-bold uppercase tracking-[0.12em] text-[#2F5A43]">
                      Current Lesson
                    </p>

                    <p className="text-[15px] font-light text-[#2F5A43]">
                      {formatDate(rescheduleLesson.lesson_date)} — {formatLessonTime(rescheduleLesson.lesson_time)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="mb-1 text-[13px] font-bold uppercase tracking-[0.12em] text-[#2F5A43]">
                      RS Used
                    </p>

                    <p className="text-[15px] font-light text-[#2F5A43]">
                      {rescheduleLesson.client_reschedules || 0} / 3
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-auto w-fit overflow-hidden rounded-2xl border border-[#3A5D49] bg-[#FBF8F3] px-2 pt-2 pb-0 text-sm">
                <DayPicker
                  className="mt-2 -mb-8 origin-top scale-90 lg:scale-[0.82]"
                mode="single"
                selected={rescheduleDate}
                onSelect={async (date) => {
                  if (!date) return

                  setRescheduleDate(date)
                  setRescheduleTime("")
                  await generateRescheduleSlots(date)
                }}
                disabled={[
                  {
                    before: new Date(),
                  },
                ]}
                styles={{
                  weekday: {
                    color: "#2F5A43",
                  },
                  day: {
                    color: "#2F5A43",
                  },
                  caption_label: {
                    color: "#2F5A43",
                  },
                  chevron: {
                    fill: "#2F5A43",
                  },
                  selected: {
                    backgroundColor: "#2F5A43",
                    color: "#FFFFFF",
                    borderRadius: "9999px",
                  },
                }}
                />
              </div>

              <div className="mt-2 flex flex-col items-center">
                <h3 className="dashboard-heading mb-2 text-center">
                  Available Time Slots
                </h3>

                <div className="flex max-w-[280px] flex-wrap justify-center gap-1 sm:max-w-none sm:gap-2">
                  {rescheduleSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setRescheduleTime(time)}
                      className={`rounded-xl border px-3.5 py-1.5 sm:px-4 sm:py-2 text-[14px] sm:text-[15px] font-light transition ${
                        rescheduleTime === time
                          ? "border-[#2F5A43] bg-[#2F5A43] text-white"
                          : "border-[#3A5D49] bg-[#FBF8F3] text-[#2F5A43] hover:bg-[#F6FAF6]"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={confirmReschedule}
                  disabled={!rescheduleTime}
                  className={`rounded-xl border px-4 py-2 text-[15px] font-light transition ${
                    rescheduleTime
                      ? "border-[#2F5A43] bg-[#2F5A43] text-white hover:bg-[#244634]"
                      : "cursor-not-allowed border-[#2F5A43] bg-[#D9DDD8] text-[#7A867E]"
                  }`}
                >
                  Confirm
                </button>
              </div>
              </div>
            </div>
          </div>
        )}

        {selectedLessonNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-2xl text-[18px] font-light uppercase tracking-[0.12em] text-black">Lesson Notes</h3>
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
      </DashboardContainer>
    </main>
  </RequireClient>
  )
}