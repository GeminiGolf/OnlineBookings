"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type Coach = {
  id: number
  name: string
}

type Props = {
  clientId: number
  coaches: Coach[]
  initialCoachId: number | null
}

export default function AdminCoachEditor({
  clientId,
  coaches,
  initialCoachId,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [coachId, setCoachId] = useState(initialCoachId)

  async function save() {
    const { error } = await supabase
      .from("clients")
      .update({
        primary_coach_id: coachId,
      })
      .eq("id", clientId)

    if (error) {
      alert(error.message)
      return
    }

    setEditing(false)
    window.location.reload()
  }

  const coachName =
    coaches.find((c) => c.id === coachId)?.name ?? "Unassigned"

  if (!editing) {
    return (
      <div>
        <div className="mb-1 flex items-center gap-2">
          <p className="dashboard-label">
            Coach
          </p>

          <button
            onClick={() => setEditing(true)}
            type="button"
            className="text-[#2F5A43] transition hover:text-[#55725F]"
          >
            <Pencil size={14} />
          </button>
        </div>

        <p className="dashboard-value">
          {coachName}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#3A5D49] bg-white p-5 shadow-sm">
      <div>
        <label className="dashboard-label mb-2 block">
          Coach
        </label>

        <select
          value={coachId ?? ""}
          onChange={(e) => {
            setCoachId(
              e.target.value
                ? Number(e.target.value)
                : null
            )
          }}
          className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
        >
          <option value="">Select a coach</option>

          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={save}
          className="rounded-xl bg-[#2F5A43] px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634]"
        >
          Save
        </button>

        <button
          onClick={() => {
            setCoachId(initialCoachId)
            setEditing(false)
          }}
          className="rounded-xl border border-[#9D3E3E] bg-white px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#9D3E3E] transition hover:bg-[#FDF4F4]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}