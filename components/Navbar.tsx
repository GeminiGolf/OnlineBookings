"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { Home, Bell, CalendarDays } from "lucide-react"

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(true)
  const [urgentCount, setUrgentCount] = useState(0)
  const [normalCount, setNormalCount] = useState(0)
  const [clientNotificationCount, setClientNotificationCount] = useState(0)
  const [showUrgentDropdown, setShowUrgentDropdown] = useState(false)
  const [urgentNotifications, setUrgentNotifications] = useState<
    {
      id: number
      booking_id: number | null
      client_name: string
      lesson_date: string
      lesson_time: string
    }[]
  >([])
  useEffect(() => {
    checkSession()

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkSession()
    })
    const notificationChannel = supabase
      .channel("navbar-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, checkSession)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, checkSession)
      .subscribe()
    return () => {
      authSubscription.unsubscribe()
      supabase.removeChannel(notificationChannel)
    }
  }, [])

  async function checkSession() {
    setLoading(true)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setLoggedIn(!!session)
    if (!session) {
      setRole("")
      setUrgentCount(0)
      setNormalCount(0)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
    const currentRole = profile?.role || ""
    setRole(currentRole)
    if (currentRole === "coach") {
      const { data: coach } = await supabase.from("coaches").select("id").eq("profile_id", session.user.id).single()
      if (coach) {
        const { data: notifications } = await supabase
          .from("notifications")
          .select("*")
          .eq("coach_id", coach.id)
          .eq("is_read", false)
          .in("type", ["late_booking", "client_cancelled", "client_rescheduled"])

        setUrgentCount(notifications?.filter((n) => n.is_urgent).length || 0)
        setNormalCount(notifications?.filter((n) => !n.is_urgent).length || 0)
        const urgentItems = notifications?.filter((n) => n.is_urgent) || []
        const enrichedUrgent = await Promise.all(
          urgentItems.map(async (notification) => {
            let client_name = ""
            let lesson_date = ""
            let lesson_time = ""

            if (notification.client_id) {
              const { data: client } = await supabase
                .from("clients")
                .select("name")
                .eq("id", notification.client_id)
                .single()
              client_name = client?.name || "Unknown Client"
            }
            if (notification.booking_id) {
              const { data: booking } = await supabase
                .from("bookings")
                .select("lesson_date, lesson_time")
                .eq("id", notification.booking_id)
                .single()
              lesson_date = booking?.lesson_date || ""
              lesson_time = booking?.lesson_time || ""
            }
            return {
              id: notification.id,
              booking_id: notification.booking_id,
              client_name,
              lesson_date,
              lesson_time,
            }
          })
        )
        setUrgentNotifications(enrichedUrgent)
      }
    }

    if (currentRole === "client") {
      const { data: client } = await supabase.from("clients").select("id").eq("profile_id", session.user.id).single()
      if (client) {
        const { data: notifications } = await supabase
          .from("notifications")
          .select("id")
          .eq("client_id", client.id)
          .is("client_read_at", null)
          .in("type", ["coach_cancelled", "coach_rescheduled", "coach_booked", "no_show"])
        setClientNotificationCount(notifications?.length || 0)
      }
    }
    if (currentRole === "admin") {
      const { data: notifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_read", false)
        .eq("is_urgent", true)
      setUrgentCount(notifications?.length || 0)
      setNormalCount(0)

      const urgentItems = notifications || []
      const enrichedUrgent = await Promise.all(
        urgentItems.map(async (notification) => {
          let client_name = ""
          let lesson_date = ""
          let lesson_time = ""
          if (notification.client_id) {
            const { data: client } = await supabase
              .from("clients")
              .select("name")
              .eq("id", notification.client_id)
              .single()

            client_name = client?.name || "Unknown Client"
          }
          if (notification.booking_id) {
            const { data: booking } = await supabase
              .from("bookings")
              .select("lesson_date, lesson_time")
              .eq("id", notification.booking_id)
              .single()
            lesson_date = booking?.lesson_date || ""
            lesson_time = booking?.lesson_time || ""
          }
          return {
            id: notification.id,
            booking_id: notification.booking_id,
            client_name,
            lesson_date,
            lesson_time,
          }
        })
      )

      setUrgentNotifications(enrichedUrgent)
    }
    setLoading(false)
  }

  async function handleApprove(notificationId: number) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        is_urgent: false,
        resolved_at: new Date().toISOString(),
        resolved_by: role,
        rejection_reason: "Approved",
      })
      .eq("id", notificationId)

    if (!error) {
      checkSession()
    }
  }

  async function handleReject(notificationId: number, bookingId: number | null) {
    let reason = ""
    while (!reason.trim()) {
      const response = prompt("Reason for rejection:")
      if (response === null) {
        return
      }
      if (!response.trim()) {
        alert("Please fill in a reason.")
        continue
      }
      reason = response.trim()
    }
    if (bookingId) {
      await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
        })
        .eq("id", bookingId)
    }
    const { data: originalNotification } = await supabase
      .from("notifications")
      .select("client_id, booking_id, coach_id")
      .eq("id", notificationId)
      .single()
    if (originalNotification?.client_id) {
      await supabase.from("notifications").insert({
        coach_id: originalNotification.coach_id,
        client_id: originalNotification.client_id,
        booking_id: originalNotification.booking_id,
        type: "coach_cancelled",
        message: `Late booking request rejected.\n\nReason:\n${reason}`,
      })
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        is_urgent: false,
        resolved_at: new Date().toISOString(),
        resolved_by: role,
        rejection_reason: reason,
      })
      .eq("id", notificationId)
    if (!error) {
      checkSession()
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <nav className="flex flex-wrap items-center justify-between border-b border-gray-800 bg-black px-4 py-4 lg:px-8 lg:py-5 text-white">
      <Link href="/" className="flex items-center justify-center text-white transition hover:text-gray-300">
        <Home size={24} strokeWidth={2.5} />
      </Link>
      <div className="flex items-center gap-2 text-sm lg:gap-6 lg:text-base">
        {!loading && (
          <>
            {loggedIn && role === "coach" && (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowUrgentDropdown(!showUrgentDropdown)}
                    className={`relative flex items-center justify-center transition ${
                      urgentCount > 0 ? "font-bold text-red-500" : "hover:text-red-400"
                    }`}
                  >
                    <>
                      <Bell size={20} />
                      {urgentCount > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                          {urgentCount}
                        </span>
                      )}
                    </>
                  </button>

                  {showUrgentDropdown && (
                    <div className="absolute left-0 top-10 z-50 w-[420px] rounded-xl border bg-white p-3 shadow-xl">
                      {urgentNotifications.length === 0 ? (
                        <p className="text-sm text-black">No urgent notifications.</p>
                      ) : (
                        <div className="space-y-3">
                          {urgentNotifications.map((notification) => (
                            <div key={notification.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                              <div className="mb-2 text-sm font-bold text-black">
                                Late Booking - {notification.client_name}
                              </div>

                              <div className="mb-3 text-xs text-gray-700">
                                {new Date(notification.lesson_date).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                                {" @ "}
                                {notification.lesson_time.replace(":00", "").toLowerCase()}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(notification.id)}
                                  className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                                >
                                  Approve
                                </button>

                                <button
                                  onClick={() => handleReject(notification.id, notification.booking_id)}
                                  className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Link href="/coach/schedule" className="text-base transition hover:text-yellow-400">
                  Schedule
                </Link>
                <Link href="/coach/dashboard" className="text-base transition hover:text-green-400">
                  {normalCount > 0 ? `Dashboard (${normalCount})` : "Dashboard"}
                </Link>
                <button onClick={handleLogout} className="text-base transition hover:text-red-400">
                  Logout
                </button>
              </>
            )}

            {loggedIn && role === "admin" && (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowUrgentDropdown(!showUrgentDropdown)}
                    className={`relative flex items-center justify-center transition ${
                      urgentCount > 0 ? "font-bold text-red-500" : "hover:text-red-400"
                    }`}
                  >
                    <>
                      <Bell size={20} />
                      {urgentCount > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                          {urgentCount}
                        </span>
                      )}
                    </>
                  </button>

                  {showUrgentDropdown && (
                    <div className="absolute left-0 top-10 z-50 w-[420px] rounded-xl border bg-white p-3 shadow-xl">
                      {urgentNotifications.length === 0 ? (
                        <p className="text-sm text-black">No urgent notifications.</p>
                      ) : (
                        <div className="space-y-3">
                          {urgentNotifications.map((notification) => (
                            <div key={notification.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                              <div className="mb-2 text-sm font-bold text-black">
                                Late Booking - {notification.client_name}
                              </div>
                              <div className="mb-3 text-xs text-gray-700">
                                {notification.lesson_date} @ {notification.lesson_time}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(notification.id)}
                                  className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(notification.id, notification.booking_id)}
                                  className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Link href="/admin/schedule" className="text-base transition hover:text-yellow-400">
                  Schedule
                </Link>
                <Link href="/admin" className="text-base transition hover:text-green-400">
                  {urgentCount + normalCount > 0 ? `Dash (${urgentCount + normalCount})` : "Dash"}
                </Link>
                <button onClick={handleLogout} className="text-base transition hover:text-red-400">
                  Logout
                </button>
              </>
            )}

            {loggedIn && role === "client" && (
              <>
                <Link
                  href="/client/notifications"
                  className="relative flex items-center justify-center text-base transition hover:text-blue-400"
                >
                  <Bell size={20} />
                  {clientNotificationCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                      {clientNotificationCount}
                    </span>
                  )}
                </Link>
                <Link href="/book" className="text-base transition hover:text-yellow-400">
                  Book
                </Link>
                <Link href="/client/dashboard" className="text-base transition hover:text-green-400">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-base transition hover:text-red-400">
                  Logout
                </button>
              </>
            )}

            {!loggedIn && (
              <>
                <Link href="/book" className="text-base transition hover:text-yellow-400">
                  Book
                </Link>
                <Link href="/login" className="text-base transition hover:text-blue-400">
                  Login
                </Link>
                <Link href="/signup" className="text-base transition hover:text-green-400">
                  Sign Up
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  )
}
