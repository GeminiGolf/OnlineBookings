"use client"

import { useState } from "react"
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
        <p className="flex items-center gap-2 text-sm text-gray-500">
          Coach

          <button
            onClick={() => setEditing(true)}
            className="rounded px-1 hover:bg-gray-100"
          >
            ✏️
          </button>
        </p>

        <p>{coachName}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500">
        Coach
      </p>

      <select
        value={coachId ?? ""}
        onChange={(e) =>
          setCoachId(Number(e.target.value))
        }
        className="mt-1 rounded border px-2 py-1"
      >
        {coaches.map((coach) => (
          <option key={coach.id} value={coach.id}>
            {coach.name}
          </option>
        ))}
      </select>

      <div className="mt-2 flex gap-2">
        <button
          onClick={save}
          className="rounded bg-blue-600 px-3 py-1 text-white"
        >
          Save
        </button>

        <button
          onClick={() => {
            setCoachId(initialCoachId)
            setEditing(false)
          }}
          className="rounded border px-3 py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}