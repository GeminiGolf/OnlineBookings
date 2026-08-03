"use client"

import Link from "next/link"
import RequireAdmin from "@/components/auth/RequireAdmin"
import AllNotifications from "@/components/admin/AllNotifications"
import DashboardContainer from "@/components/layout/DashboardContainer"
export default function SentNotificationsPage() {
  return (
    <RequireAdmin>
      <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#2F5A43]">
        <DashboardContainer>

          <div className="mb-3 flex items-center justify-between sm:mb-6">
            <Link
              href="/admin/notifications"
              className="rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6]"
            >
              <>
                <span className="sm:hidden">←</span>
                <span className="hidden sm:inline">← Back to Notifications</span>
              </>
            </Link>
          </div>

          <div className="rounded-3xl border border-[#3A5D49] bg-white p-5 shadow-md sm:p-8">
            <div className="mb-6">
              <h1 className="text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
                Sent Notifications
              </h1>

              <p className="mt-2 text-[15px] font-light text-[#2F5A43]">
                View all notifications that have been sent.
              </p>
            </div>

            <AllNotifications />
          </div>
        </DashboardContainer>
      </main>
    </RequireAdmin>
  )
}