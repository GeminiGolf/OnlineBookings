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
  const [expandedNotifications, setExpandedNotifications] = useState<number[]>([])
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

  function toggleNotification(id: number) {
    setExpandedNotifications((prev) =>
      prev.includes(id)
        ? prev.filter((n) => n !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="mx-auto max-w-5xl text-[#2F5A43]">
      <>
      </>
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[120px] rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15 md:w-[180px]"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowStartCalendar(!showStartCalendar)
              setShowEndCalendar(false)
            }}
            className="rounded-xl border border-[#55725F] bg-[#EEF5EF] px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43] transition hover:bg-[#E5F0E6]"
          >
            {startDate ? (
              format(new Date(startDate), "dd/MM/yy")
            ) : (
              <>
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Start Date</span>
              </>
            )}
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
            className="rounded-xl border border-[#B07A7A] bg-[#F9F1F1] px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#8F3434] transition hover:bg-[#F5E6E6]"
          >
            {endDate ? (
              format(new Date(endDate), "dd/MM/yy")
            ) : (
              <>
                <span className="sm:hidden">End</span>
                <span className="hidden sm:inline">End Date</span>
              </>
            )}
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

      <div className="overflow-hidden rounded-3xl border border-[#3A5D49] bg-[#FEFDFC] shadow-md">
        <table className="w-full text-[#2F5A43]">
          <thead>
            <tr className="border-b border-[#D8D2C8] bg-[#F3F0EA] text-left">
              <th className="dashboard-label p-4">Date</th>
              <th className="dashboard-label p-4">
                <span className="sm:hidden">Notifs</span>
                <span className="hidden sm:inline">Notifications</span>
              </th>
              <th className="dashboard-label p-4 text-center">
                Details
              </th>
            </tr>
          </thead>

          <tbody>
            {groupedNotifications.map((group) => (
              <Fragment key={group.date}>
                <tr className="border-b border-[#D8D2C8] bg-[#FEFDFC]">
                  <td className="dashboard-label p-4">
                    {new Date(group.date).toLocaleDateString("en-GB")}
                  </td>

                  <td className="dashboard-label p-4">
                    <>
                      <span className="sm:hidden">{group.notifications.length}</span>

                      <span className="hidden sm:inline">
                        {group.notifications.length} notification
                        {group.notifications.length !== 1 && "s"}
                      </span>
                    </>
                  </td>

                  <td className="p-4 text-center">
                    <button onClick={() => toggleRow(group.date)}>
                      {expandedDates.includes(group.date) ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>

                {expandedDates.includes(group.date) && (
                  <tr>
                    <td colSpan={3} className="border-t border-[#D8D2C8] bg-white p-4">

                      {/* Desktop */}
                      <div className="hidden md:block">
                        <table className="w-full text-[15px] font-light text-[#2F5A43]">
                          <thead>
                            <tr className="border-b border-[#D8D2C8] bg-[#FEFDFC]">
                              <th className="dashboard-label p-3 text-center">Edit</th>
                              <th className="dashboard-label p-3 text-left">Client</th>
                              <th className="dashboard-label p-3 text-left">Notifs</th>
                              <th className="dashboard-label p-3 text-left">Subject</th>
                              <th className="dashboard-label p-3 text-left">Note</th>
                            </tr>
                          </thead>

                          <tbody>
                            {group.notifications.map((notification) => (
                              <tr
                                key={notification.id}
                                className="border-b border-[#D8D2C8] last:border-0"
                              >
                                <td className="p-2 text-center">
                                  <button
                                    onClick={() => {
                                      setSelectedNotification(notification)
                                      setEditSubject(notification.subject ?? "")
                                      setEditMessage(notification.message)
                                      setEditIsRead(notification.is_read)
                                    }}
                                    className="rounded-xl bg-[#4E6FA8] px-3 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#3F5F93]"
                                  >
                                    Edit
                                  </button>
                                </td>

                                <td className="p-3 text-[15px] font-light text-[#2F5A43]">
                                  <a
                                    href={
                                      notification.client_id
                                        ? `/admin/clients/${notification.client_id}`
                                        : `/admin/profiles/coach/${notification.coach_id}`
                                    }
                                    className="text-[#4E6FA8] hover:underline"
                                  >
                                    {notification.recipient}
                                  </a>
                                </td>

                                <td className="p-3 text-[15px] font-light text-[#2F5A43]">
                                  {notification.type}
                                </td>

                                <td className="p-3 text-[15px] font-light text-[#2F5A43]">
                                  {notification.subject || "-"}
                                </td>

                                <td className="p-3 text-[15px] font-light text-[#2F5A43]">
                                  {notification.message}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile */}
                      <div className="space-y-2 md:hidden">
                        {group.notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="overflow-hidden rounded-2xl border border-[#3A5D49] bg-[#FEFDFC]"
                          >
                            <button
                              type="button"
                              onClick={() => toggleNotification(notification.id)}
                              className="flex w-full items-center gap-3 px-3 py-3 text-left"
                            >
                              <span className="flex h-10 w-[58px] shrink-0 items-center justify-center rounded-xl bg-[#4E6FA8] text-[12px] font-light uppercase tracking-[0.08em] text-white transition hover:bg-[#3F5F93]">
                                Edit
                              </span>

                              <div className="w-[110px] shrink-0">
                                <p className="dashboard-label">Client</p>
                                <p className="truncate text-[15px] font-light text-[#2F5A43]">
                                  {notification.recipient}
                                </p>
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="dashboard-label">Notifs</p>
                                <p className="truncate text-[15px] font-light text-[#2F5A43]">
                                  {notification.type}
                                </p>
                              </div>

                              <span className="w-6 shrink-0 text-center text-[#2F5A43]">
                                {expandedNotifications.includes(notification.id) ? "▲" : "▼"}
                              </span>
                            </button>

                            {expandedNotifications.includes(notification.id) && (
                              <div className="border-t border-[#D8D2C8] px-4 py-3 space-y-3">

                                <div>
                                  <p className="dashboard-label">Subject</p>
                                  <p className="text-[15px] font-light text-[#2F5A43]">
                                    {notification.subject || "-"}
                                  </p>
                                </div>

                                <div>
                                  <p className="dashboard-label">Note</p>
                                  <p className="text-[15px] font-light text-[#2F5A43] whitespace-pre-wrap">
                                    {notification.message}
                                  </p>
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedNotification(notification)
                                    setEditSubject(notification.subject ?? "")
                                    setEditMessage(notification.message)
                                    setEditIsRead(notification.is_read)
                                  }}
                                  className="w-full rounded-xl bg-[#4E6FA8] py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#3F5F93]"
                                >
                                  Edit Notification
                                </button>

                              </div>
                            )}
                          </div>
                        ))}
                      </div>

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
          <div className="w-full max-w-2xl rounded-3xl border border-[#3A5D49] bg-white p-8 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
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
                <p className="dashboard-label mb-1 font-normal">
                  Recipient
                </p>

                <p>{selectedNotification.recipient}</p>
              </div>

              <div>
                <p className="dashboard-label mb-1 font-normal">
                  Notification Type
                </p>

                <p>{selectedNotification.type}</p>
              </div>

              <div>
                <p className="dashboard-label mb-1 font-normal">
                  Subject
                </p>

                <input
                  value={editSubject}
                  onChange={(e) =>
                    setEditSubject(e.target.value)
                  }
                  className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
                />
              </div>

              <div>
                <p className="dashboard-label mb-1 font-normal">
                  Read Status
                </p>

                <select
                  value={editIsRead ? "read" : "unread"}
                  onChange={(e) =>
                    setEditIsRead(e.target.value === "read")
                  }
                  className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              <div>
                <p className="dashboard-label mb-1 font-normal">
                  Note
                </p>

                <textarea
                  rows={6}
                  value={editMessage}
                  onChange={(e) =>
                    setEditMessage(e.target.value)
                  }
                  className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
                />
              </div>

              <div className="flex justify-end gap-3">

                <button
                  onClick={deleteNotification}
                  className="rounded-xl border border-[#9D3E3E] bg-white px-6 py-3 text-[13px] font-light uppercase tracking-[0.12em] text-[#9D3E3E] transition hover:bg-[#FDF4F4]"
                >
                  Delete
                </button>

                <button
                  onClick={saveNotification}
                  className="rounded-xl bg-[#2F5A43] px-6 py-3 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634]"
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