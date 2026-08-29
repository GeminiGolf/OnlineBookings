"use client"
import PdfPreviewModal from "@/components/pdf/PdfPreviewModal"
import { supabase } from "@/lib/supabaseClient"
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
	added_by: number | null
	purchase_date: string | null
  expiration_date: string | null
  lessons_added: number | null
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
	const [expandedCoaches, setExpandedCoaches] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
	const [editingTransaction, setEditingTransaction] = useState<TransactionRow | null>(null)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [coaches, setCoaches] = useState<
		{ id: number; name: string }[]
	>([])

	const [editForm, setEditForm] = useState({
		added_by: "",
		transaction_name: "",
		lessons_added: 0,
		price: 0,
		payment_method: "",
		purchase_date: "",
		months: "",
		expiration_date: "",
	})

	useEffect(() => {
		async function fetchCoaches() {
			const { data, error } = await supabase
				.from("coaches")
				.select("id, name")
				.order("name")

			if (error) {
				console.error("Error fetching coaches:", error)
				return
			}

			setCoaches(data ?? [])
		}

		fetchCoaches()
	}, [])
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

	async function saveTransaction() {
		if (!editingTransaction) return

		const { error } = await supabase
			.from("lesson_packages")
			.update({
				added_by: editForm.added_by ? Number(editForm.added_by) : null,
				transaction_name: editForm.transaction_name,
				lessons_added: editForm.lessons_added,
				price: editForm.price,
				payment_method: editForm.payment_method,
				purchase_date: editForm.purchase_date,
				expiration_date: editForm.expiration_date,
			})
			.eq("id", editingTransaction.id)

		if (error) {
			alert(error.message)
			return
		}

		alert("Transaction updated.")

		window.location.reload()
	}

	async function deleteTransaction() {
		if (!editingTransaction) return

		const { error } = await supabase
			.from("lesson_packages")
			.delete()
			.eq("id", editingTransaction.id)

		if (error) {
			alert(error.message)
			return
		}

		alert("Transaction deleted.")
		window.location.reload()
	}

	function toggleRow(date: string) {
		setExpandedDates((prev) =>
			prev.includes(date)
				? prev.filter((d) => d !== date)
				: [...prev, date]
		)
	}

	function toggleCoach(key: string) {
		setExpandedCoaches((prev) =>
			prev.includes(key)
				? prev.filter((c) => c !== key)
				: [...prev, key]
		)
	}

  return (
    <div className="mx-auto max-w-5xl">
			<div className="mb-3 flex items-center justify-between">
				<h1 className="text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
					Transactions
				</h1>

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
          <>
						<button
							type="button"
							onClick={() => {
								setShowStartCalendar(!showStartCalendar)
								setShowEndCalendar(false)
							}}
							className="hidden md:block rounded-xl border-2 border-[#3A5D49] bg-[#35684C] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#2F5A43]"
						>
							{startDate
								? format(new Date(startDate), "dd/MM/yy")
								: "Start Date"}
						</button>

						<button
							type="button"
							onClick={() => {
								setShowStartCalendar(!showStartCalendar)
								setShowEndCalendar(false)
							}}
							className="block md:hidden rounded-xl border-2 border-[#3A5D49] bg-[#35684C] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#2F5A43]"
						>
							{startDate
								? format(new Date(startDate), "dd/MM/yy")
								: "Start"}
						</button>
					</>

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
          <>
						<button
							type="button"
							onClick={() => {
								setShowEndCalendar(!showEndCalendar)
								setShowStartCalendar(false)
							}}
							className="hidden md:block rounded-xl border-2 border-[#7F2E2E] bg-[#9B3B3B] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#842F2F]"
						>
							{endDate
								? format(new Date(endDate), "dd/MM/yy")
								: "End Date"}
						</button>

						<button
							type="button"
							onClick={() => {
								setShowEndCalendar(!showEndCalendar)
								setShowStartCalendar(false)
							}}
							className="block md:hidden rounded-xl border-2 border-[#7F2E2E] bg-[#9B3B3B] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#842F2F]"
						>
							{endDate
								? format(new Date(endDate), "dd/MM/yy")
								: "End"}
						</button>
					</>

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

      <div className="overflow-hidden rounded-3xl border border-[#3A5D49] bg-white shadow-md">
        {/* Desktop */}
        <table className="hidden w-full md:table">
					<thead>
						<tr className="border-b border-[#3A5D49] bg-[#F3F0EA]">
							<th className="dashboard-label border-b border-[#3A5D49] p-4 text-left">
								Date
							</th>
							<th className="dashboard-label border-b border-[#3A5D49] p-4 text-left">
								Price
							</th>
							<th className="dashboard-label border-b border-[#3A5D49] p-4 text-center">
								Details
							</th>
						</tr>
					</thead>

					<tbody>
						{paginatedGroups.map((group) => (
							<Fragment key={group.date}>
								<tr className="border-b border-[#3A5D49] last:border-0 hover:bg-[#F6FAF6]">
									<td className="p-4 text-[15px] font-light text-[#2F5A43]">
										{new Date(group.date).toLocaleDateString("en-GB", {
											day: "2-digit",
											month: "2-digit",
											year: "2-digit",
										})}
									</td>

									<td className="p-4 text-[15px] font-light text-[#2F5A43]">
										RM {group.total.toFixed(2)}
									</td>

									<td className="p-4 text-center">
										<button
											type="button"
											className="text-[#2F5A43] transition hover:text-[#2F5A43]"
											onClick={() => toggleRow(group.date)}
										>
											{expandedDates.includes(group.date) ? (
												<ChevronUp size={18} />
											) : (
												<ChevronDown size={18} />
											)}
										</button>
									</td>
								</tr>

								{expandedDates.includes(group.date) && (
									<tr>
										<td colSpan={3} className="border-t border-[#3A5D49] bg-white px-5 py-5">
											<div className="space-y-6">
												{Object.entries(group.coaches).map(([coachName, coach]) => (
													<div key={coachName}>
														<div className="mb-2 flex items-center justify-between text-[15px] font-light text-[#2F5A43]">
															<span>Coach: {coachName}</span>
															<span>RM {coach.total.toFixed(2)}</span>
														</div>

														<div className="mx-auto w-fit rounded-2xl border border-[#3A5D49] bg-white shadow-sm">
															<table className="w-auto text-sm">
																<thead>
																	<tr className="border-b border-[#3A5D49] bg-[#F3F0EA]">
																		<th className="dashboard-label px-2 py-2 text-center">
																			<Pencil size={16} className="mx-auto" />
																		</th>
																		<th className="dashboard-label px-4 py-2 text-left">ID</th>
																		<th className="dashboard-label px-4 py-2 text-left">Price</th>
																		<th className="dashboard-label px-4 py-2 text-left">Purchase</th>
																		<th className="dashboard-label px-4 py-2 text-left">Method</th>
																		<th className="dashboard-label px-4 py-2 text-left">Client</th>
																	</tr>
																</thead>

																<tbody>
																	{coach.transactions.map((transaction) => (
																		<tr
																			key={transaction.id}
																			className="border-b border-[#3A5D49] last:border-0 hover:bg-[#F6FAF6]"
																		>
																			<td className="px-2 py-2 text-center">
																				<button
																					type="button"
																					onClick={() => {
																						setEditingTransaction(transaction)

																						setEditForm({
																							added_by: transaction.added_by?.toString() ?? "",
																							transaction_name: transaction.transaction_name ?? "",
																							lessons_added: transaction.lessons_added ?? 0,
																							price: transaction.price ?? 0,
																							payment_method: transaction.payment_method ?? "",
																							purchase_date: transaction.purchase_date ?? "",
																							months: "",
																							expiration_date: transaction.expiration_date ?? "",
																						})
																					}}
																					className="text-[#5874A6] transition hover:text-[#45628F]"
																					title="Edit Transaction"
																				>
																					<Pencil size={14} />
																				</button>
																			</td>

																			<td className="px-4 py-2 text-[15px] font-light text-[#2F5A43]">
																				[{transaction.id}]
																			</td>

																			<td className="px-4 py-2 text-[15px] font-light text-[#2F5A43]">
																				${(transaction.price ?? 0).toFixed(0)}
																			</td>

																			<td className="px-4 py-2 text-[15px] font-light text-[#2F5A43]">
																				{transaction.transaction_name}
																			</td>

																			<td className="px-4 py-2 text-[15px] font-light text-[#2F5A43]">
																				<div className="flex items-center gap-2">
																					{transaction.receipt_url && (
																						<button
																							type="button"
																							onClick={() => setReceiptUrl(transaction.receipt_url)}
																							className="text-[#5874A6] transition hover:text-[#45628F]"
																							title="View Receipt"
																						>
																							<ImageIcon size={16} />
																						</button>
																					)}

																					<span>{transaction.payment_method ?? "-"}</span>
																				</div>
																			</td>

																			<td className="px-4 py-2 text-[15px] font-light text-[#2F5A43]">
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
          <div className="dashboard-label grid grid-cols-[120px_1fr_24px] border-b border-[#3A5D49] bg-[#F3F0EA] px-4 py-3">
            <div>Date</div>
            <div>Price</div>
            <div />
          </div>
					{paginatedGroups.map((group) => {
						const expanded = expandedDates.includes(group.date)

						return (
							<div key={group.date} className="border-b border-[#3A5D49] last:border-0">
								<button
									onClick={() => toggleRow(group.date)}
									className="grid w-full grid-cols-[120px_1fr_24px] items-center gap-3 p-4 text-left text-[15px] font-light text-[#2F5A43]"
								>
									<span className="font-medium">
										{new Date(group.date).toLocaleDateString("en-GB", {
											day: "2-digit",
											month: "2-digit",
											year: "2-digit",
										})}
									</span>

									<span className="text-[15px] font-light text-[#2F5A43]">
										RM {group.total.toFixed(2)}
									</span>

									<span>{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
								</button>

								{expanded && (
									<div className="border-t border-[#3A5D49] bg-white px-3 py-3">
										<div className="space-y-4">
											{Object.entries(group.coaches).map(([coachName, coach]) => (
												<div key={coachName}>
													<button
														type="button"
														onClick={() => toggleCoach(`${group.date}-${coachName}`)}
														className="mb-2 flex w-full items-center justify-between rounded-xl border border-[#3A5D49] bg-[#F3F0EA] px-4 py-3 text-left"
													>
														<div>
															<div className="text-[15px] font-light text-[#2F5A43]">
																Coach: {coachName.split(" ")[0]} • RM {coach.total.toFixed(2)}
															</div>
														</div>

														{expandedCoaches.includes(`${group.date}-${coachName}`) ? (
															<ChevronUp size={18} className="text-[#2F5A43]" />
														) : (
															<ChevronDown size={18} className="text-[#2F5A43]" />
														)}
													</button>

													{expandedCoaches.includes(`${group.date}-${coachName}`) && (
														<div className="mt-3 w-full rounded-2xl border border-[#3A5D49] bg-white shadow-sm">
															<table className="w-full table-fixed text-sm">
																<thead>
																	<tr className="border-b border-[#3A5D49] bg-[#F3F0EA]">
																		<th className="w-10 dashboard-label px-2 py-2 text-center">
																			<Pencil size={14} className="mx-auto" />
																		</th>
																		<th className="w-2/5 dashboard-label px-3 py-2 text-left">
																			PRICE
																		</th>
																		<th className="w-3/5 dashboard-label px-3 py-2 text-left">
																			METHOD
																		</th>
																	</tr>
																</thead>

																<tbody className="w-full">
																	{coach.transactions.map((transaction) => (
																		<tr
																			key={transaction.id}
																			className="border-b border-[#3A5D49] last:border-0"
																		>
																			<td className="px-2 py-2 text-center">
																				<button
																					type="button"
																					onClick={() => {
																						setEditingTransaction(transaction)

																						setEditForm({
																							added_by: transaction.added_by?.toString() ?? "",
																							transaction_name: transaction.transaction_name ?? "",
																							lessons_added: transaction.lessons_added ?? 0,
																							price: transaction.price ?? 0,
																							payment_method: transaction.payment_method ?? "",
																							purchase_date: transaction.purchase_date ?? "",
																							months: "",
																							expiration_date: transaction.expiration_date ?? "",
																						})
																					}}
																					className="text-[#5874A6] transition hover:text-[#45628F]"
																				>
																					<Pencil size={14} />
																				</button>
																			</td>

																			<td className="w-2/5 px-3 py-2 text-[15px] font-light text-[#2F5A43]">
																				RM {(transaction.price ?? 0).toFixed(2)}
																			</td>

																			<td className="w-3/5 px-3 py-2 text-[15px] font-light text-[#2F5A43]">
																				<div className="flex w-full items-center gap-2">
																					{transaction.receipt_url && (
																						<button
																							type="button"
																							onClick={() =>
																								setReceiptUrl(transaction.receipt_url)
																							}
																							className="text-[#5874A6] transition hover:text-[#45628F]"
																						>
																							<ImageIcon size={16} />
																						</button>
																					)}

																					<span>{transaction.payment_method ?? "-"}</span>
																				</div>
																			</td>
																		</tr>
																	))}
																</tbody>
															</table>
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)
					})}

          <div className="grid grid-cols-[120px_1fr_24px] border-t border-[#3A5D49] bg-[#F3F0EA] p-4 text-[15px] font-light text-[#2F5A43]">
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
          className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-[15px] font-light text-[#2F5A43]">
					Page {page} of {totalPages}
				</span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#2F5A43] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
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

			{editingTransaction && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
					onClick={() => setEditingTransaction(null)}
				>
					<div
						className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mb-6 flex items-center justify-between">
							<h2 className="text-[20px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
								Edit Transaction
							</h2>

							<button
								onClick={() => setEditingTransaction(null)}
								className="text-2xl font-bold text-gray-500 hover:text-black"
							>
								×
							</button>
						</div>

						<div className="space-y-4">

							<div className="flex items-center justify-between">
								<label className="text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
									Client Name:
								</label>

								<span>{editingTransaction.client_name}</span>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
									Coach:
								</label>

								<select
									value={editForm.added_by}
									onChange={(e) =>
										setEditForm({
											...editForm,
											added_by: e.target.value,
										})
									}
									className="w-[205px] rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-1.5 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
								>
									<option value="">Select Coach</option>

									{coaches.map((coach) => (
										<option key={coach.id} value={coach.id}>
											{coach.name}
										</option>
									))}
								</select>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">Transaction Name:</label>

								<input
									type="text"
									value={editForm.transaction_name}
									onChange={(e) =>
										setEditForm({
											...editForm,
											transaction_name: e.target.value,
										})
									}
									className="w-[205px] rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-1.5 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">Lessons Added:</label>

								<input
									type="number"
									value={editForm.lessons_added}
									onChange={(e) =>
										setEditForm({
											...editForm,
											lessons_added: Number(e.target.value),
										})
									}
									className="w-[205px] rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-1.5 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">Price:</label>

								<input
									type="number"
									value={editForm.price}
									onChange={(e) =>
										setEditForm({
											...editForm,
											price: Number(e.target.value),
										})
									}
									className="w-[205px] rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-1.5 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">Payment Method:</label>

								<select
									value={editForm.payment_method}
									onChange={(e) =>
										setEditForm({
											...editForm,
											payment_method: e.target.value,
										})
									}
									className="w-[205px] rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-2 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
								>
									<option>Cash</option>
									<option>Card</option>
									<option>Transfer</option>
									<option>E-wallet</option>
									<option>Free Lesson</option>
								</select>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">Purchase Date:</label>

								<input
									type="date"
									value={editForm.purchase_date}
									onChange={(e) =>
										setEditForm({
											...editForm,
											purchase_date: e.target.value,
										})
									}
									className="w-[205px] rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-1 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">Months:</label>

								<input
									type="number"
									min="0"
									value={editForm.months}
									onChange={(e) => {
										const months = e.target.value

										if (months === "") {
											setEditForm({
												...editForm,
												months: "",
											})
											return
										}

										const purchase = new Date(editForm.purchase_date)

										if (!isNaN(purchase.getTime())) {
											const expiration = new Date(purchase)
											expiration.setMonth(expiration.getMonth() + Number(months))

											setEditForm({
												...editForm,
												months,
												expiration_date: expiration.toISOString().slice(0, 10),
											})
										}
									}}
									className="w-[205px] rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-1.5 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-[13px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">Expiration Date:</label>

								<input
									type="date"
									value={editForm.expiration_date}
									onChange={(e) =>
										setEditForm({
											...editForm,
											expiration_date: e.target.value,
										})
									}
									className="w-[205px] rounded-2xl border border-[#3A5D49] bg-[#FCFAF6] px-4 py-1 text-[15px] font-light text-[#2F5A43] focus:border-[#2F5A43] focus:ring-[#2F5A43]/15"
								/>
							</div>

						</div>

						<div className="mt-8 flex justify-end gap-3">
							<button
								onClick={() => setShowDeleteConfirm(true)}
								className="rounded-lg bg-[#9D3E3E] px-4 py-2 text-[13px] font-light uppercase tracking-[0.08em] text-white transition hover:bg-[#9D3E3E]"
							>
								Delete
							</button>

							<button
								onClick={saveTransaction}
								className="rounded-lg bg-[#4E6FA8] px-4 py-2 text-[13px] font-light uppercase tracking-[0.08em] text-white transition hover:bg-[#4E6FA8]"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{showDeleteConfirm && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
					<div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
						<h3 className="text-xl font-bold">Delete Transaction?</h3>

						<p className="mt-3 text-gray-600">
							This action cannot be undone.
						</p>

						<div className="mt-6 flex justify-end gap-3">
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className="rounded-lg border px-4 py-2"
							>
								Cancel
							</button>

							<button
								onClick={deleteTransaction}
								className="rounded-lg bg-[#9D3E3E] px-4 py-2 text-[13px] font-light uppercase tracking-[0.08em] text-white transition hover:bg-[#9D3E3E]"
							>
								Delete
							</button>
						</div>
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