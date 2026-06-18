"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  packages: any[]
}

export default function CoachClientPackages({ packages }: Props) {
  const [expandedPackageId, setExpandedPackageId] = useState<number | null>(null)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [packageList, setPackageList] = useState(packages)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  async function viewReceipt(path: string) {
    const { data, error } = await supabase.storage.from("receipt-images").createSignedUrl(path, 60)
    if (error) {
      alert(error.message)
      return
    }
    if (data?.signedUrl) {
      setReceiptImage(data.signedUrl)
    }
  }

  async function uploadReceipt(pkgId: number, file: File) {
    const extension = file.name.split(".").pop()
    const path = `${pkgId}/${Date.now()}.${extension}`
    const { error: uploadError } = await supabase.storage.from("receipt-images").upload(path, file)
    if (uploadError) {
      alert(uploadError.message)
      return
    }
    const { error: updateError } = await supabase
      .from("lesson_packages")
      .update({
        receipt_url: path,
      })
      .eq("id", pkgId)
    if (updateError) {
      alert(updateError.message)
      return
    }
    setPackageList((current) => current.map((pkg) => (pkg.id === pkgId ? { ...pkg, receipt_url: path } : pkg)))
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = String(date.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }

  const activePackages = packageList
    .filter((pkg) => (pkg.lessons_added || 0) - (pkg.lessons_used || 0) > 0)
    .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime())

  const totalPages = Math.max(1, Math.ceil(activePackages.length / ITEMS_PER_PAGE))

  const paginatedPackages = activePackages.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  return (
    <>
      {receiptImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setReceiptImage(null)}
        >
          <div
            className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl bg-white p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={receiptImage} alt="Receipt" className="max-h-[85vh] max-w-[85vw] object-contain" />

            <button onClick={() => setReceiptImage(null)} className="mt-3 w-full rounded border px-4 py-2">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile */}
      <div className="w-full space-y-3 lg:hidden">
        {paginatedPackages.map((pkg) => (
          <div key={pkg.id} className="w-full rounded-xl border p-3 text-sm">
            <button
              onClick={() => setExpandedPackageId(expandedPackageId === pkg.id ? null : pkg.id)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-600">Balance</div>
                  <div className="font-bold">{(pkg.lessons_added || 0) - (pkg.lessons_used || 0)}</div>
                </div>

                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-600">Receipt</div>
                  <div>
                    {pkg.receipt_url ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          viewReceipt(pkg.receipt_url)
                        }}
                        className="cursor-pointer"
                      >
                        📷
                      </span>
                    ) : (
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer rounded border px-2 py-1 text-xs"
                      >
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              uploadReceipt(pkg.id, file)
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <span className="ml-3 text-[18px]">{expandedPackageId === pkg.id ? "▲" : "▼"}</span>
            </button>

            {expandedPackageId === pkg.id && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <div>Balance: {(pkg.lessons_added || 0) - (pkg.lessons_used || 0)}</div>
                <div>Purchase: {pkg.transaction_name}</div>
                <div>Purchased on: {formatDate(pkg.purchase_date)}</div>
                <div>Expiry: {formatDate(pkg.expiration_date)}</div>
                <div>Method: {pkg.payment_method}</div>
              </div>
            )}
          </div>
        ))}

        {activePackages.length === 0 && <div className="rounded-xl border p-4">No active lessons remaining.</div>}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block overflow-hidden rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left text-sm lg:text-[13px]">Balance</th>
              <th className="p-3 text-left text-sm lg:text-[13px]">Expiry</th>
              <th className="p-3 text-left text-sm lg:text-[13px]">Method</th>
              <th className="p-3 text-center text-sm lg:text-[13px]">Receipt</th>
              <th className="p-3 text-center text-sm lg:text-[13px]"></th>
            </tr>
          </thead>

          <tbody>
            {paginatedPackages.map((pkg) => (
              <React.Fragment key={pkg.id}>
                <tr className="border-b">
                  <td className="p-3 text-sm lg:text-[14px]">{(pkg.lessons_added || 0) - (pkg.lessons_used || 0)}</td>
                  <td className="p-3 text-sm lg:text-[14px]">{formatDate(pkg.expiration_date)}</td>
                  <td className="p-3 text-sm lg:text-[14px]">{pkg.payment_method}</td>
                  <td className="p-3 text-center text-sm lg:text-[14px]">
                    {pkg.receipt_url ? (
                      <button onClick={() => viewReceipt(pkg.receipt_url)}>📷</button>
                    ) : (
                      <label className="cursor-pointer rounded border px-2 py-1 text-xs">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              uploadReceipt(pkg.id, file)
                            }
                          }}
                        />
                      </label>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <button onClick={() => setExpandedPackageId(expandedPackageId === pkg.id ? null : pkg.id)}>
                      {expandedPackageId === pkg.id ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>

                {expandedPackageId === pkg.id && (
                  <tr className="border-b bg-gray-50">
                    <td colSpan={5} className="p-4">
                      <div className="space-y-2 text-sm">
                        <div>Balance: {(pkg.lessons_added || 0) - (pkg.lessons_used || 0)}</div>
                        <div>Purchase: {pkg.transaction_name}</div>
                        <div>Purchased on: {formatDate(pkg.purchase_date)}</div>
                        <div>Expiry: {formatDate(pkg.expiration_date)}</div>
                        <div>Method: {pkg.payment_method}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {activePackages.length === 0 && <div className="p-4 text-gray-500">No active lessons remaining.</div>}

        {activePackages.length > 0 && (
          <div className="flex items-center justify-center gap-4 border-t p-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  )
}
