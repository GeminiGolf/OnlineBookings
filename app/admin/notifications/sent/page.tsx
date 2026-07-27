"use client"

import Link from "next/link"
import RequireAdmin from "@/components/auth/RequireAdmin"
import AllNotifications from "@/components/admin/AllNotifications"

export default function SentNotificationsPage() {
  return (
    <RequireAdmin>
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">

            <Link
              href="/admin/notifications"
              className="rounded-lg bg-blue-900 px-4 py-2 font-medium text-white hover:bg-blue-950"
            >
              Back to Notifications
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <AllNotifications />
          </div>
        </div>
      </main>
    </RequireAdmin>
  )
}