import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabaseServer"

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

  const { clientId } = await request.json()

  if (!clientId) {
    return NextResponse.json(
      { error: "No client selected." },
      { status: 400 }
    )
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select(`
      profile_id,
      name,
      preferred_name,
      first_name,
      last_name,
      email,
      phone
    `)
    .eq("id", clientId)
    .single()

  if (clientError || !client) {
    return NextResponse.json(
      { error: "Client not found." },
      { status: 404 }
    )
  }

  const { data: existingCoach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", client.profile_id)
    .maybeSingle()

  if (existingCoach) {
    return NextResponse.json(
      { error: "This client is already a coach." },
      { status: 400 }
    )
  }

  const { error: coachError } = await supabase
    .from("coaches")
    .insert({
      profile_id: client.profile_id,
      name: client.name,
      preferred_name: client.preferred_name,
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
    })

  if (coachError) {
    return NextResponse.json(
      { error: coachError.message },
      { status: 400 }
    )
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: "coach",
    })
    .eq("id", client.profile_id)

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
  })
}