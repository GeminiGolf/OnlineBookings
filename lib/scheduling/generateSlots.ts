import { SupabaseClient } from "@supabase/supabase-js"

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:00 ${suffix}`
}

export async function generateSlots(
  supabase: SupabaseClient,
  selectedCoach: number,
  selectedDate: Date,
  excludeBookingId?: number
): Promise<string[]> {
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

  const { data: existingBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id, lesson_time")
    .eq("coach_id", selectedCoach)
    .eq("lesson_date", formattedDate)
    .in("status", ["booked", "completed"])

  console.log("generateSlots")
  console.log("Coach:", selectedCoach)
  console.log("Date:", formattedDate)
  console.log("Bookings:", existingBookings)
  console.log("Booking Error:", bookingsError)

	const bookedTimes =
		existingBookings
			?.filter(
				(booking: any) =>
					booking.id !== excludeBookingId
			)
			.map((booking: any) => booking.lesson_time.trim()) || []

  availableSlots = availableSlots.filter(
    (slot) => !bookedTimes.includes(slot.trim())
  )

  const { data: weeklyBreaks } = await supabase
    .from("weekly_breaks")
    .select("*")
    .eq("coach_id", selectedCoach)
    .eq("day_of_week", day)

  const breakTimes =
    weeklyBreaks?.map((item) => formatHour(item.hour)) || []

  availableSlots = availableSlots.filter(
    (slot) => !breakTimes.includes(slot)
  )

  const today = new Date()
  const isToday =
    selectedDate.toDateString() === today.toDateString()

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

  return availableSlots
}