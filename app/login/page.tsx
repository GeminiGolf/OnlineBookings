"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {


  const router =
    useRouter()

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  async function handleLogin() {

    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {

      alert(
        "Invalid email or password."
      )

      return
    }

    const user =
      data.user

    if (!user) {

      alert(
        "No user found."
      )

      return
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {

      alert(
        "Could not load profile."
      )

      return
    }

    if (!profile) {

      alert(
        "Account exists but no profile was found."
      )

      return
    }

    if (profile.role === "admin") {

      router.push(
        "/admin"
      )

    } else if (profile.role === "coach") {

      router.push(
        "/coach/dashboard"
      )

    } else {

      router.push(
        "/client/dashboard"
      )
    }
  }

  return (

    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-10">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-4xl font-bold text-black">
          Login
        </h1>

        <p className="mb-6 text-gray-600">
          Sign into your account.
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-xl border p-4 text-lg"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-xl border p-4 text-lg"
          />

          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-blue-600 p-4 text-xl font-bold text-white transition hover:bg-blue-700"
          >

            Login

          </button>

          <p className="text-center text-gray-500">

            Not a client yet?{" "}

            <a
              href="/signup"
              className="font-semibold text-blue-500 hover:text-blue-400"
            >
              Sign up here
            </a>

          </p>

        </div>

      </div>

    </main>
  )
}