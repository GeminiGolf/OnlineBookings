"use client"

import { useState } from "react"

type Props = {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

export default function AddClient({
  open,
  onClose,
  onCreated,
}: Props) {
  const [preferredName, setPreferredName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [saving, setSaving] = useState(false)

  if (!open) return null

  async function createClient() {
    if (!firstName.trim()) {
      alert("Given Name is required.")
      return
    }

    if (!lastName.trim()) {
      alert("Family Name is required.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email.trim())) {
      alert("Email is invalid.")
      return
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters.")
      return
    }

    setSaving(true)

    const response = await fetch(
      "/api/coach/clients/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferredName,
          firstName,
          lastName,
          phone,
          email,
          password,
        }),
      }
    )

    const result = await response.json()

    setSaving(false)

    if (!response.ok) {
      console.error(result)

      alert(
        result.error_description ??
        result.error ??
        result.message ??
        "Unable to create client."
      )

      return
    }

    alert("Client created successfully.")

    setPreferredName("")
    setFirstName("")
    setLastName("")
    setPhone("")
    setEmail("")
    setPassword("")

    onCreated?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#3A5D49] bg-[#F2ECE3] p-6 text-black shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[18px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
            Create Client
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
              Given Name *
            </label>

            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[16px] font-light tracking-[0.04em] text-[#2F5A43] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-light uppercase tracking-[0.08em] text-[#2F5A43]">
              Family Name *
            </label>

            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
              Password *
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 characters minimum"
              className="w-full rounded-xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[16px] font-light tracking-[0.04em] text-[#2F5A43] placeholder:text-[#6D7F72] focus:border-[#2F5A43] focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={createClient}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-[#21402E] px-6 py-3 text-sm font-light uppercase tracking-[0.18em] text-white transition hover:bg-[#2B533B] disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Client"}
        </button>
      </div>
    </div>
  )
}