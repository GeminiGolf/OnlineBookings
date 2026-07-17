import { NextRequest, NextResponse } from "next/server"
import { supabaseInternal } from "@/lib/supabaseInternal"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const coachId = Number(searchParams.get("coachId"))
  const date = searchParams.get("date")
  const before = searchParams.get("before")

  if (!coachId || !date || !before) {
    return NextResponse.json(
      { error: "Missing parameters." },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseInternal
    .from("bookings")
    .select("lesson_time")
    .eq("coach_id", coachId)
    .eq("lesson_date", date)
    .eq("status", "booked")
    .lt("lesson_time", before)
    .order("lesson_time", { ascending: false })
    .limit(1)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data?.[0] ?? null)
}