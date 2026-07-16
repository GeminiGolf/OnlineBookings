"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"


type Props = {
  clientId: number
  initialLessonsRemaining: number
}

export default function AdminLessonsRemainingEditor({
  clientId,
  initialLessonsRemaining,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialLessonsRemaining)

  async function save() {
    const { error } = await supabase
      .from("clients")
      .update({
        lessons_remaining: value,
      })
      .eq("id", clientId)

    if (error) {
      alert(error.message)
      return
    }

    setEditing(false)
    window.location.reload()
  }

  if (!editing) {
    return (
      <div>
        <p className="text-sm text-gray-500 flex items-center gap-2">
          Lessons Remaining

          <button
            onClick={() => setEditing(true)}
            className="rounded px-1 hover:bg-gray-100"
          >
            ✏️
          </button>
        </p>

        <p>{value}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500">
        Lessons Remaining
      </p>

      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-1 w-24 rounded border px-2 py-1"
      />

      <div className="mt-2 flex gap-2">
        <button
          onClick={save}
          className="rounded bg-blue-600 px-3 py-1 text-white"
        >
          Save
        </button>

        <button
          onClick={() => {
            setValue(initialLessonsRemaining)
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