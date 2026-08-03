"use client"

type Coach = {
  id: number
  name: string
  preferred_name?: string | null
}

type Props = {
  coaches: Coach[]
  selectedCoachId?: number | null
  onChange: (coachId: number | null) => void
}

export default function AdminCoachSelector({
  coaches,
  selectedCoachId,
  onChange,
}: Props) {
  return (
    <select
      value={selectedCoachId ?? ""}
      onChange={(e) =>
        onChange(
          e.target.value
            ? Number(e.target.value)
            : null
        )
      }
      className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none focus:ring-2 focus:ring-[#2F5A43]/15"
    >
      <option value="">
        Select Coach
      </option>

      {coaches.map((coach) => (
        <option
          key={coach.id}
          value={coach.id}
        >
          {coach.preferred_name || coach.name}
        </option>
      ))}
    </select>
  )
}