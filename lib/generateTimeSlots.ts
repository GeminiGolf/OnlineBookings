export function generateTimeSlots(
  startTime: string,
  endTime: string
) {

  const slots = []

  const start =
    parseInt(startTime.split(":")[0])

  const end =
    parseInt(endTime.split(":")[0])

  for (
    let hour = start;
    hour < end;
    hour++
  ) {

    slots.push(
      `${hour
        .toString()
        .padStart(2, "0")}:00`
    )
  }

  return slots
}