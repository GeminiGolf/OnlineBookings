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
      <h1 className="mb-6 text-2xl font-bold">Change Password</h1>

      <form onSubmit={handleChangePassword} className="space-y-5">
        <div>
          <label className="mb-2 block font-semibold">
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
						className="cursor-pointer select-none"
					>
						Log out of other devices
					</label>
				</div>
        <button
          type="submit"
          disabled={loading}
          className="mx-auto block w-4/5 rounded-xl bg-blue-600 p-3 text-[16px] font-bold text-white transition hover:bg-blue-700 sm:w-64 sm:text-lg"
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  )
}