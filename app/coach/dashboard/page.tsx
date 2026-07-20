"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function CoachDashboardPage() {
  const router = useRouter()
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [urgentNotifications, setUrgentNotifications] = useState(0)

  useEffect(() => {
    loadNotifications()
  }, [router])

  async function loadNotifications() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.replace("/login")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (!profile || profile.role !== "coach") {
      router.replace("/login")
      return
    }

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
        "missing_receipt"
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
          <h1 className="whitespace-nowrap text-2xl font-bold text-black sm:text-[26px]">
            Coach Dashboard
          </h1>

          <p className="whitespace-nowrap text-sm text-gray-600 sm:text-[18px]">
            Manage your coaching business.
          </p>
        </div>

        <div className="mt-3 grid gap-4 md:mt-10 md:grid-cols-2">
          <Link
            href="/coach/clients"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-[20px] font-bold text-black sm:text-[20px]">
              My Clients
            </h2>

            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-base">
              View and manage assigned clients.
            </p>
          </Link>

          <Link
            href="/notifications"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-[20px] font-bold text-black sm:text-[20px]">
              Notifications ({totalNotifications})

              {urgentNotifications > 0 && (
                <span className="ml-2 text-red-600">
                  [{urgentNotifications} Urgent]
                </span>
              )}
            </h2>

            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-base">
              View unread notifications.
            </p>
          </Link>

          <Link
            href="/coach/packages"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-[20px] font-bold text-black sm:text-[20px]">
              Client Packages
            </h2>

            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-base">
              View all client packages
            </p>
          </Link>

          <Link
            href="/coach/transactions"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-[20px] font-bold text-black sm:text-[20px]">
              Transactions
            </h2>

            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-base">
              View transactions
            </p>
          </Link>

          <Link
            href="/coach/lessons"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-[20px] font-bold text-black sm:text-[20px]">
              Previous Lessons
            </h2>

            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-base">
              View lesson history and past clients.
            </p>
          </Link>

          <Link
            href="/coach/mapschedule"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-[20px] font-bold text-black sm:text-[20px]">
              Map Schedule
            </h2>

            <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:base">
              Edit your weekly coaching availability.
            </p>
          </Link>

          <Link
            href="/coach/profile"
            className="rounded-3xl bg-white p-5 sm:p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h2 className="text-[20px] font-bold text-black">
              My Profile
            </h2>

            <p className="mt-2 text-base text-gray-600">
              View details
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}