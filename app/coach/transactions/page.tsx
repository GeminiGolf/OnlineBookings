import Link from "next/link"
import { createClient } from "@/lib/supabaseServer"
import TransactionsTable, {
  TransactionRow,
} from "@/components/transactions/TransactionsTable"
import { redirect } from "next/navigation"
import DashboardContainer from "@/components/layout/DashboardContainer"

export default async function CoachTransactionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", user.id)
    .single()

  if (!coach) {
    redirect("/login")
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
        payment_method,
        receipt_url,
        client_id
      `)
      .in("client_id", clientIds)
      .gt("price", 0)
      .order("purchase_date", { ascending: false })

    transactions = await Promise.all(
      (packages ?? []).map(async (pkg) => {
        let receiptUrl: string | null = null

        if (pkg.receipt_url) {
          const { data } = await supabase.storage
            .from("receipt-images")
            .createSignedUrl(pkg.receipt_url, 60 * 60)

          receiptUrl = data?.signedUrl ?? null
        }

        return {
          id: pkg.id,
          purchase_date: pkg.purchase_date,
          price: pkg.price,
          transaction_name: pkg.transaction_name,
          payment_method: pkg.payment_method,
          receipt_url: receiptUrl,
          client_name: clientMap.get(pkg.client_id) ?? "Unknown",
        }
      })
    )
  }

  return (
    <main className="min-h-screen bg-[#F2EEE8] px-4 pt-8 pb-3 sm:p-10 text-[#1F3327]">
      <DashboardContainer>
        <Link
          href="/coach/dashboard"
          className="mb-3 sm:mb-6 inline-flex items-center gap-2 rounded-xl border border-[#3A5D49] bg-white px-5 py-2 text-[13px] font-light tracking-[0.04em] text-[#1F3327] shadow-sm transition hover:bg-[#F6FAF6]"
        >
          ← Back to Dashboard
        </Link>

        <div className="rounded-3xl border border-[#3A5D49] bg-white p-4 shadow-md">
          <TransactionsTable transactions={transactions} />
        </div>
      </DashboardContainer>
    </main>
  )
}