"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { supabase } from "@/lib/supabaseClient"
import DashboardContainer from "@/components/layout/DashboardContainer"
import CoachSelect from "@/components/ui/CoachSelect";

type Coach = {
  id: number
  name: string
  preferred_name: string | null
  photo_url: string | null
  ppv_price: number | null
  specializations: string | null
}

export default function CoachAvailabilityPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [selectedCoachData, setSelectedCoachData] = useState<Coach | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const dateRef = useRef<HTMLLabelElement>(null)
  const slotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCoaches()
  }, [])

  async function fetchCoaches() {
    const { data } = await supabase
      .from("coaches")
      .select("id, name, preferred_name, photo_url, ppv_price, specializations")
      .order("name")

    if (data) {
      setCoaches(data.filter((coach) => coach.id !== 3 && coach.id !== 8))
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

      if (window.innerWidth < 1024) {
        setTimeout(() => {
          slotsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }, 150)
      }
		}

		loadSlots()
	}, [selectedCoach, selectedDate])

  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
      <DashboardContainer>
        <h1 className="dashboard-heading mb-6 text-center lg:text-left">
          Coach Availability
        </h1>

        <div className="rounded-2xl bg-white p-4 lg:p-8 shadow-lg">
          <div className="grid gap-6 lg:gap-10 md:grid-cols-2">

            {/* Coach */}

            <div>
              <label
                ref={dateRef}
                className="dashboard-label mb-3 block"
              >
                Select Coach
              </label>

              <CoachSelect
                coaches={coaches}
                value={selectedCoach}
                onChange={async (coachId) => {
                  setSelectedCoach(coachId);

                  const { data } = await supabase
                    .from("coaches")
                    .select("id, name, preferred_name, photo_url, ppv_price, specializations")
                    .eq("id", coachId)
                    .single();

                  setSelectedCoachData(data);

                  if (window.innerWidth < 1024) {
                    setTimeout(() => {
                      window.scrollTo({
                        top:
                          dateRef.current!.getBoundingClientRect().top +
                          window.scrollY +
                          150,
                        behavior: "smooth",
                      });
                    }, 150);
                  }
                }}
              />

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
                    <div className="mt-5 border-t pt-4">
                      
                      <p className="dashboard-label mb-2">
                        Specializations
                      </p>

                      <ul className="space-y-2">
                        {selectedCoachData.specializations
                          .split("\n")
                          .filter(Boolean)
                          .map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#21402E]" />
                              <span className="text-[15px] font-light tracking-[0.02em] text-black">
                                {item}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Calendar */}

            <div>
              <label className="dashboard-label mb-3 block">
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

                <div
                  ref={slotsRef}
                  className="mt-2 lg:mt-6 border-t pt-2 lg:pt-4 min-h-[60px] lg:min-h-[80px] w-full flex flex-col items-center"
                >

                  <h3 className="dashboard-label mb-3 text-center">
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
														className="rounded-xl bg-emerald-900 px-4 py-2 text-[12px] font-light uppercase tracking-[0.18em] text-white transition hover:bg-emerald-800"
													>
														{time}
													</div>
												))}
											</div>

											<p className="mt-5 text-center text-sm text-gray-600">
												<Link
													href="/login"
													className="text-[13px] font-semibold tracking-[0.02em] text-blue-700 transition hover:underline"
												>
													Log in
												</Link>{" "}
												/{" "}
												<Link
													href="/signup"
													className="text-[13px] font-semibold tracking-[0.02em] text-blue-700 transition hover:underline"
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
      </DashboardContainer>
    </main>
  )
}