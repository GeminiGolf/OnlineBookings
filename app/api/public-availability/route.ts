import { NextRequest, NextResponse } from "next/server"
import { supabaseInternal } from "@/lib/supabaseInternal"
import { generateSlots } from "@/lib/scheduling/generateSlots"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const coachId = Number(searchParams.get("coachId"))
  const date = searchParams.get("date")

  if (!coachId || !date) {
    return NextResponse.json(
      { error: "Missing coachId or date." },
      { status: 400 }
    )
  }

	const slots = await generateSlots(
		supabaseInternal,
		coachId,
		new Date(date)
	)

  return NextResponse.json(slots)
}