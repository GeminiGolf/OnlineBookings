"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) {
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-black shadow">
        <h1 className="mb-2 text-2xl font-bold">Forgot Password</h1>

        <p className="mb-6 text-sm text-gray-600">
          Enter your email address and we'll send you a password reset link if
          an account exists.
        </p>

        {successMessage && (
          <div className="mb-6 rounded-lg bg-green-100 p-3 text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-5">
          <div>
            <label className="mb-2 block font-semibold">
              Email Address
            </label>

            <input
              type="email"
              disabled={!!successMessage}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border p-3"
              autoComplete="email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!!successMessage}
            className="mx-auto block w-4/5 rounded-xl bg-blue-600 p-3 text-[16px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-64 sm:text-lg"
          >
            {successMessage ? "Reset Link Sent" : "Send Reset Link"}
          </button>
        </form>
      </div>
    </main>
  )
}