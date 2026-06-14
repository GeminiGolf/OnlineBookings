"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

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
      alert("Please log in as coach.")
      router.push("/login")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
    setCurrentRole(profile?.role || "")

    if (profile?.role === "client") {
      router.push("/client/notifications")
      return
    }
    if (profile?.role !== "coach" && profile?.role !== "admin") {
      alert("Please log in as coach.")
      router.push("/login")
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
        .in("type", ["late_booking", "client_cancelled", "client_rescheduled"])
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

    setUrgentNotifications(enrichedNotifications.filter((n) => n.is_urgent && !n.is_read))
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
        resolved_by: "coach",
        rejection_reason: reason,
      })
      .eq("id", notification.id)
    if (!error) {
      return
    }
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
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-4xl font-bold text-black">Notifications</h1>
        <p className="mt-4 text-black">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        {/* URGENT */}
        <div className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-red-700">Urgent</h2>
          {urgentNotifications.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-black">No urgent notifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {urgentNotifications.map((notification) => (
                <div key={notification.id} className="rounded-xl border border-red-300 bg-red-100 p-6 shadow">
                  <h3 className="text-xl font-bold text-red-700">LATE BOOKING</h3>
                  <p className="mt-3 text-black">
                    <strong>Client:</strong> {notification.client_name}
                  </p>
                  <p className="mt-1 text-black">
                    <strong>Time:</strong> {(notification.lesson_date ?? "").split("-").reverse().slice(0, 2).join("/")}{" "}
                    @ {(notification.lesson_time ?? "").replace(":00", "").toLowerCase()}
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleApprove(notification)}
                      className="rounded bg-green-600 px-4 py-2 text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(notification)}
                      className="rounded bg-red-600 px-4 py-2 text-white"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* STANDARD */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-black">Notifications ({activeNotifications.length})</h2>
          <div className="mb-3 ml-16 grid grid-cols-[140px_180px_180px_1fr_140px] gap-4 text-sm font-bold text-gray-600">
            <span>Type</span>
            <span>Original Date</span>
            <span>New Date</span>
            <span>Notes</span>
            <span>Created</span>
          </div>
          {activeNotifications.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-black">No notifications.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedActiveNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-xl p-4 shadow ${notification.is_read ? "bg-gray-200" : "bg-white"}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={notification.is_read}
                          onChange={(e) => toggleNotification(notification.id, e.target.checked)}
                          className="h-5 w-5"
                        />

                        <button
                          onClick={() => setSelectedClient(notification)}
                          className="rounded-md px-2 py-1 text-lg transition hover:bg-sky-200 hover:scale-110 cursor-pointer"
                        >
                          👤
                        </button>

                        <div className="grid grid-cols-[120px_180px_180px_1fr] gap-4 text-sm text-black">
                          <span>{notification.type_label || "-"}</span>
                          <span>{notification.original_datetime || "-"}</span>
                          <span>{notification.new_datetime || "-"}</span>
                          <span className="truncate">{notification.notes || "-"}</span>
                        </div>
                      </div>

                      <span className="text-sm text-gray-600 whitespace-nowrap">
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
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                {activePage > 1 && (
                  <button onClick={() => setActivePage((p) => p - 1)} className="rounded bg-gray-300 px-4 py-2">
                    Previous
                  </button>
                )}

                {activeHasNext && (
                  <button onClick={() => setActivePage((p) => p + 1)} className="rounded bg-gray-300 px-4 py-2">
                    Next
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-10">
          <button onClick={() => setShowOlder(!showOlder)} className="mb-4 text-2xl font-bold text-black">
            Older Notifications {showOlder ? " ▲" : " ▼"}
          </button>

          {showOlder && (
            <>
              <div className="mb-4">
                <select
                  value={olderFilter}
                  onChange={(e) => setOlderFilter(e.target.value)}
                  className="rounded border px-3 py-2 text-black bg-white"
                >
                  <option value="all">All</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Late Booking">Late Booking</option>
                  <option value="Coach Cancelled">Coach Cancelled</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>
              <div className="mb-3 ml-16 grid grid-cols-[140px_180px_180px_1fr_140px_140px] gap-4 text-sm font-bold text-gray-600">
                <span>Type</span>
                <span>Original Date</span>
                <span>New Date</span>
                <span>Notes</span>
                <span>Done At</span>
                <span>Created</span>
              </div>

              {olderNotifications.length === 0 ? (
                <div className="rounded-xl bg-white p-6 shadow">
                  <p className="text-black">No older notifications.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
                    {paginatedOlderNotifications.map((notification) => (
                      <div key={notification.id} className="border-b border-gray-300 bg-white">
                        <div className="grid grid-cols-[40px_40px_140px_180px_180px_1fr_140px_140px] items-center">
                          <input
                            type="checkbox"
                            checked={notification.is_read}
                            onChange={(e) => toggleNotification(notification.id, e.target.checked)}
                            className="h-5 w-5"
                          />

                          <button
                            onClick={() => setSelectedClient(notification)}
                            className="rounded-md px-2 py-1 text-lg transition hover:bg-sky-200 hover:scale-110 cursor-pointer"
                          >
                            👤
                          </button>

                          <div className="contents text-sm text-black">
                            <span className="border-l border-gray-300 px-3 py-3">{notification.type_label || "-"}</span>
                            <span className="border-l border-gray-300 px-3 py-3">
                              {notification.original_datetime || "-"}
                            </span>
                            <span className="border-l border-gray-300 px-3 py-3">
                              {notification.new_datetime || "-"}
                            </span>
                            <span className="border-l border-gray-300 px-3 py-3">{notification.notes || "-"}</span>
                            <span className="border-l border-gray-300 px-3 py-3">
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
                            <span className="border-l border-gray-300 px-3 py-3">
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
                    ))}
                  </div>

                  <div className="mt-4 flex gap-3">
                    {olderPage > 1 && (
                      <button onClick={() => setOlderPage((p) => p - 1)} className="rounded bg-gray-300 px-4 py-2">
                        Previous
                      </button>
                    )}
                    {olderHasNext && (
                      <button onClick={() => setOlderPage((p) => p + 1)} className="rounded bg-gray-300 px-4 py-2">
                        Next
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {selectedClient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl text-black">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold">Client Details</h2>

              <button onClick={() => setSelectedClient(null)} className="text-2xl font-bold">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="text-xl font-semibold">{selectedClient.client_name}</p>
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
