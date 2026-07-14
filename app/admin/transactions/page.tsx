import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import AdminTransactionsTable, {
  TransactionRow,
} from "@/components/transactions/AdminTransactionsTable"

export default async function AdminTransactionsPage() {
  const supabase = await createClient()

  const { data: packages } = await supabase
    .from("lesson_packages")
    .select(`
      id,
      client_id,
      added_by,
      purchase_date,
      price,
      transaction_name,
      payment_method,
      receipt_url
    `)
    .gt("price", 0)
    .order("purchase_date", { ascending: false })

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")

  const { data: coaches } = await supabase
    .from("coaches")
    .select("id, name")

  const clientMap = new Map<number, string>()
  const coachMap = new Map<number, string>()

  clients?.forEach((client) => {
    clientMap.set(client.id, client.name)
  })

  coaches?.forEach((coach) => {
    coachMap.set(Number(coach.id), coach.name)
  })

  const transactions: TransactionRow[] =
    packages?.map((pkg) => ({
      id: pkg.id,
      purchase_date: pkg.purchase_date,
      price: pkg.price,
      transaction_name: pkg.transaction_name,
      payment_method: pkg.payment_method,
      receipt_url: pkg.receipt_url,
      client_name: clientMap.get(pkg.client_id) ?? "Unknown Client",
      coach_name: coachMap.get(Number(pkg.added_by)) ?? "Unknown Coach",
    })) ?? []

  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-10 text-black">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/"
          className="mb-6 inline-block rounded-lg border bg-white px-4 py-2"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-2xl bg-white p-4 shadow">
          <AdminTransactionsTable transactions={transactions} />
        </div>
      </div>
    </main>
  )
}