"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Coach = {
  id: number
  name: string
}

export default function ClientPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [selectedCoach, setSelectedCoach] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  const dates = ["June 12", "June 13", "June 14"]

  const times = ["9:00 AM", "10:00 AM", "11:00 AM"]

  useEffect(() => {
    async function fetchCoaches() {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")

      if (error) {
        console.error(error)
      } else {
        setCoaches(data)
      }
    }

    fetchCoaches()
  }, [])

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-2xl rounded bg-white p-8 shadow">

        <h1 className="text-4xl font-bold">
          Book A Lesson
        </h1>

        <p className="mt-2 text-gray-500">
          Choose your coach, date, and time.
        </p>

        <div className="mt-8 space-y-4">

          {coaches.map((coach) => (

            <div
              key={coach.id}
              className="overflow-hidden rounded border bg-white"
            >

              <button
                onClick={() => {
                  setSelectedCoach(coach.name)
                  setSelectedDate("")
                  setSelectedTime("")
                }}
                className={`w-full p-4 text-left text-xl font-semibold transition ${
                  selectedCoach === coach.name
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >

                {coach.name}

              </button>

              {selectedCoach === coach.name && (

                <div className="space-y-8 p-6">

                  {/* Dates */}
                  <div>

                    <h2 className="text-2xl font-bold">
                      Select Date
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-3">

                      {dates.map((date) => (

                        <button
                          key={date}
                          onClick={() =>
                            setSelectedDate(date)
                          }
                          className={`rounded px-4 py-2 transition ${
                            selectedDate === date
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200"
                          }`}
                        >

                          {date}

                        </button>

                      ))}

                    </div>

                  </div>

                  {/* Times */}
                  {selectedDate && (

                    <div>

                      <h2 className="text-2xl font-bold">
                        Available Times
                      </h2>

                      <div className="mt-4 flex flex-wrap gap-3">

                        {times.map((time) => (

                          <button
                            key={time}
                            onClick={() =>
                              setSelectedTime(time)
                            }
                            className={`rounded px-4 py-2 transition ${
                              selectedTime === time
                                ? "bg-green-600 text-white"
                                : "bg-green-200"
                            }`}
                          >

                            {time}

                          </button>

                        ))}

                      </div>

                    </div>

                  )}

                  {/* Booking Button */}
                  {selectedTime && (

                    <button
                      onClick={async () => {

                        const { error } =
                          await supabase
                            .from("bookings")
                            .insert([
                              {
                                client_id: 1,
                                coach_id: coach.id,
                                lesson_date: "2025-06-12",
                                lesson_time: selectedTime,
                                status: "booked",
                              },
                            ])

                        if (error) {
                          console.error(error)
                          alert("Booking failed")
                        } else {
                          alert("Booking successful!")
                        }
                      }}
                      className="w-full rounded bg-black p-4 text-white transition hover:bg-gray-800"
                    >

                      Confirm Booking

                    </button>

                  )}

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </main>
  )
}