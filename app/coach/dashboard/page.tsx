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
    <main className="min-h-screen bg-gray-100 p-4 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 text-center sm:mb-8 sm:text-left">
          <h1 className="whitespace-nowrap text-3xl font-bold text-black sm:text-5xl">
            Coach Dashboard
          </h1>

          <p className="whitespace-nowrap text-sm text-gray-600 sm:text-2xl">
            Manage your coaching business.
          </p>
        </div>

        <div className="mt-3 grid gap-4 md:mt-10 md:grid-cols-2">
          <Link
            href="/coach/clients"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-2xl font-bold text-black sm:text-3xl">
              My Clients
            </h2>

            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-lg">
              View and manage assigned clients.
            </p>
          </Link>

          <Link
            href="/coach/mapschedule"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-2xl font-bold text-black sm:text-3xl">
              Map Schedule
            </h2>

            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-lg">
              Edit your weekly coaching availability.
            </p>
          </Link>

          <Link
            href="/coach/lessons"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-2xl font-bold text-black sm:text-3xl">
              Previous Lessons
            </h2>

            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-lg">
              View lesson history and past clients.
            </p>
          </Link>

          <Link
            href="/notifications"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-2xl font-bold text-black sm:text-3xl">
              Notifications ({totalNotifications})

              {urgentNotifications > 0 && (
                <span className="ml-2 text-red-600">
                  [{urgentNotifications} Urgent]
                </span>
              )}
            </h2>

            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-lg">
              View unread notifications.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}