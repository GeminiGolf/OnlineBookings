"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

type Lesson = {
  id: number
  lesson_date: string
  lesson_notes: string | null
  lesson_package_id: number | null
  payment_method: string | null
}

type Props = {
  lessons: Lesson[]
}

export default function PreviousLessonsTable({ lessons }: Props) {
  const [page, setPage] = useState(1)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [noteText, setNoteText] = useState("")

  const lessonsPerPage = 5

  const totalPages = Math.max(
    1,
    Math.ceil(lessons.length / lessonsPerPage)
  )

  const paginatedLessons = lessons.slice(
    (page - 1) * lessonsPerPage,
    page * lessonsPerPage
  )

  async function saveNote(lessonId: number) {
    const { error } = await supabase
      .from("bookings")
      .update({
        lesson_notes: noteText,
      })
      .eq("id", lessonId)

    if (!error) {
      setSelectedLesson(null)
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Notes</th>
            </tr>
          </thead>

          <tbody>
            {paginatedLessons.map((lesson) => {
              const formattedDate = new Date(
                lesson.lesson_date
              ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })

              const method =
                lesson.lesson_package_id
                  ? "Package"
                  : lesson.payment_method || "Other"

              return (
                <tr key={lesson.id} className="border-b">
                  <td className="p-3">{formattedDate}</td>

                  <td className="p-3">{method}</td>

                  <td className="p-3">
                    <button
                      onClick={() => {
                        setSelectedLesson(lesson)
                        setNoteText(lesson.lesson_notes || "")
                      }}
                      className="rounded px-2 py-1 text-lg hover:bg-gray-100"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          onClick={() =>
            setPage((p) => Math.max(1, p - 1))
          }
          disabled={page === 1}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() =>
            setPage((p) => Math.min(totalPages, p + 1))
          }
          disabled={page === totalPages}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-2xl font-bold">
              Lesson Notes
            </h3>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={10}
              className="w-full rounded-lg border p-3"
              placeholder="Lesson notes..."
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLesson(null)}
                className="rounded border px-4 py-2"
              >
                Close
              </button>

              <button
                onClick={() => saveNote(selectedLesson.id)}
                className="rounded bg-green-600 px-4 py-2 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}