import { createClient } from "@/lib/supabaseServer"
import CoachDashboardClient from "@/components/dashboard/CoachDashboardClient"

type Props = {
  searchParams: Promise<{
    date?: string
    reschedule?: string
  }>
}

export default async function CoachSchedulePage({ searchParams }: Props) {
  const params = await searchParams
  const selectedDate = params.date || new Date().toISOString().split("T")[0]
  const rescheduleId = params.reschedule ? Number(params.reschedule) : null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }
  const { data: coach } = await supabase.from("coaches").select("*").eq("profile_id", user.id).single()
  if (!coach) {
    return null
  }

  const dayOfWeek = new Date(selectedDate).getDay()
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      clients (
        id,
        name,
        phone,
        email,
        notes,
        lessons_remaining
      )
    `
    )
    .eq("coach_id", coach.id)
    .eq("lesson_date", selectedDate)

  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("coach_id", coach.id)
    .eq("day_of_week", dayOfWeek)
    .single()

  const { data: weeklyBreaks } = await supabase
    .from("weekly_breaks")
    .select("*")
    .eq("coach_id", coach.id)
    .eq("day_of_week", dayOfWeek)

  const { data: dateOverrides } = await supabase
    .from("date_overrides")
    .select("*")
    .eq("coach_id", coach.id)
    .eq("lesson_date", selectedDate)

  let rescheduleBooking = null

  if (rescheduleId) {
    const { data } = await supabase
      .from("bookings")
      .select(
        `
        *,
        clients (
          id,
          name,
          phone,
          email,
          notes,
          lessons_remaining
        )
      `
      )
      .eq("id", rescheduleId)
      .single()

    rescheduleBooking = data
  }

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
