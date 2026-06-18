"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  coachId: number
  initialPhone: string | null
  initialEmail: string | null
}

export default function AdminCoachContactEditor({
  coachId,
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

    await supabase
      .from("coaches")
      .update({
        email:
          email.trim() === ""
            ? null
            : email.trim(),
      })
      .eq("id", coachId)

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
          >
            <Pencil size={14} />
          </button>
        </div>

        {!editingPhone ? (
          <p>
            {phone || "Not provided"}
          </p>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <input
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
            type="button"
            onClick={() =>
              setEditingEmail(true)
            }
          >
            <Pencil size={14} />
          </button>
        </div>

        {!editingEmail ? (
          <p>
            {email || "Not provided"}
          </p>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <input
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