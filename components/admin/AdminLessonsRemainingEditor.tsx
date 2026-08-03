"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
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
        <div className="mb-1 flex items-center gap-2">
          <p className="dashboard-label">
            Lessons Remaining
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
          {value}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#3A5D49] bg-white p-5 shadow-sm">
      <div>
        <label className="dashboard-label mb-2 block">
          Lessons Remaining
        </label>

        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onFocus={(e) => e.target.select()}
          className="w-28 rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
        />
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
            setValue(initialLessonsRemaining)
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