import { createClient } from "@/lib/supabaseServer"
import CoachDashboardClient from "@/components/dashboard/CoachDashboardClient"

type Props = {
  searchParams: Promise<{
    date?: string
    reschedule?: string
  }>
}

export default async function CoachSchedulePage({
  searchParams,
}: Props) {
  console.log("1 START")

  const params = await searchParams

  const selectedDate =
    params.date ||
    new Date().toISOString().split("T")[0]

  const rescheduleId =
    params.reschedule
      ? Number(params.reschedule)
      : null

  console.log("BEFORE CLIENT")

  const supabase = await createClient()

  console.log("AFTER CLIENT")

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log("USER", user)
  console.log("USER ERROR", userError)

  if (!user) {
    return (
      <div className="p-10 text-red-500">
        NO USER FOUND
      </div>
    )
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("profile_id", user.id)
    .single()

  console.log("4 COACH", coach?.id)

  if (!coach) {
    return null
  }

  const dayOfWeek = new Date(selectedDate).getDay()

  console.log("5 DAY", dayOfWeek)

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      clients (
        id,
        name,
        phone,
        email,
        notes,
        lessons_remaining
      )
    `)
    .eq("coach_id", coach.id)
    .eq("lesson_date", selectedDate)

  console.log("6 BOOKINGS")

  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("coach_id", coach.id)
    .eq("day_of_week", dayOfWeek)
    .single()

  console.log("7 AVAILABILITY")

  const { data: weeklyBreaks } = await supabase
    .from("weekly_breaks")
    .select("*")
    .eq("coach_id", coach.id)
    .eq("day_of_week", dayOfWeek)

  console.log("8 BREAKS")

  const { data: dateOverrides } = await supabase
    .from("date_overrides")
    .select("*")
    .eq("coach_id", coach.id)
    .eq("lesson_date", selectedDate)

  console.log("9 OVERRIDES")

  let rescheduleBooking = null

  if (rescheduleId) {
    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        clients (
          id,
          name,
          phone,
          email,
          notes,
          lessons_remaining
        )
      `)
      .eq("id", rescheduleId)
      .single()

    rescheduleBooking = data

    console.log("9.5 RESCHEDULE")
  }

  console.log("10 RETURN")

  return (
    <CoachDashboardClient
      coachId={coach.id}
      coachName={coach.name}
      initialBookings={bookings || []}
      selectedDate={selectedDate}
      availability={availability}
      weeklyBreaks={weeklyBreaks || []}
      dateOverrides={dateOverrides || []}
      rescheduleBooking={rescheduleBooking}
    />
  )
}