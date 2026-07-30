"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [preferredName, setPreferredName] = useState("")
  const [givenName, setGivenName] = useState("")
  const [familyName, setFamilyName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [coaches, setCoaches] = useState<
    { id: number; name: string; preferred_name: string | null }[]
  >([])
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadCoaches() {
      const { data } = await supabase
        .from("coaches")
        .select("id, name, preferred_name")
        .order("name")

      if (data) {
        setCoaches(data.filter((coach) => coach.id !== 3 && coach.id !== 8))
      }
    }

    loadCoaches()
  }, [])

  async function handleSignup() {
    if (!selectedCoach) {
      alert("Please choose a coach")
      return
    }
    if (!givenName.trim()) {
      alert("Please fill in your given name")
      return
    }
    if (!familyName.trim()) {
      alert("Please fill in your family name")
      return
    }

    const invalidNames = ["~", "-", ".", "n/a", "na", "test"]
    if (
      invalidNames.includes(givenName.trim().toLowerCase()) ||
      invalidNames.includes(familyName.trim().toLowerCase())
    ) {
      alert("Please enter a valid given name and family name")
      return
    }
    if (!phone.trim()) {
      alert("Please fill in your phone number")
      return
    }

    if (!email.trim()) {
      alert("Please fill in your email address")
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
        data: {
          given_name: givenName.trim(),
          family_name: familyName.trim(),
          preferred_name: preferredName.trim() || null,
          phone: phone.trim(),
          primary_coach_id: selectedCoach,
        },
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) {
        alert("Existing account found with this email. Please log in instead.")
        router.push("/login")
        return
      }
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
    <main className="flex min-h-screen items-start justify-center bg-gray-100 px-6 pt-10 sm:items-center sm:p-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg sm:p-8">
        <h1 className="mb-2 text-3xl font-light uppercase tracking-[0.12em] text-black">
          Client Signup
        </h1>

        <p className="mb-6 text-sm uppercase tracking-[0.15em] text-gray-500">
          CREATE YOUR ACCOUNT
        </p>

        <div className="space-y-3">
          <select
            value={selectedCoach ?? ""}
            onChange={(e) =>
              setSelectedCoach(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-base font-light tracking-[0.08em] text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
          >
            <option value="">Choose Coach *</option>

            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.preferred_name || coach.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Preferred Name (Optional)"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-base font-light tracking-[0.08em] text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
          />

          <input
            type="text"
            placeholder="Given Name *"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-base font-light tracking-[0.08em] text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
          />

          <input
            type="text"
            placeholder="Family Name *"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-base font-light tracking-[0.08em] text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
          />

          <input
            type="tel"
            placeholder="Phone Number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-base font-light tracking-[0.08em] text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
          />

          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-base font-light tracking-[0.08em] text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-base font-light tracking-[0.08em] text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-base font-light tracking-[0.08em] text-black placeholder:text-gray-500 focus:border-black focus:outline-none"
          />

          <label className="flex items-center gap-3 text-sm font-light uppercase tracking-[0.12em] text-gray-700">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show Password
          </label>

          <button
            onClick={handleSignup}
            className="mx-auto block w-64 rounded-xl bg-emerald-900 px-6 py-3 text-sm font-light uppercase tracking-[0.18em] text-white transition hover:bg-emerald-800"
          >
            Create Account
          </button>

          <p className="text-center text-xs font-light uppercase tracking-[0.15em] text-gray-500">
            Already a client?{" "}
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
