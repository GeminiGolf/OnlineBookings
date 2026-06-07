"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabaseClient"

export default function SignupPage() {
  const supabase = createClient()

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  async function handleSignup() {
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

    alert("Account created successfully! Please check your email to verify your account, then log in.")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-4xl font-bold text-black">Client Signup</h1>

        <p className="mb-6 text-gray-600">Create your account to book lessons.</p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border p-4 text-lg text-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border p-4 text-lg text-black"
          />

          <button
            onClick={handleSignup}
            className="w-full rounded-xl bg-green-600 p-4 text-xl font-bold text-white transition hover:bg-green-700"
          >
            Create Client Account
          </button>

          <p className="text-center text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-blue-500 hover:text-blue-400">
              Login here
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
