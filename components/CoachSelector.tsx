"use client"

import { useRouter, useSearchParams } from "next/navigation"

type Coach = {
  id: number
  name: string
}
type Props = {
  coaches: Coach[]
  selectedCoachId?: number
  selectedDate: string
}

export default function CoachSelector({
  coaches,
  selectedCoachId,
  selectedDate,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <select
      value={selectedCoachId ?? ""}
      onChange={(e) => {
        const coachId = e.target.value
        if (!coachId) {
          router.push(`/admin/schedule?date=${selectedDate}`)
          return
        }
        const params = new URLSearchParams(searchParams.toString())
        params.set("coach", coachId)
        params.set("date", selectedDate)
        router.push(`/admin/schedule?${params.toString()}`)
      }}
      className="rounded-lg border bg-white px-4 py-2 text-black"
    >
      <option value="">Select Coach</option>
      {coaches.map((coach) => (
        <option key={coach.id} value={coach.id}>
          {coach.name}
        </option>
      ))}
    </select>
  )
}