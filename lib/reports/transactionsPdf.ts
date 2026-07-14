import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

export type PdfTransaction = {
  purchase_date: string | null
  coach_name: string
  price: number | null
}

type GenerateTransactionsPdfOptions = {
  transactions: PdfTransaction[]
  startDate: string
  endDate: string
}

export function generateTransactionsPdf({
  transactions,
  startDate,
  endDate,
}: GenerateTransactionsPdfOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  })

	const generatedAt = format(new Date(), "dd MMM yyyy HH:mm")

	const formatAmount = (amount: number) =>
		`RM ${amount.toLocaleString("en-MY", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`

  let dateRange = "All Dates"

  if (startDate && endDate) {
    if (startDate === endDate) {
      dateRange = format(new Date(startDate), "dd MMM yyyy")
    } else {
      dateRange = `${format(
        new Date(startDate),
        "dd MMM yyyy"
      )} to ${format(new Date(endDate), "dd MMM yyyy")}`
    }
  } else if (startDate) {
    dateRange = `From ${format(new Date(startDate), "dd MMM yyyy")}`
  } else if (endDate) {
    dateRange = `Until ${format(new Date(endDate), "dd MMM yyyy")}`
  }

  const sortedTransactions = transactions
    .map((transaction, index) => ({
      ...transaction,
      index,
    }))
    .sort((a, b) => {
      const dateCompare = (a.purchase_date ?? "").localeCompare(
        b.purchase_date ?? ""
      )

      if (dateCompare !== 0) return dateCompare

      const coachCompare = a.coach_name.localeCompare(b.coach_name)

      if (coachCompare !== 0) return coachCompare

      return a.index - b.index
    })

	let previousDate = ""

	const body: string[][] = []

	sortedTransactions.forEach((transaction, index) => {
		const date = transaction.purchase_date ?? ""

		const displayDate =
			date !== previousDate
				? format(new Date(date), "dd/MM/yyyy")
				: ""

		previousDate = date

		body.push([
			displayDate,
			transaction.coach_name.split(" ")[0],
			formatAmount(transaction.price ?? 0),
		])

		const nextTransaction = sortedTransactions[index + 1]

		if (
			nextTransaction &&
			nextTransaction.purchase_date !== transaction.purchase_date
		) {
			body.push(["", "", ""])
		}
	})

  const total = sortedTransactions.reduce(
    (sum, transaction) => sum + (transaction.price ?? 0),
    0
  )
	const logo = new Image()
	logo.src = "/images/gemini-logo.png"

	logo.onload = () => {
		// generate the PDF here
	}
  doc.setFontSize(18)
  doc.text("Gemini Golf Academy", 40, 40)

  doc.setFontSize(14)
  doc.text("Transactions Report", 40, 65)

  doc.setFontSize(10)
  doc.text(`Generated: ${generatedAt}`, 40, 85)
  doc.text(`Date Range: ${dateRange}`, 40, 100)

  autoTable(doc, {
    startY: 120,

    head: [["Date", "Coach", "Amount"]],

		body: [
			...body,
			["", "", ""], // Blank row before Total
			[
				"",
				"Total",
				formatAmount(total),
			],
		],

		didParseCell: (data) => {
			const isTotalRow =
				data.section === "body" &&
				data.row.index === data.table.body.length - 1

			if (isTotalRow) {
				data.cell.styles.fontStyle = "bold"
				data.cell.styles.lineWidth = 1
			}
		},

    theme: "grid",

    headStyles: {
      fillColor: [33, 150, 83],
      halign: "left",
    },

    columnStyles: {
      2: {
        halign: "right",
      },
    },

    footStyles: {
      fontStyle: "bold",
    },

    didDrawPage: (data) => {
      const pageSize = doc.internal.pageSize

      const width = pageSize.getWidth()
      const height = pageSize.getHeight()

      doc.setFontSize(9)

      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        width / 2,
        height - 20,
        {
          align: "center",
        }
      )
    },
  })

  let filename = "Transactions.pdf"

  if (startDate && endDate) {
    if (startDate === endDate) {
      filename = `Transactions - ${format(
        new Date(startDate),
        "MMMM yyyy"
      )}.pdf`
    } else {
      filename = `Transactions - ${format(
        new Date(startDate),
        "dd MMM yyyy"
      )} to ${format(
        new Date(endDate),
        "dd MMM yyyy"
      )}.pdf`
    }
  }

	const blobUrl = doc.output("bloburl")
	window.open(blobUrl, "_blank")
}