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
      <div className="w-full space-y-3 lg:hidden">
        {activePackages.map((pkg) => (
          <div
            key={pkg.id}
            className="w-full rounded-xl border p-3 text-sm"
          >
            <button
              onClick={() =>
                setExpandedPackageId(
                  expandedPackageId === pkg.id ? null : pkg.id
                )
              }
              className="flex w-full items-center justify-between"
            >
            <div className="flex flex-1 items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-gray-600">
                  Balance
                </div>
                <div className="font-bold">
                  {(pkg.lessons_added || 0) -
                    (pkg.lessons_used || 0)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs font-semibold text-gray-600">
                  Receipt
                </div>
                <div>
                  {pkg.receipt_url ? (
                    <button
                      onClick={() =>
                        window.open(
                          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipt-images/${pkg.receipt_url}`,
                          "_blank"
                        )
                      }
                    >
                      📷
                    </button>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>

              <span className="ml-3 text-[18px]">
                {expandedPackageId === pkg.id ? "▲" : "▼"}
              </span>
            </button>

            {expandedPackageId === pkg.id && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <div>
                  Balance:{" "}
                  {(pkg.lessons_added || 0) -
                    (pkg.lessons_used || 0)}
                </div>
                <div>
                  Purchase: {pkg.transaction_name}
                </div>
                <div>
                  Purchased on: {formatDate(pkg.purchase_date)}
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
              <th className="p-3 text-left text-sm lg:text-[13px]">
                Balance
              </th>
              <th className="p-3 text-left text-sm lg:text-[13px]">
                Expiry
              </th>
              <th className="p-3 text-left text-sm lg:text-[13px]">
                Method
              </th>
              <th className="p-3 text-center text-sm lg:text-[13px]">
                Receipt
              </th>
              <th className="p-3 text-center text-sm lg:text-[13px]">
              </th>
            </tr>
          </thead>

          <tbody>
            {activePackages.map((pkg) => (
              <>
                <tr key={pkg.id} className="border-b">
                  <td className="p-3 text-sm lg:text-[14px]">
                    {(pkg.lessons_added || 0) -
                      (pkg.lessons_used || 0)}
                  </td>

                  <td className="p-3 text-sm lg:text-[14px]">
                    {formatDate(pkg.expiration_date)}
                  </td>

                  <td className="p-3 text-sm lg:text-[14px]">
                    {pkg.payment_method}
                  </td>

                  <td className="p-3 text-center text-sm lg:text-[14px]">
                    {pkg.receipt_url ? (
                      <button
                        onClick={() =>
                          window.open(
                            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipt-images/${pkg.receipt_url}`,
                            "_blank"
                          )
                        }
                      >
                        📷
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        setExpandedPackageId(
                          expandedPackageId === pkg.id
                            ? null
                            : pkg.id
                        )
                      }
                    >
                      {expandedPackageId === pkg.id ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>

                {expandedPackageId === pkg.id && (
                  <tr className="border-b bg-gray-50">
                    <td colSpan={5} className="p-4">
                      <div className="space-y-2 text-sm">
                        <div>
                          Balance:{" "}
                          {(pkg.lessons_added || 0) -
                            (pkg.lessons_used || 0)}
                        </div>
                        <div>
                          Purchase: {pkg.transaction_name}
                        </div>
                        <div>
                          Purchased on:{" "}
                          {formatDate(pkg.purchase_date)}
                        </div>
                        <div>
                          Expiry:{" "}
                          {formatDate(pkg.expiration_date)}
                        </div>
                        <div>
                          Method: {pkg.payment_method}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
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