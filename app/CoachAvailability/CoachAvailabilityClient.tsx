"use client"

import Link from "next/link"
import { useEffect, useRef, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { supabase } from "@/lib/supabaseClient"
import DashboardContainer from "@/components/layout/DashboardContainer"
import CoachSelect from "@/components/ui/CoachSelect"

type Coach = {
  id: number
  name: string
  preferred_name: string | null
  photo_url: string | null
  ppv_price: number | null
  specializations: string | null
}

function CoachAvailabilityContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [coaches, setCoaches] = useState<Coach[]>([])
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [selectedCoachData, setSelectedCoachData] = useState<Coach | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [timeSlots, setTimeSlots] = useState<string[]>()
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
      const filtered = data.filter((coach) => coach.id !== 8)
      setCoaches(filtered)

      const coachParam = searchParams.get("coach")
      if (coachParam) {
        const foundCoach = filtered.find(
          (c) =>
            (c.preferred_name || c.name)
              .toLowerCase()
              .includes(coachParam.toLowerCase()) ||
            c.name.toLowerCase().includes(coachParam.toLowerCase())
        )

        if (foundCoach) {
          handleCoachSelect(foundCoach.id, filtered)
        }
      }
    }
  }

  const handleCoachSelect = async (coachId: number, coachList = coaches) => {
    setSelectedCoach(coachId)

    const coach = coachList.find((c) => c.id === coachId)
    if (coach) {
      const firstName = (coach.preferred_name || coach.name).split(" ")[0]
      router.replace(`/CoachAvailability?coach=${encodeURIComponent(firstName)}`, {
        scroll: false,
      })
    }

    const { data } = await supabase
      .from("coaches")
      .select("id, name, preferred_name, photo_url, ppv_price, specializations")
      .eq("id", coachId)
      .single()

    setSelectedCoachData(data)

    if (window.innerWidth < 1024 && dateRef.current) {
      setTimeout(() => {
        window.scrollTo({
          top:
            dateRef.current!.getBoundingClientRect().top +
            window.scrollY +
            150,
          behavior: "smooth",
        })
      }, 150)
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
    <main className="min-h-screen bg-[#F2EEE8] px-3 pt-10 pb-3 sm:p-10 text-black">
      <DashboardContainer>
        <h1 className="dashboard-heading mb-6 text-center lg:text-left">
          Coach Availability
        </h1>

        <div className="rounded-3xl border border-[#3A5D49] bg-white p-4 lg:p-8 shadow-md">
          <div className="grid gap-6 lg:gap-10 md:grid-cols-2">
            <div>
              <label ref={dateRef} className="dashboard-label mb-3 block">
                Select Coach
              </label>

              <CoachSelect
                coaches={coaches}
                value={selectedCoach}
                onChange={handleCoachSelect}
              />

              {selectedCoachData && (
                <div className="mt-4 rounded-2xl border border-[#3A5D49] bg-[#FBF8F3] p-5">
                  {selectedCoachData.photo_url && (
                    <img
                      src={selectedCoachData.photo_url}
                      alt={
                        selectedCoachData.preferred_name ||
                        selectedCoachData.name
                      }
                      className="mb-4 w-[75%] mx-auto rounded-lg"
                    />
                  )}

                  {selectedCoachData.specializations && (
                    <div className="mt-5 border-t border-[#3A5D49] pt-4">
                      <p className="dashboard-label mb-2">Specializations</p>
                      <ul className="space-y-2">
                        {selectedCoachData.specializations
                          .split("\n")
                          .filter(Boolean)
                          .map((item) => (
                            <li key={item} className="flex items-start gap-3">
                              <span className="mt-[1px] text-[18px] font-light leading-none text-[#2F5A43]">
                                ›
                              </span>
                              <span className="dashboard-value text-[#2F5A43]">
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

            <div>
              <label className="dashboard-label mb-3 block">
                Select Date
              </label>

              <div className="rounded-2xl border border-[#3A5D49] bg-[#FBF8F3] pt-4 lg:pt-10 pb-4 px-5 h-fit flex flex-col items-center">
                <DayPicker
                  className="coach-calendar scale-90 lg:scale-90 origin-top -mb-6 lg:mb-0"
                  styles={{
                    weekday: { color: "#2F5A43" },
                    day: { color: "#2F5A43" },
                    chevron: { fill: "#2F5A43" },
                  }}
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={[{ before: new Date() }]}
                />

                <div
                  ref={slotsRef}
                  className="mt-2 lg:mt-6 border-t border-[#3A5D49] pt-2 lg:pt-4 min-h-[60px] lg:min-h-[80px] w-full flex flex-col items-center"
                >
                  <h3 className="dashboard-label mb-1 text-center">
                    Available Time Slots
                  </h3>

                  {selectedCoach === 1 && selectedDate?.getDay() === 3 && (
                    <p className="mb-2 max-w-sm text-center text-[12px] font-normal text-[#2F5A43]">
                      <strong>Wednesdays 7 AM - 12 PM</strong> are for{" "}
                      <strong>short game</strong> - Francois
                    </p>
                  )}

                  {!timeSlots || timeSlots.length === 0 ? (
                    <p className="text-[15px] font-light tracking-[0.02em] text-[#2F5A43]">
                      Select a coach and date.
                    </p>
                  ) : (
                    <div className="mx-auto w-full max-w-[340px]">
                      <div className="flex flex-wrap justify-center gap-1">
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            className="flex w-[calc(33.333%-0.375rem)] items-center justify-center rounded-2xl border border-[#3A5D49] bg-[#2F5A43] py-1.5 text-[13px] sm:text-[14px] font-medium text-white shadow-sm transition hover:bg-[#244634]"
                          >
                            {time}
                          </div>
                        ))}
                      </div>

                      <p className="mt-5 text-center text-sm text-gray-600">
                        <Link
                          href="/login"
                          className="text-[13px] font-semibold tracking-[0.02em] text-[#5874A6] transition hover:text-[#45628F] hover:underline"
                        >
                          Log in
                        </Link>{" "}
                        /{" "}
                        <Link
                          href="/signup"
                          className="text-[13px] font-semibold tracking-[0.02em] text-[#5874A6] transition hover:text-[#45628F] hover:underline"
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

export default function CoachAvailabilityClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoachAvailabilityContent />
    </Suspense>
  )
}