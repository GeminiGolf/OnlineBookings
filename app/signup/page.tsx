"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function SignupPage() {
  const [preferredName, setPreferredName] = useState("")
  const [givenName, setGivenName] = useState("")
  const [familyName, setFamilyName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleSignup() {
    if (!preferredName.trim() && !givenName.trim() && !familyName.trim()) {
      alert("Please fill in your name")
      return
    }

    if (!preferredName.trim() && !givenName.trim()) {
      alert("Please fill in either a preferred name or given name")
      return
    }

    if (!familyName.trim()) {
      alert("Please fill in your surname/family name")
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match")
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/login",
      },
    })

    if (error) {
      alert(error.message)
      return
    }

    const user = data.user

    if (!user) {
      alert("User creation failed")
      return
    }

    const displayName =
      preferredName.trim() ||
      `${givenName.trim()} ${familyName.trim()}`

    await supabase
      .from("clients")
      .update({
        name: `${givenName.trim()} ${familyName.trim()}`,
        preferred_name: preferredName.trim() || null,
      })
      .eq("profile_id", user.id)

    alert(
      "Account created successfully! Please check your email to verify your account, then log in."
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-4xl font-bold text-black">
          Client Signup
        </h1>

        <p className="mb-6 text-gray-600">
          Create your account to book lessons.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Preferred Name (Optional)"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            className="w-full rounded-xl border p-4 text-lg text-black"
          />

          <input
            type="text"
            placeholder="Given Name"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
            className="w-full rounded-xl border p-4 text-lg text-black"
          />

          <input
            type="text"
            placeholder="Family Name"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="w-full rounded-xl border p-4 text-lg text-black"
          />

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

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border p-4 text-lg text-black"
          />

          <label className="flex items-center gap-2 text-black">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show Password
          </label>

          <button
            onClick={handleSignup}
            className="w-full rounded-xl bg-green-600 p-4 text-xl font-bold text-white transition hover:bg-green-700"
          >
            Create Client Account
          </button>

          <p className="text-center text-gray-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-blue-500 hover:text-blue-400"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}