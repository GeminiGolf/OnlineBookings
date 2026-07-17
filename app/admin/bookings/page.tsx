import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import BookingsTable from "@/components/admin/BookingsTable"

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
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="mb-8 inline-block rounded-xl border border-black bg-white px-6 py-3 hover:bg-gray-100"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow">
          <BookingsTable
            bookings={bookings ?? []}
            coaches={coaches ?? []}
          />
        </div>
      </div>
    </main>
  )
}