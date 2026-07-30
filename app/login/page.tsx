"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert("Invalid email or password.")
      return
    }

    const user = data.user

    if (!user) {
      alert("No user found.")
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      alert("Could not load profile.")
      return
    }

    if (!profile) {
      alert("Account exists but no profile was found.")
      return
    }

    if (profile.role === "admin") {
      router.push("/admin")
    } else if (profile.role === "coach") {
      router.push("/coach/dashboard")
    } else {
      router.push("/client/dashboard")
    }
  }

  function handleForgotPassword() {
    router.push("/forgot-password")
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-gray-100 px-6 pt-10 sm:items-center sm:p-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-light uppercase tracking-[0.12em] text-black">
         Login
        </h1>

        <p className="mb-6 text-center text-sm uppercase tracking-[0.15em] text-gray-500">
          WELCOME BACK
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-[15px] font-light tracking-[0.08em] text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-[15px] font-light tracking-[0.08em] text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
          />

          <div className="flex flex-wrap justify-center gap-4">
            <label className="flex items-center gap-3 text-sm font-light uppercase tracking-[0.12em] text-gray-700">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show Password
            </label>

          </div>

          <button
            onClick={handleLogin}
            className="mx-auto mt-5 block w-64 rounded-xl bg-[#21402E] px-6 py-3 text-sm font-light uppercase tracking-[0.18em] text-white transition hover:bg-[#2B533B]"
          >
            Login
          </button>

          <div className="space-y-2 text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-light uppercase tracking-[0.15em] text-gray-500 transition hover:text-black"
            >
              Forgot Password?
            </button>

            <p className="text-center text-xs font-light uppercase tracking-[0.15em] text-gray-500">
              NOT A CLIENT YET?{" "}
              <a
                href="/signup"
                className="font-semibold text-blue-500 hover:text-blue-400"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}