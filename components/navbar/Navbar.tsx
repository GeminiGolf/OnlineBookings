"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { usePathname } from "next/navigation"
import AdminNavbar from "./AdminNavbar"
import CoachNavbar from "./CoachNavbar"
import ClientNavbar from "./ClientNavbar"
import {Menu} from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  const [loggedIn, setLoggedIn] = useState(false)
  const [role, setRole] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      const next = !prev
      const wrapper = document.getElementById("site-wrapper")
      const navHeader = document.getElementById("nav-header")

      if (wrapper) wrapper.style.transform = "none"
      if (navHeader) navHeader.style.transform = "none"

      return next
    })
  }
  const [loading, setLoading] = useState(true)
  const [urgentCount, setUrgentCount] = useState(0)
  const [normalCount, setNormalCount] = useState(0)
  const [clientNotificationCount, setClientNotificationCount] = useState(0)
  const [showUrgentDropdown, setShowUrgentDropdown] = useState(false)
  const [urgentNotifications, setUrgentNotifications] = useState<
    {
      id: number
      booking_id: number | null
      client_id: number | null
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
      await fetch("/api/push/subscribe", {
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
              client_id: notification.client_id,
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
            client_id: notification.client_id,
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
    <nav
      id="nav-header"
      className={`fixed left-0 top-0 z-40 flex h-12 w-full items-center justify-between border-b border-[#D8CCB7]/15 px-6 text-white transition-transform duration-300 ease-in-out ${
        isHomePage
          ? "bg-[#1B2E23]/80 backdrop-blur-2xl"
          : "bg-[#1B2E23]"
      }`}
    >
      {/* Left side: Single Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center p-1 text-[#E7DED1] transition hover:text-white"
        aria-label="Toggle Menu"
      >
        <Menu size={24} />
      </button>

      {/* Right side: All Links & Notifications */}
      <div className="flex items-center gap-6 text-sm lg:gap-8 lg:text-base">
        {!loading && (
          <>
            {loggedIn && role === "coach" && (
              <CoachNavbar
                urgentCount={urgentCount}
                normalCount={normalCount}
                showUrgentDropdown={showUrgentDropdown}
                setShowUrgentDropdown={setShowUrgentDropdown}
                urgentNotifications={urgentNotifications}
                handleApprove={handleApprove}
                handleReject={handleReject}
                markNotificationRead={markNotificationRead}
                handleLogout={handleLogout}
                isMenuOpen={isMenuOpen}
                toggleMenu={toggleMenu}
              />
            )}

            {loggedIn && role === "admin" && (
              <AdminNavbar
                urgentCount={urgentCount}
                normalCount={normalCount}
                showUrgentDropdown={showUrgentDropdown}
                setShowUrgentDropdown={setShowUrgentDropdown}
                urgentNotifications={urgentNotifications}
                handleApprove={handleApprove}
                handleReject={handleReject}
                markNotificationRead={markNotificationRead}
                handleLogout={handleLogout}
              />
            )}

            {loggedIn && role === "client" && (
              <ClientNavbar
                clientNotificationCount={clientNotificationCount}
                handleLogout={handleLogout}
              />
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