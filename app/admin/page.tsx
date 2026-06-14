"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [urgentNotifications, setUrgentNotifications] = useState(0)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
  const { data } = await supabase
    .from("notifications")
    .select("is_urgent")
    .eq("is_read", false)
    .eq("is_urgent", true)

    if (!data) return

    setTotalNotifications(data.length)

    setUrgentNotifications(
      data.filter(
        (notification) =>
          notification.is_urgent
      ).length
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-4xl font-bold text-black">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <Link
          href="/admin/notifications"
          className="rounded-xl bg-white p-6 shadow transition hover:scale-[1.02]"
        >
          <h2 className="text-lg font-semibold text-black">
            Notifications
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            {totalNotifications}
          </p>
        </Link>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-black">
            Profiles
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            -
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-black">
            Transactions
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            -
          </p>
        </div>
      </div>
      
    </main>
  )
}