"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function ResetPasswordPage() {
  const router = useRouter()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-black shadow">
        <h1 className="mb-6 text-2xl font-bold">
          Reset Password
        </h1>

        {success && (
          <div className="mb-6 rounded-lg bg-green-100 p-3 text-green-700">
            ✓ Password reset successfully.
            <br />
            Redirecting to login...
          </div>
        )}
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="mb-2 block font-semibold">
              New Password
            </label>

            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border p-3"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Confirm New Password
            </label>

            <input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border p-3"
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="show-passwords"
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="h-4 w-4"
            />

            <label
              htmlFor="show-passwords"
              className="cursor-pointer select-none"
            >
              Show passwords
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mx-auto block w-4/5 rounded-xl bg-blue-600 p-3 text-[16px] font-bold text-white transition hover:bg-blue-700 sm:w-64 sm:text-lg"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  )
}