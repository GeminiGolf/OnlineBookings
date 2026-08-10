import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {

  try {
    const body = await req.json()

    const {
      profile_id,
      endpoint,
      keys,
      userAgent,
    } = body

    if (
      !profile_id ||
      !endpoint ||
      !keys?.p256dh ||
      !keys?.auth
    ) {
      return NextResponse.json(
        { error: "Invalid subscription." },
        { status: 400 }
      )
    }

    // This browser/device should only ever belong to the latest logged-in account.
    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)

    const { data, error } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert(
        {
          profile_id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "profile_id,endpoint",
        }
        )
        .select()

    console.log("UPSERT RESULT:", data)

    if (error) {
      console.error(error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const { data: coach } = await supabaseAdmin
      .from("coaches")
      .select("id")
      .eq("profile_id", profile_id)
      .maybeSingle()

    if (coach) {
      await supabaseAdmin
        .from("coach_notification_preferences")
        .upsert(
          {
            coach_id: coach.id,
            late_booking: true,
            client_cancelled: true,
            double_booking: true,
            admin_message: true,
          },
          {
            onConflict: "coach_id",
          }
        )
    }

    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("id, name")
      .eq("profile_id", profile_id)
      .maybeSingle()

    if (client) {
      await supabaseAdmin
        .from("client_notification_preferences")
        .upsert(
          {
            client_id: client.id,
            name: client.name,
            late_booking_rejected: true,
            appointment_reminder_hours: [12],
            admin_messages: true,
          },
          {
            onConflict: "client_id",
          }
        )
    }

    return NextResponse.json({
      success: true,
    })
    
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    )
  }
}