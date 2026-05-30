"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  useRouter,
} from "next/navigation"

import {
  createClient,
} from "@/lib/supabaseClient"

const supabase =
  createClient()

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

export default function CoachPage() {

  const router =
    useRouter()

  const [
    authorized,
    setAuthorized,
  ] = useState(false)

  const [
    loadingPage,
    setLoadingPage,
  ] = useState(true)

  const [
    coachId,
    setCoachId,
  ] = useState<number | null>(
    null
  )

  const [
    availability,
    setAvailability,
  ] = useState<Availability[]>(
    []
  )

  const [
    loading,
    setLoading,
  ] = useState(false)

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

    const {
      data: profile,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq(
        "id",
        session.user.id
      )
      .single()

    // NOT COACH

    if (
      !profile ||
      profile.role !== "coach"
    ) {

      router.push("/")

      return
    }

    // LOAD COACH

    const {
      data: coach,
    } = await supabase
      .from("coaches")
      .select("*")
      .eq(
        "profile_id",
        session.user.id
      )
      .single()

    if (!coach) {

      router.push("/")

      return
    }

    setCoachId(coach.id)

    setAuthorized(true)

    setLoadingPage(false)

    fetchAvailability(
      coach.id
    )
  }

  async function fetchAvailability(
    currentCoachId: number
  ) {

    const {
      data,
    } = await supabase
      .from("availability")
      .select("*")
      .eq(
        "coach_id",
        currentCoachId
      )

    if (data) {

      setAvailability(data)
    }
  }

  function getDayAvailability(
    day: number
  ) {

    return availability.find(
      (item) =>
        item.day_of_week === day
    )
  }

  async function saveAvailability(
    day: number,
    start: string,
    end: string
  ) {

    if (!coachId) {

      return
    }

    setLoading(true)

    const existing =
      getDayAvailability(day)

    // CLOSED DAY

    if (
      start === "" ||
      end === ""
    ) {

      if (existing?.id) {

        await supabase
          .from("availability")
          .delete()
          .eq(
            "id",
            existing.id
          )
      }

      await fetchAvailability(
        coachId
      )

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
        .eq(
          "id",
          existing.id
        )

    } else {

      // INSERT

      await supabase
        .from("availability")
        .insert({
          coach_id: coachId,
          day_of_week: day,
          start_time: start,
          end_time: end,
        })
    }

    await fetchAvailability(
      coachId
    )

    setLoading(false)
  }

  // LOADING SCREEN

  if (loadingPage) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-gray-100">

        <p className="text-xl text-gray-500">

          Loading...

        </p>

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

          <h1 className="text-5xl font-bold">

            Coach Availability

          </h1>

          <p className="mt-2 text-gray-500">

            Configure your weekly lesson schedule.

          </p>

        </div>

        <div className="space-y-4">

          {days.map((day) => {

            const existing =
              getDayAvailability(
                day.value
              )

            return (

              <DayAvailabilityRow
                key={day.value}
                dayLabel={day.label}
                existing={existing}
                onSave={(
                  start,
                  end
                ) =>
                  saveAvailability(
                    day.value,
                    start,
                    end
                  )
                }
              />

            )
          })}

        </div>

        {loading && (

          <p className="mt-6 text-sm text-gray-500">

            Saving...

          </p>

        )}

      </div>

    </main>
  )
}

type RowProps = {
  dayLabel: string
  existing?: Availability
  onSave: (
    start: string,
    end: string
  ) => void
}

function DayAvailabilityRow({
  dayLabel,
  existing,
  onSave,
}: RowProps) {

  const [start, setStart] =
    useState(
      existing?.start_time || ""
    )

  const [end, setEnd] =
    useState(
      existing?.end_time || ""
    )

  useEffect(() => {

    setStart(
      existing?.start_time || ""
    )

    setEnd(
      existing?.end_time || ""
    )

  }, [existing])

  return (

    <div className="flex flex-col gap-4 rounded-2xl border bg-gray-50 p-6 md:flex-row md:items-center md:justify-between">

      <div className="w-40">

        <h2 className="text-xl font-bold">

          {dayLabel}

        </h2>

      </div>

      <div className="flex flex-col gap-4 md:flex-row">

        <div>

          <label className="mb-1 block text-sm text-gray-500">

            Start Time

          </label>

          <input
            type="time"
            value={start}
            onChange={(e) =>
              setStart(
                e.target.value
              )
            }
            className="rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="mb-1 block text-sm text-gray-500">

            End Time

          </label>

          <input
            type="time"
            value={end}
            onChange={(e) =>
              setEnd(
                e.target.value
              )
            }
            className="rounded-xl border p-3"
          />

        </div>

        <div className="flex items-end gap-2">

          <button
            onClick={() =>
              onSave(
                start,
                end
              )
            }
            className="rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >

            Save

          </button>

          <button
            onClick={() => {

              setStart("")
              setEnd("")

              onSave("", "")
            }}
            className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >

            Closed

          </button>

        </div>

      </div>

    </div>
  )
}