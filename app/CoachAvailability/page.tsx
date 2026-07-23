"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { supabase } from "@/lib/supabaseClient"

type Coach = {
  id: number
  name: string
  preferred_name: string | null
  photo_url: string | null
  specializations: string | null
}

export default function CoachAvailabilityPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [selectedCoachData, setSelectedCoachData] = useState<Coach | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [timeSlots, setTimeSlots] = useState<string[]>([])

  useEffect(() => {
    fetchCoaches()
  }, [])

  async function fetchCoaches() {
    const { data } = await supabase
      .from("coaches")
      .select("id, name, preferred_name, photo_url, specializations")
      .order("name")

    if (data) {
      setCoaches(data.filter((coach) => coach.id !== 3 && coach.id !== 7))
    }
  }

	useEffect(() => {
		async function loadSlots() {
			if (!selectedCoach || !selectedDate) {
				setTimeSlots([])
				return
			}

			const year = selectedDate.getFullYear()
			const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
			const day = String(selectedDate.getDate()).padStart(2, "0")

			const formattedDate = `${year}-${month}-${day}`

			const response = await fetch(
				`/api/public-availability?coachId=${selectedCoach}&date=${formattedDate}`
			)

			if (!response.ok) {
				setTimeSlots([])
				return
			}

			const slots = await response.json()

			setTimeSlots(slots)
		}

		loadSlots()
	}, [selectedCoach, selectedDate])

  return (
    <main className="min-h-screen bg-gray-100 p-4 lg:p-10 text-black">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-center lg:text-left text-2xl lg:text-3xl font-bold">
          Coach Availability
        </h1>

        <div className="rounded-2xl bg-white p-4 lg:p-8 shadow-lg">
          <div className="grid gap-6 lg:gap-10 md:grid-cols-2">

            {/* Coach */}

            <div>
              <label className="mb-2 block text-lg font-semibold">
                Select Coach
              </label>

              <select
                value={selectedCoach ?? ""}
                onChange={async (e) => {
                  const coachId = Number(e.target.value)

                  setSelectedCoach(coachId)

                  const { data } = await supabase
                    .from("coaches")
                    .select("id, name, preferred_name, photo_url, specializations")
                    .eq("id", coachId)
                    .single()

                  setSelectedCoachData(data)
                }}
                className="w-full rounded-xl border p-4"
              >
                <option value="">Choose a coach</option>

                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.preferred_name || coach.name}
                  </option>
                ))}
              </select>

              {selectedCoachData && (
                <div className="mt-4 rounded-xl border bg-white p-4">

                  {selectedCoachData.photo_url && (
                    <img
                      src={selectedCoachData.photo_url}
                      alt={selectedCoachData.preferred_name || selectedCoachData.name}
                      className="mb-4 w-[75%] mx-auto rounded-lg"
                    />
                  )}

                  {selectedCoachData.specializations && (
                    <div className="mt-3 whitespace-pre-line">
                      {selectedCoachData.specializations}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Calendar */}

            <div>
              <label className="mb-4 block text-lg font-semibold">
                Select Date
              </label>

              <div className="rounded-xl border pt-4 lg:pt-10 pb-4 px-5 h-fit flex flex-col items-center">

                <DayPicker
                  className="scale-90 lg:scale-90 origin-top -mb-6 lg:mb-0"
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={[
                    {
                      before: new Date(),
                    },
                  ]}
                />

                <div className="mt-2 lg:mt-6 border-t pt-2 lg:pt-4 min-h-[60px] lg:min-h-[80px] w-full flex flex-col items-center">

                  <h3 className="mb-3 text-base font-semibold text-center">
                    Available Time Slots
                  </h3>

									{timeSlots.length === 0 ? (
										<p className="text-sm text-gray-500">
											Select a coach and date.
										</p>
									) : (
										<div className="mx-auto max-w-[340px]">
											<div className="flex flex-wrap justify-center gap-2">
												{timeSlots.map((time) => (
													<div
														key={time}
														className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
													>
														{time}
													</div>
												))}
											</div>

											<p className="mt-5 text-center text-sm text-gray-600">
												<Link
													href="/login"
													className="font-semibold text-blue-700 hover:underline"
												>
													Log in
												</Link>{" "}
												/{" "}
												<Link
													href="/signup"
													className="font-semibold text-blue-700 hover:underline"
												>
													Sign up
												</Link>{" "}
												to book a lesson.
											</p>
										</div>
									)}

                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}