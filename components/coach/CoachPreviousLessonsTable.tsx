"use client"

import { useMemo, useState } from "react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import "react-day-picker/dist/style.css"

type Lesson = {
  id: number
  lesson_date: string
  lesson_time: string
  lesson_notes: string | null
  clients: {
    id: number
    name: string
    phone: string | null
  } | null
}

type Props = {
  lessons: Lesson[]
}

export default function CoachPreviousLessonsTable({ lessons }: Props) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const lessonsPerPage = 10
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const clientName = lesson.clients?.name?.toLowerCase() || ""
      const phone = lesson.clients?.phone?.toLowerCase() || ""
      const searchText = search.toLowerCase()
      const matchesSearch = !search || clientName.includes(searchText) || phone.includes(searchText)
      const lessonDate = lesson.lesson_date
      const matchesFrom = !fromDate || lessonDate >= fromDate
      const matchesTo = !toDate || lessonDate <= toDate
      return matchesSearch && matchesFrom && matchesTo
    })
  }, [lessons, search, fromDate, toDate])

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / lessonsPerPage))
  const paginatedLessons = filteredLessons.slice((page - 1) * lessonsPerPage, page * lessonsPerPage)
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-[22px] font-bold">
        Previous Lessons
      </h1>
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

        <div className="flex gap-3">
          <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowStartCalendar(!showStartCalendar)
              setShowEndCalendar(false)
            }}
            className="rounded-lg border border-black bg-green-100 px-4 py-2 text-black hover:bg-green-200"
          >
            {fromDate
              ? format(new Date(fromDate), "dd MMM yyyy")
              : "Start Date"}
          </button>

          {showStartCalendar && (
            <div className="absolute z-50 mt-2 rounded-lg border bg-white p-2 shadow-lg">
              <div className="overflow-hidden">
                <DayPicker
                  className="-mb-4 scale-90 origin-top"
                  mode="single"
                  selected={fromDate ? new Date(fromDate) : undefined}
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        setFromDate("")
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

                    setFromDate(date.toISOString().split("T")[0])
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
            className="rounded-lg border border-black bg-red-100 px-4 py-2 text-black hover:bg-red-200"
          >
            {toDate
              ? format(new Date(toDate), "dd MMM yyyy")
              : "End Date"}
          </button>

          {showEndCalendar && (
          <div className="absolute z-50 mt-2 rounded-lg border bg-white p-2 shadow-lg">
            <div className="overflow-hidden">
              <DayPicker
                className="-mb-4 scale-90 origin-top"
                mode="single"
                selected={toDate ? new Date(toDate) : undefined}
                footer={
                  <button
                    type="button"
                    onClick={() => {
                      setToDate("")
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

                  setToDate(date.toISOString().split("T")[0])
                  setPage(1)
                  setShowEndCalendar(false)
                }}
              />
            </div>
          </div>
          )}
        </div>
    </div>
</div>

      <div className="hidden md:block overflow-hidden rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Client Name</th>
              <th className="p-3 text-left">Lesson Notes</th>
            </tr>
          </thead>

          <tbody>
            {paginatedLessons.map((lesson) => (
              <tr key={lesson.id} className="border-b">
                <td className="p-3">
                  {new Date(lesson.lesson_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </td>
                <td className="p-3">{lesson.clients?.name || "-"}</td>
                <td className="p-3">
                  {lesson.lesson_notes ? (
                    <button
                      onClick={() => {
                        setSelectedLesson(lesson)
                      }}
                      className="rounded px-2 py-1 text-base hover:bg-gray-100"
                    >
                      ✏️
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        <div className="mb-2 grid grid-cols-[120px_1fr_24px] px-4 text-sm font-semibold">
          <div>Date</div>
          <div>Client Name</div>
          <div />
        </div>

        <div className="space-y-2">
          {paginatedLessons.map((lesson) => (
            <div key={lesson.id} className="rounded-lg border bg-white">
              <button
                onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
                className="grid w-full grid-cols-[120px_1fr_24px] items-center gap-3 p-3 text-left"
              >
                <span>
                  {new Date(lesson.lesson_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </span>
                <span className="text-left">
                  {lesson.clients?.name}
                </span>
                <span>{expandedId === lesson.id ? "▲" : "▼"}</span>
              </button>

              {expandedId === lesson.id && (
                <div className="border-t p-3 text-sm">
                  <p>
                    <strong>Time:</strong> {lesson.lesson_time}
                  </p>
                  <p className="mt-2">
                    <strong>Notes:</strong> {lesson.lesson_notes || "No notes"}
                  </p>
                </div>
              )}
            </div>
          ))}
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

      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-2xl font-bold">Lesson Notes</h3>
            <textarea
              value={selectedLesson.lesson_notes || ""}
              readOnly
              rows={10}
              className="w-full rounded-lg border p-3"
            />
            <div className="mt-4 flex justify-end">
              <button onClick={() => setSelectedLesson(null)} className="rounded border px-4 py-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
