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
    <div className="rounded-3xl border border-[#3A5D49] bg-white p-5 shadow-md lg:px-6 lg:py-5">
      <h2 className="dashboard-heading mb-4">
        Lesson Defaults
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="p-2 text-left font-medium text-gray-500">
              Package
            </th>

            <th className="p-2 text-left font-medium text-gray-500">
              Price
            </th>

            <th className="p-2 text-left font-medium text-gray-500">
              Expiry
            </th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b border-gray-100">
            <td className="p-2 dashboard-value">PPV</td>

            <td className="p-2">
              <input
                type="number"
                value={ppvPrice}
                onChange={(e) =>
                  setPpvPrice(
                    Number(e.target.value)
                  )
                }
                className="w-24 rounded-xl border border-[#3A5D49] bg-white px-3 py-1.5 text-black outline-none focus:ring-1 focus:ring-[#3A5D49]"
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
                className="w-24 rounded-xl border border-[#3A5D49] bg-white px-3 py-1.5 text-black outline-none focus:ring-1 focus:ring-[#3A5D49]"
              />
            </td>
          </tr>

          <tr className="border-b border-gray-100">
            <td className="p-2 dashboard-value">
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
                className="w-24 rounded-xl border border-[#3A5D49] bg-white px-3 py-1.5 text-black outline-none focus:ring-1 focus:ring-[#3A5D49]"
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
                className="w-24 rounded-xl border border-[#3A5D49] bg-white px-3 py-1.5 text-black outline-none focus:ring-1 focus:ring-[#3A5D49]"
              />
            </td>
          </tr>

          <tr>
            <td className="p-2 dashboard-value">
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
                className="w-24 rounded-xl border border-[#3A5D49] bg-white px-3 py-1.5 text-black outline-none focus:ring-1 focus:ring-[#3A5D49]"
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
                className="w-24 rounded-xl border border-[#3A5D49] bg-white px-3 py-1.5 text-black outline-none focus:ring-1 focus:ring-[#3A5D49]"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <button
        onClick={saveDefaults}
        disabled={saving}
        className="mt-4 rounded-xl border border-[#3A5D49] bg-[#3A5D49] px-5 py-2 text-[15px] font-light tracking-[0.04em] text-white shadow-sm transition hover:bg-[#2F5A43] disabled:opacity-50"
      >
        {saving
          ? "Saving..."
          : "Save Defaults"}
      </button>
    </div>
  )
}