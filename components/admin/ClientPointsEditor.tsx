"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Props = {
  clientId: number
  initialPoints: number | null
}

export default function ClientPointsEditor({ clientId, initialPoints }: Props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [points, setPoints] = useState<number>(initialPoints ?? 0)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)

    const { error } = await supabase
      .from("clients")
      .update({ points: Number(points) || 0 })
      .eq("id", clientId)

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    setIsEditing(false)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <p className="dashboard-label">Points</p>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[#2F5A43] transition hover:opacity-75"
            title="Edit Points"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>

      {!isEditing ? (
        <p className="dashboard-value mt-1">{initialPoints ?? 0}</p>
      ) : (
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-full max-w-[120px] rounded-xl border border-[#3A5D49] bg-white px-3 py-1 text-[15px] font-light text-[#2F5A43] focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[13px] font-medium text-[#2F5A43] underline"
          >
            {saving ? "..." : "Save"}
          </button>
          <button
            onClick={() => {
              setPoints(initialPoints ?? 0)
              setIsEditing(false)
            }}
            className="text-[13px] text-gray-500 underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}