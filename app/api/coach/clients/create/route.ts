import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabaseServer"
import { createClient as createAdminClient } from "@supabase/supabase-js"

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Verify this user is a coach
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", user.id)
    .single()

  if (!coach) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  const {
    preferredName,
    firstName,
    lastName,
    phone,
    email,
    password,
  } = await request.json()

  // Validation
  if (!firstName?.trim()) {
    return NextResponse.json(
      { error: "Given name is required." },
      { status: 400 }
    )
  }

  if (!lastName?.trim()) {
    return NextResponse.json(
      { error: "Family name is required." },
      { status: 400 }
    )
  }

  if (!email?.trim()) {
    return NextResponse.json(
      { error: "Email is required." },
      { status: 400 }
    )
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    )
  }

  // Create Auth user.
  // handle_new_user will automatically create the
  // profile and client record.
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: {
        preferred_name: preferredName,
        given_name: firstName,
        family_name: lastName,
        phone,
        primary_coach_id: coach.id,
      },
    })

  if (authError) {
    console.error(authError)

    return NextResponse.json(
      authError,
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
  })
}