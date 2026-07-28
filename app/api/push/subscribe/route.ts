import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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

    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("profile_id", profile_id)
      .neq("endpoint", endpoint)

    const { error } = await supabaseAdmin
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

    if (error) {
      console.error(error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
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