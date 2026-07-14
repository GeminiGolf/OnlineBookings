import logo from "@/public/images/gemini-logo.png"
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

	const image = new Image()
	image.src = logo.src



	doc.setFontSize(9)
	doc.setTextColor(40, 40, 40)

	doc.text(
		[
			"Attention: Rebecca Eng",
			"Flagstick Venture",
			"Block A Boulevard 51",
			"Jalan SS9A/18, Seksyen 51a",
			"Petaling Jaya",
			"Selangor, Malaysia",
			"",
			"Golf lessons",
		],
		400,
		70
	)
	
	doc.text(`Date: ${dateRange}`, 80, 160)

  autoTable(doc, {
    startY: 170,

		margin: {
			top: 180,
			left: 80,
			right: 80,
			bottom: 100,
		},

		tableWidth: "auto",

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
			fillColor: [54, 125, 162],
			textColor: [255, 255, 255],
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

		didDrawPage: () => {
			const pageWidth = doc.internal.pageSize.getWidth()
			const pageHeight = doc.internal.pageSize.getHeight()

			// Logo
			doc.addImage(image, "PNG", 70, 65, 120, 65)

			// Brand blue
			doc.setDrawColor(54, 125, 162)
			doc.setLineWidth(1)

			// Top line
			doc.line(40, 30, pageWidth - 40, 30)

			// Bottom line
			doc.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40)

			// Page number
			doc.setFontSize(9)
			doc.text(
				`${doc.getCurrentPageInfo().pageNumber}`,
				pageWidth - 40,
				pageHeight - 15,
				{
					align: "right",
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

	return {
		doc,
		filename,
	}
}