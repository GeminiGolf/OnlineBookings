"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type CoachDefaults = {
  ppv_price: number | null
  ppv_expiry_months: number | null
  package_5_price: number | null
  package_5_expiry_months: number | null
  package_10_price: number | null
  package_10_expiry_months: number | null
}

type Props = {
  clientId: number
  lessonsRemaining: number
  onSaved: () => void
  onCancel: () => void
}

export default function AddTransactionForm({
  clientId,
  lessonsRemaining,
  onSaved,
  onCancel,
}: Props) {
  const [transactionType, setTransactionType] = useState("PPV")
  const [transactionName, setTransactionName] = useState("PPV")
  const [lessonsAdded, setLessonsAdded] = useState(1)
  const [price, setPrice] = useState(0)
  const [coachDefaults, setCoachDefaults] =
    useState<CoachDefaults | null>(null)

  const isOther = transactionType === "Other"

  const [paymentMethod, setPaymentMethod] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const expiry = new Date()
  expiry.setFullYear(expiry.getFullYear() + 1)

  const [expirationDate, setExpirationDate] = useState(
    expiry.toISOString().split("T")[0]
  )

  const showReceiptUpload =
    paymentMethod === "transfer" ||
    paymentMethod === "e-wallet"

  useEffect(() => {
    loadCoachDefaults()
  }, [])

  useEffect(() => {
    if (coachDefaults) {
      updateTransaction(transactionType)
    }
  }, [coachDefaults])

  async function loadCoachDefaults() {
    const { data: clientData } = await supabase
      .from("clients")
      .select("primary_coach_id")
      .eq("id", clientId)
      .single()

    if (!clientData?.primary_coach_id) return

    const { data: coachData } = await supabase
      .from("coaches")
      .select(`
        ppv_price,
        ppv_expiry_months,
        package_5_price,
        package_5_expiry_months,
        package_10_price,
        package_10_expiry_months
      `)
      .eq("id", clientData.primary_coach_id)
      .single()

    setCoachDefaults(coachData)
  }

  function updateTransaction(type: string) {
    setTransactionType(type)

    const expiry = new Date()

    if (type === "PPV") {
      const months =
        coachDefaults?.ppv_expiry_months ?? 6

      expiry.setMonth(
        expiry.getMonth() + months
      )

      setTransactionName("PPV")
      setLessonsAdded(1)
      setPrice(
        coachDefaults?.ppv_price ?? 0
      )

      setExpirationDate(
        expiry.toISOString().split("T")[0]
      )
    }

    if (type === "5 Lessons") {
      const months =
        coachDefaults?.package_5_expiry_months ?? 6

      expiry.setMonth(
        expiry.getMonth() + months
      )

      setTransactionName("5 Lessons")
      setLessonsAdded(5)

      setPrice(
        coachDefaults?.package_5_price ?? 0
      )

      setExpirationDate(
        expiry.toISOString().split("T")[0]
      )
    }

    if (type === "10 Lessons") {
      const months =
        coachDefaults?.package_10_expiry_months ?? 12

      expiry.setMonth(
        expiry.getMonth() + months
      )

      setTransactionName("10 Lessons")
      setLessonsAdded(10)

      setPrice(
        coachDefaults?.package_10_price ?? 0
      )

      setExpirationDate(
        expiry.toISOString().split("T")[0]
      )
    }

    if (type === "Other") {
      setTransactionName("")
      setLessonsAdded(1)
      setPrice(0)

      expiry.setMonth(
        expiry.getMonth() + 6
      )

      setExpirationDate(
        expiry.toISOString().split("T")[0]
      )
    }
  }

  async function saveTransaction() {
    if (saving) return

    if (!paymentMethod) {
      alert("Please select a payment method.")
      return
    }

    setSaving(true)

    let receiptUrl: string | null = null

    if (receiptFile) {
      const fileExt = receiptFile.name.split(".").pop()

      const fileName = `${clientId}-${Date.now()}.${fileExt}`

      const { error: uploadError } =
        await supabase.storage
          .from("receipt-images")
          .upload(fileName, receiptFile)

      if (uploadError) {
        console.error("UPLOAD ERROR", uploadError)
        alert(uploadError.message)
        setSaving(false)
        return
      }

      receiptUrl = fileName
    }

    const purchaseDate =
      new Date().toISOString().split("T")[0]

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("Auth user:", user)

    const { data: coach, error: coachError } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", user?.id)
      .single()

    console.log("Coach:", coach)
    console.log("Coach error:", coachError)

    const { data, error } = await supabase
      .from("lesson_packages")
      .insert({
        client_id: clientId,
        transaction_name: transactionName,
        lessons_added: lessonsAdded,
        price:
          paymentMethod === "free lesson"
            ? 0
            : price,
        payment_method: paymentMethod,
        receipt_url: receiptUrl,
        purchase_date: purchaseDate,
        expiration_date: expirationDate,
        added_by: coach?.id ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error(
        "LESSON PACKAGE ERROR",
        error
      )

      alert(error.message)
      setSaving(false)
      return
    }

    if (
      (paymentMethod === "transfer" ||
        paymentMethod === "e-wallet") &&
      !receiptUrl
    ) {
      const { data: clientData } =
        await supabase
          .from("clients")
          .select("primary_coach_id")
          .eq("id", clientId)
          .single()

      await supabase
        .from("notifications")
        .insert({
          coach_id:
            clientData?.primary_coach_id,
          client_id: clientId,
          type: "missing_receipt",
          message: JSON.stringify({
            package_id: data.id,
            transaction_name:
              transactionName,
            purchase_date: purchaseDate,
            client_id: clientId,
          }),
        })
    }

    await supabase
      .from("clients")
      .update({
        lessons_remaining:
          lessonsRemaining +
          Number(lessonsAdded),
        expiry_date: expirationDate,
      })
      .eq("id", clientId)

    alert("Transaction added successfully.")
    onSaved()
  }

  return (
    <>
      <h3 className="mb-6 text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
        Add Transaction
      </h3>

      <div className="space-y-2">
        <div>
          <label className="mb-1 block text-[13px] font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
            Transaction Type
          </label>

          <select
            value={transactionType}
            onChange={(e) =>
              updateTransaction(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] outline-none transition focus:border-[#2F5A43] focus:ring-2 focus:ring-[#2F5A43]/15"
          >
            <option>PPV</option>
            <option>5 Lessons</option>
            <option>10 Lessons</option>
            <option>Other</option>
          </select>
        </div>

        {isOther && (
          <div>
            <label className="mb-1 block text-[13px] font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
              Transaction Name
            </label>

            <input
              value={transactionName}
              onChange={(e) =>
                setTransactionName(
                  e.target.value
                )
              }
              placeholder="Describe the purchase"
              className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] outline-none transition focus:border-[#2F5A43] focus:ring-2 focus:ring-[#2F5A43]/15"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-[13px] font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
            Lessons Adding
          </label>

          <input
            type="number"
            value={lessonsAdded}
            disabled={!isOther}
            onFocus={(e) => e.target.select()}
            onChange={(e) =>
              setLessonsAdded(
                Number(e.target.value)
              )
            }
            className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] disabled:bg-[#F3F0EA]"
          />
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
            Price
          </label>

          <input
            type="number"
            value={
              paymentMethod === "free lesson"
                ? 0
                : price
            }
            disabled={!isOther}
            onFocus={(e) => e.target.select()}
            onChange={(e) =>
              setPrice(Number(e.target.value))
            }
            className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] disabled:bg-[#F3F0EA]"
          />
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
            Payment Method
          </label>

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] outline-none transition focus:border-[#2F5A43] focus:ring-2 focus:ring-[#2F5A43]/15"
          >
            <option value="">
              Select payment method
            </option>
            <option value="cash">
              Cash
            </option>
            <option value="card">
              Card
            </option>
            <option value="transfer">
              Transfer
            </option>
            <option value="e-wallet">
              E-wallet
            </option>
            <option value="free lesson">
              Free Lesson
            </option>
          </select>
        </div>

        {showReceiptUpload && (
          <div>
            <label className="mb-1 block text-[13px] font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
              Upload Receipt
            </label>

            <input
              id="receipt-upload"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setReceiptFile(
                  e.target.files?.[0] || null
                )
              }
              className="hidden"
            />

            <label
              htmlFor="receipt-upload"
              className="block w-full cursor-pointer rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] transition hover:bg-[#F6FAF6]"
            >
              {receiptFile
                ? receiptFile.name
                : "Choose File"}
            </label>
          </div>
        )}

        <div>
          <label className="mb-1 block text-[13px] font-medium uppercase tracking-[0.12em] text-[#2F5A43]">
            Package Expiration Date
          </label>

          <input
            type="date"
            value={expirationDate}
            onChange={(e) =>
              setExpirationDate(
                e.target.value
              )
            }
           className="w-[150px] rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43]"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="rounded-2xl border border-[#9D3E3E] bg-white px-6 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-[#9D3E3E] transition hover:bg-[#FDF4F4]"
          >
            Cancel
          </button>

          <button
            onClick={saveTransaction}
            disabled={saving}
            className="rounded-2xl bg-[#2F5A43] px-6 py-2 text-[13px] font-light uppercase tracking-[0.12em] text-white transition hover:bg-[#244634] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  )
}