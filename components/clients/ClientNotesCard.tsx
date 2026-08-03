"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  clientId: number
  initialNotes: string | null
}

export default function ClientNotesCard({
  clientId,
  initialNotes,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(initialNotes || "")
  const [saving, setSaving] = useState(false)

  async function saveNotes() {
    try {
      setSaving(true)

      const { error } = await supabase
        .from("clients")
        .update({
          notes,
        })
        .eq("id", clientId)

      if (error) {
        alert(error.message)
        return
      }

      setEditing(false)
    } catch (error) {
      console.error(error)
      alert("Failed to save notes.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <p className="dashboard-label">
          Notes
        </p>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            type="button"
            className="text-[#2F5A43] transition hover:text-[#55725F]"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4 rounded-2xl border border-[#3A5D49] bg-white p-5 shadow-sm">
          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            rows={4}
            className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-3 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
            placeholder="Enter notes..."
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={saveNotes}
              disabled={saving}
              className="rounded-xl bg-[#2F5A43] px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => {
                setNotes(initialNotes || "")
                setEditing(false)
              }}
              className="rounded-xl border border-[#9D3E3E] bg-white px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#9D3E3E] transition hover:bg-[#FDF4F4]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="dashboard-value">
          {notes || "No Notes"}
        </p>
      )}
    </div>
  )
}