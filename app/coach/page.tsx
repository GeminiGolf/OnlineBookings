"use client"

import { useState } from "react"

export default function CoachPage() {
  const [blockedTimes, setBlockedTimes] = useState<string[]>([])

  const schedule = [
    { time: "08:00", client: "" },
    { time: "09:00", client: "John Smith" },
    { time: "10:00", client: "" },
    { time: "11:00", client: "Sarah Johnson" },
    { time: "12:00", client: "" },
    { time: "13:00", client: "" },
    { time: "14:00", client: "Mike Brown" },
    { time: "15:00", client: "" },
    { time: "16:00", client: "" },
  ]

  function toggleBlocked(time: string) {
    if (blockedTimes.includes(time)) {
      setBlockedTimes(
        blockedTimes.filter((t) => t !== time)
      )
    } else {
      setBlockedTimes([...blockedTimes, time])
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">

      <div className="mx-auto max-w-3xl rounded bg-white p-8 shadow">

        <h1 className="text-4xl font-bold">
          Coach Schedule
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your daily lesson schedule.
        </p>

        <div className="mt-8 space-y-3">

          {schedule.map((slot) => {

            const isBlocked =
              blockedTimes.includes(slot.time)

            const isBooked =
              slot.client !== ""

            return (

              <div
                key={slot.time}
                className={`flex items-center justify-between rounded p-4 transition ${
                  isBooked
                    ? "bg-blue-100"
                    : isBlocked
                    ? "bg-red-200"
                    : "bg-green-100"
                }`}
              >

                <div>

                  <h2 className="text-xl font-bold">
                    {slot.time}
                  </h2>

                  <p className="text-gray-700">

                    {isBooked
                      ? slot.client
                      : isBlocked
                      ? "Blocked Off"
                      : "Available"}

                  </p>

                </div>

                {!isBooked && (

                  <button
                    onClick={() =>
                      toggleBlocked(slot.time)
                    }
                    className={`rounded px-4 py-2 text-white ${
                      isBlocked
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >

                    {isBlocked
                      ? "Open Time"
                      : "Block Time"}

                  </button>

                )}

              </div>

            )
          })}

        </div>

      </div>

    </main>
  )
}