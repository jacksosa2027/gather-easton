import type { CommunityEvent } from "../_shared/events.ts"

type EventDetails = Omit<CommunityEvent, "id" | "status" | "submittedAt" | "reviewedAt" | "rejectionReason">

export class EventSubmissionError extends Error {}

function optionalString(
  input: Record<string, unknown>,
  field: string,
): string | undefined {
  const value = input[field]
  if (value === undefined) return undefined
  if (typeof value !== "string") {
    throw new EventSubmissionError(`${field} must be a string`)
  }
  return value.trim() || undefined
}

function requiredString(input: Record<string, unknown>, field: string): string {
  const value = optionalString(input, field)
  if (!value) throw new EventSubmissionError(`${field} is required`)
  return value
}

function optionalUrl(
  input: Record<string, unknown>,
  field: string,
): string | undefined {
  const value = optionalString(input, field)
  if (!value) return undefined

  try {
    const url = new URL(value)
    if (url.protocol === "http:" || url.protocol === "https:") return value
  } catch {
    // Report the same validation error for malformed and unsupported URLs.
  }
  throw new EventSubmissionError(`${field} must be an http or https URL`)
}

export function parseEventSubmission(input: unknown): EventDetails {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new EventSubmissionError("Request body must be an event object")
  }
  const fields = input as Record<string, unknown>
  const title = requiredString(fields, "title")
  const category = requiredString(fields, "category")
  const time = requiredString(fields, "time")
  const location = requiredString(fields, "location")
  const description = requiredString(fields, "description")
  const month = requiredString(fields, "month").toUpperCase()
  const date = requiredString(fields, "date").padStart(2, "0")
  const year = fields.year
  const monthIndex = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ].indexOf(month)

  if (
    typeof year !== "number" ||
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999
  ) {
    throw new EventSubmissionError("year must be an integer between 1 and 9999")
  }
  if (monthIndex === -1 || !/^\d{2}$/.test(date)) {
    throw new EventSubmissionError(
      "Provide a valid month and day-of-month date",
    )
  }
  const eventDate = new Date(
    `${String(year).padStart(4, "0")}-${String(monthIndex + 1).padStart(2, "0")}-${date}T12:00:00Z`,
  )
  if (
    !Number.isFinite(eventDate.getTime()) ||
    eventDate.getUTCFullYear() !== year ||
    eventDate.getUTCMonth() !== monthIndex ||
    eventDate.getUTCDate() !== Number(date)
  ) {
    throw new EventSubmissionError("Provide a valid calendar date")
  }

  const sourceUrl = optionalUrl(fields, "sourceUrl")
  return {
    title,
    category,
    year,
    date,
    month,
    day: eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }),
    time,
    location,
    description,
    image: optionalUrl(fields, "image") ?? "",
    alt: optionalString(fields, "alt") ?? `${title} in Easton`,
    ...(sourceUrl ? { sourceUrl } : {}),
  }
}
