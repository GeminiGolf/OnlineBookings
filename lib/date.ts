export function getMalaysiaDate() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const year = parts.find((p) => p.type === "year")!.value
  const month = parts.find((p) => p.type === "month")!.value
  const day = parts.find((p) => p.type === "day")!.value

  return `${year}-${month}-${day}`
}

export function getMalaysiaHour() {
  return Number(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Kuala_Lumpur",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  )
}

export function formatMalaysiaLessonReminder(
  lessonDate: string,
  lessonTime: string,
  coachName: string
) {
  const today = getMalaysiaDate()

  const dayText =
    lessonDate === today
      ? "today"
      : "tomorrow"

  const [hour] = lessonTime.split(":").map(Number)

  const displayHour =
    hour === 0
      ? 12
      : hour > 12
        ? hour - 12
        : hour

  const ampm = hour >= 12 ? "PM" : "AM"

  return `${displayHour} ${ampm} ${dayText} with ${coachName}`
}