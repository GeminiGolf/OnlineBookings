"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type PushNotificationsModalProps = {
  open: boolean
  onClose: () => void
}

export default function PushNotificationsModal({
  open,
  onClose,
}: PushNotificationsModalProps) {

  const [clients, setClients] = useState<
    {
      id: number
      name: string
      preferred_name: string | null
      first_name: string | null
      last_name: string | null
      primary_coach_id: number | null
    }[]
  >([])

  const [coaches, setCoaches] = useState<
    {
      id: number
      name: string
      preferred_name: string | null
    }[]
  >([])

  const [search, setSearch] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!open) return

    loadClients()
  }, [open])

  const term = search.trim().toLowerCase()

  const matchingCoach = coaches.find((coach) =>
    `${coach.preferred_name ?? ""} ${coach.name}`
      .toLowerCase()
      .includes(term)
  )

  const visibleCoaches =
    term === ""
      ? coaches
      : matchingCoach
        ? [matchingCoach]
        : []

  const visibleClients =
    term === ""
      ? clients
      : matchingCoach
        ? clients.filter(
            (client) => client.primary_coach_id === matchingCoach.id
          )
        : clients.filter((client) => {
            const searchText = [
              client.preferred_name,
              client.first_name,
              client.last_name,
              client.name,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()

            return searchText.includes(term)
          })

  async function loadClients() {
    const [
      { data: clientsData },
      { data: coaches },
    ] = await Promise.all([
      supabase
      .from("clients")
      .select(
        "id,name,preferred_name,first_name,last_name,primary_coach_id"
      )
      .order("first_name"),

      supabase
        .from("coaches")
        .select("id,name,preferred_name")
        .order("name"),
    ])

    setClients((clientsData ?? []) as {
      id: number
      name: string
      preferred_name: string | null
      first_name: string | null
      last_name: string | null
      primary_coach_id: number | null
    }[])

    setCoaches(coaches ?? [])
    }

    async function sendNotification() {
      if (!subject.trim() || !message.trim()) {
        alert("Please enter a subject and message.")
        return
      }

      if (selectedRecipients.length === 0) {
        alert("Please select at least one recipient.")
        return
      }

      const notifications = selectedRecipients.map((id) => {
        const [recipientType, value] = id.split("-")

        if (recipientType === "client") {
          const client = clients.find((c) => c.id === Number(value))

          return {
            coach_id: client!.primary_coach_id,
            client_id: client!.id,
            booking_id: null,
            type: "admin_message_client",
            subject,
            message,
            is_read: false,
            is_urgent: false,
          }
        }

        return {
          coach_id: Number(value),
          client_id: null,
          booking_id: null,
          type: "admin_message_coach",
          subject,
          message,
          is_read: false,
          is_urgent: false,
        }
      })

      const { data: insertedNotifications, error } = await supabase
        .from("notifications")
        .insert(notifications)
        .select("id, type")

      if (error) {
        alert(error.message)
        return
      }

      const coachNotifications =
        insertedNotifications?.filter(
          (notification) => notification.type === "admin_message_coach"
        ) ?? []

      const clientNotifications =
        insertedNotifications?.filter(
          (notification) => notification.type === "admin_message_client"
        ) ?? []

      await Promise.all([
        ...coachNotifications.map((notification) =>
          fetch("/api/coach/notifications/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              notificationId: notification.id,
            }),
          })
        ),

        ...clientNotifications.map((notification) =>
          fetch("/api/client/notifications/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              notificationId: notification.id,
            }),
          })
        ),
      ])

      alert("Notification sent successfully.")

      setSubject("")
      setMessage("")
      setSelectedRecipients([])
      setSearch("")

      onClose()
    }
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-[#3A5D49] bg-white shadow-xl">
        <div className="mb-1 flex items-center justify-between px-6 pt-4">
          <h2 className="text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
            Push Notification
          </h2>

          <button
            onClick={onClose}
            className="text-3xl font-light text-[#55725F] transition hover:text-[#2F5A43]"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-6 pb-8 pt-1">

          <div className="flex items-center gap-3">
            <h3 className="dashboard-label whitespace-nowrap">
              Send to:
            </h3>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients or coaches..."
              className="flex-1 rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] placeholder:text-[#8A9A8F] focus:border-[#2F5A43] focus:outline-none"
              style={{ accentColor: "#2F5A43" }}
            />
          </div>

          <div className="pt-2">

            <div className="rounded-2xl border border-[#3A5D49] bg-[#FEFDFC] p-3">

              <p className="dashboard-label">
                Recipients
              </p>

              <div className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-[#3A5D49] bg-white">

                <label className="flex cursor-pointer items-center gap-3 border-b border-[#3A5D49] bg-[#F8F5F0] px-4 py-2 text-[15px] font-light text-[#2F5A43]">
                  <input
                    type="checkbox"
                    checked={
                      [...visibleCoaches, ...visibleClients].length > 0 &&
                      [...visibleCoaches, ...visibleClients].every((person) => {
                        const id =
                          "primary_coach_id" in person
                            ? `client-${person.id}`
                            : `coach-${person.id}`

                        return selectedRecipients.includes(id)
                      })
                    }
                    onChange={(e) => {
                      const visibleIds = [
                        ...visibleCoaches.map((coach) => `coach-${coach.id}`),
                        ...visibleClients.map((client) => `client-${client.id}`),
                      ]

                      if (e.target.checked) {
                        setSelectedRecipients((prev) => [
                          ...new Set([...prev, ...visibleIds]),
                        ])
                      } else {
                        setSelectedRecipients((prev) =>
                          prev.filter((id) => !visibleIds.includes(id))
                        )
                      }
                    }}
                  />

                  <span className="text-[15px] font-light text-[#2F5A43]">
                    Select All
                  </span>
                </label>

                <div className="border-b border-[#3A5D49] bg-[#F2EEE8] px-4 py-2 text-[13px] font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
                  Coaches
                </div>

                {visibleCoaches.map((coach) => {
                  const id = `coach-${coach.id}`

                  return (
                    <label
                      key={coach.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-[#3A5D49] px-4 py-2 text-[15px] font-light text-[#2F5A43] transition hover:bg-[#F8FBF8]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecipients((prev) => [...prev, id])
                          } else {
                            setSelectedRecipients((prev) =>
                              prev.filter((x) => x !== id)
                            )
                          }
                        }}
                      />

                      <span className="font-medium text-black">
                        {coach.preferred_name ?? coach.name}
                      </span>
                    </label>
                  )
                })}

                <div className="border-b border-[#3A5D49] bg-[#F2EEE8] px-4 py-2 text-[13px] font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
                  Clients
                </div>

                {visibleClients.map((client) => {
                  const id = `client-${client.id}`

                  return (
                    <label
                      key={client.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-[#3A5D49] px-4 py-2 text-[15px] font-light text-[#2F5A43] transition hover:bg-[#F8FBF8]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecipients((prev) => [...prev, id])
                          } else {
                            setSelectedRecipients((prev) =>
                              prev.filter((x) => x !== id)
                            )
                          }
                        }}
                      />

                      <span className="text-[15px] font-light text-[#2F5A43]">
                        {client.preferred_name &&
                        client.preferred_name.trim() !== ""
                          ? `(${client.preferred_name}) ${client.first_name ?? ""} ${client.last_name ?? ""}`.trim()
                          : `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim()}
                      </span>
                    </label>
                  )
                })}

              </div>

            </div>

            <div className="mt-4 rounded-2xl border border-[#3A5D49] bg-[#F6FAF6] px-4 py-3 text-[15px] font-light text-[#2F5A43]">
              {selectedRecipients.length} recipient
              {selectedRecipients.length === 1 ? "" : "s"} selected
            </div>

            <div className="mt-5 space-y-5 border-t border-[#3A5D49] pt-5">

              <div>
                <label className="dashboard-label mb-2 block">
                  Subject
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Notification subject..."
                  className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
                />
              </div>

              <div>
                <label className="dashboard-label mb-2 block">
                  Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Notification message..."
                  className="w-full resize-none rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-3 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
                />
              </div>

              <div className="flex justify-end gap-2">

                <button
                  onClick={onClose}
                  className="rounded-xl border border-[#9D3E3E] bg-white px-6 py-3 text-[13px] font-light uppercase tracking-[0.12em] text-[#9D3E3E] transition hover:bg-[#FDF4F4]"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Send this notification to ${selectedRecipients.length} recipient${selectedRecipients.length === 1 ? "" : "s"}?`
                      )
                    ) {
                      sendNotification()
                    }
                  }}
                  disabled={
                    !subject.trim() ||
                    !message.trim() ||
                    selectedRecipients.length === 0
                  }
                  className="rounded-xl bg-[#2F5A43] px-6 py-3 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634] disabled:cursor-not-allowed disabled:bg-[#A7B3AC]"
                >
                  <>
                    <span className="sm:hidden">Send</span>
                    <span className="hidden sm:inline">Send Notification</span>
                  </>
                </button>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}