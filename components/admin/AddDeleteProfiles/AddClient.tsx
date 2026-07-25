"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  open: boolean
  onClose: () => void
}

export default function AddClient({
  open,
  onClose,
}: Props) {
  if (!open) return null

  const [preferredName, setPreferredName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [primaryCoachId, setPrimaryCoachId] = useState("")
  const [password, setPassword] = useState("")

  const [coaches, setCoaches] = useState<
    {
      id: number
      name: string
      preferred_name: string | null
    }[]
  >([])

  useEffect(() => {
    loadCoaches()
  }, [])

  async function loadCoaches() {
    const { data } = await supabase
      .from("coaches")
      .select("id, name, preferred_name")
      .order("name")

    setCoaches(data || [])
  }

  async function createClient() {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !primaryCoachId ||
      !password
    ) {
      alert("Please complete all required fields.")
      return
    }

    const response = await fetch("/api/admin/create/create-client", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preferredName,
        firstName,
        lastName,
        email,
        phone,
        primaryCoachId,
        password,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(result.error)
      return
    }

    alert("Client created successfully.")
    window.location.reload()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-black shadow-xl">
        <div className="mb-1 flex justify-end">
          <button
            onClick={onClose}
            className="rounded border px-3 py-1 text-lg hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="space-y-1">
          <div>
            <label className="mb-1 block font-medium">
              Preferred Name
            </label>
            <input
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              First Name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Last Name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Primary Coach
            </label>
            <select
              value={primaryCoachId}
              onChange={(e) => setPrimaryCoachId(e.target.value)}
              className="w-full rounded border p-3"
            >
              <option value="">Select Coach</option>

              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.preferred_name || coach.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border p-3"
            />
          </div>

          <button
            onClick={createClient}
            className="mt-2 w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
          >
            Create Client Profile
          </button>
        </div>
      </div>
    </div>
  )
}