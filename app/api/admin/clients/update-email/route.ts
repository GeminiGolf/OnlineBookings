import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { profileId, email } = await req.json()

    if (!profileId || !email) {
      return NextResponse.json(
        { error: "Missing profileId or email" },
        { status: 400 }
      )
    }

    // Update Supabase Auth
    const { error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(profileId, {
        email,
      })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Update clients table
    const { error: clientError } = await supabaseAdmin
      .from("clients")
      .update({ email })
      .eq("profile_id", profileId)

    if (clientError) {
      return NextResponse.json(
        { error: clientError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}