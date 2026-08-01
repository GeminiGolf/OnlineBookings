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
    <main className="flex min-h-screen -translate-y-6 items-center justify-center bg-[#F2EEE8] px-6 py-10 sm:translate-y-0 sm:p-10">
       <div className="w-full max-w-md rounded-3xl border border-[#3A5D49] bg-[#F2ECE3] p-8 shadow-md">
        <h1 className="mb-2 text-center text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
          Login
        </h1>

        <p className="mb-6 text-center text-[15px] font-light tracking-[0.08em] text-[#2F5A43]">
          Welcome Back
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-5 py-3 text-[15px] font-light text-[#1F3327] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-5 py-3 text-[15px] font-light text-[#1F3327] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
          />

          <div className="flex flex-wrap justify-center gap-4">
            <label className="flex items-center gap-3 text-[13px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
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
                className="font-light text-[#5874A6] underline decoration-[#5874A6] underline-offset-2 transition hover:text-[#45628F]"
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