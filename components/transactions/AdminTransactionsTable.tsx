"use client"
import PdfPreviewModal from "@/components/pdf/PdfPreviewModal"
import jsPDF from "jspdf"
import { Fragment, useEffect, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Printer,
  Pencil,
} from "lucide-react"
import { generateTransactionsPdf } from "@/lib/reports/transactionsPdf"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import "react-day-picker/dist/style.css"

export type TransactionRow = {
  id: number
  client_id: number
  purchase_date: string |null
  price: number | null
  transaction_name: string | null
  payment_method: string | null
  receipt_url: string | null
  client_name: string
  coach_name: string
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
  const [expandedDates, setExpandedDates] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
const [editingTransaction, setEditingTransaction] = useState<TransactionRow | null>(null)
	const [previewOpen, setPreviewOpen] = useState(false)
	const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null)
	const [pdfFilename, setPdfFilename] = useState("")
  const transactionsPerPage = 5
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
			const matchesSearch =
				transaction.client_name.toLowerCase().includes(search.toLowerCase()) ||
				transaction.coach_name.toLowerCase().includes(search.toLowerCase()) ||
				(transaction.transaction_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
				(transaction.payment_method ?? "").toLowerCase().includes(search.toLowerCase())
      const purchaseDate = transaction.purchase_date ?? ""
      const matchesStart = !startDate || purchaseDate >= startDate
      const matchesEnd = !endDate || purchaseDate <= endDate
      return matchesSearch && matchesStart && matchesEnd
    })
  }, [transactions, search, startDate, endDate])

		const groupedTransactions = useMemo(() => {
			const groups = new Map<
				string,
				{
					date: string
					total: number
					coaches: {
						[name: string]: {
							total: number
							transactions: TransactionRow[]
						}
					}
				}
			>()

			filteredTransactions.forEach((transaction) => {
				const date = transaction.purchase_date ?? "Unknown"

				if (!groups.has(date)) {
					groups.set(date, {
						date,
						total: 0,
						coaches: {},
					})
				}

				const group = groups.get(date)!

				group.total += transaction.price ?? 0

				if (!group.coaches[transaction.coach_name]) {
					group.coaches[transaction.coach_name] = {
						total: 0,
						transactions: [],
					}
				}

				group.coaches[transaction.coach_name].transactions.push(transaction)
				group.coaches[transaction.coach_name].total += transaction.price ?? 0
			})

			return Array.from(groups.values()).sort((a, b) =>
				b.date.localeCompare(a.date)
			)
		}, [filteredTransactions])
	const totalPages = Math.max(
		1,
		Math.ceil(groupedTransactions.length / transactionsPerPage)
	)

	const paginatedGroups = groupedTransactions.slice(
		(page - 1) * transactionsPerPage,
		page * transactionsPerPage
	)
  const hasDateFilter = startDate !== "" || endDate !== ""

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setReceiptUrl(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])
	
	const totalAmount = filteredTransactions.reduce(
		(sum, transaction) => sum + (transaction.price ?? 0),
		0
	)

	function toggleRow(date: string) {
		setExpandedDates((prev) =>
			prev.includes(date)
				? prev.filter((d) => d !== date)
				: [...prev, date]
		)
	}

  return (
    <div className="mx-auto max-w-5xl">
			<div className="mb-3 flex items-center justify-between">
				<h1 className="text-[22px] font-bold">Transactions</h1>

				<button
					type="button"
					onClick={() => {
						const { doc, filename } = generateTransactionsPdf({
							transactions: filteredTransactions,
							startDate,
							endDate,
						})

						setPdfDoc(doc)
						setPdfFilename(filename)
						setPreviewOpen(true)
					}}
					className="rounded-lg border p-2 hover:bg-gray-100"
					title="Export PDF"
				>
					<Printer size={20} />
				</button>
			</div>
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
                    setStartDate(format(date, "yyyy-MM-dd"))
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
                    setEndDate(format(date, "yyyy-MM-dd"))
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
							<th className="p-4 text-center">Details</th>
						</tr>
					</thead>

					<tbody>
						{paginatedGroups.map((group) => (
							<Fragment key={group.date}>
								<tr className="border-b last:border-0">
									<td className="p-4">
										{new Date(group.date).toLocaleDateString("en-GB", {
											day: "2-digit",
											month: "2-digit",
											year: "2-digit",
										})}
									</td>

									<td className="p-4">${group.total.toFixed(0)}</td>

									<td className="p-4 text-center">
										<button onClick={() => toggleRow(group.date)}>
											{expandedDates.includes(group.date) ? "▲" : "▼"}
										</button>
									</td>
								</tr>

								{expandedDates.includes(group.date) && (
									<tr>
										<td colSpan={3} className="border-t bg-white px-4 py-4">
											<div className="space-y-6">
												{Object.entries(group.coaches).map(([coachName, coach]) => (
													<div key={coachName}>
														<div className="mb-2 flex items-center justify-between font-semibold">
															<span>Coach: {coachName}</span>
															<span>Total: ${coach.total.toFixed(0)}</span>
														</div>

														<div className="mx-auto w-fit rounded-lg border border-gray-300 bg-gray-50 p-4">
															<table className="w-auto text-sm">
																<thead>
																	<tr className="border-b">
																		<th className="px-2 py-2 text-center">
																			<Pencil size={16} className="mx-auto" />
																		</th>
																		<th className="px-4 py-2 text-left">ID</th>
																		<th className="px-4 py-2 text-left">Price</th>
																		<th className="px-4 py-2 text-left">Purchase</th>
																		<th className="px-4 py-2 text-left">Method</th>
																		<th className="px-4 py-2 text-left">Client</th>
																	</tr>
																</thead>

																<tbody>
																	{coach.transactions.map((transaction) => (
																		<tr key={transaction.id} className="border-b last:border-0">
																			<td className="px-2 py-2 text-center">
																				<button
																					type="button"
																					onClick={() => setEditingTransaction(transaction)}
																					className="text-blue-600 hover:text-blue-800"
																					title="Edit Transaction"
																				>
																					<Pencil size={14} />
																				</button>
																			</td>

																			<td className="px-4 py-2">
																				[{transaction.id}]
																			</td>

																			<td className="px-4 py-2">
																				${(transaction.price ?? 0).toFixed(0)}
																			</td>

																			<td className="px-4 py-2">
																				{transaction.transaction_name}
																			</td>

																			<td className="px-4 py-2">
																				<div className="flex items-center gap-2">
																					{transaction.receipt_url && (
																						<button
																							type="button"
																							onClick={() => setReceiptUrl(transaction.receipt_url)}
																							className="text-blue-600 hover:text-blue-800"
																							title="View Receipt"
																						>
																							<ImageIcon size={16} />
																						</button>
																					)}

																					<span>{transaction.payment_method ?? "-"}</span>
																				</div>
																			</td>

																			<td className="px-4 py-2">
																				[{transaction.client_id}] {transaction.client_name}
																			</td>


																		</tr>
																	))}
																</tbody>
															</table>
														</div>
													</div>
												))}
											</div>
										</td>
									</tr>
								)}
							</Fragment>
						))}
					</tbody>

					<tfoot>
						<tr className="border-t text-sm font-bold">
							<td className="p-4" />
							<td className="p-4 font-bold">Total: ${totalAmount.toFixed(0)}</td>
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
					{paginatedGroups.map((group) => {
						const expanded = expandedDates.includes(group.date)

						return (
							<div key={group.date} className="border-b last:border-0">
								<button
									onClick={() => toggleRow(group.date)}
									className="grid w-full grid-cols-[120px_1fr_24px] items-center gap-3 p-4 text-left"
								>
									<span className="font-medium">
										{new Date(group.date).toLocaleDateString("en-GB", {
											day: "2-digit",
											month: "2-digit",
											year: "2-digit",
										})}
									</span>

									<span className="text-sm text-gray-600">
										${group.total.toFixed(0)}
									</span>

									<span>{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
								</button>

								{expanded && (
									<div className="border-t bg-white px-3 py-3">
										<div className="space-y-4">
											{Object.entries(group.coaches).map(([coachName, coach]) => (
												<div key={coachName}>
													<div className="mb-2 flex items-center justify-between font-semibold">
														<span>Coach: {coachName}</span>
														<span>Total: ${coach.total.toFixed(0)}</span>
													</div>

													<div className="mx-auto w-fit rounded-lg border border-gray-300 bg-gray-50 p-2">
														<table className="w-auto text-sm">
															<thead>
																<tr className="border-b">
																	<th className="px-2 py-1 text-center">
																		<Pencil size={14} className="mx-auto" />
																	</th>
																	<th className="px-2 py-1 text-left">ID</th>
																	<th className="px-3 py-1 text-left">Price</th>
																	<th className="px-2 py-1 text-left">Purchase</th>
																	<th className="px-2 py-1 text-left">Method</th>
																	<th className="px-2 py-1 text-left">Client</th>
																</tr>
															</thead>

															<tbody>
																{coach.transactions.map((transaction) => (
																	<tr key={transaction.id} className="border-b last:border-0">
																		<td className="px-2 py-2 text-center">
																			<button
																				type="button"
																				onClick={() => setEditingTransaction(transaction)}
																				className="text-blue-600 hover:text-blue-800"
																				title="Edit Transaction"
																			>
																				<Pencil size={14} />
																			</button>
																		</td>

																		<td className="px-2 py-2">
																			[{transaction.id}]
																		</td>

																		<td className="px-3 py-2">
																			${(transaction.price ?? 0).toFixed(0)}
																		</td>

																		<td className="px-2 py-2">
																			{transaction.transaction_name}
																		</td>

																		<td className="px-2 py-2">
																			<div className="flex items-center gap-2">
																				{transaction.receipt_url && (
																					<button
																						type="button"
																						onClick={() => setReceiptUrl(transaction.receipt_url)}
																						className="text-blue-600 hover:text-blue-800"
																						title="View Receipt"
																					>
																						<ImageIcon size={16} />
																					</button>
																				)}

																				<span>{transaction.payment_method ?? "-"}</span>
																			</div>
																		</td>

																		<td className="px-2 py-2">
																			[{transaction.client_id}] {transaction.client_name}
																		</td>

																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)
					})}

          <div className="grid grid-cols-[120px_1fr_24px] border-t bg-gray-100 p-4 text-[13px] font-bold">
            <div />
            <div>Total: ${totalAmount.toFixed(0)}</div>
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

      {receiptUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setReceiptUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-lg bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setReceiptUrl(null)}
              className="absolute right-3 top-3 rounded border bg-white px-2 py-1 text-lg"
            >
              ×
            </button>

            <img
              src={receiptUrl}
              alt="Payment receipt"
              className="max-h-[80vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}

			<PdfPreviewModal
				isOpen={previewOpen}
				onClose={() => setPreviewOpen(false)}
				doc={pdfDoc}
				filename={pdfFilename}
			/>
    </div>
  )
}