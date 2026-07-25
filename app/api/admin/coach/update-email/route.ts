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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  const { profileId, email } = await request.json()

  if (!profileId) {
    return NextResponse.json(
      { error: "Missing profile ID." },
      { status: 400 }
    )
  }

  const { error: authError } =
    await supabaseAdmin.auth.admin.updateUserById(
      profileId,
      {
        email,
      }
    )

  if (authError) {
    return NextResponse.json(
      { error: authError.message },
      { status: 400 }
    )
  }

  const { error: clientError } = await supabase
    .from("clients")
    .update({
      email,
    })
    .eq("profile_id", profileId)

  if (clientError) {
    return NextResponse.json(
      { error: clientError.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
  })
}