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
    <div className="rounded-3xl border border-[#3A5D49] bg-white p-3 shadow-md lg:px-6 lg:py-5">
      <h2 className="dashboard-heading mb-3">
        Book A Lesson
      </h2>
      <div className="mb-4">
        <p className="dashboard-label mb-2">
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
        <div className="rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] p-5">
          <p className="dashboard-value">
            Select a coach to view availability.
          </p>
        </div>
      )}
    </div>
  )
}