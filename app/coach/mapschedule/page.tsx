"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

const days = [
  {
    label: "Monday",
    value: 1,
  },
  {
    label: "Tuesday",
    value: 2,
  },
  {
    label: "Wednesday",
    value: 3,
  },
  {
    label: "Thursday",
    value: 4,
  },
  {
    label: "Friday",
    value: 5,
  },
  {
    label: "Saturday",
    value: 6,
  },
  {
    label: "Sunday",
    value: 0,
  },
]

type Availability = {
  id?: number
  day_of_week: number
  start_time: string
  end_time: string
}

type WeeklyBreak = {
  id?: number
  coach_id: number
  day_of_week: number
  hour: number
}

export default function CoachPage() {
  const router = useRouter()

  const [authorized, setAuthorized] = useState(false)

  const [loadingPage, setLoadingPage] = useState(true)

  const [coachId, setCoachId] = useState<number | null>(null)

  const [availability, setAvailability] = useState<Availability[]>([])

  const [weeklyBreaks, setWeeklyBreaks] = useState<WeeklyBreak[]>([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkCoachAccess()
  }, [])

  async function checkCoachAccess() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // NOT LOGGED IN

    if (!session) {
      router.push("/login")

      return
    }

    // PROFILE

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    // NOT COACH

    if (!profile || profile.role !== "coach") {
      router.push("/")

      return
    }

    // LOAD COACH

    const { data: coach } = await supabase.from("coaches").select("*").eq("profile_id", session.user.id).single()

    if (!coach) {
      router.push("/")

      return
    }

    setCoachId(coach.id)

    setAuthorized(true)

    setLoadingPage(false)

    fetchAvailability(coach.id)
  }

  async function fetchAvailability(currentCoachId: number) {
    const { data } = await supabase.from("availability").select("*").eq("coach_id", currentCoachId)

    if (data) {
      setAvailability(data)
    }

    const { data: breaksData } = await supabase.from("weekly_breaks").select("*").eq("coach_id", currentCoachId)

    if (breaksData) {
      setWeeklyBreaks(breaksData)
    }
  }

  function getDayAvailability(day: number) {
    return availability.find((item) => item.day_of_week === day)
  }

  async function saveAvailability(day: number, start: string, end: string) {
    if (!coachId) {
      return
    }

    setLoading(true)

    const existing = getDayAvailability(day)

    // CLOSED DAY

    if (start === "" || end === "") {
      if (existing?.id) {
        await supabase.from("availability").delete().eq("id", existing.id)
      }

      await fetchAvailability(coachId)

      setLoading(false)

      return
    }

    // UPDATE

    if (existing?.id) {
      await supabase
        .from("availability")
        .update({
          start_time: start,
          end_time: end,
        })
        .eq("id", existing.id)
    } else {
      // INSERT

      await supabase.from("availability").insert({
        coach_id: coachId,
        day_of_week: day,
        start_time: start,
        end_time: end,
      })
    }

    await fetchAvailability(coachId)

    setLoading(false)
  }

  // LOADING SCREEN

  if (loadingPage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-500">Loading...</p>
      </main>
    )
  }

  // SAFETY

  if (!authorized) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10 text-black">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8">
          <h1 className="text-5xl font-bold">Coach Availability</h1>

          <p className="mt-2 text-gray-500">Configure your weekly lesson schedule.</p>
        </div>

        <div className="space-y-4">
          {days.map((day) => {
            const existing = getDayAvailability(day.value)

            return (
              <DayAvailabilityRow
                key={day.value}
                dayLabel={day.label}
                dayValue={day.value}
                coachId={coachId!}
                existing={existing}
                weeklyBreaks={weeklyBreaks}
                onSave={(start, end) => saveAvailability(day.value, start, end)}
              />
            )
          })}
        </div>

        {loading && <p className="mt-6 text-sm text-gray-500">Saving...</p>}
      </div>
    </main>
  )
}

type RowProps = {
  dayLabel: string
  dayValue: number
  coachId: number
  existing?: Availability
  weeklyBreaks: WeeklyBreak[]
  onSave: (start: string, end: string) => void
}

function DayAvailabilityRow({ dayLabel, dayValue, coachId, existing, weeklyBreaks, onSave }: RowProps) {
  const [start, setStart] = useState(existing?.start_time || "")

  const [end, setEnd] = useState(existing?.end_time || "")

  const [showBreaks, setShowBreaks] = useState(false)

  const [selectedBreaks, setSelectedBreaks] = useState<number[]>([])

  useEffect(() => {
    setStart(existing?.start_time || "")

    setEnd(existing?.end_time || "")

    const breaksForDay = weeklyBreaks.filter((item) => item.day_of_week === dayValue).map((item) => item.hour)

    setSelectedBreaks(breaksForDay)
  }, [existing, weeklyBreaks, dayValue])

  function generateHours() {
    if (!start || !end) {
      return []
    }

    const startHour = parseInt(start.split(":")[0])

    const endHour = parseInt(end.split(":")[0])

    const hours = []

    for (let hour = startHour; hour < endHour; hour++) {
      hours.push(hour)
    }

    return hours
  }

  function formatHour(hour: number) {
    const suffix = hour >= 12 ? "PM" : "AM"

    const display = hour % 12 || 12

    return `${display}:00 ${suffix}`
  }

  async function saveBreaks() {
    await supabase.from("weekly_breaks").delete().eq("coach_id", coachId).eq("day_of_week", dayValue)

    if (selectedBreaks.length > 0) {
      await supabase.from("weekly_breaks").insert(
        selectedBreaks.map((hour) => ({
          coach_id: coachId,
          day_of_week: dayValue,
          hour,
        }))
      )
    }

    setShowBreaks(false)
  }

  return (
    <div className="rounded-2xl border border-black p-8">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold">{dayLabel}</h3>

        <div className="flex items-end gap-4">
          <div>
            <label className="mb-2 block text-lg">Start Time</label>

            <input
              type="time"
              step="3600"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="rounded-xl border border-black p-4"
            />
          </div>

          <div>
            <label className="mb-2 block text-lg">End Time</label>

            <input
              type="time"
              step="3600"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="rounded-xl border border-black p-4"
            />
          </div>

          <button onClick={() => onSave(start, end)} className="rounded-xl bg-black px-8 py-4 font-bold text-white">
            Save
          </button>

          <button
            onClick={() => {
              setStart("")
              setEnd("")

              onSave("", "")
            }}
            className="rounded-xl bg-red-600 px-8 py-4 font-bold text-white"
          >
            Closed
          </button>

          {!!start && !!end && (
            <button
              onClick={() => setShowBreaks(!showBreaks)}
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold text-white"
            >
              Breaks ({selectedBreaks.length})
            </button>
          )}
        </div>
      </div>

      {showBreaks && (
        <div className="mt-6 rounded-xl border p-6">
          <div className="grid grid-cols-4 gap-3">
            {generateHours().map((hour) => (
              <label key={hour} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedBreaks.includes(hour)}
                  onChange={() => {
                    setSelectedBreaks((current) =>
                      current.includes(hour) ? current.filter((item) => item !== hour) : [...current, hour]
                    )
                  }}
                />

                {formatHour(hour)}
              </label>
            ))}
          </div>

          <button onClick={saveBreaks} className="mt-6 rounded-xl bg-black px-6 py-3 font-bold text-white">
            Save Breaks
          </button>
        </div>
      )}
    </div>
  )
}
