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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#3A5D49] bg-[#F2ECE3] p-6 text-black shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[18px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
            Create Client Profile
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-[#2F5A43] transition hover:opacity-70"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
              Preferred Name
            </label>
            <input
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[16px] font-light tracking-[0.04em] text-[#2F5A43] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
              First Name *
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[16px] font-light tracking-[0.04em] text-[#2F5A43] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
              Last Name *
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[16px] font-light tracking-[0.04em] text-[#2F5A43] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[16px] font-light tracking-[0.04em] text-[#2F5A43] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[16px] font-light tracking-[0.04em] text-[#2F5A43] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
              Primary Coach *
            </label>
            <select
              value={primaryCoachId}
              onChange={(e) => setPrimaryCoachId(e.target.value)}
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[16px] font-light tracking-[0.04em] text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
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
            <label className="mb-1 block text-[12px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[16px] font-light tracking-[0.04em] text-[#2F5A43] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <button
            onClick={createClient}
            className="mt-6 w-full rounded-xl bg-[#21402E] px-6 py-3 text-sm font-light uppercase tracking-[0.18em] text-white transition hover:bg-[#2B533B]"
          >
            Create Client Profile
          </button>
        </div>
      </div>
    </div>
  )
}