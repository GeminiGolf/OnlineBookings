"use client"

import Link from "next/link"

import {
  useEffect,
  useState,
} from "react"

import { createClient }
  from "../lib/supabaseClient"

const supabase =
  createClient()

export default function Navbar() {

  const [
    loggedIn,
    setLoggedIn,
  ] = useState(false)

  const [
    isCoach,
    setIsCoach,
  ] = useState(false)

  useEffect(() => {

    checkSession()

  }, [])

  async function checkSession() {

    const {
      data: { session },
    } = await supabase
      .auth
      .getSession()

    setLoggedIn(
      !!session
    )

    if (!session) return

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("role")
        .eq(
          "id",
          session.user.id
        )
        .single()

    if (
      profile?.role ===
      "coach"
    ) {
      setIsCoach(true)
    }
  }

  async function handleLogout() {

    await supabase.auth.signOut()

    window.location.href =
      "/login"
  }

  return (

    <nav className="flex items-center justify-between border-b border-gray-800 bg-black px-8 py-5">

      <Link
        href="/"
        className="text-xl font-bold"
      >
        Home
      </Link>

      <div className="flex gap-6">

        {loggedIn ? (

          isCoach ? (

            <>

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
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="text-lg transition hover:text-red-400"
              >
                Logout
              </button>

            </>

          ) : (

            <>

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

          )

        ) : (

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

      </div>

    </nav>
  )
}