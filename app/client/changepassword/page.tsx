import Link from "next/link"
import ChangePassword from "@/components/auth/ChangePassword"

export default function ClientChangePasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2EEE8] px-6 py-6">
      <div className="w-full max-w-md -translate-y-6">
        <Link
          href="/client/dashboard"
          className="mb-4 inline-flex items-center rounded-xl border border-[#3A5D49] bg-[#F7F4EF] px-5 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F2ECE3]"
        >
          ← Back to Profile
        </Link>

        <ChangePassword />
      </div>
    </main>
  )
}