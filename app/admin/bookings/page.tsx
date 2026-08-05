import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import BookingsTable from "@/components/admin/BookingsTable"
import DashboardContainer from "@/components/layout/DashboardContainer"

export default async function AdminBookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return null
  }

  const [{ data: bookings }, { data: coaches }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select(`
          *,
          clients (
            id,
            name,
            preferred_name,
            first_name,
            last_name,
            phone,
            email,
            lessons_remaining
          ),
          coaches (
            id,
            name,
            preferred_name,
            first_name,
            last_name
          )
        `)
        .order("lesson_date", { ascending: false })
        .order("lesson_time"),

      supabase
        .from("coaches")
        .select("id,name")
        .order("name"),
    ])

  return (
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-black">
      <DashboardContainer>
        <Link
          href="/admin"
          className="mb-4 inline-block rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[15px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] hover:text-[#2F5A43]"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-3xl border border-[#3A5D49] bg-white p-6 shadow-md lg:px-6 lg:py-5">
          <BookingsTable
            bookings={bookings ?? []}
            coaches={coaches ?? []}
          />
        </div>
      </DashboardContainer>
    </main>
  )
}