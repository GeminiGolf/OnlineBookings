import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabaseServer"

import AdminPackagesTable, {
  CoachPackageRow,
} from "@/components/admin/AdminPackagesTable"

export default async function CoachPackagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: coaches } = await supabase
    .from("coaches")
    .select(`
      id,
      first_name,
      last_name,
      name
    `)

  const { data: clients } = await supabase
    .from("clients")
    .select(`
        id,
        preferred_name,
        first_name,
        last_name,
        phone,
        email,
        primary_coach_id
      `)

  const clientMap = new Map<number, any>()
  const clientIds: number[] = []
  const coachMap = new Map<number, string>()

  for (const coach of coaches ?? []) {
    coachMap.set(
      coach.id,
      coach.name ||
        `${coach.first_name ?? ""} ${coach.last_name ?? ""}`.trim()
    )
  }

  for (const client of clients ?? []) {
    clientMap.set(client.id, client)
    clientIds.push(client.id)
  }

  let packages: CoachPackageRow[] = []

  if (clientIds.length > 0) {
    const { data: lessonPackages } = await supabase
      .from("lesson_packages")
      .select(`
        id,
        client_id,
        transaction_name,
        lessons_added,
        lessons_used,
        purchase_date,
        expiration_date,
        price,
        payment_method,
        notes,
        receipt_url
      `)
      .in("client_id", clientIds)

    packages = (lessonPackages ?? []).map((pkg) => {
      const client = clientMap.get(pkg.client_id)
      const coachId = client?.primary_coach_id ?? 0

      const coachName =
        coachMap.get(coachId) ?? "Unknown Coach"
      const preferredName = client?.preferred_name ?? ""
      const firstName = client?.first_name ?? ""
      const lastName = client?.last_name ?? ""

      return {
        id: pkg.id,
        client_id: pkg.client_id,

        transaction_name: pkg.transaction_name ?? "",

        lessons_added: pkg.lessons_added ?? 0,
        lessons_used: pkg.lessons_used ?? 0,

        purchase_date: pkg.purchase_date,
        expiration_date: pkg.expiration_date,

        price: pkg.price,
        payment_method: pkg.payment_method,
        notes: pkg.notes,
        receipt_url: pkg.receipt_url,

        preferred_name: preferredName,
        first_name: firstName,
        last_name: lastName,
        phone: client?.phone ?? "",
        email: client?.email ?? "",

        client_name:
          preferredName ||
          `${firstName} ${lastName}`.trim() ||
          "Unknown",

        coach_id: coachId,
        coach_name: coachName,
      }
    })
  }
  const coachList = (coaches ?? []).map((coach) => ({
    id: coach.id,
    name:
      coach.name ||
      `${coach.first_name ?? ""} ${coach.last_name ?? ""}`.trim(),
  }))

  return (
    <main className="min-h-screen bg-gray-100 px-4 pb-4 pt-8 text-black sm:p-10">
      <div className="mx-auto max-w-6xl">

        <AdminPackagesTable
          packages={packages}
          coaches={coachList}
        />
      </div>
    </main>
  )
}