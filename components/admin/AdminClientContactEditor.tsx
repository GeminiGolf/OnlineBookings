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
        <div className="mb-1 flex items-center gap-2">
          <p className="dashboard-label">
            Phone
          </p>

          <button
            onClick={() =>
              setEditingPhone(true)
            }
            type="button"
            className="text-[#2F5A43] transition hover:text-[#55725F]"
          >
            <Pencil size={14} />
          </button>
        </div>

        {!editingPhone ? (
          <p className="dashboard-value">
            {phone || "Not Provided"}
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
            />

            <button
              onClick={savePhone}
              disabled={saving}
              className="rounded-xl bg-[#2F5A43] px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634]"
            >
              Save
            </button>

            <button
              onClick={() =>
                setEditingPhone(false)
              }
              className="rounded-xl border border-[#9D3E3E] bg-white px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#9D3E3E] transition hover:bg-[#FDF4F4]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-center gap-2">
          <p className="dashboard-label">
            Email
          </p>

          <button
            onClick={() =>
              setEditingEmail(true)
            }
            type="button"
            className="text-[#2F5A43] transition hover:text-[#55725F]"
          >
            <Pencil size={14} />
          </button>
        </div>

        {!editingEmail ? (
          <p className="dashboard-value">
            {email || "Not Provided"}
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
            />

            <button
              onClick={saveEmail}
              disabled={saving}
              className="rounded-xl bg-[#2F5A43] px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634]"
            >
              Save
            </button>

            <button
              onClick={() =>
                setEditingEmail(false)
              }
              className="rounded-xl border border-[#9D3E3E] bg-white px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#9D3E3E] transition hover:bg-[#FDF4F4]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  )
}