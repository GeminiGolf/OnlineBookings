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
      className="w-full rounded-lg border bg-white px-3 py-2 text-black"
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