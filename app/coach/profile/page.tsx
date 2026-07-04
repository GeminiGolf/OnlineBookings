"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

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
    return (
      <main className="min-h-screen bg-gray-100 p-4 text-black">
        Loading...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      <div className="mx-auto max-w-5xl p-4 lg:p-8">
        <div className="mb-4">
          <h1 className="text-[24px] lg:text-[24px] font-bold">
            My Profile
          </h1>

          <Link
            href="/coach/changepassword"
            className="mt-0 inline-block text-black underline decoration-blue-600 decoration-2 underline-offset-2"
          >
            Change Password
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-[20px] lg:text-[20px] font-bold">
              Client Summary
            </h2>

            <div className="space-y-4">
              <div>
                <p className="font-semibold">
                  Total Clients
                </p>

                <p className="text-xl font-bold">
                  {totalClients}
                </p>
              </div>

              <div>
                <p className="font-semibold">
                  Active Clients
                </p>

                <p className="text-xl font-bold">
                  {totalActiveClients}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-[20px] lg:text-[20px] font-bold">
              Lesson Defaults
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-black">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 text-left">
                      Package
                    </th>

                    <th className="p-3 text-left">
                      Price
                    </th>

                    <th className="p-3 text-left">
                      Expiration
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b">
                    <td className="p-3">
                      PPV
                    </td>

                    <td className="p-3">
                      RM {coach?.ppv_price ?? 0}
                    </td>

                    <td className="p-3">
                      {coach?.ppv_expiry_months ?? 0} months
                    </td>
                  </tr>

                  <tr className="border-b">
                    <td className="p-3">
                      5 Lessons
                    </td>

                    <td className="p-3">
                      RM {coach?.package_5_price ?? 0}
                    </td>

                    <td className="p-3">
                      {coach?.package_5_expiry_months ?? 0} months
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3">
                      10 Lessons
                    </td>

                    <td className="p-3">
                      RM {coach?.package_10_price ?? 0}
                    </td>

                    <td className="p-3">
                      {coach?.package_10_expiry_months ?? 0} months
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-[20px] lg:text-[20px] font-bold">
            Specializations
          </h2>

          <p>
            {coach?.specializations || "None added"}
          </p>
        </div>
      </div>
    </main>
  )
}