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
    <main className="min-h-screen bg-[#F2EEE8] p-4 sm:p-10">
      <div className="mx-auto mt-10 max-w-5xl lg:mt-12">
        <div className="mb-3 text-center sm:mb-8 sm:text-left">
          <h1 className="whitespace-nowrap text-[20px] font-light uppercase tracking-[0.12em] text-black">
            Coach Dashboard
          </h1>

          <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-black">
            Manage your coaching business.
          </p>
        </div>

        <div className="mt-3 grid gap-4 md:mt-10 md:grid-cols-2">
          <Link
            href="/coach/clients"
            className="rounded-3xl border border-[#B9B2A8] bg-[#FEFDFC] p-5 sm:p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <h2 className="text-[20px] font-light tracking-[0.06em] text-black">
              My Clients
            </h2>

            <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-black">
              View and manage assigned clients.
            </p>
          </Link>

          <Link
            href="/coach/notifications"
            className="rounded-3xl border border-[#B9B2A8] bg-[#FEFDFC] p-5 sm:p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <h2 className="text-[20px] font-light tracking-[0.06em] text-black">
              Notifications ({totalNotifications})

              {urgentNotifications > 0 && (
                <span className="ml-2 text-red-600">
                  [{urgentNotifications} Urgent]
                </span>
              )}
            </h2>

            <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-black">
              View unread notifications.
            </p>
          </Link>

          <Link
            href="/coach/packages"
            className="rounded-3xl border border-[#B9B2A8] bg-[#FEFDFC] p-5 sm:p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <h2 className="text-[20px] font-light tracking-[0.06em] text-black">
              Client Packages
            </h2>

            <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-black">
              View all client packages
            </p>
          </Link>

          <Link
            href="/coach/transactions"
            className="rounded-3xl border border-[#B9B2A8] bg-[#FEFDFC] p-5 sm:p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <h2 className="text-[20px] font-light tracking-[0.06em] text-black">
              Transactions
            </h2>

            <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-black">
              View transactions
            </p>
          </Link>

          <Link
            href="/coach/lessons"
            className="rounded-3xl border border-[#B9B2A8] bg-[#FEFDFC] p-5 sm:p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <h2 className="text-[20px] font-light tracking-[0.06em] text-black">
              Previous Lessons
            </h2>

            <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-black">
              View lesson history and past clients.
            </p>
          </Link>

          <Link
            href="/coach/mapschedule"
            className="rounded-3xl border border-[#B9B2A8] bg-[#FEFDFC] p-5 sm:p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <h2 className="text-[20px] font-light tracking-[0.06em] text-black">
              Map Schedule
            </h2>

            <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-black">
              Edit your weekly coaching availability.
            </p>
          </Link>

          <Link
            href="/coach/profile"
            className="rounded-3xl border border-[#B9B2A8] bg-[#FEFDFC] p-5 sm:p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <h2 className="text-[20px] font-light tracking-[0.06em] text-black">
              My Profile
            </h2>

            <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-black">
              View details
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}