"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  coach: {
    id: number
    ppv_price: number | null
    ppv_expiry_months: number | null
    package_5_price: number | null
    package_5_expiry_months: number | null
    package_10_price: number | null
    package_10_expiry_months: number | null
  }
}

export default function AdminCoachDefaultsCard({
  coach,
}: Props) {
  const [ppvPrice, setPpvPrice] = useState(
    coach.ppv_price ?? 0
  )

  const [ppvExpiry, setPpvExpiry] = useState(
    coach.ppv_expiry_months ?? 0
  )

  const [package5Price, setPackage5Price] =
    useState(
      coach.package_5_price ?? 0
    )

  const [package5Expiry, setPackage5Expiry] =
    useState(
      coach.package_5_expiry_months ?? 0
    )

  const [package10Price, setPackage10Price] =
    useState(
      coach.package_10_price ?? 0
    )

  const [package10Expiry, setPackage10Expiry] =
    useState(
      coach.package_10_expiry_months ?? 0
    )

  const [saving, setSaving] = useState(false)

  async function saveDefaults() {
    setSaving(true)

    await supabase
      .from("coaches")
      .update({
        ppv_price: ppvPrice,
        ppv_expiry_months: ppvExpiry,

        package_5_price: package5Price,
        package_5_expiry_months:
          package5Expiry,

        package_10_price: package10Price,
        package_10_expiry_months:
          package10Expiry,
      })
      .eq("id", coach.id)

    setSaving(false)
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="mb-4 text-[22px] font-bold">
        Lesson Defaults
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">
              Package
            </th>

            <th className="p-2 text-left">
              Price
            </th>

            <th className="p-2 text-left">
              Expiry
            </th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b">
            <td className="p-2">PPV</td>

            <td className="p-2">
              <input
                type="number"
                value={ppvPrice}
                onChange={(e) =>
                  setPpvPrice(
                    Number(e.target.value)
                  )
                }
                className="w-24 rounded border p-2"
              />
            </td>

            <td className="p-2">
              <input
                type="number"
                value={ppvExpiry}
                onChange={(e) =>
                  setPpvExpiry(
                    Number(e.target.value)
                  )
                }
                className="w-24 rounded border p-2"
              />
            </td>
          </tr>

          <tr className="border-b">
            <td className="p-2">
              5 Lessons
            </td>

            <td className="p-2">
              <input
                type="number"
                value={package5Price}
                onChange={(e) =>
                  setPackage5Price(
                    Number(e.target.value)
                  )
                }
                className="w-24 rounded border p-2"
              />
            </td>

            <td className="p-2">
              <input
                type="number"
                value={package5Expiry}
                onChange={(e) =>
                  setPackage5Expiry(
                    Number(e.target.value)
                  )
                }
                className="w-24 rounded border p-2"
              />
            </td>
          </tr>

          <tr>
            <td className="p-2">
              10 Lessons
            </td>

            <td className="p-2">
              <input
                type="number"
                value={package10Price}
                onChange={(e) =>
                  setPackage10Price(
                    Number(e.target.value)
                  )
                }
                className="w-24 rounded border p-2"
              />
            </td>

            <td className="p-2">
              <input
                type="number"
                value={package10Expiry}
                onChange={(e) =>
                  setPackage10Expiry(
                    Number(e.target.value)
                  )
                }
                className="w-24 rounded border p-2"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <button
        onClick={saveDefaults}
        disabled={saving}
        className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
      >
        {saving
          ? "Saving..."
          : "Save Defaults"}
      </button>
    </div>
  )
}