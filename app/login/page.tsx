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

  async function handleForgotPassword() {
    const emailAddress = prompt("Enter your email address:")
    if (!emailAddress) {
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailAddress, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      alert(error.message)
      return
    }
    alert("Password reset email sent.")
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-gray-100 px-4 pt-10 sm:items-center sm:p-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-black sm:text-4xl">Login</h1>
        <p className="mb-6 text-gray-600">Sign into your account.</p>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border p-4 text-lg text-black"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border p-4 text-lg text-black"
          />

          <label className="flex items-center gap-2 text-black">
            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
            Show Password
          </label>

          <button
            onClick={handleLogin}
            className="mx-auto block w-4/5 rounded-xl bg-blue-600 p-3 text-[16px] font-bold text-white transition hover:bg-blue-700 sm:w-64 sm:text-lg"
          >
            Login
          </button>

          <div className="space-y-2 text-center">
            <button type="button" onClick={handleForgotPassword} className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </button>

            <p className="text-gray-500">
              Not a client yet?{" "}
              <a href="/signup" className="font-semibold text-blue-500 hover:text-blue-400">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
