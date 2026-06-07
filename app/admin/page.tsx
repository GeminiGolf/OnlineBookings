"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [urgentNotifications, setUrgentNotifications] = useState(0)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("is_urgent")
      .eq("is_read", false)

    if (!data) return

    setTotalNotifications(data.length)

    setUrgentNotifications(
      data.filter(
        (notification) =>
          notification.is_urgent
      ).length
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-4xl font-bold text-black">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-black">
            Total Coaches
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            -
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-black">
            Total Clients
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            -
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-black">
            Total Bookings
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            -
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-black">
            Today's Bookings
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            -
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/notifications"
          className="block rounded-xl bg-white p-6 shadow transition hover:scale-[1.02]"
        >
          <h2 className="text-2xl font-bold text-black">
            Notifications ({totalNotifications})
            {urgentNotifications > 0 && (
              <span className="ml-2 text-red-600">
                [{urgentNotifications} Urgent]
              </span>
            )}
          </h2>

          <p className="mt-2 text-gray-600">
            View unread notifications.
          </p>
        </Link>
      </div>
    </main>
  )
}