"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

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
}

export default function NotificationsPage() {
  const [urgentNotifications, setUrgentNotifications] = useState<Notification[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRole, setCurrentRole] = useState("")

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    setCurrentRole(profile?.role || "")

    console.log("SESSION USER", session.user.id)
    console.log("ROLE", profile?.role)

    let data = null
    let error = null

    if (profile?.role === "coach") {
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("profile_id", session.user.id)
        .single()

      console.log("COACH", coach)

      const result = await supabase
        .from("notifications")
        .select("*")
        .eq("coach_id", coach?.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })

      data = result.data
      error = result.error
    } else {
      const result = await supabase
        .from("notifications")
        .select("*")
        .eq("is_read", false)
        .order("created_at", { ascending: false })

      data = result.data
      error = result.error
    }

    console.log("NOTIFICATION ERROR", error)
    console.log("NOTIFICATION DATA", data)


    if (error || !data) {
      console.error(error)
      setLoading(false)
      return
    }

      console.log("RAW NOTIFICATIONS", data)

      console.log(
        "URGENT COUNT",
        data.filter((n) => n.is_urgent).length
      )

          const enrichedNotifications = await Promise.all(
      data.map(async (notification) => {
        let client_name = ""
        let lesson_date = ""
        let lesson_time = ""

        if (notification.client_id) {
          const { data: client } = await supabase
            .from("clients")
            .select("name")
            .eq("id", notification.client_id)
            .single()

          client_name = client?.name || ""
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
          ...notification,
          client_name,
          lesson_date,
          lesson_time,
        }
      })
    )

    setUrgentNotifications(
      enrichedNotifications.filter(
        (n) => n.is_urgent
      )
    )

    setNotifications(
      enrichedNotifications.filter(
        (n) => !n.is_urgent
      )
    )

    setLoading(false)
  }

  async function toggleNotification(
    id: number,
    value: boolean
  ) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: value,
      })
      .eq("id", id)

    if (!error) {
      loadNotifications()
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-4xl font-bold text-black">
          Notifications
        </h1>

        <p className="mt-4 text-black">
          Loading...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-8 text-4xl font-bold text-black">
          Notifications
        </h1>

        {/* URGENT */}

        <div className="mb-10">
          <h2 className="mb-4 text-3xl font-bold text-red-700">
            Urgent
          </h2>

          {urgentNotifications.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-black">
                No urgent notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {urgentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-xl border border-red-300 bg-red-100 p-6 shadow"
                >
                  <h3 className="text-xl font-bold text-red-700">
                    LATE BOOKING
                  </h3>

                  <p className="mt-3 text-black">
                    <strong>Client:</strong>{" "}
                    {notification.client_name}
                  </p>

                  <p className="mt-1 text-black">
                    <strong>Time:</strong>{" "}
                    {notification.lesson_date} @{" "}
                    {notification.lesson_time}
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      className="rounded bg-green-600 px-4 py-2 text-white"
                    >
                      Approve
                    </button>

                    <button
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
          <h2 className="mb-4 text-3xl font-bold text-black">
            Notifications
          </h2>

          {notifications.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-black">
                No notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-xl bg-white p-4 shadow"
                >
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notification.is_read}
                        onChange={(e) =>
                          toggleNotification(
                            notification.id,
                            e.target.checked
                          )
                        }
                        className="h-5 w-5"
                      />

                      <span className="font-medium text-black">
                        {notification.message}
                      </span>
                    </div>

                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      {new Date(
                        notification.created_at
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                      {" | "}
                      {new Date(
                        notification.created_at
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}