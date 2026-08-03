"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  clientId: number
  initialPreferredName: string | null
  initialFirstName: string | null
  initialLastName: string | null
}

export default function AdminClientNameEditor({
  clientId,
  initialPreferredName,
  initialFirstName,
  initialLastName,
}: Props) {
  const [editing, setEditing] = useState(false)

  const [preferredName, setPreferredName] = useState(
    initialPreferredName ?? ""
  )
  const [firstName, setFirstName] = useState(
    initialFirstName ?? ""
  )
  const [lastName, setLastName] = useState(
    initialLastName ?? ""
  )

  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)

    const { error } = await supabase
      .from("clients")
      .update({
        preferred_name: preferredName,
        first_name: firstName,
        last_name: lastName,
      })
      .eq("id", clientId)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setEditing(false)
  }

  if (!editing) {
    return (
      <div>
        <div className="mb-1 flex items-center gap-2">
          <p className="dashboard-label">
            Name
          </p>

          <button
            onClick={() => setEditing(true)}
            type="button"
            className="text-[#2F5A43] transition hover:text-[#55725F]"
          >
            <Pencil size={14} />
          </button>
        </div>

        <p className="dashboard-value">
          {preferredName
            ? `(${preferredName}) ${firstName} ${lastName}`
            : `${firstName} ${lastName}`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#3A5D49] bg-white p-5 shadow-sm">
      <div>
        <label className="dashboard-label mb-2 block">
          Preferred Name
        </label>

        <input
          value={preferredName}
          onChange={(e) =>
            setPreferredName(e.target.value)
          }
          className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
        />
      </div>

      <div>
        <label className="dashboard-label mb-2 block">
          First Name
        </label>

        <input
          value={firstName}
          onChange={(e) =>
            setFirstName(e.target.value)
          }
          className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
        />
      </div>

      <div>
        <label className="dashboard-label mb-2 block">
          Last Name
        </label>

        <input
          value={lastName}
          onChange={(e) =>
            setLastName(e.target.value)
          }
          className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-[#2F5A43] px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634]"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          onClick={() => {
            setPreferredName(initialPreferredName ?? "")
            setFirstName(initialFirstName ?? "")
            setLastName(initialLastName ?? "")
            setEditing(false)
          }}
          className="rounded-xl border border-[#9D3E3E] bg-white px-4 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#9D3E3E] transition hover:bg-[#FDF4F4]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}