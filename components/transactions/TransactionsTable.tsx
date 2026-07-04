"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export type TransactionRow = {
  id: number
  purchase_date: string | null
  price: number | null
  transaction_name: string | null
  client_name: string
}

type TransactionsTableProps = {
  transactions: TransactionRow[]
}

export default function TransactionsTable({
  transactions,
}: TransactionsTableProps) {
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.client_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (transaction.transaction_name ?? "")
          .toLowerCase()
          .includes(search.toLowerCase())

      const purchaseDate = transaction.purchase_date ?? ""

      const matchesStart =
        !startDate || purchaseDate >= startDate

      const matchesEnd =
        !endDate || purchaseDate <= endDate

      return matchesSearch && matchesStart && matchesEnd
    })
  }, [transactions, search, startDate, endDate])

  const totalAmount = filteredTransactions.reduce(
    (sum, transaction) => sum + (transaction.price ?? 0),
    0
  )

  function toggleRow(id: number) {
    setExpandedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    )
  }

  return (
    <div>
      <h2 className="mb-6 text-3xl font-bold">
        Transactions
      </h2>

      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border px-4 py-3"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border bg-green-100 px-4 py-3"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-lg border bg-red-100 px-4 py-3"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        {/* Desktop */}
        <table className="hidden w-full md:table">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4">Date</th>
              <th className="p-4">Price</th>
              <th className="p-4">Purchase</th>
              <th className="p-4">Client Name</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b last:border-0"
              >
                <td className="p-4">
                  {transaction.purchase_date}
                </td>

                <td className="p-4">
                  $
                  {(transaction.price ?? 0).toFixed(2)}
                </td>

                <td className="p-4">
                  {transaction.transaction_name}
                </td>

                <td className="p-4">
                  {transaction.client_name}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t font-bold">
              <td
                className="p-4 text-right"
                colSpan={3}
              >
                Total
              </td>

              <td className="p-4">
                ${totalAmount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Mobile */}
        <div className="md:hidden">
          {filteredTransactions.map((transaction) => {
            const expanded = expandedRows.includes(
              transaction.id
            )

            return (
              <div
                key={transaction.id}
                className="border-b last:border-0"
              >
                <button
                  onClick={() =>
                    toggleRow(transaction.id)
                  }
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div>
                    <div className="font-medium">
                      {transaction.purchase_date}
                    </div>

                    <div className="text-sm text-gray-600">
                      $
                      {(transaction.price ?? 0).toFixed(
                        2
                      )}
                    </div>
                  </div>

                  {expanded ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>

                {expanded && (
                  <div className="space-y-3 border-t bg-gray-50 p-4">
                    <div>
                      <div className="text-xs font-semibold uppercase text-gray-500">
                        Client
                      </div>

                      <div>
                        {transaction.client_name}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase text-gray-500">
                        Purchase
                      </div>

                      <div>
                        {transaction.transaction_name}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <div className="border-t bg-gray-100 p-4 text-right font-bold">
            Total: ${totalAmount.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}