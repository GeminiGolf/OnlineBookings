"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  coachId: number
  profileId: string
  initialPhone: string | null
  initialEmail: string | null
}

export default function AdminCoachContactEditor({
  coachId,
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
      .from("coaches")
      .update({
        phone:
          phone.trim() === ""
            ? null
            : phone.trim(),
      })
      .eq("id", coachId)

    setSaving(false)
    setEditingPhone(false)
  }

  async function saveEmail() {
    setSaving(true)

    // Update coaches table directly so coach.email changes immediately
    const { error: coachErr } = await supabase
      .from("coaches")
      .update({
        email: email.trim() === "" ? null : email.trim(),
      })
      .eq("id", coachId)

    if (coachErr) {
      alert(coachErr.message)
      setSaving(false)
      return
    }

    // Keep auth/profile updated via API if applicable
    const response = await fetch(
      "/api/admin/coach/update-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          email: email.trim() === "" ? null : email.trim(),
        }),
      }
    )

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
            type="button"
            onClick={() =>
              setEditingPhone(true)
            }
            className="text-[#2F5A43] hover:opacity-80 transition"
          >
            <Pencil size={14} />
          </button>
        </div>

        {!editingPhone ? (
          <p className="dashboard-value">
            {phone || "Not provided"}
          </p>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <input
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="rounded-xl border border-[#3A5D49] bg-white px-3 py-1.5 text-black outline-none focus:ring-1 focus:ring-[#3A5D49]"
            />

            <button
              onClick={savePhone}
              disabled={saving}
              className="rounded-xl border border-[#3A5D49] bg-[#3A5D49] px-4 py-1.5 text-sm font-light text-white transition hover:bg-[#2F5A43] disabled:opacity-50"
            >
              Save
            </button>

            <button
              onClick={() =>
                setEditingPhone(false)
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-1.5 text-sm font-light text-gray-700 transition hover:bg-gray-50"
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
            type="button"
            onClick={() =>
              setEditingEmail(true)
            }
            className="text-[#2F5A43] hover:opacity-80 transition"
          >
            <Pencil size={14} />
          </button>
        </div>

        {!editingEmail ? (
          <p className="dashboard-value">
            {email || "Not provided"}
          </p>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <input
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="rounded-xl border border-[#3A5D49] bg-white px-3 py-1.5 text-black outline-none focus:ring-1 focus:ring-[#3A5D49]"
            />

            <button
              onClick={saveEmail}
              disabled={saving}
              className="rounded-xl border border-[#3A5D49] bg-[#3A5D49] px-4 py-1.5 text-sm font-light text-white transition hover:bg-[#2F5A43] disabled:opacity-50"
            >
              Save
            </button>

            <button
              onClick={() =>
                setEditingEmail(false)
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-1.5 text-sm font-light text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  )
}