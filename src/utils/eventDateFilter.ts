import type { CommunityEvent } from "../../supabase/functions/_shared/events"

export type EventDateFilter = "any" | "weekend" | "week" | "month"

export type EventDateRange = {
  start: Date
  end: Date
}

const monthIndexes: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
}

/** Local calendar dates, with an inclusive start and exclusive end. */
export function getEventDateRange(
  filter: EventDateFilter,
  now = new Date(),
): EventDateRange | null {
  if (filter === "any") return null
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  if (filter === "month") {
    start.setDate(1)
    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)
    return { start, end }
  }

  if (filter === "weekend") {
    // Sunday belongs to the weekend that began yesterday.
    start.setDate(
      start.getDate() +
        (start.getDay() === 0 ? -1 : (6 - start.getDay() + 7) % 7),
    )
  } else {
    start.setDate(start.getDate() + ((8 - start.getDay()) % 7 || 7))
  }
  const end = new Date(start)
  // Calendar arithmetic keeps local midnight correct across daylight saving changes.
  end.setDate(end.getDate() + (filter === "weekend" ? 2 : 7))
  return { start, end }
}

export function getEventDate(
  event: Pick<CommunityEvent, "year" | "month" | "date">,
): Date | null {
  const year = event.year ?? 2026
  const month = monthIndexes[event.month.toUpperCase()]
  const day = Number(event.date)
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999 ||
    month === undefined ||
    !/^\d{1,2}$/.test(event.date) ||
    day < 1 ||
    day > 31
  )
    return null

  const date = new Date(0)
  date.setFullYear(year, month, day)
  date.setHours(0, 0, 0, 0)
  return date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
    ? date
    : null
}

export function isEventInDateRange(
  event: Pick<CommunityEvent, "year" | "month" | "date">,
  range: EventDateRange | null,
): boolean {
  if (!range) return true
  const date = getEventDate(event)
  return date !== null && date >= range.start && date < range.end
}
