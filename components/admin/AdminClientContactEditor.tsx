"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  clientId: number
  profileId: string
  initialPhone: string | null
  initialEmail: string | null
}

export default function AdminClientContactEditor({
  clientId,
  profileId,
  initialPhone,
  initialEmail,
}: Props) {
  const [phone, setPhone] = useState(
    initialPhone || ""
  )

  const [email, setEmail] = useState(
    initialEmail || ""
  )

  const [editingPhone, setEditingPhone] =
    useState(false)

  const [editingEmail, setEditingEmail] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  async function savePhone() {
    setSaving(true)

    await supabase
      .from("clients")
      .update({
        phone:
          phone.trim() === ""
            ? null
            : phone.trim(),
      })
      .eq("id", clientId)

    setSaving(false)
    setEditingPhone(false)
  }

  async function saveEmail() {
    setSaving(true)

    const response = await fetch("/api/admin/clients/update-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profileId,
        email: email.trim() === "" ? null : email.trim(),
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(result.error)
      setSaving(false)
      return
    }

    setSaving(false)
    setEditingEmail(false)
  }

  return (
    <>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            Phone
          </p>

          <button
            onClick={() =>
              setEditingPhone(true)
            }
            type="button"
          >
            <Pencil size={14} />
          </button>
        </div>

        {!editingPhone ? (
          <p className="text-sm sm:text-base">
            {phone || "Not provided"}
          </p>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="rounded border px-2 py-1"
            />

            <button
              onClick={savePhone}
              disabled={saving}
              className="rounded bg-black px-3 py-1 text-white"
            >
              Save
            </button>

            <button
              onClick={() =>
                setEditingPhone(false)
              }
              className="rounded border px-3 py-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            Email
          </p>

          <button
            onClick={() =>
              setEditingEmail(true)
            }
            type="button"
          >
            <Pencil size={14} />
          </button>
        </div>

        {!editingEmail ? (
          <p className="text-sm sm:text-base">
            {email || "Not provided"}
          </p>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="rounded border px-2 py-1"
            />

            <button
              onClick={saveEmail}
              disabled={saving}
              className="rounded bg-black px-3 py-1 text-white"
            >
              Save
            </button>

            <button
              onClick={() =>
                setEditingEmail(false)
              }
              className="rounded border px-3 py-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  )
}