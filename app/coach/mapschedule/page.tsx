"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import DashboardContainer from "@/components/layout/DashboardContainer"
import LoadingScreen from "@/components/ui/LoadingScreen"

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
    return <LoadingScreen text="Loading availability..." />
  }

  if (!authorized) {
    return null
  }

  return (
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#1F3327]">
      <DashboardContainer>
        <Link
          href="/coach/dashboard"
          className="mb-3 sm:mb-6 inline-flex items-center gap-2 rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[13px] font-light tracking-[0.04em] text-[#1F3327] shadow-sm transition hover:bg-[#F6FAF6]"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-5 sm:mb-6">
          <h1 className="text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
            Coach Availability
          </h1>

          <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-[#1F3327]">
            Configure your weekly lesson schedule.
          </p>
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
      </DashboardContainer>
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
    return `${display} ${suffix}`
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
    <div className="rounded-3xl border border-[#3A5D49] bg-white px-5 py-5 shadow-md">
      {/* DESKTOP */}
      <div className="hidden min-[900px]:flex items-center justify-between">
        <h3 className="min-w-[180px] text-[20px] font-light tracking-[0.02em] text-[#2F5A43]">
          {dayLabel}
        </h3>
        <div className="flex items-end gap-3">
          <div>
            <label className="dashboard-label mb-1 block">
              Start Time
            </label>

            <input
              type="time"
              step="3600"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="rounded-xl border border-[#3A5D49] bg-white px-3 py-2 text-[15px] font-light text-[#1F3327] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <div>
            <label className="dashboard-label mb-1 block">
              End Time
            </label>

            <input
              type="time"
              step="3600"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="rounded-xl border border-[#3A5D49] bg-white px-3 py-2 text-[15px] font-light text-[#1F3327] focus:border-[#2F5A43] focus:outline-none"
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
              className="rounded-xl border-2 border-[#3A5D49] bg-[#35684C] px-5 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#2F5A43]"
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
              className="rounded-xl border-2 border-[#7F2E2E] bg-[#9B3B3B] px-5 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#842F2F]"
            >
              Close
            </button>
          )}

          <button
            onClick={async () => {
              await onSave(start, end)
              alert("Times saved")
            }}
            disabled={!start || !end}
            className="shrink-0 rounded-xl border border-[#3A5D49] bg-[#2F5A43] px-5 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#244634] disabled:opacity-50"
          >
            Save
          </button>

          <button
            onClick={() => setShowBreaks(!showBreaks)}
            className="shrink-0 rounded-xl border border-[#4E6FA8] bg-[#4E6FA8] px-5 py-2 text-[15px] font-light text-white shadow-sm transition hover:bg-[#3F5E92]"
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
          <h3 className="text-[18px] font-light tracking-[0.02em] text-[#2F5A43]">
            {dayLabel}
          </h3>

          <span className="text-[18px] text-[#2F5A43]">
            {expanded ? "▼" : "▶"}
          </span>
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="dashboard-label mb-1 block">
                  Start Time
                </label>

                <input
                  type="time"
                  step="3600"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#3A5D49] bg-white px-3 py-2 text-[15px] font-light text-[#1F3327] focus:border-[#2F5A43] focus:outline-none"
                />
              </div>

              <div>
                <label className="dashboard-label mb-1 block">
                  End Time
                </label>

                <input
                  type="time"
                  step="3600"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#3A5D49] bg-white px-3 py-2 text-[15px] font-light text-[#1F3327] focus:border-[#2F5A43] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
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
                  className="rounded-xl border-2 border-[#3A5D49] bg-[#35684C] px-3 py-2 text-[15px] font-light text-white shadow-sm"
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
                  className="rounded-xl border-2 border-[#7F2E2E] bg-[#9B3B3B] px-3 py-2 text-[15px] font-light text-white shadow-sm"
                >
                  Close
                </button>
              )}

              <button
                onClick={async () => {
                  await onSave(start, end)
                  alert("Times saved")
                }}
                disabled={!start || !end}
                className="rounded-xl border border-[#3A5D49] bg-[#2F5A43] px-3 py-2 text-[15px] font-light text-white shadow-sm disabled:opacity-50"
              >
                Save
              </button>

              <button
                onClick={() => setShowBreaks(!showBreaks)}
                className="rounded-xl border border-[#4E6FA8] bg-[#4E6FA8] px-3 py-2 text-[15px] font-light text-white shadow-sm"
              >
                Breaks ({selectedBreaks.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {showBreaks && start && end && (
        <div className="mt-4 rounded-2xl border border-[#3A5D49] bg-[#FBF8F3] p-5">
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
            {generateHours().map((hour) => (
              <label
                key={hour}
                className="dashboard-value flex items-center gap-2"
              >
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
            className="mt-4 rounded-xl border border-[#3A5D49] bg-[#2F5A43] px-5 py-2 text-[15px] font-light text-white shadow-sm transition hover:bg-[#244634]"
          >
            Save Breaks
          </button>
        </div>
      )}
    </div>
  )
}
