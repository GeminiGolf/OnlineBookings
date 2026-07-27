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

      const { error } = await supabase
        .from("notifications")
        .insert(notifications)

      if (error) {
        alert(error.message)
        return
      }

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
      <div className="flex max-h-[75vh] md:max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="mb-1 flex items-center justify-between px-6 pt-4">
          <h2 className="text-xl font-bold text-black">
            Push Notification
          </h2>

          <button
            onClick={onClose}
            className="text-3xl font-bold text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-6 pb-8 pt-1">

          <div className="flex items-center gap-3">
            <h3 className="whitespace-nowrap text-[16px] font-semibold text-black">
              Send to:
            </h3>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients or coaches..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-black placeholder:text-gray-400 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">

            <div className="rounded-lg border bg-gray-50 p-2">

              <p className="font-medium text-black">
                Recipients
              </p>

              <div className="mt-1 max-h-62 overflow-y-auto rounded-md border bg-white">

                <label className="flex cursor-pointer items-center gap-2 border-b bg-gray-50 px-3 py-1 font-medium">
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

                  <span className="text-black">
                    Select All
                  </span>
                </label>

                <div className="border-b bg-gray-100 px-3 py-0 text-sm font-semibold text-gray-600">
                  Coaches
                </div>

                {visibleCoaches.map((coach) => {
                  const id = `coach-${coach.id}`

                  return (
                    <label
                      key={coach.id}
                      className="flex cursor-pointer items-center gap-2 border-b px-3 py-1 hover:bg-gray-50"
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

                <div className="border-b bg-gray-100 px-3 py-0 text-sm font-semibold text-gray-600">
                  Clients
                </div>

                {visibleClients.map((client) => {
                  const id = `client-${client.id}`

                  return (
                    <label
                      key={client.id}
                      className="flex cursor-pointer items-center gap-2 border-b px-3 py-1 hover:bg-gray-50"
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

                      <span className="text-black">
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

            <div className="mt-4 rounded-md bg-sky-50 px-2 py-1 text-sm font-medium text-sky-700">
              {selectedRecipients.length} recipient
              {selectedRecipients.length === 1 ? "" : "s"} selected
            </div>

            <div className="mt-3 space-y-3 border-t pt-3">

              <div>
                <label className="mb-0 block font-medium text-black">
                  Subject
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Notification subject..."
                  className="w-full rounded-md border border-gray-300 px-3 py-1 text-black focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-0 block font-medium text-black">
                  Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Notification message..."
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-1 text-black focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">

                <button
                  onClick={onClose}
                  className="rounded-md bg-gray-300 px-3 py-2 font-medium text-black hover:bg-gray-400"
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
                  className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Send Notification
                </button>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}