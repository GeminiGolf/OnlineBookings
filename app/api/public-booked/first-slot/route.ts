import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(request: NextRequest) {
  const coachId = request.nextUrl.searchParams.get("coachId")
  const date = request.nextUrl.searchParams.get("date")
  const excludeBookingId = request.nextUrl.searchParams.get("excludeBookingId")

  if (!coachId || !date) {
    return NextResponse.json(null)
  }

  let query = supabaseAdmin
    .from("bookings")
    .select("lesson_time")
    .eq("coach_id", coachId)
    .eq("lesson_date", date)
    .eq("status", "booked")

  if (excludeBookingId) {
    query = query.neq("id", excludeBookingId)
  }

  const { data, error } = await query
    .order("lesson_time", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json(null)
  }

  return NextResponse.json(data)
}