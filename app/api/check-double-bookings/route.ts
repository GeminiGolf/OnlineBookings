import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { coachId, lessonDate, lessonTime } = await req.json()

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        coach_id,
        client_id,
        lesson_date,
        lesson_time,
        status
      `)
      .eq("coach_id", coachId)
      .eq("lesson_date", lessonDate)
      .eq("lesson_time", lessonTime)
      .in("status", ["booked", "completed", "no_show"])

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // No conflict (or conflict resolved)
    if (!bookings || bookings.length <= 1) {
      await supabase
        .from("double_booking_alerts")
        .delete()
        .eq("coach_id", coachId)
        .eq("lesson_date", lessonDate)
        .eq("lesson_time", lessonTime)

      return NextResponse.json({
        success: true,
        duplicate: false,
      })
    }

    const { data: existingAlert } = await supabase
      .from("double_booking_alerts")
      .select("id")
      .eq("coach_id", coachId)
      .eq("lesson_date", lessonDate)
      .eq("lesson_time", lessonTime)
      .maybeSingle()

    if (existingAlert) {
      return NextResponse.json({
        success: true,
        duplicate: true,
      })
    }

    const { data: coach } = await supabase
      .from("coaches")
      .select("name, preferred_name")
      .eq("id", coachId)
      .single()

    const clientIds = bookings.map((b) => b.client_id)

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

    bookings.forEach((booking) => {
      message += `${clientMap.get(booking.client_id) || "Unknown Client"}|${booking.client_id}\n`
    })

    message += "\nPlease resolve immediately."

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

    return NextResponse.json({
      success: true,
      duplicate: true,
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Server error", details: err },
      { status: 500 }
    )
  }
}