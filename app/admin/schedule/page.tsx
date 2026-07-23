import { createClient } from "@/lib/supabaseServer"
import AdminDashboard from "@/components/dashboard/AdminDashboard"
import CoachSelector from "@/components/CoachSelector"

type Props = {
  searchParams: Promise<{
    date?: string
    coach?: string
    reschedule?: string
  }>
}

export default async function AdminSchedulePage({ searchParams }: Props) {
  const params = await searchParams
  const selectedDate =
    params.date || new Date().toISOString().split("T")[0]
  const coachId = params.coach
    ? Number(params.coach)
    : null
  const rescheduleId = params.reschedule
    ? Number(params.reschedule)
    : null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return null
  }
  const { data: coaches } = await supabase
    .from("coaches")
    .select("id,name")
    .order("name")

  if (!coachId) {
    return (
      <AdminDashboard
        coachId={0}
        coachName=""
        initialBookings={[]}
        selectedDate={selectedDate}
        availability={null}
        weeklyBreaks={[]}
        dateOverrides={[]}
        headerContent={
          <CoachSelector
            coaches={coaches || []}
            selectedDate={selectedDate}
          />
        }
      />
    )
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", coachId)
    .single()

  if (!coach) {
    return null
  }
  const dayOfWeek = new Date(selectedDate).getDay()
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      clients (
        id,
        name,
        preferred_name,
        first_name,
        last_name,
        phone,
        email,
        notes,
        lessons_remaining
      )
    `)
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
      .select(`
        *,
        clients (
          id,
          name,
          preferred_name,
          first_name,
          last_name,
          phone,
          email,
          notes,
          lessons_remaining
        )
      `)
      .eq("id", rescheduleId)
      .single()

    rescheduleBooking = data
  }
  return (
    <AdminDashboard
      coachId={coach.id}
      coachName={coach.name}
      initialBookings={bookings || []}
      selectedDate={selectedDate}
      availability={availability}
      weeklyBreaks={weeklyBreaks || []}
      dateOverrides={dateOverrides || []}
      rescheduleBooking={rescheduleBooking}
      headerContent={
        <CoachSelector
          coaches={coaches || []}
          selectedCoachId={coach.id}
          selectedDate={selectedDate}
        />
      }
    />
  )
}