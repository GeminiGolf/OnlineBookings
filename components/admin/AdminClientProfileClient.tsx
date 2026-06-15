"use client"

import { useState } from "react"
import AdminCoachSelector from "@/components/admin/AdminCoachSelector"
import AdminBookLessonCard from "@/components/admin/AdminBookLessonCard"

type Coach = {
  id: number
  name: string
  preferred_name?: string | null
}

type Props = {
  clientId: number
  coaches: Coach[]
  initialCoachId?: number | null
}

export default function AdminClientProfileClient({
  clientId,
  coaches,
  initialCoachId,
}: Props) {
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(
    initialCoachId ?? null
  )

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <h2 className="mb-4 text-[19px] font-bold">
        Book A Lesson
      </h2>
      <div className="mb-4">
        <p className="mb-1 text-sm text-gray-500">
          Coach
        </p>
        <AdminCoachSelector
          coaches={coaches}
          selectedCoachId={selectedCoachId}
          onChange={setSelectedCoachId}
        />
      </div>
      {selectedCoachId ? (
        <AdminBookLessonCard
          clientId={clientId}
          coachId={selectedCoachId}
        />
      ) : (
        <div className="rounded-lg border p-4">
          <p className="text-gray-500">
            Select a coach to view availability.
          </p>
        </div>
      )}
    </div>
  )
}