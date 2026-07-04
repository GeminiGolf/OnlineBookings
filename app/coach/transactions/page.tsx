import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import TransactionsTable, {
  TransactionRow,
} from "@/components/transactions/TransactionsTable"

export default async function CoachTransactionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", user.id)
    .single()

  if (!coach) {
    return null
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("primary_coach_id", coach.id)

  const clientMap = new Map<number, string>()
  const clientIds: number[] = []

  for (const client of clients ?? []) {
    clientMap.set(client.id, client.name)
    clientIds.push(client.id)
  }

  let transactions: TransactionRow[] = []

  if (clientIds.length > 0) {
    const { data: packages } = await supabase
      .from("lesson_packages")
      .select(`
        id,
        purchase_date,
        price,
        transaction_name,
        client_id
      `)
      .in("client_id", clientIds)
      .gt("price", 0)
      .order("purchase_date", { ascending: false })

    transactions =
      packages?.map((pkg) => ({
        id: pkg.id,
        purchase_date: pkg.purchase_date,
        price: pkg.price,
        transaction_name: pkg.transaction_name,
        client_name: clientMap.get(pkg.client_id) ?? "Unknown",
      })) ?? []
  }

  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/coach/dashboard"
          className="mb-6 inline-block rounded-lg border bg-white px-4 py-2"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-2xl bg-white p-4 shadow">
          <TransactionsTable transactions={transactions} />
        </div>
      </div>
    </main>
  )
}