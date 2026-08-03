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
      className="rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none focus:ring-2 focus:ring-[#2F5A43]/15"
    >
      <option value="" className="bg-[#FCFAF6] text-[#2F5A43]">
        Select Coach
      </option>
      {coaches.map((coach) => (
        <option
          key={coach.id}
          value={coach.id}
          className="bg-[#FCFAF6] text-[#2F5A43]"
        >
          {coach.name}
        </option>
      ))}
    </select>
  )
}