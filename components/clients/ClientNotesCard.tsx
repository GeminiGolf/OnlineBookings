"use client"

import { useState } from "react"
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
        <p className="text-gray-500">Notes</p>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ✏️
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            rows={4}
            className="w-full rounded border p-2"
            placeholder="Enter notes..."
          />

          <div className="flex gap-2">
            <button
              onClick={saveNotes}
              disabled={saving}
              className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => {
                setNotes(initialNotes || "")
                setEditing(false)
              }}
              className="rounded bg-gray-300 px-3 py-1 text-black hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="font-bold">
        {notes || "No notes"}
        </p>
      )}
    </div>
  )
}