"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Settings } from "lucide-react"
import RequireClient from "@/components/auth/RequireClient"
import DashboardContainer from "@/components/layout/DashboardContainer"
import LoadingScreen from "@/components/ui/LoadingScreen"
export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [olderNotifications, setOlderNotifications] = useState<any[]>([])
  const [showOlder, setShowOlder] = useState(false)
  const router = useRouter()
  const [expandedNotifications, setExpandedNotifications] = useState<number[]>([])
  const ITEMS_PER_PAGE = 5
  const [notificationsPage, setNotificationsPage] = useState(1)
  const [olderNotificationsPage, setOlderNotificationsPage] = useState(1)
const [loadingPage, setLoadingPage] = useState(true)
  useEffect(() => {
    loadNotifications()
  }, [])

	async function loadNotifications() {
		setLoadingPage(true)
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      router.replace("/login")
      return
    }

    const { data: client } = await supabase.from("clients").select("*").eq("profile_id", session.user.id).single()
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
    if (profile?.role === "coach") {
      router.push("/coach/notifications")
      return
    }
    if (profile?.role !== "client" && profile?.role !== "admin") {
      router.replace("/login")
      return
    }
    if (!client) return
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("client_id", client.id)
      .in("type", [
        "coach_cancelled",
        "admin_cancelled",
        "coach_rescheduled",
        "coach_booked",
        "no_show",
        "admin_message_client",
      ])
      .order("created_at", { ascending: false })
    const enrichedNotifications = await Promise.all(
      (data || []).map(async (notification) => {
        let original_datetime = "-"
        let new_datetime = ""
        let details = notification.message || ""

        if (notification.type === "admin_message_client") {
          details = notification.message || ""
        }

        if (
          notification.booking_id &&
          notification.type !== "admin_message_client"
        ) {
          const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", notification.booking_id)
            .single()
          const formatDate = (date: string) =>
            new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
            })
          const formatTime = (time: string) => time.replace(":00", "")
          if (booking?.lesson_date) {
            original_datetime = `${formatDate(booking.lesson_date)} @ ${formatTime(booking.lesson_time)}`
          }
          if (notification.type === "coach_cancelled") {
            console.log("coach_cancelled", {
              notification,
              booking,
            })
            if (notification.message?.toLowerCase().includes("late booking")) {
              details =
                "Late booking rejected" +
                (booking?.cancellation_reason
                  ? `\n\nCoach: ${booking.cancellation_reason}`
                  : "")
            } else {
              details = booking?.cancellation_reason
                ? `Coach: ${booking.cancellation_reason}`
                : notification.message || "-"
            }
          }
          if (notification.type === "coach_booked") {
            details =
              "Coach has booked a new lesson for you." + (booking?.lesson_notes ? `\n\n${booking.lesson_notes}` : "")
          }
          if (notification.type === "no_show") {
            details = "Missed Lesson"
          }
          if (notification.type === "coach_rescheduled") {
            const { data: changes } = await supabase
              .from("booking_changes")
              .select("*")
              .eq("booking_id", notification.booking_id)
              .order("created_at", {
                ascending: false,
              })
            const change = changes?.[0]

            if (change) {
              original_datetime = `${formatDate(change.old_date)} @ ${formatTime(change.old_time)}`

              new_datetime = `${formatDate(change.new_date)} @ ${formatTime(change.new_time)}`

              details =
                `New Lesson:\n${new_datetime}` +
                (notification.message && notification.message !== "Coach rescheduled lesson"
                  ? `\n\n${notification.message}`
                  : "")
            }
          }
        }
        return {
          ...notification,
          original_datetime,
          new_datetime,
          details,
        }
      })
    )
    const unread = enrichedNotifications.filter((n) => !n.client_read_at)
    const read = enrichedNotifications.filter((n) => n.client_read_at)
    setNotifications(unread)
    setOlderNotifications(read)
    setLoadingPage(false)
  }

  async function markAsRead(id: number) {
    await supabase
      .from("notifications")
      .update({
        client_read_at: new Date().toISOString(),
      })
      .eq("id", id)

    loadNotifications()
  }
  function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }
  function getTypeLabel(notification: any) {
    switch (notification.type) {
      case "coach_cancelled":
        return "Cancellation"

      case "coach_rescheduled":
        return "Rescheduled"

      case "coach_booked":
        return "Booked"

      case "no_show":
        return "Missed Lesson"

      case "admin_message_client":
        return notification.subject || "Admin Message"

      default:
        return notification.type
    }
  }

  const paginatedNotifications = notifications.slice(
    (notificationsPage - 1) * ITEMS_PER_PAGE,
    notificationsPage * ITEMS_PER_PAGE
  )
  const paginatedOlderNotifications = olderNotifications.slice(
    (olderNotificationsPage - 1) * ITEMS_PER_PAGE,
    olderNotificationsPage * ITEMS_PER_PAGE
  )
  function toggleNotification(id: number) {
    setExpandedNotifications((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }
  if (loadingPage) {
    return <LoadingScreen text="Loading notifications..." />
  }

  return (
    <RequireClient>
      <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#2F5A43]">
        <DashboardContainer>
          <div className="w-full">
            <div className="mb-3 flex items-center gap-3 sm:mb-6">
              <Link
                href="/client/dashboard"
                className="rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6]"
              >
                ← Back to Dashboard
              </Link>

              <Link
                href="/client/notifications/settings"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3A5D49] bg-white text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6]"
                title="Notification Settings"
              >
                <Settings className="h-5 w-5 stroke-[1.25]" />
              </Link>
            </div>

            <h2 className="dashboard-heading mb-4">
              Notifications ({notifications.length})
            </h2>
          <div className="space-y-1">
            <div className="dashboard-label hidden lg:grid grid-cols-[60px_180px_220px_1fr_220px] gap-4 px-4">
              <div></div>
              <div>Type</div>
              <div>Lesson</div>
              <div>Details</div>
              <div>Created At</div>
            </div>

            {paginatedNotifications.map((notification) => (
              <div key={notification.id}>
                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-[60px_180px_220px_1fr_220px] items-center gap-4 rounded-xl border border-[#3A5D49] bg-[#FBF8F3] px-4 py-3 transition hover:bg-[#F6FAF6]">
                  <div>
                    <input type="checkbox" onChange={() => markAsRead(notification.id)} />
                  </div>
                  <div
                    className={`text-[15px] font-light ${
                      notification.type === "admin_message_client"
                        ? "text-[#8f3434]"
                        : "!text-[#2F5A43]"
                    }`}
                  >
                    {getTypeLabel(notification)}
                  </div>
                  <div className="dashboard-value !text-[#2F5A43]">
                    {notification.type === "admin_message_client"
                      ? ""
                      : notification.original_datetime}
                  </div>
                  <div className="dashboard-value whitespace-pre-line !text-[#2F5A43]">
                    {notification.details}
                  </div>
                  <div className="dashboard-value !text-[#2F5A43]">
                    {formatDateTime(notification.created_at)}
                  </div>
                </div>

                {/* Mobile */}
                <div className="lg:hidden rounded-xl border border-[#3A5D49] bg-[#FBF8F3] px-4 py-5">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" onChange={() => markAsRead(notification.id)} />

                    <button onClick={() => toggleNotification(notification.id)} className="flex-1 text-left">
                      <div
                        className={`text-[15px] font-light ${
                          notification.type === "admin_message_client"
                            ? "text-[#8f3434]"
                            : "text-[#2F5A43]"
                        }`}
                      >
                        {getTypeLabel(notification)}{" "}
                        {expandedNotifications.includes(notification.id) ? "▲" : "▼"}
                      </div>

                      {notification.type !== "admin_message_client" && (
                        <div className="text-sm font-light text-[#2F5A43]">
                          {notification.original_datetime}
                        </div>
                      )}
                    </button>
                  </div>

                  {expandedNotifications.includes(notification.id) && (
                    <div className="mt-4 space-y-4">
                      {notification.type === "admin_message_client" ? (
                        <p className="dashboard-value !text-[#2F5A43]">{notification.message}</p>
                      ) : (
                        <div>
                          <p className="dashboard-label">Notes</p>
                          <p className="dashboard-value whitespace-pre-line !text-[#2F5A43]">
                            {notification.message}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="dashboard-label">Created</p>
                        <p className="dashboard-value !text-[#2F5A43]">
                          {formatDateTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
							<div className="rounded-2xl border border-[#3A5D49] bg-white p-6 shadow-md">
								<p className="dashboard-value !text-[#2F5A43]">
									No notifications.
								</p>
							</div>
						)}

            {notifications.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setNotificationsPage((p) => Math.max(1, p - 1))}
                  disabled={notificationsPage === 1}
                  className="rounded border px-3 py-1 disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  {notificationsPage} of {Math.ceil(notifications.length / ITEMS_PER_PAGE)}
                </span>
                <button
                  onClick={() =>
                    setNotificationsPage((p) => Math.min(Math.ceil(notifications.length / ITEMS_PER_PAGE), p + 1))
                  }
                  disabled={notificationsPage >= Math.ceil(notifications.length / ITEMS_PER_PAGE)}
                  className="rounded border px-3 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="mt-10">
            <button
              onClick={() => setShowOlder(!showOlder)}
              className="text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43] transition hover:text-[#244634]"
            >
              Older Notifications {showOlder ? "▲" : "▼"}
            </button>

            {showOlder && (
              <div className="mt-4 space-y-1">
                {paginatedOlderNotifications.map((notification) => (
                  <div key={notification.id}>
                    {/* Desktop */}
                    <div className="hidden lg:grid grid-cols-[60px_180px_220px_1fr_220px] items-center gap-4 rounded-xl border border-[#3A5D49] bg-[#FBF8F3] px-4 py-3 transition hover:bg-[#F6FAF6]">
                      <div>✓</div>

                      <div
                        className={`text-[15px] font-light ${
                          notification.type === "admin_message_client"
                            ? "text-[#8f3434]"
                            : "!text-[#2F5A43]"
                        }`}
                      >
                        {getTypeLabel(notification)}
                      </div>
                      <div className="dashboard-value !text-[#2F5A43]">
                        {notification.type === "admin_message_client"
                          ? ""
                          : notification.original_datetime}
                      </div>
                      <div className="dashboard-value whitespace-pre-line !text-[#2F5A43]">
                        {notification.details}
                      </div>
                      <div className="dashboard-value !text-[#2F5A43]">
                        {formatDateTime(notification.created_at)}
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="lg:hidden rounded-xl border border-[#3A5D49] bg-[#FBF8F3] px-4 py-5">
                      <button onClick={() => toggleNotification(notification.id)} className="flex-1 text-left">
                        <div
                          className={`text-[15px] font-light ${
                            notification.type === "admin_message_client"
                              ? "text-[#8f3434]"
                              : "text-[#2F5A43]"
                          }`}
                        >
                          {getTypeLabel(notification)}
                          {expandedNotifications.includes(notification.id) ? "▲" : "▼"}
                        </div>
                        {notification.type !== "admin_message_client" && (
                          <div className="text-sm font-light text-[#2F5A43]">
                            {notification.original_datetime}
                          </div>
                        )}
                      </button>

                      {expandedNotifications.includes(notification.id) && (
                        <div className="mt-4 space-y-4">
                          {notification.type === "admin_message_client" ? (
                            <p>{notification.message}</p>
                          ) : (
                            <div>
                              <p className="dashboard-label">Notes</p>
                              <p className="dashboard-value whitespace-pre-line !text-[#2F5A43]">
                                {notification.message}
                              </p>
                            </div>
                          )}

                          <div>
                            <p className="dashboard-label">Created</p>
                            <p className="dashboard-value !text-[#2F5A43]">
                              {formatDateTime(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {olderNotifications.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                      onClick={() => setOlderNotificationsPage((p) => Math.max(1, p - 1))}
                      disabled={olderNotificationsPage === 1}
                      className="rounded border px-3 py-1 disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <span>
                      {olderNotificationsPage} of {Math.ceil(olderNotifications.length / ITEMS_PER_PAGE)}
                    </span>

                    <button
                      onClick={() =>
                        setOlderNotificationsPage((p) =>
                          Math.min(Math.ceil(olderNotifications.length / ITEMS_PER_PAGE), p + 1)
                        )
                      }
                      disabled={olderNotificationsPage >= Math.ceil(olderNotifications.length / ITEMS_PER_PAGE)}
                      className="rounded border px-3 py-1 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardContainer>
    </main>
  </RequireClient>
  )
}