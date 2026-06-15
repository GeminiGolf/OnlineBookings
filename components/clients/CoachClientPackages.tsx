"use client"

import { useState } from "react"

type Props = {
  packages: any[]
}

export default function CoachClientPackages({ packages }: Props) {
  const [expandedPackageId, setExpandedPackageId] = useState<number | null>(null)

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = String(date.getFullYear()).slice(-2)

    return `${day}/${month}/${year}`
  }

  const activePackages = packages
    .filter((pkg) => (pkg.lessons_added || 0) - (pkg.lessons_used || 0) > 0)
    .sort(
      (a, b) =>
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
    )

  return (
    <>
      {/* Mobile */}
      <div className="mx-auto max-w-md space-y-3 lg:hidden">
        {activePackages.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-xl border p-3 text-sm"
          >
            <button
              onClick={() =>
                setExpandedPackageId(
                  expandedPackageId === pkg.id ? null : pkg.id
                )
              }
              className="flex w-full items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-gray-600">
                  Balance
                </div>

                <div className="text-[18px] font-bold">
                  {(pkg.lessons_added || 0) -
                    (pkg.lessons_used || 0)}
                </div>
              </div>

              <span className="text-[18px]">
                {expandedPackageId === pkg.id ? "▲" : "▼"}
              </span>
            </button>

            {expandedPackageId === pkg.id && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <div>
                  Purchase: {pkg.transaction_name}
                </div>

                <div>
                  Purchased: {formatDate(pkg.purchase_date)}
                </div>

                <div>
                  Expiry: {formatDate(pkg.expiration_date)}
                </div>

                <div>
                  Method: {pkg.payment_method}
                </div>
              </div>
            )}
          </div>
        ))}

        {activePackages.length === 0 && (
          <div className="rounded-xl border p-4">
            No active lessons remaining.
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block overflow-hidden rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left">Balance</th>
              <th className="p-3 text-left">Purchase</th>
              <th className="p-3 text-left">Purchased On</th>
              <th className="p-3 text-left">Expiry</th>
              <th className="p-3 text-left">Method</th>
            </tr>
          </thead>

          <tbody>
            {activePackages.map((pkg) => (
              <tr key={pkg.id} className="border-b">
                <td className="p-3">
                  {(pkg.lessons_added || 0) -
                    (pkg.lessons_used || 0)}
                </td>

                <td className="p-3">
                  {pkg.transaction_name}
                </td>

                <td className="p-3">
                  {formatDate(pkg.purchase_date)}
                </td>

                <td className="p-3">
                  {formatDate(pkg.expiration_date)}
                </td>

                <td className="p-3">
                  {pkg.payment_method}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {activePackages.length === 0 && (
          <div className="p-4 text-gray-500">
            No active lessons remaining.
          </div>
        )}
      </div>
    </>
  )
}