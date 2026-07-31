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
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-black shadow">
      <h1 className="mb-6 text-[18px] font-light uppercase tracking-[0.12em] text-black">
        Change Password
      </h1>

      <form onSubmit={handleChangePassword} className="space-y-5">
        <div>
          <label className="dashboard-label mb-2 block">
            Current Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
            autoComplete="current-password"
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
            className="w-full rounded-lg border p-3"
            autoComplete="new-password"
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
            className="dashboard-value cursor-pointer select-none text-[13px]"
          >
            Show passwords
          </label>
        </div>

        <div className="flex items-center gap-3">
					<input
						id="logout-other-devices"
						type="checkbox"
						checked={logoutOtherDevices}
						onChange={(e) => setLogoutOtherDevices(e.target.checked)}
						className="h-4 w-4"
					/>

					<label
            htmlFor="logout-other-devices"
            className="dashboard-value cursor-pointer select-none text-[13px]"
          >
            Log out of other devices
          </label>
				</div>
        <button
          type="submit"
          disabled={loading}
          className="mx-auto block w-4/5 rounded-xl bg-[#3C6A50] p-3 text-[13px] font-light tracking-[0.06em] text-white transition hover:bg-[#4A7D61] sm:w-64"
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  )
}