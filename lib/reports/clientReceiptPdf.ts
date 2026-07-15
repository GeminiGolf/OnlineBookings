import logo from "@/public/images/gemini-logo.png"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

export type ClientReceiptData = {
  clientName: string
  purchaseDate: string
  description: string
  price: number
}

export function generateClientReceiptPdf({
  clientName,
  purchaseDate,
  description,
  price,
}: ClientReceiptData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  })

  const formatAmount = (amount: number) =>
    `MYR ${amount.toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const image = new Image()
  image.src = logo.src

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Header line
  doc.setDrawColor(54, 125, 162)
  doc.setLineWidth(1)
  doc.line(40, 30, pageWidth - 40, 30)

  // Logo
  doc.addImage(image, "PNG", 60, 55, 120, 65)

  // Company
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Gemini Golf SDN BHD", 60, 130)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  doc.text(
    [
      "Block A Boulevard 51",
      "Jalan SS9A/18, Seksyen 51a",
      "Petaling Jaya",
      "Selangor, Malaysia",
    ],
    60,
    148
  )

  // Receipt title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text("Receipt", pageWidth - 180, 80)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  doc.text("Receipt No:", pageWidth - 180, 120)

  doc.text(
    `Date: ${format(new Date(purchaseDate), "dd/MM/yyyy")}`,
    pageWidth - 180,
    138
  )

  // Client
  doc.setFont("helvetica", "bold")
  doc.text("To:", 60, 220)

  doc.setFont("helvetica", "normal")
  doc.text(clientName, 85, 220)

  autoTable(doc, {
    startY: 250,

    margin: {
      left: 60,
      right: 60,
    },

    head: [["Date", "Description", "Price"]],

    body: [
      [
        format(new Date(purchaseDate), "dd/MM/yy"),
        description,
        formatAmount(price),
      ],
      [
        "",
        "Total",
        formatAmount(price),
      ],
    ],

    theme: "grid",

    headStyles: {
      fillColor: [54, 125, 162],
      textColor: [255, 255, 255],
    },

    columnStyles: {
      2: {
        halign: "right",
      },
    },

    didParseCell: (data) => {
      const isTotalRow =
        data.section === "body" &&
        data.row.index === 1

      if (isTotalRow) {
        data.cell.styles.fontStyle = "bold"
      }
    },
  })

  // Footer line
  doc.setDrawColor(54, 125, 162)
  doc.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40)

  return {
    doc,
    filename: `Receipt - ${clientName}.pdf`,
  }
}