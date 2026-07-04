import Link from "next/link"
import ChangePassword from "@/components/auth/ChangePassword"

export default function CoachChangePasswordPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto mb-4 max-w-md">
        <Link
          href="/coach/profile"
          className="inline-block rounded-lg border border-black bg-white px-4 py-2 text-black no-underline hover:bg-gray-100"
        >
          ← Back to Profile
        </Link>
      </div>

      <ChangePassword />
    </main>
  )
}