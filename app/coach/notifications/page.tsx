"use client"
import Image from "next/image"
import Link from "next/link"
import { Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import DashboardContainer from "@/components/layout/DashboardContainer"
import LoadingScreen from "@/components/ui/LoadingScreen";

type Notification = {
  id: number
  coach_id: number | null
  client_id: number | null
  booking_id: number | null
  type: string
  message: string
  is_read: boolean
  is_urgent: boolean
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
  rejection_reason: string | null
  client_name?: string
  lesson_date?: string
  lesson_time?: string
  display_message?: string
  client_phone?: string | null
  client_email?: string | null
  client_notes?: string | null
  lessons_remaining?: number
  type_label?: string
  original_datetime?: string
  new_datetime?: string
  notes?: string
  subject?: string
}

export default function NotificationsPage() {
  const [urgentNotifications, setUrgentNotifications] = useState<Notification[]>([])
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([])
  const [olderNotifications, setOlderNotifications] = useState<Notification[]>([])
  const [showOlder, setShowOlder] = useState(false)
  const [activePage, setActivePage] = useState(1)
  const [olderPage, setOlderPage] = useState(1)
  const PAGE_SIZE = 5
  const [loading, setLoading] = useState(true)
  const [currentRole, setCurrentRole] = useState("")
  const [selectedClient, setSelectedClient] = useState<Notification | null>(null)
  const [olderFilter, setOlderFilter] = useState("all")
  const [expandedNotifications, setExpandedNotifications] = useState<number[]>([])
  const router = useRouter()

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    setLoading(true)
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      router.replace("/login")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
    setCurrentRole(profile?.role || "")

    if (profile?.role === "client") {
      router.push("/client/notifications")
      return
    }
    if (profile?.role !== "coach" && profile?.role !== "admin") {
      router.replace("/login")
      return
    }

    let data = null
    let error = null

    if (profile?.role === "coach") {
      const { data: coach } = await supabase.from("coaches").select("id").eq("profile_id", session.user.id).single()
      const result = await supabase
        .from("notifications")
        .select("*")
        .eq("coach_id", coach?.id)
        .in("type", [
          "late_booking",
          "double_booking",
          "client_cancelled",
          "client_rescheduled",
          "missing_receipt",
          "admin_message_coach",
        ])
        .order("created_at", { ascending: false })
      data = result.data
      error = result.error
    } else {
      setLoading(false)
      return
    }

    if (error || !data) {
      console.error(error)
      setLoading(false)
      return
    }

    const enrichedNotifications = await Promise.all(
      data.map(async (notification) => {
        let client_name = ""
        let lesson_date = ""
        let lesson_time = ""
        let display_message = notification.message
        let client_phone = ""
        let client_email = ""
        let client_notes = ""
        let lessons_remaining = 0
        let type_label = ""
        let original_datetime = ""
        let new_datetime = ""
        let notes = ""
        let cancellationReason = ""

        if (notification.client_id) {
          const { data: client } = await supabase
            .from("clients")
            .select(
              `
              name,
              phone,
              email,
              notes,
              lessons_remaining
            `
            )
            .eq("id", notification.client_id)
            .single()
          client_name = client?.name || ""
          client_phone = client?.phone || ""
          client_email = client?.email || ""
          client_notes = client?.notes || ""
          lessons_remaining = client?.lessons_remaining || 0
        }

        if (notification.booking_id) {
          const { data: booking } = await supabase
            .from("bookings")
            .select(
              `
              lesson_date,
              lesson_time,
              cancellation_reason
            `
            )
            .eq("id", notification.booking_id)
            .single()

          lesson_date = booking?.lesson_date || ""
          lesson_time = booking?.lesson_time || ""
          cancellationReason = booking?.cancellation_reason || ""
        }

        if (notification.type === "client_cancelled" && lesson_date) {
          display_message = `Cancelled lesson | ${new Date(lesson_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          })} @ ${lesson_time.replace(":00", "").toLowerCase()}`

          type_label = "Cancelled"
          notes = cancellationReason

          original_datetime = `${new Date(lesson_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          })} @ ${lesson_time.replace(":00", "")}`
        }

        if (notification.type === "late_booking") {
          type_label = "Late Booking"

          original_datetime = `${new Date(lesson_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          })} @ ${lesson_time.replace(":00", "")}`

          if (notification.rejection_reason === "Approved") {
            notes = "Approved"
          } else if (notification.rejection_reason) {
            notes = `Rejected (${notification.rejection_reason})`
          }
        }

        if (notification.type === "client_rescheduled" && notification.booking_id) {
          const { data: changes } = await supabase
            .from("booking_changes")
            .select("*")
            .eq("booking_id", notification.booking_id)
            .order("created_at", {
              ascending: false,
            })

          const change = changes?.[0]

          if (change) {
            const formatDate = (date: string) =>
              new Date(date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
              })
            const formatTime = (time: string) => time.replace(":00", "")
            display_message =
              `Rescheduled lesson | ` +
              `${formatDate(change.old_date)} @ ${formatTime(change.old_time)} → ` +
              `${formatDate(change.new_date)} @ ${formatTime(change.new_time)}`

            type_label = "Rescheduled"
            notes = ""
            original_datetime = `${formatDate(change.old_date)} @ ${formatTime(change.old_time)}`
            new_datetime = `${formatDate(change.new_date)} @ ${formatTime(change.new_time)}`
          }
        }
        if (notification.type === "coach_cancelled" && lesson_date) {
          const formatDate = (date: string) =>
            new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
            })

          type_label = "Coach Cancelled"
          original_datetime = `${formatDate(lesson_date)} @ ${lesson_time.replace(":00", "")}`
          notes = notification.message || cancellationReason || "-"
        }

        if (notification.type === "no_show" && lesson_date) {
          const formatDate = (date: string) =>
            new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
            })
          type_label = "No Show"
          original_datetime = `${formatDate(lesson_date)} @ ${lesson_time.replace(":00", "")}`
          notes = "Missed Lesson"
        }

        if (notification.type === "admin_message_coach") {
          type_label = notification.subject || "Admin Message"
          notes = notification.message || ""
        }

        if (notification.type === "missing_receipt") {
          let receiptData: any = {}

          try {
            receiptData = JSON.parse(notification.message)
          } catch {}

          type_label = "Missing Receipt"

          notes = receiptData.transaction_name || "-"

          if (receiptData.purchase_date) {
            original_datetime = new Date(receiptData.purchase_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
            })
          }

          display_message = notification.message
        }

        return {
          ...notification,
          client_name,
          lesson_date,
          lesson_time,
          display_message,
          client_phone,
          client_email,
          client_notes,
          lessons_remaining,
          type_label,
          original_datetime,
          new_datetime,
          notes,
        }
      })
    )

    setUrgentNotifications(
      enrichedNotifications.filter((n) => n.is_urgent && !n.is_read)
    )
    setActiveNotifications(enrichedNotifications.filter((n) => !n.is_urgent && !n.is_read))
    setOlderNotifications(
      enrichedNotifications
        .filter((n) => !n.is_urgent && n.is_read)
        .sort((a, b) => new Date(b.resolved_at || 0).getTime() - new Date(a.resolved_at || 0).getTime())
    )
    setLoading(false)
  }

  async function toggleNotification(id: number, value: boolean) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: value,
        resolved_at: value ? new Date().toISOString() : null,
      })
      .eq("id", id)

    if (!error && value) {
      const movedNotification = activeNotifications.find((n) => n.id === id)
      if (movedNotification) {
        setActiveNotifications((prev) => prev.filter((n) => n.id !== id))
        setOlderNotifications((prev) => [
          {
            ...movedNotification,
            is_read: true,
            resolved_at: new Date().toISOString(),
          },
          ...prev,
        ])
      }
    }
  }

  async function handleApprove(notification: Notification) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        is_urgent: false,
        resolved_at: new Date().toISOString(),
        resolved_by: "coach",
        rejection_reason: "Approved",
      })
      .eq("id", notification.id)

    if (!error) {
      const movedNotification = urgentNotifications.find((n) => n.id === notification.id)
      if (movedNotification) {
        setUrgentNotifications((prev) => prev.filter((n) => n.id !== notification.id))
        setOlderNotifications((prev) => [
          {
            ...movedNotification,
            is_read: true,
            is_urgent: false,
            resolved_at: new Date().toISOString(),
            rejection_reason: "Approved",
          },
          ...prev,
        ])
      }
    }
  }

  async function handleReject(notification: Notification) {
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
    if (notification.booking_id) {
      await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
        })
        .eq("id", notification.booking_id)
    }
    const { data: originalNotification } = await supabase
      .from("notifications")
      .select("client_id, booking_id, coach_id")
      .eq("id", notification.id)
      .single()
    if (originalNotification?.client_id) {
      const { data: clientNotification, error: notificationError } =
        await supabase
          .from("notifications")
          .insert({
            coach_id: originalNotification.coach_id,
            client_id: originalNotification.client_id,
            booking_id: originalNotification.booking_id,
            type: currentRole === "admin"
              ? "admin_cancelled"
              : "coach_cancelled",
            message: `Late booking request rejected.\n\nReason:\n${reason}`,
          })
          .select()
          .single();

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
        resolved_by: "coach",
        rejection_reason: reason,
      })
      .eq("id", notification.id)
    if (!error) {
      return
    }
  }

  function toggleExpanded(id: number) {
    setExpandedNotifications((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const activeStart = (activePage - 1) * PAGE_SIZE
  const activeEnd = activeStart + PAGE_SIZE
  const olderStart = (olderPage - 1) * PAGE_SIZE
  const olderEnd = olderStart + PAGE_SIZE
  const paginatedActiveNotifications = activeNotifications.slice(activeStart, activeEnd)
  const filteredOlderNotifications =
    olderFilter === "all" ? olderNotifications : olderNotifications.filter((n) => n.type_label === olderFilter)
  const paginatedOlderNotifications = filteredOlderNotifications.slice(olderStart, olderEnd)
  const activeHasNext = activeEnd < activeNotifications.length
  const olderHasNext = olderEnd < filteredOlderNotifications.length

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#2F5A43]">
      <DashboardContainer>
        <div className="mb-3 flex items-center gap-3 sm:mb-6">
          <Link
            href="/coach/dashboard"
            className="rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6]"
          >
            ← Back to Dashboard
          </Link>

          <Link
            href="/coach/notifications/settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3A5D49] bg-white text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6]"
            title="Notification Settings"
          >
            <Settings className="h-5 w-5 stroke-[1.25]" />
          </Link>
        </div>

        {/* URGENT */}
        <div className="mb-10">
          <h2 className="mb-5 text-[20px] font-light uppercase tracking-[0.08em] text-[#8F3434]">
            Urgent
          </h2>
          {urgentNotifications.length === 0 ? (
            <div className="rounded-2xl border border-[#3A5D49] bg-[#FEFDFC] p-10 text-center shadow-xl">
              <p className="text-[15px] font-light text-[#2F5A43]">
                No urgent notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {urgentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-2xl border border-[#8F3434] bg-[#FBF4F3] p-5 shadow-xl"
                >
                  {notification.type === "late_booking" ? (
                    <>
                      <h3 className="text-[20px] font-light uppercase tracking-[0.12em] text-[#8F3434]">
                        Late Booking
                      </h3>

                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="dashboard-label font-normal">Client</p>
                          <p className="text-[15px] font-light text-[#2F5A43]">
                            {notification.client_name}
                          </p>
                        </div>

                        <div>
                          <p className="dashboard-label font-normal">Lesson</p>
                          <p className="text-[15px] font-light text-[#2F5A43]">
                            {(notification.lesson_date ?? "").split("-").reverse().slice(0, 2).join("/")} @{" "}
                            {(notification.lesson_time ?? "").replace(":00", "").toLowerCase()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => handleApprove(notification)}
                          className="rounded-xl bg-[#2F5A43] px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634]"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(notification)}
                          className="rounded-xl bg-[#8F3434] px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#742A2A]"
                        >
                          Reject
                        </button>
                      </div>
                    </>
                  ) : notification.type === "double_booking" ? (
                    <>
                      <h3 className="text-lg font-bold text-red-700">DOUBLE BOOKING</h3>

                      <div className="mt-3 space-y-1 text-[#1F3327]">
                        {notification.message.split("\n").map((line, index) => {
                          if (line.includes("|")) {
                            const [name, clientId] = line.split("|")

                            return (
                              <Link
                                key={index}
                                href={`/coach/clients/${clientId}`}
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

                      <div className="mt-3">
                        <button
                          onClick={() => toggleNotification(notification.id, true)}
                          className="rounded bg-blue-600 px-4 py-2 text-white"
                        >
                          Mark as Read
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* STANDARD */}
        <div>
          <h2 className="mb-5 text-[20px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
            Notifications ({activeNotifications.length})
          </h2>
          <div className="dashboard-label mb-3 hidden lg:grid grid-cols-[40px_40px_140px_180px_180px_1fr_140px] items-center rounded-xl border border-[#3A5D49] bg-[#F3F0EA] px-5 py-3">
            <span></span>
            <span></span>
            <span className="dashboard-label text-center">Type</span>
            <span className="dashboard-label text-center">Original Date</span>
            <span className="dashboard-label text-center">New Date</span>
            <span className="dashboard-label text-center">Notes</span>
            <span className="dashboard-label text-center">Created</span>
          </div>
          {activeNotifications.length === 0 ? (
            <div className="rounded-2xl border border-[#3A5D49] bg-[#FEFDFC] p-10 text-center shadow-xl">
              <p className="text-[15px] font-light text-[#2F5A43]">
                No notifications.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedActiveNotifications.map((notification) => (
                  <div key={notification.id}>
                    <div
                      className={`hidden lg:block rounded-xl border border-[#3A5D49] bg-[#FBF8F3] transition hover:bg-[#F6FAF6] ${
                        notification.is_read ? "opacity-75" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-6 px-4 py-3">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={notification.is_read}
                            onChange={(e) => toggleNotification(notification.id, e.target.checked)}
                            className="h-5 w-5 accent-[#2F5A43]"
                          />

                          {notification.type === "admin_message_coach" ? (
                            <Image
                              src="/images/gemini-logo-black.png"
                              alt="Gemini Golf Academy"
                              width={34}
                              height={34}
                              className="object-contain"
                            />
                          ) : (
                            <button
                              onClick={() => setSelectedClient(notification)}
                              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#E8F2EB]"
                            >
                              👤
                            </button>
                          )}

                          <div className="grid flex-1 grid-cols-[140px_180px_180px_1fr] items-center gap-4">
                            <span
                              className={`text-[15px] font-light ${
                                notification.type === "admin_message_coach"
                                  ? "text-[#8F3434]"
                                  : "text-[#2F5A43]"
                              }`}
                            >
                              {notification.type_label || "-"}
                            </span>

                            <span className="text-[15px] font-light text-[#2F5A43]">
                              {notification.type === "admin_message_coach"
                                ? "-"
                                : notification.original_datetime || "-"}
                            </span>

                            <span className="text-[15px] font-light text-[#2F5A43]">
                              {notification.new_datetime || "-"}
                            </span>

                            {notification.type === "missing_receipt" ? (
                              <details>
                                <summary className="dashboard-value cursor-pointer hover:text-[#2F5A43]">
                                  {notification.notes || "-"}
                                </summary>

                                <div className="mt-3 rounded-xl border border-[#3A5D49] bg-[#F7F3EE] p-3 space-y-2">
                                  <div className="dashboard-value">
                                    <strong>Client:</strong>{" "}
                                    <a
                                      href={`/coach/clients/${notification.client_id}`}
                                      className="text-[#2F5A43] underline"
                                    >
                                      {notification.client_name}
                                    </a>
                                  </div>

                                  <div className="dashboard-value">
                                    <strong>Purchase:</strong> {notification.notes}
                                  </div>

                                  <div className="dashboard-value">
                                    <strong>Date:</strong> {notification.original_datetime}
                                  </div>
                                </div>
                              </details>
                            ) : (
                              <span className="text-[15px] font-light text-[#2F5A43] truncate">
                                {notification.notes || "-"}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[15px] font-light text-[#2F5A43] whitespace-nowrap text-right">
                          {new Date(notification.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                          {" | "}
                          {new Date(notification.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                      <div
                        className={`lg:hidden mb-2 rounded-xl border border-[#3A5D49] shadow-sm ${
                          notification.is_read
                            ? "border-[#3A5D49] bg-[#ECE7DE]"
                            : "border-[#3A5D49] bg-[#FEFDFC]"
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={notification.is_read}
                              onChange={(e) => toggleNotification(notification.id, e.target.checked)}
                              className="h-5 w-5 accent-[#2F5A43]"
                            />

                            {notification.type === "admin_message_coach" ? (
                              <Image
                                src="/images/gemini-logo-black.png"
                                alt="Gemini Golf Academy"
                                width={30}
                                height={30}
                                className="object-contain"
                              />
                            ) : (
                              <button
                                onClick={() => setSelectedClient(notification)}
                                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#DDEEDB]"
                              >
                                👤
                              </button>
                            )}

                            <button
                              onClick={() => toggleExpanded(notification.id)}
                              className="flex-1 text-left"
                            >
                              <div
                                className={`text-[15px] font-light ${
                                  notification.type === "admin_message_coach"
                                    ? "text-[#8F3434]"
                                    : "text-[#2F5A43]"
                                }`}
                              >
                                {notification.type_label || "-"}{" "}
                                {expandedNotifications.includes(notification.id) ? "▲" : "▼"}
                              </div>

                              {notification.type !== "admin_message_coach" && (
                                <div className="dashboard-label mt-1">
                                  {notification.original_datetime || "-"}
                                </div>
                              )}
                            </button>
                          </div>

                          {expandedNotifications.includes(notification.id) && (
                            <div className="mt-5 space-y-4 rounded-xl border border-[#3A5D49] bg-[#F7F3EE] p-4">
                              {notification.type !== "admin_message_coach" && (
                                <div>
                                  <p className="dashboard-label">Original Date</p>
                                  <p className="dashboard-value">
                                    {notification.original_datetime || "-"}
                                  </p>
                                </div>
                              )}

                              {notification.new_datetime && (
                                <div>
                                  <p className="dashboard-label">New Date</p>
                                  <p className="dashboard-value">
                                    {notification.new_datetime}
                                  </p>
                                </div>
                              )}

                              <div>
                                <p className="dashboard-label">Notes</p>

                                {notification.type === "missing_receipt" ? (
                                  <details className="mt-2">
                                    <summary className="dashboard-value cursor-pointer hover:text-[#2F5A43]">
                                      {notification.notes || "-"}
                                    </summary>

                                    <div className="mt-3 rounded-xl border border-[#3A5D49] bg-[#FEFDFC] p-3 space-y-2">
                                      <div className="dashboard-value">
                                        <strong>Client:</strong>{" "}
                                        <Link
                                          href={`/coach/clients/${notification.client_id}`}
                                          className="text-[#2F5A43] underline"
                                        >
                                          {notification.client_name}
                                        </Link>
                                      </div>

                                      <div className="dashboard-value">
                                        <strong>Purchase:</strong> {notification.notes}
                                      </div>

                                      <div className="dashboard-value">
                                        <strong>Date:</strong> {notification.original_datetime}
                                      </div>
                                    </div>
                                  </details>
                                ) : (
                                  <p className="text-[15px] font-light text-[#2F5A43] whitespace-pre-wrap">
                                    {notification.notes || "-"}
                                  </p>
                                )}
                              </div>

                              <div>
                                <p className="dashboard-label">Created</p>
                                <p className="text-[15px] font-light text-[#2F5A43]">
                                  {new Date(notification.created_at).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                  })}
                                  {" | "}
                                  {new Date(notification.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                {activePage > 1 && (
                  <button
                    onClick={() => setActivePage((p) => p - 1)}
                    className="rounded-lg border border-[#3A5D49] bg-white px-4 py-2 text-[#1F3327] shadow-sm transition hover:border-[#2F5A43] hover:bg-[#F8FBF8]"
                  >
                    Previous
                  </button>
                )}

                <span className="text-[15px] font-light text-[#2F5A43]">
                  Page {activePage}
                </span>

                {activeHasNext && (
                  <button
                    onClick={() => setActivePage((p) => p + 1)}
                    className="rounded-lg border border-[#3A5D49] bg-white px-4 py-2 text-[#1F3327] shadow-sm transition hover:border-[#2F5A43] hover:bg-[#F8FBF8]"
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-12">
          <button
            onClick={() => setShowOlder(!showOlder)}
            className="mb-5 text-[20px] font-light uppercase tracking-[0.08em] text-[#2F5A43] transition hover:text-[#3C6A50]"
          >
            Older Notifications {showOlder ? " ▲" : " ▼"}
          </button>

          {showOlder && (
            <>
              <div className="mb-5">
                <select
                  value={olderFilter}
                  onChange={(e) => setOlderFilter(e.target.value)}
                  className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[15px] font-light text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] focus:border-[#2F5A43] focus:outline-none"
                >
                  <option value="all">All Notifications</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Late Booking">Late Booking</option>
                  <option value="Coach Cancelled">Coach Cancelled</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>

              <div className="mb-3 hidden lg:grid grid-cols-[40px_40px_140px_180px_180px_1fr_140px_140px] items-center rounded-xl border border-[#3A5D49] bg-[#F3F0EA] py-3">
                <span></span>
                <span></span>
                <span className="dashboard-label text-center">Type</span>
                <span className="dashboard-label text-center">Original Date</span>
                <span className="dashboard-label text-center">New Date</span>
                <span className="dashboard-label text-center">Notes</span>
                <span className="dashboard-label text-center">Done At</span>
                <span className="dashboard-label text-center">Created</span>
              </div>
              {olderNotifications.length === 0 ? (
                <div className="rounded-xl bg-white p-6 shadow">
                  <p className="text-[#1F3327]">No older notifications.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-[#3A5D49] bg-white">
                    {paginatedOlderNotifications.map((notification) => (
                      <div key={notification.id}>
                        <div
                          className={`hidden lg:block border-b border-[#3A5D49] ${
                            notification.is_read
                              ? "bg-[#ECE7DE]"
                              : "bg-[#FEFDFC]"
                          }`}
                        >
                          <div className="grid grid-cols-[40px_40px_140px_180px_180px_1fr_140px_140px] items-center">
                            <input
                              type="checkbox"
                              checked={notification.is_read}
                              onChange={(e) => toggleNotification(notification.id, e.target.checked)}
                              className="h-5 w-5 accent-[#2F5A43]"
                            />

                            {notification.type === "admin_message_coach" ? (
                              <Image
                                src="/images/gemini-logo-black.png"
                                alt="Gemini Golf Academy"
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            ) : (
                              <button
                                onClick={() => setSelectedClient(notification)}
                                className="rounded-md px-2 py-1 text-lg transition hover:bg-sky-200 hover:scale-110 cursor-pointer"
                              >
                                👤
                              </button>
                            )}

                            <div className="contents">
                              <span
                                className={`dashboard-value border-l border-[#3A5D49] px-3 py-3 ${
                                  notification.type === "admin_message_coach"
                                    ? "text-[#8F3434]"
                                    : ""
                                }`}
                              >
                                {notification.type_label || "-"}
                              </span>
                              <span className="dashboard-value border-l border-[#3A5D49] px-3 py-2">
                                {notification.type === "admin_message_coach"
                                  ? ""
                                  : notification.original_datetime || "-"}
                              </span>
                              <span className="dashboard-value border-l border-[#3A5D49] px-3 py-2">
                                {notification.new_datetime || "-"}
                              </span>
                              <span
                                className={`dashboard-value border-l border-[#3A5D49] px-3 py-2 whitespace-pre-wrap ${
                                  notification.type === "admin_message_coach"
                                    ? "text-[#8F3434]"
                                    : ""
                                }`}
                              >
                                {notification.notes || "-"}
                              </span>
                              <span className="dashboard-value border-l border-[#3A5D49] px-3 py-2">
                                {notification.resolved_at
                                  ? `${new Date(notification.resolved_at).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                    })} | ${new Date(notification.resolved_at).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}`
                                  : "-"}
                              </span>
                              <span className="dashboard-value border-l border-[#3A5D49] px-3 py-2">
                                {new Date(notification.created_at).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                                {" | "}
                                {new Date(notification.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`lg:hidden border-b border-[#3A5D49] ${
                            notification.is_read
                              ? "bg-[#ECE7DE]"
                              : "bg-[#FEFDFC]"
                          }`}
                        >
                          <div className="flex items-center gap-3 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={notification.is_read}
                              onChange={(e) => toggleNotification(notification.id, e.target.checked)}
                              className="h-5 w-5 accent-[#2F5A43]"
                            />

                            {notification.type === "admin_message_coach" ? (
                              <Image
                                src="/images/gemini-logo-black.png"
                                alt="Gemini Golf Academy"
                                width={28}
                                height={28}
                                className="object-contain"
                              />
                            ) : (
                              <button
                                onClick={() => setSelectedClient(notification)}
                                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#E8F2EB]"
                              >
                                👤
                              </button>
                            )}

                            <button onClick={() => toggleExpanded(notification.id)} className="flex-1 text-left">
                              <div
                                className={`text-[15px] font-light ${
                                  notification.type === "admin_message_coach"
                                    ? "text-[#8F3434]"
                                    : "text-[#2F5A43]"
                                }`}
                              >
                                {notification.type_label || "-"}{" "}
                                {expandedNotifications.includes(notification.id) ? "▲" : "▼"}
                              </div>

                              {notification.type !== "admin_message_coach" && (
                                <div className="dashboard-label mt-1">
                                  {notification.original_datetime || "-"}
                                </div>
                              )}
                            </button>
                          </div>

                          {expandedNotifications.includes(notification.id) && (
                            <div className="mt-4 space-y-4 rounded-xl border border-[#3A5D49] bg-[#F7F3EE] p-4">
                              {notification.type !== "admin_message_coach" && (
                                <div>
                                  <p className="dashboard-label">Original Date</p>
                                  <p className="text-[15px] font-light text-[#2F5A43]">
                                    {notification.original_datetime || "-"}
                                  </p>
                                </div>
                              )}

                              {notification.new_datetime && (
                                <div>
                                  <p className="dashboard-label">New Date</p>
                                  <p className="text-[15px] font-light text-[#2F5A43]">
                                    {notification.new_datetime}
                                  </p>
                                </div>
                              )}

                              {notification.type === "admin_message_coach" ? (
                                <p className="dashboard-value whitespace-pre-wrap text-[#8F3434]">
                                  {notification.notes}
                                </p>
                              ) : (
                                <>
                                  <p className="dashboard-label">Notes</p>
                                  <p
                                    className={`dashboard-value whitespace-pre-wrap ${
                                      notification.type === "admin_message_coach"
                                        ? "text-[#8F3434]"
                                        : ""
                                    }`}
                                  >
                                    {notification.notes || "-"}
                                  </p>
                                </>
                              )}

                              <div>
                                <p className="dashboard-label">Done At</p>
                                <p>
                                  {notification.resolved_at
                                    ? `${new Date(notification.resolved_at).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                      })} | ${new Date(notification.resolved_at).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}`
                                    : "-"}
                                </p>
                              </div>

                              <div>
                                <p className="dashboard-label">Created</p>
                                <p>
                                  {new Date(notification.created_at).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                  })}{" "}
                                  |{" "}
                                  {new Date(notification.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    {activePage > 1 && (
                      <button
                        onClick={() => setActivePage((p) => p - 1)}
                        className="rounded-lg border border-[#3A5D49] bg-white px-4 py-2 text-[#1F3327] shadow-sm transition hover:border-[#2F5A43] hover:bg-[#F8FBF8]"
                      >
                        Previous
                      </button>
                    )}

                    <span className="text-[15px] font-light text-[#2F5A43]">
                      Page {activePage}
                    </span>

                    {activeHasNext && (
                      <button
                        onClick={() => setActivePage((p) => p + 1)}
                        className="rounded-lg border border-[#3A5D49] bg-white px-4 py-2 text-[#1F3327] shadow-sm transition hover:border-[#2F5A43] hover:bg-[#F8FBF8]"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DashboardContainer>
      {selectedClient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl text-[#1F3327]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold">Client Details</h2>

              <button onClick={() => setSelectedClient(null)} className="text-2xl font-bold">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <Link
                  href={`/coach/clients/${selectedClient.client_id}`}
                  className="text-xl font-semibold text-blue-600 underline hover:text-blue-800"
                >
                  {selectedClient.client_name}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{selectedClient.client_phone || "No phone added"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{selectedClient.client_email || "No email added"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p>{selectedClient.client_notes || "No notes"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lessons Remaining</p>
                <p className="font-bold">{selectedClient.lessons_remaining}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
