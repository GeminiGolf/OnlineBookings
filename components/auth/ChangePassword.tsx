"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please complete all fields.")
      return
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.")
      return
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.")
      return
    }

    setLoading(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user || !user.email) {
      alert("Unable to verify your account.")
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      alert("Current password is incorrect.")
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      alert(updateError.message)
      setLoading(false)
      return
    }

    alert("Password changed successfully.")

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")

    setLoading(false)
  }

  return (
    <div className="rounded-3xl border border-[#3A5D49] bg-[#F2ECE3] p-6 shadow-sm sm:p-8">
      <h1 className="mb-2 text-center text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
        Change Password
      </h1>

      <p className="mb-5 text-center text-[15px] font-light tracking-[0.08em] text-[#2F5A43]">
        Update your password to keep your account secure.
      </p>

      <form onSubmit={handleChangePassword} className="space-y-3">
        <div>
          <label className="dashboard-label mb-2 block">
            Current Password
          </label>

          <input
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-xl border border-[#55725F] bg-white px-5 py-2.5 text-[14px] font-light tracking-[0.08em] text-[#2F5A43] placeholder:text-[#7B867D] placeholder:tracking-[0.08em] focus:border-[#2F5A43] focus:outline-none"
          />
        </div>

        <div>
          <label className="dashboard-label mb-2 block">
            New Password
          </label>

          <input
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-xl border border-[#55725F] bg-white px-5 py-2.5 text-[14px] font-light tracking-[0.08em] text-[#2F5A43] placeholder:text-[#7B867D] placeholder:tracking-[0.08em] focus:border-[#2F5A43] focus:outline-none"
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
            className="w-full rounded-xl border border-[#55725F] bg-white px-5 py-2.5 text-[14px] font-light tracking-[0.08em] text-[#2F5A43] placeholder:text-[#7B867D] placeholder:tracking-[0.08em] focus:border-[#2F5A43] focus:outline-none"
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

        <label className="flex items-center gap-2 text-[13px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
          <input
            type="checkbox"
            checked={logoutOtherDevices}
            onChange={(e) => setLogoutOtherDevices(e.target.checked)}
          />
          Log out of other devices
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mx-auto mt-4 block w-56 rounded-xl border border-[#3A5D49] bg-[#2F5A43] px-5 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#244634]"
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  )
}