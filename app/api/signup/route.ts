import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: NextRequest) {
  const { email, phone } = await req.json()

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("email, phone")
    .or(`email.eq.${email.trim()},phone.eq.${phone.trim()}`)
    .limit(2)

  if (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Unable to verify account." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    emailExists: data.some((c) => c.email === email.trim()),
    phoneExists: data.some((c) => c.phone === phone.trim()),
  })
}