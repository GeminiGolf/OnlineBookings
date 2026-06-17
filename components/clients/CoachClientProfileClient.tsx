"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  clientId: number
  lessonsRemaining: number
}

export default function CoachClientProfileClient({ clientId, lessonsRemaining }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [transactionType, setTransactionType] = useState("PPV")
  const [transactionName, setTransactionName] = useState("PPV")
  const [lessonsAdded, setLessonsAdded] = useState(1)
  const [price, setPrice] = useState(0)
  const isOther = transactionType === "Other"
  const [paymentMethod, setPaymentMethod] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const today = new Date()
  const expiry = new Date()
  expiry.setFullYear(expiry.getFullYear() + 1)
  const [expirationDate, setExpirationDate] = useState(expiry.toISOString().split("T")[0])
  const showReceiptUpload =
  paymentMethod === "transfer" ||
  paymentMethod === "e-wallet"
  function updateTransaction(type: string) {
    setTransactionType(type)
    const expiry = new Date()
    if (type === "PPV") {
      expiry.setMonth(expiry.getMonth() + 6)
      setTransactionName("PPV")
      setLessonsAdded(1)
      setPrice(0)
      setExpirationDate(expiry.toISOString().split("T")[0])
    }
    if (type === "5 Lessons") {
      expiry.setMonth(expiry.getMonth() + 6)
      setTransactionName("5 Lessons")
      setLessonsAdded(5)
      setPrice(0)
      setExpirationDate(expiry.toISOString().split("T")[0])
    }
    if (type === "10 Lessons") {
      expiry.setFullYear(expiry.getFullYear() + 1)
      setTransactionName("10 Lessons")
      setLessonsAdded(10)
      setPrice(0)
      setExpirationDate(expiry.toISOString().split("T")[0])
    }
    if (type === "Other") {
      setTransactionName("")
      setLessonsAdded(1)
      setPrice(0)
      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + 6)
      setExpirationDate(expiry.toISOString().split("T")[0])
    }
  }

  async function saveTransaction() {
    if (!paymentMethod) {
      alert("Please select a payment method.")
      return
    }
    let receiptUrl: string | null = null
    if (receiptFile) {
      const fileExt = receiptFile.name.split(".").pop()
      const fileName = `${clientId}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from("receipt-images")
        .upload(fileName, receiptFile)
      if (uploadError) {
        console.error("UPLOAD ERROR", uploadError)
        alert(uploadError.message)
        return
      }
      receiptUrl = fileName
    }

    const purchaseDate = new Date().toISOString().split("T")[0]
    const { data, error } = await supabase
      .from("lesson_packages")
      .insert({
        client_id: clientId,
        transaction_name: transactionName,
        lessons_added: lessonsAdded,
        price,
        payment_method: paymentMethod,
        receipt_url: receiptUrl,
        purchase_date: purchaseDate,
        expiration_date: expirationDate,
      })
      .select()
      .single()
    if (error) {
      console.error("LESSON PACKAGE ERROR", error)
      alert(error.message)
      return
    }
    if (
      (paymentMethod === "transfer" ||
        paymentMethod === "e-wallet") &&
      !receiptUrl
    ) {
      await supabase.from("notifications").insert({
        client_id: clientId,
        type: "missing_receipt",
        message: JSON.stringify({
          package_id: data.id,
          transaction_name: transactionName,
          purchase_date: purchaseDate,
        }),
      })
    }
    await supabase
      .from("clients")
      .update({
        lessons_remaining: lessonsRemaining + Number(lessonsAdded),
        expiry_date: expirationDate,
      })
      .eq("id", clientId)
    window.location.reload()
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white sm:px-4 sm:text-sm">
        Add Transaction
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-black">
            <h2 className="mb-6 text-2xl font-bold">New Transaction</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Transaction Type</label>
                <select
                  value={transactionType}
                  onChange={(e) => updateTransaction(e.target.value)}
                  className="w-full rounded border p-3"
                >
                  <option>PPV</option>
                  <option>5 Lessons</option>
                  <option>10 Lessons</option>
                  <option>Other</option>
                </select>
              </div>

              {isOther && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Transaction Name</label>
                  <input
                    value={transactionName}
                    onChange={(e) => setTransactionName(e.target.value)}
                    placeholder="Describe the purchase"
                    className="w-full rounded border p-3"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">Lessons Adding</label>
                <input
                  type="number"
                  value={lessonsAdded}
                  disabled={!isOther}
                  onChange={(e) => setLessonsAdded(Number(e.target.value))}
                  className="w-full rounded border p-3 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={price}
                  disabled={!isOther}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded border p-3 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded border p-3"
                >
                  <option value="">Select payment method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                  <option value="e-wallet">E-wallet</option>
                  <option value="free lesson">Free Lesson</option>
                </select>
              </div>

              {showReceiptUpload && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Upload Receipt
                  </label>

                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setReceiptFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />

                  <label
                    htmlFor="receipt-upload"
                    className="block w-full cursor-pointer rounded border p-3"
                  >
                    {receiptFile ? receiptFile.name : "Choose File"}
                  </label>
                </div>
              )}

              <div className="w-full">
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-[98%] sm:w-full rounded border p-3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="rounded border px-4 py-2">
                  Cancel
                </button>

                <button onClick={saveTransaction} className="rounded bg-blue-600 px-4 py-2 text-white">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
