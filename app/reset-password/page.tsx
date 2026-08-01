"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function ResetPasswordPage() {
  const router = useRouter()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const access_token = params.get("access_token")
    const refresh_token = params.get("refresh_token")

    if (!access_token || !refresh_token) return

    supabase.auth.setSession({
      access_token,
      refresh_token,
    })
  }, [])

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      alert("Please complete all fields.")
      return
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.")
      return
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setSuccess(true)

    setTimeout(async () => {
      await supabase.auth.signOut()
      router.push("/login")
    }, 2500)
  }

  return (
    <main className="flex min-h-screen -translate-y-6 items-center justify-center bg-[#F2EEE8] px-6 py-10 sm:translate-y-0">
      <div className="w-full max-w-md rounded-3xl border border-[#3A5D49] bg-[#F2ECE3] p-6 shadow-md sm:p-8">
        <h1 className="mb-0 text-center text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
          Reset Password
        </h1>

        <p className="mb-5 text-center text-[14px] font-light tracking-[0.08em] text-[#2F5A43]">
          Choose a new password
        </p>

        {success && (
          <div className="mb-5 rounded-xl border border-[#3A5D49] bg-[#F6FAF6] p-4 text-center text-[14px] font-light text-[#2F5A43]">
            ✓ Password reset successfully.
            <br />
            Redirecting to login...
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-3">
          <div>
            <label className="dashboard-label mb-2 block">
              New Password
            </label>

            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-5 py-3 text-[14px] font-light tracking-[0.08em] text-[#2F5A43] placeholder:text-[#6D7F72] placeholder:tracking-[0.08em] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <div>
            <label className="dashboard-label mb-2 block">
              Confirm New Password
            </label>

            <input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-5 py-3 text-[14px] font-light tracking-[0.08em] text-[#2F5A43] placeholder:text-[#6D7F72] placeholder:tracking-[0.08em] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-[13px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
            />
            Show Password
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mx-auto block w-56 rounded-xl border border-[#3A5D49] bg-[#2F5A43] px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#244634]"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  )
}