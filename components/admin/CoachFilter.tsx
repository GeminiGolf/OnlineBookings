"use client"

import { useEffect, useRef, useState } from "react"

type Coach = {
  id: number
  name: string
}

type CoachFilterProps = {
  coaches: Coach[]
  onChange?: (selectedCoachIds: number[]) => void
}

export default function CoachFilter({
  coaches,
  onChange,
}: CoachFilterProps) {
  const [open, setOpen] = useState(false)

  const [selectedCoachIds, setSelectedCoachIds] = useState<number[]>(
    coaches.map((coach) => coach.id)
  )

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
  }, [])

  useEffect(() => {
    onChange?.(selectedCoachIds)
  }, [selectedCoachIds, onChange])

  const allSelected =
    selectedCoachIds.length === coaches.length

  function toggleAll() {
    if (allSelected) {
      setSelectedCoachIds([])
    } else {
      setSelectedCoachIds(coaches.map((coach) => coach.id))
    }
  }

  function toggleCoach(id: number) {
    if (selectedCoachIds.includes(id)) {
      setSelectedCoachIds(
        selectedCoachIds.filter((coachId) => coachId !== id)
      )
    } else {
      setSelectedCoachIds([
        ...selectedCoachIds,
        id,
      ])
    }
  }

  let buttonText = "All Coaches"

  if (!allSelected) {
    buttonText =
      selectedCoachIds.length === 1
        ? "1 Coach"
        : `${selectedCoachIds.length} Coaches`
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-2xl border border-[#3A5D49] bg-white px-4 py-2 text-[15px] font-light text-[#2F5A43] shadow-sm hover:bg-[#F6FAF6]"
      >
        {buttonText} ▼
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-72 rounded-3xl border border-[#3A5D49] bg-white shadow-md">
          <div className="max-h-72 overflow-y-auto p-3">

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl p-3 hover:bg-[#F6FAF6]">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 accent-[#2F5A43]"
              />
              <span className="dashboard-value">
                All Coaches
              </span>
            </label>

            <hr className="my-2 border-[#3A5D49]" />

            {coaches.map((coach) => (
              <label
                key={coach.id}
                className="flex cursor-pointer items-center gap-3 rounded-2xl p-3 hover:bg-[#F6FAF6]"
              >
                <input
                  type="checkbox"
                  checked={selectedCoachIds.includes(
                    coach.id
                  )}
                  onChange={() =>
                    toggleCoach(coach.id)
                  }
                  className="h-4 w-4 accent-[#2F5A43]"
                />

                <span className="dashboard-value">{coach.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}