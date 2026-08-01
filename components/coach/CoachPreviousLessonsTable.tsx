"use client"

import { useMemo, useState } from "react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import { supabase } from "@/lib/supabaseClient"
import "react-day-picker/dist/style.css"

type Lesson = {
  id: number
  lesson_date: string
  lesson_time: string
  lesson_notes: string | null
  clients: {
    id: number
    first_name: string
    last_name: string
    preferred_name: string | null
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
  const [noteText, setNoteText] = useState("")
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const clientName = [
        lesson.clients?.preferred_name,
        lesson.clients?.first_name,
        lesson.clients?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const phone = lesson.clients?.phone?.toLowerCase() || ""
      const searchText = search.toLowerCase()
      const matchesSearch = !search || clientName.includes(searchText) || phone.includes(searchText)
      const lessonDate = lesson.lesson_date
      const matchesFrom = !fromDate || lessonDate >= fromDate
      const matchesTo = !toDate || lessonDate <= toDate
      return matchesSearch && matchesFrom && matchesTo
    })
  }, [lessons, search, fromDate, toDate])

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

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / lessonsPerPage))
  const paginatedLessons = filteredLessons.slice((page - 1) * lessonsPerPage, page * lessonsPerPage)
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-3 text-[22px] font-light uppercase tracking-[0.12em] text-[#2F5A43]">
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
          className="w-[95px] sm:w-[180px] rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[15px] font-light text-[#1F3327] placeholder:text-[#6D7F72] shadow-sm focus:border-[#2F5A43] focus:outline-none"
        />

        <div className="flex gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowStartCalendar(!showStartCalendar)
                setShowEndCalendar(false)
              }}
              className="rounded-xl border-2 border-[#3A5D49] bg-[#35684C] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#2F5A43]"
            >
              {fromDate ? format(new Date(fromDate), "dd/MM/yy") : (
                <>
                  <span className="sm:hidden">Start</span>
                  <span className="hidden sm:inline">Start Date</span>
                </>
              )}
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
              className="rounded-xl border-2 border-[#7F2E2E] bg-[#9B3B3B] px-4 py-2 text-[15px] font-light text-white shadow-sm hover:bg-[#842F2F]"
            >
              {toDate ? format(new Date(toDate), "dd/MM/yy") : (
                <>
                  <span className="sm:hidden">End</span>
                  <span className="hidden sm:inline">End Date</span>
                </>
              )}
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

      <div className="hidden overflow-hidden rounded-3xl border border-[#3A5D49] shadow-md md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#3A5D49] bg-[#F3F0EA]">
              <th className="dashboard-label p-4 text-left">Date</th>
              <th className="dashboard-label p-4 text-left">Client Name</th>
              <th className="dashboard-label p-4 text-left">Lesson Notes</th>
            </tr>
          </thead>

          <tbody>
            {paginatedLessons.map((lesson) => (
              <tr
                key={lesson.id}
                className="border-b border-[#3A5D49] hover:bg-[#F6FAF6]"
              >
                <td className="p-4 text-[15px] font-light text-[#2F5A43]">
                  {new Date(lesson.lesson_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </td>

                <td className="p-4 text-[15px] font-light text-[#2F5A43]">
                  {lesson.clients ? (
                    <a
                      href={`/coach/clients/${lesson.clients.id}`}
                      className="text-[#2F5A43] underline decoration-[#2F5A43] underline-offset-2 hover:text-[#2F5A43]"
                    >
                      {lesson.clients.preferred_name
                        ? `(${lesson.clients.preferred_name}) `
                        : ""}
                      {lesson.clients.first_name} {lesson.clients.last_name}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => {
                      setSelectedLesson(lesson)
                      setNoteText(lesson.lesson_notes || "")
                    }}
                    className="rounded px-2 py-1 text-base hover:bg-gray-100"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        <div className="mb-2 grid grid-cols-[120px_1fr_24px] px-4 text-sm font-semibold">
          <div>Date</div>
          <div className="-ml-4">Client Name</div>
          <div />
        </div>

        <div className="space-y-2">
          {paginatedLessons.map((lesson) => (
            <div key={lesson.id} className="rounded-xl border border-[#3A5D49] bg-white">
              <button
                onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
                className="dashboard-value grid w-full grid-cols-[120px_1fr_24px] items-center gap-3 p-4 text-left"
              >
                <span>
                  {new Date(lesson.lesson_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </span>
                <span className="-ml-8 text-left">
                  {lesson.clients ? (
                    <a
                      href={`/coach/clients/${lesson.clients.id}`}
                      className="dashboard-value text-[#5874A6] underline decoration-[#5874A6] underline-offset-2 hover:text-[#45628F]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lesson.clients.preferred_name
                        ? `(${lesson.clients.preferred_name}) `
                        : ""}
                      {lesson.clients.first_name} {lesson.clients.last_name}
                    </a>
                  ) : (
                    "-"
                  )}
                </span>
                <span>{expandedId === lesson.id ? "▲" : "▼"}</span>
              </button>

              {expandedId === lesson.id && (
                <div className="border-t p-3 text-sm">
                  <p>
                    <strong>Time:</strong> {lesson.lesson_time}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <strong>Notes</strong>

                    <button
                      onClick={() => {
                        setSelectedLesson(lesson)
                        setNoteText(lesson.lesson_notes || "")
                      }}
                      className="rounded px-2 py-1 text-base hover:bg-gray-100"
                    >
                      ✏️
                    </button>
                  </div>

                  <p className="mt-2">{lesson.lesson_notes || "No notes"}</p>
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
          className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#1F3327] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
        >
          Previous
        </button>

        <span className="dashboard-value">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-xl border border-[#3A5D49] bg-white px-4 py-2 text-[13px] font-light tracking-[0.04em] text-[#1F3327] shadow-sm transition hover:bg-[#F6FAF6] disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-2xl font-bold">Lesson Notes</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={10}
              className="w-full rounded-lg border p-3"
              placeholder="Lesson notes..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSelectedLesson(null)} className="rounded border px-4 py-2">
                Close
              </button>

              <button onClick={() => saveNote(selectedLesson.id)} className="rounded bg-green-600 px-4 py-2 text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
