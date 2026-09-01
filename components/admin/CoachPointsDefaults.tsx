"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  coach: {
    id: number
    complete_points: number | null
    review_points: number | null
  }
}

export default function AdminCoachPointsDefaultsCard({ coach }: Props) {
  const [completePoints, setCompletePoints] = useState<number | "">(
    coach.complete_points ?? ""
  )
  const [reviewPoints, setReviewPoints] = useState<number | "">(
    coach.review_points ?? ""
  )
  const [saving, setSaving] = useState(false)

  async function saveDefaults() {
    setSaving(true)

    await supabase
      .from("coaches")
      .update({
        complete_points: completePoints === "" ? null : Number(completePoints),
        review_points: reviewPoints === "" ? null : Number(reviewPoints),
      })
      .eq("id", coach.id)

    setSaving(false)
  }

  return (
    <div className="rounded-3xl border border-[#3A5D49] bg-white p-5 shadow-md lg:px-6 lg:py-5">
      <h2 className="dashboard-heading mb-4">Points Defaults</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="p-2 text-left font-medium text-gray-500">
              Action
            </th>
            <th className="p-2 text-left font-medium text-gray-500">
              Points
            </th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b border-gray-100">
            <td className="p-2 dashboard-value">Complete Lesson</td>
            <td className="p-2">
              <input
                type="number"
                value={completePoints}
                onChange={(e) =>
                  setCompletePoints(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-24 rounded-xl border border-[#3A5D49] bg-white px-3 py-1.5 text-black outline-none focus:ring-1 focus:ring-[#3A5D49]"
              />
            </td>
          </tr>

          <tr>
            <td className="p-2 dashboard-value">Review Lesson</td>
            <td className="p-2">
              <input
                type="number"
                value={reviewPoints}
                onChange={(e) =>
                  setReviewPoints(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-24 rounded-xl border border-[#3A5D49] bg-white px-3 py-1.5 text-black outline-none focus:ring-1 focus:ring-[#3A5D49]"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <button
        onClick={saveDefaults}
        disabled={saving}
        className="mt-4 rounded-xl border border-[#3A5D49] bg-[#3A5D49] px-5 py-2 text-[15px] font-light tracking-[0.04em] text-white shadow-sm transition hover:bg-[#2F5A43] disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Defaults"}
      </button>
    </div>
  )
}