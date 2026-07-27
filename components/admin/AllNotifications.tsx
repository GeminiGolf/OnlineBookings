"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import "react-day-picker/dist/style.css"

type NotificationRow = {
  id: number
  client_id: number | null
  coach_id: number
  type: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string
  recipient: string
}

export default function AllNotifications() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [expandedDates, setExpandedDates] = useState<string[]>([])
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationRow | null>(null)
  const [editSubject, setEditSubject] = useState("")
  const [editMessage, setEditMessage] = useState("")
  const [editIsRead, setEditIsRead] = useState(false)
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    const { data: notificationData, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error || !notificationData) {
      console.error(error)
      return
    }

    const { data: clients } = await supabase
      .from("clients")
      .select("id, preferred_name, first_name, last_name")

    const { data: coaches } = await supabase
      .from("coaches")
      .select("id, preferred_name, first_name, last_name")

    const clientMap = new Map<number, string>()

    clients?.forEach((client: any) => {
      clientMap.set(
        client.id,
        `${client.preferred_name || client.first_name || ""} ${client.last_name || ""}`.trim()
      )
    })

    const coachMap = new Map<number, string>()

    coaches?.forEach((coach: any) => {
      coachMap.set(
        coach.id,
        `${coach.preferred_name || coach.first_name || ""} ${coach.last_name || ""}`.trim()
      )
    })

    setNotifications(
      notificationData.map((notification: any) => ({
        ...notification,
        recipient:
          notification.client_id != null
            ? clientMap.get(notification.client_id) ?? "-"
            : coachMap.get(notification.coach_id) ?? "-",
      }))
    )
  }

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.recipient.toLowerCase().includes(search.toLowerCase()) ||
        notification.type.toLowerCase().includes(search.toLowerCase()) ||
        (notification.subject ?? "").toLowerCase().includes(search.toLowerCase())

      const notificationDate = notification.created_at.slice(0, 10)

      const matchesStart =
        !startDate || notificationDate >= startDate

      const matchesEnd =
        !endDate || notificationDate <= endDate

      return matchesSearch && matchesStart && matchesEnd
    })
  }, [notifications, search, startDate, endDate])

  const groupedNotifications = useMemo(() => {
    const groups = new Map<
      string,
      {
        date: string
        notifications: NotificationRow[]
      }
    >()

    filteredNotifications.forEach((notification) => {
      const date = notification.created_at.slice(0, 10)

      if (!groups.has(date)) {
        groups.set(date, {
          date,
          notifications: [],
        })
      }

      groups.get(date)!.notifications.push(notification)
    })

    return Array.from(groups.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    )
  }, [filteredNotifications])

    async function saveNotification() {
    if (!selectedNotification) return

    await supabase
      .from("notifications")
      .update({
        subject: editSubject,
        message: editMessage,
        is_read: editIsRead,
      })
      .eq("id", selectedNotification.id)

    setSelectedNotification(null)
    loadNotifications()
  }

  async function deleteNotification() {
    if (!selectedNotification) return

    if (!confirm("Delete this notification?")) return

    await supabase
      .from("notifications")
      .delete()
      .eq("id", selectedNotification.id)

    setSelectedNotification(null)
    loadNotifications()
  }

  function toggleRow(date: string) {
    setExpandedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    )
  }

  return (
    <div className="mx-auto max-w-5xl text-black">
      <h1 className="mb-4 text-[22px] font-bold">
        Sent Notifications
      </h1>
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[105px] md:w-[110px] rounded-lg border p-2"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowStartCalendar(!showStartCalendar)
              setShowEndCalendar(false)
            }}
            className="rounded-lg border border-black bg-green-100 px-4 py-2 hover:bg-green-200"
          >
            {startDate ? format(new Date(startDate), "dd/MM/yy") : "Start Date"}
          </button>

          {showStartCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-white p-2 shadow-lg">
              <div className="overflow-hidden">
                <DayPicker
                  className="-mb-4 scale-90 origin-top"
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate("")
                        setShowStartCalendar(false)
                      }}
                      className="mt-2 w-full rounded border px-3 py-2 text-sm"
                    >
                      Clear Date
                    </button>
                  }
                  onSelect={(date) => {
                    if (!date) return
                    setStartDate(format(date, "yyyy-MM-dd"))
                    setShowStartCalendar(false)
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEndCalendar(!showEndCalendar)
              setShowStartCalendar(false)
            }}
            className="rounded-lg border border-black bg-red-100 px-4 py-2 hover:bg-red-200"
          >
            {endDate ? format(new Date(endDate), "dd/MM/yy") : "End Date"}
          </button>

          {showEndCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-white p-2 shadow-lg">
              <div className="overflow-hidden">
                <DayPicker
                  className="-mb-4 scale-90 origin-top"
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        setEndDate("")
                        setShowEndCalendar(false)
                      }}
                      className="mt-2 w-full rounded border px-3 py-2 text-sm"
                    >
                      Clear Date
                    </button>
                  }
                  onSelect={(date) => {
                    if (!date) return
                    setEndDate(format(date, "yyyy-MM-dd"))
                    setShowEndCalendar(false)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-black">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4">Date</th>
              <th className="p-4">Notifications</th>
              <th className="p-4 text-center">Details</th>
            </tr>
          </thead>

          <tbody>
            {groupedNotifications.map((group) => (
              <Fragment key={group.date}>
                <tr className="border-b">
                  <td className="p-4">
                    {new Date(group.date).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-4">
                    {group.notifications.length} notification
                    {group.notifications.length !== 1 && "s"}
                  </td>

                  <td className="p-4 text-center">
                    <button onClick={() => toggleRow(group.date)}>
                      {expandedDates.includes(group.date) ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>

                {expandedDates.includes(group.date) && (
                  <tr>
                    <td colSpan={3} className="border-t bg-white p-4">
                      <table className="w-full text-sm text-black">
                        <thead>
                          <tr className="border-b">
                            <th className="p-2">✏️</th>
                            <th className="p-2 text-left">Recipient</th>
                            <th className="p-2 text-left">Notification Type</th>
                            <th className="p-2 text-left">Subject</th>
                            <th className="p-2 text-left">Note</th>
                          </tr>
                        </thead>

                        <tbody>
                          {group.notifications.map((notification) => (
                            <tr
                              key={notification.id}
                              className="border-b last:border-0"
                            >
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedNotification(notification)
                                    setEditSubject(notification.subject ?? "")
                                    setEditMessage(notification.message)
                                    setEditIsRead(notification.is_read)
                                  }}
                                  className="hover:scale-110"
                                >
                                  ✏️
                                </button>
                              </td>

                              <td className="p-2">
                                <a
                                  href={
                                    notification.client_id
                                      ? `/admin/clients/${notification.client_id}`
                                      : `/admin/profiles/coach/${notification.coach_id}`
                                  }
                                  className="text-blue-600 hover:underline"
                                >
                                  {notification.recipient}
                                </a>
                              </td>

                              <td className="p-2">
                                {notification.type}
                              </td>

                              <td className="p-2">
                                {notification.subject || "-"}
                              </td>

                              <td className="p-2">
                                {notification.message}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
          {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold">
                Edit Notification
              </h2>

              <button
                onClick={() => setSelectedNotification(null)}
                className="text-3xl font-bold text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 text-black">

              <div>
                <p className="mb-1 font-semibold">
                  Recipient
                </p>

                <p>{selectedNotification.recipient}</p>
              </div>

              <div>
                <p className="mb-1 font-semibold">
                  Notification Type
                </p>

                <p>{selectedNotification.type}</p>
              </div>

              <div>
                <p className="mb-1 font-semibold">
                  Subject
                </p>

                <input
                  value={editSubject}
                  onChange={(e) =>
                    setEditSubject(e.target.value)
                  }
                  className="w-full rounded border p-2"
                />
              </div>

              <div>
                <p className="mb-1 font-semibold">
                  Read Status
                </p>

                <select
                  value={editIsRead ? "read" : "unread"}
                  onChange={(e) =>
                    setEditIsRead(e.target.value === "read")
                  }
                  className="w-full rounded border p-2"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              <div>
                <p className="mb-1 font-semibold">
                  Note
                </p>

                <textarea
                  rows={6}
                  value={editMessage}
                  onChange={(e) =>
                    setEditMessage(e.target.value)
                  }
                  className="w-full rounded border p-2"
                />
              </div>

              <div className="flex justify-end gap-3">

                <button
                  onClick={deleteNotification}
                  className="rounded bg-red-600 px-6 py-3 font-medium text-white"
                >
                  Delete
                </button>

                <button
                  onClick={saveNotification}
                  className="rounded bg-blue-600 px-6 py-3 font-medium text-white"
                >
                  Save
                </button>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  )
}