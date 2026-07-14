"use client"

import { useEffect, useMemo } from "react"
import jsPDF from "jspdf"

type PdfPreviewModalProps = {
  isOpen: boolean
  onClose: () => void
  doc: jsPDF | null
  filename: string
}

export default function PdfPreviewModal({
  isOpen,
  onClose,
  doc,
  filename,
}: PdfPreviewModalProps) {
  const pdfUrl = useMemo(() => {
    if (!doc) return null

    const blob = doc.output("blob")
    return URL.createObjectURL(blob)
  }, [doc])

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  if (!isOpen || !pdfUrl) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="flex h-full w-full flex-col overflow-hidden bg-white md:h-[95vh] md:max-w-6xl md:rounded-xl md:shadow-xl">

        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold">PDF Preview</h2>

          <button
            onClick={onClose}
            className="rounded border px-3 py-1 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

				<iframe
					src={pdfUrl}
					className="h-full w-full flex-1"
					title="PDF Preview"
				/>

        <div className="flex justify-end gap-3 border-t p-4">

					{!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
						<button
							onClick={() => {
								const frame = document.querySelector(
									'iframe[title="PDF Preview"]'
								) as HTMLIFrameElement | null

								frame?.contentWindow?.print()
							}}
							className="rounded-lg border px-4 py-2"
						>
							Print
						</button>
					)}

					<button
						onClick={() => {
							if (!doc) return

							const blob = doc.output("blob")
							const url = URL.createObjectURL(blob)

							const a = document.createElement("a")
							a.href = url
							a.download = filename
							a.click()

							URL.revokeObjectURL(url)
						}}
						className="rounded-lg bg-blue-600 px-4 py-2 text-white"
					>
						Download
					</button>

        </div>
      </div>
    </div>
  )
}