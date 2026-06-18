"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

const days = [
  { label: "Monday",    value: 1 },
  { label: "Tuesday",   value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday",  value: 4 },
  { label: "Friday",    value: 5 },
  { label: "Saturday",  value: 6 },
  { label: "Sunday",    value: 0 },
];

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
    if (!session) {
      router.push("/login")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
    if (!profile || profile.role !== "coach") {
      router.push("/")
      return
    }
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

    if (start === "" || end === "") {
      if (existing?.id) {
        await supabase.from("availability").delete().eq("id", existing.id)
      }
      await fetchAvailability(coachId)
      setLoading(false)
      return
    }

    if (existing?.id) {
      await supabase
        .from("availability")
        .update({
          start_time: start,
          end_time: end,
        })
        .eq("id", existing.id)
    } else {

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

  if (loadingPage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-500">Loading...</p>
      </main>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-100 p-2 sm:p-10 text-black">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-4 sm:p-8 shadow-lg">
        <Link
          href="/coach/dashboard"
          className="mb-6 inline-block rounded-lg border bg-white px-4 py-2"
        >
          ← Back to Dashboard
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Coach Availability</h1>
          <p className="mt-2 text-gray-500">Configure your weekly lesson schedule.</p>
        </div>

        <div className="space-y-2">
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
  const [expanded, setExpanded] = useState(false)
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
    <div className="rounded-xl border border-black py-4 px-5">
      {/* DESKTOP */}
      <div className="hidden min-[900px]:flex items-center justify-between">
        <h3 className="min-w-[180px] text-[16px] font-bold">
          {dayLabel}
        </h3>
        <div className="flex items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Start Time
            </label>

            <input
              type="time"
              step="3600"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="rounded-lg border border-black px-3 py-1 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              End Time
            </label>

            <input
              type="time"
              step="3600"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="rounded-lg border border-black px-3 py-1 text-sm"
            />
          </div>

          {!start || !end ? (
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  "Confirm opening this day for all future weeks?"
                )
                if (!confirmed) return
                setStart("08:00")
                setEnd("19:00")
                onSave("08:00", "19:00")
              }}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Open
            </button>
          ) : (
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  "Confirm closing this day for all future weeks?"
                )
                if (!confirmed) return
                setStart("")
                setEnd("")
                onSave("", "")
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Close
            </button>
          )}

          <button
            onClick={() => setShowBreaks(!showBreaks)}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Breaks ({selectedBreaks.length})
          </button>
        </div>
      </div>

      {/* MOBILE */}

      <div className="min-[900px]:hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between"
        >
          <h3 className="text-[18px] font-bold">{dayLabel}</h3>
          <span className="text-lg">
            {expanded ? "▼" : "▶"}
          </span>
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Start Time
                </label>
                <input
                  type="time"
                  step="3600"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-black px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  End Time
                </label>

                <input
                  type="time"
                  step="3600"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-black px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {!start || !end ? (
                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Confirm opening this day for all future weeks?"
                    )

                    if (!confirmed) return
                    setStart("08:00")
                    setEnd("19:00")
                    onSave("08:00", "19:00")
                  }}
                  className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white"
                >
                  Open
                </button>
              ) : (
                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Confirm closing this day for all future weeks?"
                    )
                    if (!confirmed) return
                    setStart("")
                    setEnd("")
                    onSave("", "")
                  }}
                  className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white"
                >
                  Close
                </button>
              )}
              <button
                onClick={() => setShowBreaks(!showBreaks)}
                className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white"
              >
                Breaks ({selectedBreaks.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {showBreaks && start && end && (
        <div className="mt-4 rounded-lg border p-4">
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
            {generateHours().map((hour) => (
              <label key={hour} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedBreaks.includes(hour)}
                  onChange={() => {
                    setSelectedBreaks((current) =>
                      current.includes(hour)
                        ? current.filter((item) => item !== hour)
                        : [...current, hour]
                    )
                  }}
                />
                {formatHour(hour)}
              </label>
            ))}
          </div>
          <button
            onClick={saveBreaks}
            className="mt-4 rounded-lg bg-black px-4 py-2 font-semibold text-white"
          >
            Save Breaks
          </button>
        </div>
      )}
    </div>
  )
}
