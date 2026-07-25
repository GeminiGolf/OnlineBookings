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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-black shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Create Client
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-1">
          <div>
            <label className="mb-1 block text-sm">
              Preferred Name
            </label>

            <input
              value={preferredName}
              onChange={(e) =>
                setPreferredName(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Given Name *
            </label>

            <input
              value={firstName}
              onChange={(e) =>
                setFirstName(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Family Name *
            </label>

            <input
              value={lastName}
              onChange={(e) =>
                setLastName(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Phone
            </label>

            <input
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Email *
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Password *
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="8 characters minimum"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={createClient}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-black py-3 font-medium text-white disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Client"}
        </button>
      </div>
    </div>
  )
}