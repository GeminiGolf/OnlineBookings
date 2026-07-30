import Link from "next/link"
import ChangePassword from "@/components/auth/ChangePassword"
import DashboardContainer from "@/components/layout/DashboardContainer"
export default function CoachChangePasswordPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
      <DashboardContainer>
        <Link
          href="/coach/profile"
          className="inline-block rounded-lg border border-black bg-white px-4 py-2 text-black no-underline hover:bg-gray-100"
        >
          ← Back to Profile
        </Link>
      </DashboardContainer>

      <ChangePassword />
    </main>
  )
}