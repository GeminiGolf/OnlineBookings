"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import RequireCoach from "@/components/auth/RequireCoach"
import DashboardContainer from "@/components/layout/DashboardContainer"
import LoadingScreen from "@/components/ui/LoadingScreen"

type Coach = {
  id: number
  name: string
  preferred_name: string | null
  ppv_price: number | null
  package_5_price: number | null
  package_10_price: number | null
  ppv_expiry_months: number | null
  package_5_expiry_months: number | null
  package_10_expiry_months: number | null
  complete_points: number | null
  review_points: number | null
  specializations: string | null
}

export default function CoachProfilePage() {
  const [coach, setCoach] = useState<Coach | null>(null)
  const [totalClients, setTotalClients] = useState(0)
  const [totalActiveClients, setTotalActiveClients] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    const { data: coachData } = await supabase
      .from("coaches")
      .select("*")
      .eq("profile_id", session.user.id)
      .single()
    if (!coachData) {
      setLoading(false)
      return
    }

    setCoach(coachData)

    const { data: clients } = await supabase
      .from("clients")
      .select("id")
      .eq("primary_coach_id", coachData.id)
    setTotalClients(clients?.length || 0)

    const { data: completedBookings } = await supabase
      .from("bookings")
      .select("client_id")
      .eq("coach_id", coachData.id)
      .eq("status", "completed")

    const activeClients = new Set(
      (completedBookings || []).map(
        (booking) => booking.client_id
      )
    )
    setTotalActiveClients(activeClients.size)
    setLoading(false)
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <RequireCoach>
      <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#2F5A43]">
        <DashboardContainer>
          <div className="mb-4">
            <h1 className="text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
              My Profile
            </h1>

            <Link
              href="/coach/changepassword"
              className="dashboard-value mt-1 inline-block text-[#5874A6] underline decoration-[#5874A6] underline-offset-2 hover:text-[#45628F]"
            >
              Change Password
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#3A5D49] bg-white p-6 shadow-md">
              <h2 className="mb-4 text-[20px] font-light tracking-[0.02em] text-[#2F5A43]">
                Client Summary
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="dashboard-label">Total Clients</p>

                  <p className="dashboard-value text-[22px]">
                    {totalClients}
                  </p>
                </div>

                <div>
                  <p className="dashboard-label">Active Clients</p>

                  <p className="dashboard-value text-[22px]">
                    {totalActiveClients}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#3A5D49] bg-white p-6 shadow-md">
              <h2 className="mb-4 text-[20px] font-light tracking-[0.02em] text-[#2F5A43]">
                Lesson Defaults
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full overflow-hidden rounded-2xl border border-[#3A5D49] border-separate border-spacing-0">
                  <thead>
                    <tr className="border-b border-[#3A5D49] bg-[#F3F0EA]">
                      <th className="dashboard-label p-4 text-left">
                        Package
                      </th>

                      <th className="dashboard-label p-4 text-left">
                        Price
                      </th>

                      <th className="dashboard-label p-4 text-left">
                        Expiration
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-b border-[#3A5D49] hover:bg-[#F6FAF6]">
                      <td className="dashboard-value p-4">PPV</td>

                      <td className="dashboard-value p-4">
                        RM {coach?.ppv_price ?? 0}
                      </td>

                      <td className="dashboard-value p-4">
                        {coach?.ppv_expiry_months ?? 0} months
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="dashboard-value p-4">5 Lessons</td>

                      <td className="dashboard-value p-4">
                        RM {coach?.package_5_price ?? 0}
                      </td>

                      <td className="dashboard-value p-4">
                        {coach?.package_5_expiry_months ?? 0} months
                      </td>
                    </tr>

                    <tr className="hover:bg-[#F6FAF6]">
                      <td className="dashboard-value p-4">10 Lessons</td>

                      <td className="dashboard-value p-4">
                        RM {coach?.package_10_price ?? 0}
                      </td>

                      <td className="dashboard-value p-4">
                        {coach?.package_10_expiry_months ?? 0} months
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Points Defaults Display Card */}
          <div className="mt-8 rounded-3xl border border-[#3A5D49] bg-white p-6 shadow-md">
            <h2 className="mb-4 text-[20px] font-light tracking-[0.02em] text-[#2F5A43]">
              Points Defaults
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full overflow-hidden rounded-2xl border border-[#3A5D49] border-separate border-spacing-0">
                <thead>
                  <tr className="border-b border-[#3A5D49] bg-[#F3F0EA]">
                    <th className="dashboard-label p-4 text-left">Action</th>
                    <th className="dashboard-label p-4 text-left">Points</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-[#3A5D49] hover:bg-[#F6FAF6]">
                    <td className="dashboard-value p-4">Complete Lesson</td>
                    <td className="dashboard-value p-4">
                      {coach?.complete_points ?? 0} pts
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F6FAF6]">
                    <td className="dashboard-value p-4">Review Lesson</td>
                    <td className="dashboard-value p-4">
                      {coach?.review_points ?? 0} pts
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-[#3A5D49] bg-white p-6 shadow-md">
            <h2 className="mb-4 text-[20px] font-light tracking-[0.02em] text-[#2F5A43]">
              Specializations
            </h2>

            <p className="dashboard-value">
              {coach?.specializations || "None added"}
            </p>
          </div>
        </DashboardContainer>
      </main>
    </RequireCoach>
  )
}