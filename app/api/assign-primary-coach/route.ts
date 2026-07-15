import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { clientId, coachId } = await req.json()

    const { data: client, error: fetchError } = await supabase
      .from("clients")
      .select("primary_coach_id")
      .eq("id", clientId)
      .single()

    if (fetchError) {
      return NextResponse.json(fetchError, { status: 400 })
    }

    // Already assigned
    if (client.primary_coach_id) {
      return NextResponse.json({ success: true })
    }

    const { error } = await supabase
      .from("clients")
      .update({
        primary_coach_id: coachId,
      })
      .eq("id", clientId)

    if (error) {
      return NextResponse.json(error, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: err },
      { status: 500 }
    )
  }
}