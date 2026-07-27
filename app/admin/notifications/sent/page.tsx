"use client"

import Link from "next/link"
import AllNotifications from "@/components/admin/AllNotifications"

export default function AdminSentNotificationsPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/notifications"
        className="inline-flex items-center rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-300"
      >
        ← Return to Notifications
      </Link>

      <AllNotifications />
    </div>
  )
}