"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import RequireAdmin from "@/components/auth/RequireAdmin"

export default function AdminPage() {
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [urgentNotifications, setUrgentNotifications] = useState(0)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    const { data: urgentNotifications } = await supabase
      .from("notifications")
      .select("id")
      .eq("type", "late_booking")
      .eq("is_urgent", true)
      .eq("is_read", false)

    const { data: missingReceiptNotifications } = await supabase
      .from("notifications")
      .select("id")
      .eq("type", "missing_receipt")
      .eq("is_read", false)

    const urgentCount = urgentNotifications?.length || 0
    const receiptCount = missingReceiptNotifications?.length || 0

    setUrgentNotifications(urgentCount)
    setTotalNotifications(urgentCount + receiptCount)
  }

  return (
    <RequireAdmin>
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

        <Link
          href="/admin/profiles"
          className="rounded-xl bg-white p-6 shadow transition hover:scale-[1.02]"
        >
          <h2 className="text-lg font-semibold text-black">
            Profiles
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            →
          </p>
        </Link>


        <Link
          href="/admin/packages"
          className="rounded-xl bg-white p-6 shadow transition hover:scale-[1.02]"
        >
          <h2 className="text-lg font-semibold text-black">
            All Client Packages
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            →
          </p>
        </Link>

        <Link
          href="/admin/bookings"
          className="rounded-xl bg-white p-6 shadow transition hover:scale-[1.02]"
        >
          <h2 className="text-lg font-semibold text-black">
            All Bookings
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            →
          </p>
        </Link>

        <Link
          href="/admin/transactions"
          className="rounded-xl bg-white p-6 shadow transition hover:scale-[1.02]"
        >
          <h2 className="text-lg font-semibold text-black">
            Transactions
          </h2>

          <p className="mt-2 text-3xl font-bold text-black">
            →
          </p>
        </Link>
      </div>
      
    </main>
  </RequireAdmin>
  )
}