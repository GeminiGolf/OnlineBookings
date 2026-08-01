"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Lesson = {
  id: number
  lesson_date: string
  lesson_notes: string | null
  lesson_package_id: number | null
  payment_method: string | null
  lesson_packages?: {
    id: number
    transaction_name: string | null
  } | null
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
      <div className="overflow-hidden rounded-2xl border border-[#3A5D49]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#3A5D49] bg-[#F3F0EA]">
              <th className="dashboard-label px-4 py-4 text-left align-middle">
                Date
              </th>

              <th className="dashboard-label px-4 py-4 text-left align-middle">
                Method
              </th>

              <th className="dashboard-label px-4 py-4 text-left align-middle">
                Notes
              </th>
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
                lesson.lesson_packages?.transaction_name ||
                lesson.payment_method ||
                "Other"

              return (
                <tr
                  key={lesson.id}
                  className="hover:bg-[#F6FAF6]"
                >
                  <td className="dashboard-value p-4">{formattedDate}</td>
                  <td className="dashboard-value p-4">{method}</td>
                  <td className="dashboard-value p-4">
                    <button
                      onClick={() => {
                        setSelectedLesson(lesson)
                        setNoteText(lesson.lesson_notes || "")
                      }}
                      className="rounded-xl border border-[#4E6FA8] bg-[#4E6FA8] px-3 py-1.5 text-[14px] font-light text-white shadow-sm transition hover:bg-[#3F5E92]"
                    >
                      View Note
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
          className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#1F3327] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
        >
          Previous
        </button>

        <span className="dashboard-value">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() =>
            setPage((p) => Math.min(totalPages, p + 1))
          }
          disabled={page === totalPages}
          className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#1F3327] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
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