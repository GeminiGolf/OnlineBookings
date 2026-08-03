"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import RequireAdmin from "@/components/auth/RequireAdmin"
import DashboardContainer from "@/components/layout/DashboardContainer"
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
      <main className="min-h-screen bg-[#F2EEE8] p-4 sm:p-10">
        <DashboardContainer>
          <div className="mx-auto mt-10 max-w-5xl lg:mt-12">
            <div className="mb-3 text-center sm:mb-8 sm:text-left">
              <h1 className="whitespace-nowrap text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-[#2F5A43]">
                Manage Gemini Golf Academy.
              </p>
            </div>

            <div className="mt-3 grid gap-4 md:mt-5 md:grid-cols-2">
              <Link
                href="/admin/notifications"
                className="rounded-3xl border border-[#3A5D49] bg-white p-5 sm:p-8 shadow-md transition hover:bg-[#F6FAF6]"
              >
                <h2 className="text-[20px] font-light tracking-[0.06em] text-[#2F5A43]">
                  Notifications ({totalNotifications})

                  {urgentNotifications > 0 && (
                    <span className="ml-2 text-red-600">
                      [{urgentNotifications} Urgent]
                    </span>
                  )}
                </h2>

                <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-[#2F5A43]">
                  View unread notifications.
                </p>
              </Link>

              <Link
                href="/admin/profiles"
                className="rounded-3xl border border-[#3A5D49] bg-white p-5 sm:p-8 shadow-md transition hover:bg-[#F6FAF6]"
              >
                <h2 className="text-[20px] font-light tracking-[0.06em] text-[#2F5A43]">
                  Profiles
                </h2>

                <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-[#2F5A43]">
                  View and manage user accounts.
                </p>
              </Link>


              <Link
                href="/admin/packages"
                className="rounded-3xl border border-[#3A5D49] bg-white p-5 sm:p-8 shadow-md transition hover:bg-[#F6FAF6]"
              >
                <h2 className="text-[20px] font-light tracking-[0.06em] text-[#2F5A43]">
                  Client Packages
                </h2>

                <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-[#2F5A43]">
                  View all client packages.
                </p>
              </Link>

              <Link
                href="/admin/bookings"
                className="rounded-3xl border border-[#3A5D49] bg-white p-5 sm:p-8 shadow-md transition hover:bg-[#F6FAF6]"
              >
                <h2 className="text-[20px] font-light tracking-[0.06em] text-[#2F5A43]">
                  All Bookings
                </h2>

                <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-[#2F5A43]">
                  View every lesson booking.
                </p>
              </Link>

              <Link
                href="/admin/transactions"
                className="rounded-3xl border border-[#3A5D49] bg-white p-5 sm:p-8 shadow-md transition hover:bg-[#F6FAF6]"
              >
                <h2 className="text-[20px] font-light tracking-[0.06em] text-[#2F5A43]">
                  Transactions
                </h2>

                <p className="mt-2 text-[15px] font-light tracking-[0.02em] text-[#2F5A43]">
                  View all transactions.
                </p>
              </Link>
            </div>
          </div>
        </DashboardContainer>
      </main>
  </RequireAdmin>
  )
}