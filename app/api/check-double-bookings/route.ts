import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const today = new Date()
  today.setDate(today.getDate() - 1)

  const formattedToday = today.toISOString().split("T")[0]

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      coach_id,
      client_id,
      lesson_date,
      lesson_time,
      status,
      booked_by
    `)
    .gte("lesson_date", formattedToday)
    .in("status", ["booked", "completed", "no_show"])

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }

  const grouped = new Map<string, typeof bookings>()

  for (const booking of bookings ?? []) {
    const key = `${booking.coach_id}-${booking.lesson_date}-${booking.lesson_time}`

    if (!grouped.has(key)) {
      grouped.set(key, [])
    }

    grouped.get(key)!.push(booking)
  }

  const duplicates = Array.from(grouped.values()).filter(
    (group) => group.length > 1
  )

  const activeKeys = new Set<string>()

  for (const duplicate of duplicates) {
    const coachId = duplicate[0].coach_id
    const lessonDate = duplicate[0].lesson_date
    const lessonTime = duplicate[0].lesson_time

    const key = `${coachId}-${lessonDate}-${lessonTime}`

    activeKeys.add(key)

    const { data: existingAlert } = await supabase
      .from("double_booking_alerts")
      .select("id")
      .eq("coach_id", coachId)
      .eq("lesson_date", lessonDate)
      .eq("lesson_time", lessonTime)
      .maybeSingle()

    if (existingAlert) {
      continue
    }

    const { data: coach } = await supabase
      .from("coaches")
      .select("name, preferred_name")
      .eq("id", coachId)
      .single()

    const clientIds = duplicate.map((b) => b.client_id)

    const { data: clients } = await supabase
      .from("clients")
      .select("id, name")
      .in("id", clientIds)

    const clientMap = new Map(
      (clients ?? []).map((client) => [client.id, client.name])
    )

    let message =
      `⚠️ DOUBLE BOOKING DETECTED\n\n` +
      `Coach: ${coach?.preferred_name || coach?.name || "Unknown"}\n\n` +
      `Date: ${lessonDate}\n` +
      `Time: ${lessonTime}\n\n`

		duplicate.forEach((booking) => {
			message +=
				`${clientMap.get(booking.client_id) || "Unknown Client"}|${booking.client_id}\n`
		})

		message += "\n"

    message += "Please resolve immediately."

    await supabase.from("notifications").insert({
      coach_id: coachId,
      client_id: null,
      booking_id: null,
      type: "double_booking",
      is_urgent: true,
      is_read: false,
      message,
    })

    await supabase.from("double_booking_alerts").insert({
      coach_id: coachId,
      lesson_date: lessonDate,
      lesson_time: lessonTime,
    })
  }

  const { data: alerts } = await supabase
    .from("double_booking_alerts")
    .select("*")

  for (const alert of alerts ?? []) {
    const key = `${alert.coach_id}-${alert.lesson_date}-${alert.lesson_time}`

    if (!activeKeys.has(key)) {
      await supabase
        .from("double_booking_alerts")
        .delete()
        .eq("id", alert.id)
    }
  }

  return NextResponse.json({
    success: true,
    duplicates: duplicates.length,
  })
}