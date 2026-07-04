"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import "react-day-picker/dist/style.css"

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

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [page, setPage] = useState(1)
  const transactionsPerPage = 5
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.client_name.toLowerCase().includes(search.toLowerCase()) ||
        (transaction.transaction_name ?? "").toLowerCase().includes(search.toLowerCase())
      const purchaseDate = transaction.purchase_date ?? ""
      const matchesStart = !startDate || purchaseDate >= startDate
      const matchesEnd = !endDate || purchaseDate <= endDate
      return matchesSearch && matchesStart && matchesEnd
    })
  }, [transactions, search, startDate, endDate])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / transactionsPerPage))

  const paginatedTransactions = filteredTransactions.slice((page - 1) * transactionsPerPage, page * transactionsPerPage)

  const hasDateFilter = startDate !== "" || endDate !== ""

  const totalAmount = (hasDateFilter ? filteredTransactions : paginatedTransactions).reduce(
    (sum, transaction) => sum + (transaction.price ?? 0),
    0
  )

  function toggleRow(id: number) {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-[22px] font-bold">Transactions</h1>
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-[105px] md:w-[110px] rounded-lg border p-2"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowStartCalendar(!showStartCalendar)
              setShowEndCalendar(false)
            }}
            className="rounded-lg border border-black bg-green-100 px-4 py-2 hover:bg-green-200"
          >
            {startDate ? format(new Date(startDate), "dd/MM/yy") : "Start Date"}
          </button>

          {showStartCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-white p-2 shadow-lg">
              <div className="overflow-hidden">
                <DayPicker
                  className="-mb-4 scale-90 origin-top"
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate("")
                        setPage(1)
                        setShowStartCalendar(false)
                      }}
                      className="mt-2 w-full rounded border px-3 py-2 text-sm"
                    >
                      Clear Date
                    </button>
                  }
                  onSelect={(date) => {
                    if (!date) return
                    setStartDate(date.toISOString().split("T")[0])
                    setPage(1)
                    setShowStartCalendar(false)
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEndCalendar(!showEndCalendar)
              setShowStartCalendar(false)
            }}
            className="rounded-lg border border-black bg-red-100 px-4 py-2 hover:bg-red-200"
          >
            {endDate ? format(new Date(endDate), "dd/MM/yy") : "End Date"}
          </button>

          {showEndCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-white p-2 shadow-lg">
              <div className="overflow-hidden">
                <DayPicker
                  className="-mb-4 scale-90 origin-top"
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        setEndDate("")
                        setPage(1)
                        setShowEndCalendar(false)
                      }}
                      className="mt-2 w-full rounded border px-3 py-2 text-sm"
                    >
                      Clear Date
                    </button>
                  }
                  onSelect={(date) => {
                    if (!date) return
                    setEndDate(date.toISOString().split("T")[0])
                    setPage(1)
                    setShowEndCalendar(false)
                  }}
                />
              </div>
            </div>
          )}
        </div>
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
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b last:border-0">
                <td className="p-4">
                  {transaction.purchase_date
                    ? new Date(transaction.purchase_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })
                    : "-"}
                </td>

                <td className="p-4">${(transaction.price ?? 0).toFixed(2)}</td>

                <td className="p-4">{transaction.transaction_name}</td>

                <td className="p-4">{transaction.client_name}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t text-sm font-bold">
              <td className="p-4" />
              <td className="p-4 font-bold">Total: ${totalAmount.toFixed(2)}</td>
              <td className="p-4" />
              <td className="p-4" />
            </tr>
          </tfoot>
        </table>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="grid grid-cols-[120px_1fr_24px] border-b px-4 py-3 text-sm font-semibold">
            <div>Date</div>
            <div>Price</div>
            <div />
          </div>
          {paginatedTransactions.map((transaction) => {
            const expanded = expandedRows.includes(transaction.id)

            return (
              <div key={transaction.id} className="border-b last:border-0">
                <button
                  onClick={() => toggleRow(transaction.id)}
                  className="grid w-full grid-cols-[120px_1fr_24px] items-center gap-3 p-4 text-left"
                >
                  <span className="font-medium">
                    {transaction.purchase_date
                      ? new Date(transaction.purchase_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })
                      : "-"}
                  </span>

                  <span className="text-sm text-gray-600">${(transaction.price ?? 0).toFixed(2)}</span>

                  <span>{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                </button>

                {expanded && (
                  <div className="space-y-3 border-t bg-gray-50 p-4">
                    <div>
                      <div className="text-xs font-semibold uppercase text-gray-500">Client</div>

                      <div>{transaction.client_name}</div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase text-gray-500">Purchase</div>

                      <div>{transaction.transaction_name}</div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <div className="grid grid-cols-[120px_1fr_24px] border-t bg-gray-100 p-4 text-[13px] font-bold">
            <div />
            <div>Total: ${totalAmount.toFixed(2)}</div>
            <div />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
