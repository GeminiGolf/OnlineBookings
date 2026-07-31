import Link from "next/link"
import ChangePassword from "@/components/auth/ChangePassword"
import DashboardContainer from "@/components/layout/DashboardContainer"

export default function ClientChangePasswordPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
     <DashboardContainer>
        <Link
          href="/client/dashboard"
          className="mb-8 inline-block rounded-lg border border-black bg-white px-5 py-2.5 text-[13px] font-light tracking-[0.06em] text-black no-underline transition hover:bg-gray-100"
        >
          ← Back to Profile
        </Link>
      </DashboardContainer>

      <ChangePassword />
    </main>
  )
}