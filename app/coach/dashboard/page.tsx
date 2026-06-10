"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function CoachDashboardPage() {
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [urgentNotifications, setUrgentNotifications] = useState(0)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", session.user.id)
      .single()

    if (!coach) return

    const { data: notifications } = await supabase
      .from("notifications")
      .select("is_urgent")
      .eq("coach_id", coach.id)
      .eq("is_read", false)
      .in("type", [
        "late_booking",
        "client_cancelled",
        "client_rescheduled",
      ])

    if (!notifications) return

    setTotalNotifications(
      notifications.length
    )

    setUrgentNotifications(
      notifications.filter(
        (notification) =>
          notification.is_urgent
      ).length
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-6xl font-black text-black">
          Coach Dashboard
        </h1>

        <p className="mt-4 text-2xl text-gray-600">
          Manage your coaching business.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/coach/clients"
            className="rounded-3xl bg-white p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-3xl font-bold text-black">
              My Clients
            </h2>

            <p className="mt-3 text-lg text-gray-600">
              View and manage assigned clients.
            </p>
          </Link>

          <Link
            href="/coach/mapschedule"
            className="rounded-3xl bg-white p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-3xl font-bold text-black">
              Map Schedule
            </h2>

            <p className="mt-3 text-lg text-gray-600">
              Edit your weekly coaching availability.
            </p>
          </Link>

          <Link
            href="/coach/lessons"
            className="rounded-3xl bg-white p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-3xl font-bold text-black">
              Previous Lessons
            </h2>

            <p className="mt-3 text-lg text-gray-600">
              View lesson history and past clients.
            </p>
          </Link>

          <Link
            href="/notifications"
            className="rounded-3xl bg-white p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-3xl font-bold text-black">
              Notifications ({totalNotifications})

              {urgentNotifications > 0 && (
                <span className="ml-2 text-red-600">
                  [{urgentNotifications} Urgent]
                </span>
              )}
            </h2>

            <p className="mt-3 text-lg text-gray-600">
              View unread notifications.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}