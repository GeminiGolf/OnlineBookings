"use client"

import { useState, ChangeEvent } from "react"
import { supabase } from "@/lib/supabaseClient"

interface ReceiptRow {
  id: string
  file: File | null
}

export default function SubmitReceipt() {
  const [rows, setRows] = useState<ReceiptRow[]>([
    { id: "1", file: null }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, file: selectedFile } : row))
    )
  }

  const handleAddMore = () => {
    setRows((prev) => [...prev, { id: crypto.randomUUID(), file: null }])
  }

  const handleSubmit = async () => {
    const filesToUpload = rows
      .map((r) => r.file)
      .filter((file): file is File => file !== null)

    if (filesToUpload.length === 0) {
      alert("Please select at least one receipt to submit.")
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Get logged-in user and associated client profile
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("User session not found.")
      }

      const userId = session.user.id

      const { data: clientRecord, error: clientError } = await supabase
        .from("clients")
        .select("id, name, preferred_name, primary_coach_id")
        .eq("profile_id", userId)
        .maybeSingle()

      if (clientError || !clientRecord) {
        throw new Error("Client record not found.")
      }

      // 2. Upload files to storage and capture the path
      let lastUploadedPath = ""
      let lastFileName = ""

      for (const file of filesToUpload) {
        const fileExt = file.name.split(".").pop()
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const filePath = `${userId}/${cleanFileName}`

        const { error: storageError } = await supabase.storage
          .from("client_uploaded_receipts")
          .upload(filePath, file)

        if (storageError) {
          throw storageError
        }

        lastUploadedPath = filePath
        lastFileName = file.name
      }

      // 3. Create notification with JSON payload containing file path
      const clientName = clientRecord.preferred_name || clientRecord.name || "Client"

      const { data: notification, error: notificationError } = await supabase
        .from("notifications")
        .insert({
          coach_id: clientRecord.primary_coach_id,
          client_id: clientRecord.id,
          type: "payment_received",
          is_urgent: true,
          message: JSON.stringify({
            text: `Payment receipt uploaded by ${clientName}.`,
            client_name: clientName,
            file_name: lastFileName,
            file_path: lastUploadedPath,
          }),
        })
        .select()
        .single()

      if (!notificationError && notification) {
        await fetch("/api/admin/notifications/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId: notification.id,
          }),
        })
      }

      alert("Receipt(s) uploaded successfully!")
      // Reset input state back to 1 empty field
      setRows([{ id: crypto.randomUUID(), file: null }])
    } catch (error: any) {
      console.error("Failed to upload receipt:", error)
      alert(error.message || "Failed to upload receipt. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-[#E2DDD3]/60 bg-[#FAF8F5] p-5">
      <h3 className="text-[11px] font-light uppercase tracking-[0.2em] text-[#B89868]">
        Upload your receipt(s)
      </h3>

      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              placeholder="No file chosen"
              value={row.file ? row.file.name : ""}
              className="w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-2 text-xs text-[#2F5A43] placeholder-[#2F5A43]/40 focus:outline-none"
            />
            <label className="cursor-pointer whitespace-nowrap rounded-xl border border-[#B89868]/80 bg-[#FAF8F5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#2F5A43] transition-all hover:bg-[#E2DDD3]">
              Upload
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(row.id, e)}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-start">
        <button
          type="button"
          onClick={handleAddMore}
          className="text-xs font-medium tracking-[0.06em] text-[#B89868] underline transition-colors hover:text-[#2F5A43]"
        >
          + Add more receipts
        </button>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-[#B89868]/80 bg-[#2F5A43] py-2.5 text-xs font-semibold uppercase tracking-[0.17em] text-[#F2EEE8] shadow-md transition-all hover:bg-[#234533] disabled:opacity-50"
        >
          {isSubmitting ? "Uploading..." : "Submit"}
        </button>
      </div>
    </div>
  )
}