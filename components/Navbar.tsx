"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

console.log("NAVBAR RENDER")
export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(true)

  const [urgentCount, setUrgentCount] = useState(0)
  const [normalCount, setNormalCount] = useState(0)

  useEffect(() => {
    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkSession()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function checkSession() {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    setLoggedIn(!!session)

    if (!session) {
      setRole("")
      setUrgentCount(0)
      setNormalCount(0)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    const currentRole = profile?.role || ""

    setRole(currentRole)

    if (currentRole === "coach") {
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("profile_id", session.user.id)
        .single()

      if (coach) {
        const { data: notifications } = await supabase
          .from("notifications")
          .select("is_urgent")
          .eq("coach_id", coach.id)
          .eq("is_read", false)

        setUrgentCount(
          notifications?.filter(
            (n) => n.is_urgent
          ).length || 0
        )

        setNormalCount(
          notifications?.filter(
            (n) => !n.is_urgent
          ).length || 0
        )
      }
    }

    if (currentRole === "admin") {
      const { data: notifications } = await supabase
        .from("notifications")
        .select("is_urgent")
        .eq("is_read", false)

      setUrgentCount(
        notifications?.filter(
          (n) => n.is_urgent
        ).length || 0
      )

      setNormalCount(
        notifications?.filter(
          (n) => !n.is_urgent
        ).length || 0
      )
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <nav className="flex items-center justify-between border-b border-gray-800 bg-black px-8 py-5 text-white">
      <Link href="/" className="text-xl font-bold">
        Home
      </Link>

      <div className="flex gap-6">
        {!loading && (
          <>
            {loggedIn && role === "coach" && (
              <>
                <Link
                  href="/notifications"
                  className={`text-lg transition ${
                    urgentCount > 0
                      ? "font-bold text-red-500"
                      : "hover:text-red-400"
                  }`}
                >
                  {urgentCount > 0
                    ? `Urgent (${urgentCount})`
                    : "Urgent"}
                </Link>

                <Link
                  href="/coach/schedule"
                  className="text-lg transition hover:text-yellow-400"
                >
                  Schedule
                </Link>

                <Link
                  href="/coach/dashboard"
                  className="text-lg transition hover:text-green-400"
                >
                  {normalCount > 0
                    ? `Dashboard (${normalCount})`
                    : "Dashboard"}
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-lg transition hover:text-red-400"
                >
                  Logout
                </button>
              </>
            )}

            {loggedIn && role === "admin" && (
              <>
                <Link
                  href="/notifications"
                  className={`text-lg transition ${
                    urgentCount > 0
                      ? "font-bold text-red-500"
                      : "hover:text-red-400"
                  }`}
                >
                  {urgentCount > 0
                    ? `Urgent (${urgentCount})`
                    : "Urgent"}
                </Link>

                <Link
                  href="/book"
                  className="text-lg transition hover:text-yellow-400"
                >
                  Book
                </Link>

                <Link
                  href="/admin"
                  className="text-lg transition hover:text-green-400"
                >
                  {normalCount > 0
                    ? `Dashboard (${normalCount})`
                    : "Dashboard"}
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-lg transition hover:text-red-400"
                >
                  Logout
                </button>
              </>
            )}

            {loggedIn && role === "client" && (
              <>
                <Link
                  href="/notifications"
                  className="text-lg transition hover:text-blue-400"
                >
                  Notifications
                </Link>

                <Link
                  href="/book"
                  className="text-lg transition hover:text-yellow-400"
                >
                  Book
                </Link>

                <Link
                  href="/client/dashboard"
                  className="text-lg transition hover:text-green-400"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-lg transition hover:text-red-400"
                >
                  Logout
                </button>
              </>
            )}

            {!loggedIn && (
              <>
                <Link
                  href="/book"
                  className="text-lg transition hover:text-yellow-400"
                >
                  Book
                </Link>

                <Link
                  href="/login"
                  className="text-lg transition hover:text-blue-400"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="text-lg transition hover:text-green-400"
                >
                  Sign Up
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  )
}