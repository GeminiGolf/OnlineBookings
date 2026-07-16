"use client"

import { useState } from "react"
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
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              Preferred Name
            </span>

            <button
              onClick={() => setEditing(true)}
              className="text-sm"
            >
              ✏️
            </button>
          </div>

          <p className="font-semibold">
            {preferredName || "—"}
          </p>
        </div>

        <div>
          <span className="text-gray-600">
            First Name
          </span>

          <p className="font-semibold">
            {firstName || "—"}
          </p>
        </div>

        <div>
          <span className="text-gray-600">
            Last Name
          </span>

          <p className="font-semibold">
            {lastName || "—"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div>
        <label className="mb-1 block font-semibold">
          Preferred Name
        </label>

        <input
          value={preferredName}
          onChange={(e) =>
            setPreferredName(e.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block font-semibold">
          First Name
        </label>

        <input
          value={firstName}
          onChange={(e) =>
            setFirstName(e.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block font-semibold">
          Last Name
        </label>

        <input
          value={lastName}
          onChange={(e) =>
            setLastName(e.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white"
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
          className="rounded border px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}