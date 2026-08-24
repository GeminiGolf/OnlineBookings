"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) return

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    })
    if (error) {
      alert("Something went wrong. Please try again later.")
      return
    }

    setSuccessMessage(
      `If an account exists for ${email}, the reset link has been sent.`
    )
  }

  return (
    <main className="flex min-h-screen -translate-y-6 items-center justify-center bg-[#F2EEE8] px-6 py-10 sm:translate-y-0">
      <div className="w-full max-w-md rounded-3xl border border-[#3A5D49] bg-[#F2ECE3] p-6 shadow-sm sm:p-8">
        <h1 className="mb-2 text-center text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
          Forgot Password?
        </h1>

        <p className="mb-8 text-center text-[12px] font-light tracking-[0.08em] text-[#2F5A43]">
          Enter your email address and we'll send you a password reset link if an account exists.
        </p>

        {successMessage && (
          <div className="mb-5 rounded-xl border border-[#3A5D49] bg-[#F6FAF6] p-4 text-center text-[14px] font-light text-[#2F5A43]">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label className="dashboard-label mb-2 block">
              Email Address
            </label>

            <input
              type="email"
              disabled={!!successMessage}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-5 py-3 text-[14px] font-light tracking-[0.08em] text-[#2F5A43] placeholder:text-[#6D7F72] placeholder:tracking-[0.08em] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!!successMessage}
            className="mx-auto block w-56 rounded-xl border border-[#3A5D49] bg-[#2F5A43] px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#244634] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {successMessage ? "Reset Link Sent" : "Send Reset Link"}
          </button>
        </form>
      </div>
    </main>
  )
}