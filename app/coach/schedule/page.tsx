import { createClient } from "@/lib/supabaseServer"

import CoachDashboardClient from "@/components/dashboard/CoachDashboardClient"

type Props = {
  searchParams: Promise<{
    date?: string
  }>
}

export default async function CoachSchedulePage({
  searchParams,
}: Props) {
  const params =
    await searchParams

  const selectedDate =
    params.date ||
    new Date()
      .toISOString()
      .split("T")[0]

  const supabase =
    await createClient()

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: coach } =
    await supabase
      .from("coaches")
      .select("*")
      .eq("profile_id", user.id)
      .single()

  if (!coach) {
    return null
  }

  const dayOfWeek =
    new Date(selectedDate)
      .getDay()

  console.log(
  "selectedDate",
  selectedDate,
  "dayOfWeek",
  dayOfWeek
)

  const { data: bookings } =
    await supabase
      .from("bookings")
      .select(`
        *,
        clients (
          name,
          phone,
          email,
          notes,
          lessons_remaining
        )
      `)
      .eq("coach_id", coach.id)
      .eq("lesson_date", selectedDate)

  const { data: availability } =
    await supabase
      .from("availability")
      .select("*")
      .eq("coach_id", coach.id)
      .eq("day_of_week", dayOfWeek)
      .single()

  const { data: weeklyBreaks } =
  await supabase
    .from("weekly_breaks")
    .select("*")
    .eq(
      "coach_id",
      coach.id
    )
    .eq(
      "day_of_week",
      dayOfWeek
    )

  const { data: dateOverrides } =
    await supabase
      .from("date_overrides")
      .select("*")
      .eq("coach_id", coach.id)
      .eq("lesson_date", selectedDate)

  return (
    <CoachDashboardClient
      coachId={coach.id}
      coachName={coach.name}
      initialBookings={bookings || []}
      selectedDate={selectedDate}
      availability={availability}
      weeklyBreaks={
        weeklyBreaks || []
      }
      dateOverrides={dateOverrides || []}
    />
  )
}