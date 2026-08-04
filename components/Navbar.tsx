"use client"

import Link from "next/link"
import Image from "next/image"
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
      booking_id: number |null
      type: string
      message: string
      client_name: string
      lesson_date: string
      lesson_time: string
    }[]
  >([])
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }

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

  async function registerPushSubscription(profileId: string) {
    try {

      if (!("serviceWorker" in navigator)) {
        return
      }

      if (!("PushManager" in window)) {
        return
      }

      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission()

        if (permission !== "granted") {
          return
        }
      }

      if (Notification.permission !== "granted") {
        return
      }

      const registration = await navigator.serviceWorker.ready

      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        })

      }
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile_id: profileId,
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys,
          userAgent: navigator.userAgent,
        }),
      })

    } catch (error) {
      console.error("PUSH ERROR:", error)
    }
  }

  async function checkSession() {
    setLoading(true)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setLoggedIn(!!session)
    if (session) {
      await registerPushSubscription(session.user.id)
    }
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
          .in("type", [
            "late_booking",
            "double_booking",
            "client_cancelled",
            "client_rescheduled",
            "missing_receipt",
          ])

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
              type: notification.type,
              message: notification.message,
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
          .in("type", [
            "coach_cancelled",
            "admin_cancelled",
            "coach_rescheduled",
            "coach_booked",
            "no_show",
            "admin_message_client",
          ])
        setClientNotificationCount(notifications?.length || 0)
      }
    }
    if (currentRole === "admin") {
      const { data: urgentNotificationsData } = await supabase
        .from("notifications")
        .select("*")
        .in("type", ["late_booking", "double_booking"])
        .eq("is_urgent", true)
        .eq("is_read", false)

      const { data: missingReceiptNotifications } = await supabase
        .from("notifications")
        .select("id")
        .eq("type", "missing_receipt")
        .eq("is_read", false)

      setUrgentCount(urgentNotificationsData?.length || 0)
      setNormalCount(missingReceiptNotifications?.length || 0)

      const urgentItems = urgentNotificationsData || []
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
            type: notification.type,
            message: notification.message,
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

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)

    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/")

    const rawData = window.atob(base64)

    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
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

  async function markNotificationRead(notificationId: number) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        is_urgent: false,
        resolved_at: new Date().toISOString(),
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
          status: role === "admin"
            ? "cancelled_admin"
            : "cancelled_coach",
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
      const { data: clientNotification, error: notificationError } =
        await supabase
          .from("notifications")
          .insert({
            coach_id: originalNotification.coach_id,
            client_id: originalNotification.client_id,
            booking_id: originalNotification.booking_id,
            type: role === "admin"
              ? "admin_cancelled"
              : "coach_cancelled",
            message: `Late booking request rejected.\n\nReason:\n${reason}`,
          })
          .select()
          .single()

      if (!notificationError && clientNotification) {
        await fetch("/api/client/notifications/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId: clientNotification.id,
          }),
        })
      }
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
    <nav className="absolute left-0 top-0 z-50 flex w-full flex-wrap items-center justify-between border-b border-[#D8CCB7]/10 bg-[#102016]/80 px-6 py-3 text-white backdrop-blur-2xl lg:px-10 lg:py-2.5">
      <Link href="/" className="flex items-center">
        <Image
          src="/images/navbar-logo.png"
          alt="Gemini Golf Academy"
          width={80}
          height={80}
          priority
          className="h-6 w-auto transition hover:opacity-70"
        />
      </Link>
      <div className="flex items-center gap-0 text-sm lg:gap-8 lg:text-base">
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
                    <div className="absolute left-0 top-10 z-50 w-[430px] rounded-2xl border border-[#D8CCB7] bg-[#F2EEE8] p-3 shadow-2xl">
                      {urgentNotifications.length === 0 ? (
                        <p className="rounded-xl border border-[#D8CCB7] bg-white px-5 py-4 text-center text-sm font-light text-[#2F5A43]">
                          No urgent notifications.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {urgentNotifications.map((notification) => (
                            <div key={notification.id} className="rounded-2xl border border-[#D8CCB7] bg-white p-4 shadow-sm">
                              {notification.type === "double_booking" ? (
                                <>
                                  <div className="mb-3 border-b border-[#E7DDD1] pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8F3434]">
                                    DOUBLE BOOKING
                                  </div>

                                  <div className="space-y-2 text-[13px] text-[#2F2F2F]">
                                    {notification.message.split("\n").map((line, index) => {
                                      if (line.includes("|")) {
                                        const [name, clientId] = line.split("|")

                                        return (
                                          <Link
                                            key={index}
                                            href={`/coach/clients/${clientId}`}
                                            className="block font-medium text-[#2F5A43] transition hover:text-[#214434] hover:underline"
                                          >
                                            {name}
                                          </Link>
                                        )
                                      }

                                      return (
                                        <p key={index} className="whitespace-pre-wrap">
                                          {line}
                                        </p>
                                      )
                                    })}
                                  </div>

                                  <button
                                    onClick={() => markNotificationRead(notification.id)}
                                    className="rounded-xl bg-[#2F5A43] px-4 py-2 text-[12px] font-light uppercase tracking-[0.15em] text-white transition hover:bg-[#254937]"
                                  >
                                    Mark as Done
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className="mb-3 border-b border-[#E7DDD1] pb-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8F3434]">
                                      LATE BOOKING
                                    </p>

                                    <p className="mt-1 text-[14px] font-medium text-[#2F5A43]">
                                      {notification.client_name}
                                    </p>
                                  </div>

                                  <div className="mb-4 text-[13px] text-[#555555]">
                                    {new Date(notification.lesson_date).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                    })}
                                    {" @ "}
                                    {notification.lesson_time.replace(":00", "").toLowerCase()}
                                  </div>

                                  <div className="flex gap-3 pt-1">
                                    <button
                                      onClick={() => handleApprove(notification.id)}
                                      className="rounded-xl bg-[#2F5A43] px-4 py-2 text-[12px] font-light uppercase tracking-[0.15em] text-white transition hover:bg-[#254937]"
                                    >
                                      Approve
                                    </button>

                                    <button
                                      onClick={() => handleReject(notification.id, notification.booking_id)}
                                      className="rounded-xl bg-[#8F3434] px-4 py-2 text-[12px] font-light uppercase tracking-[0.15em] text-white transition hover:bg-[#742A2A]"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Link
                  href="/coach/schedule"
                  className="text-sm font-light uppercase tracking-[0.15em] text-white/80 transition hover:text-white"
                >
                  <span className="inline-block scale-x-90">SCHEDULE</span>
                </Link>
                <Link
                  href="/coach/dashboard"
                  className="text-sm font-light uppercase tracking-[0.15em] text-white/80 transition hover:text-white"
                >
                  <span className="inline-block scale-x-90">
                    <span className="inline-block scale-x-90">
                      {normalCount > 0 ? `DASHBOARD (${normalCount})` : "DASHBOARD"}
                    </span>
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-light uppercase tracking-[0.15em] text-white/80 transition hover:text-white"
                >
                  <span className="inline-block scale-x-90">LOGOUT</span>
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
                              {notification.type === "double_booking" ? (
                                <>
                                  <div className="mb-2 text-sm font-bold text-red-700">
                                    DOUBLE BOOKING
                                  </div>

                                  <div className="mb-3 space-y-1 text-sm text-black">
                                    {notification.message.split("\n").map((line, index) => {
                                      if (line.includes("|")) {
                                        const [name, clientId] = line.split("|")

                                        return (
                                          <Link
                                            key={index}
                                            href={`/admin/clients/${clientId}`}
                                            className="block text-blue-600 hover:underline font-medium"
                                          >
                                            {name}
                                          </Link>
                                        )
                                      }

                                      return (
                                        <p key={index} className="whitespace-pre-wrap">
                                          {line}
                                        </p>
                                      )
                                    })}
                                  </div>

                                  <button
                                    onClick={() => markNotificationRead(notification.id)}
                                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                                  >
                                    Mark as Read
                                  </button>
                                </>
                              ) : (
                                <>
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
                                </>
                              )}
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

                <Link href="/client/dashboard" className="text-sm font-light uppercase tracking-[0.15em] text-white/80 transition hover:text-white">
                  <span className="inline-block scale-x-90">
                    DASHBOARD
                  </span>
                </Link>
                <button onClick={handleLogout} className="text-sm font-light uppercase tracking-[0.15em] text-white/80 transition hover:text-white">
                  <span className="inline-block scale-x-90">
                    LOGOUT
                  </span>
                </button>
              </>
            )}

            {!loggedIn && (
              <>
                <Link href="/login" className="flex h-8 items-center text-sm font-light uppercase tracking-[0.22em] text-[#E7DED1] transition hover:text-white">
                  <span className="inline-block scale-x-90">LOGIN</span>
                </Link>
                <Link href="/signup" className="flex h-8 items-center text-sm font-light uppercase tracking-[0.22em] text-[#E7DED1] transition hover:text-white">
                  <span className="inline-block scale-x-90">SIGN UP</span>
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  )
}
