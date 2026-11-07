import assert from "node:assert/strict"
import { test } from "node:test"
import {
  EventSubmissionError,
  parseEventSubmission,
} from "./event_submission.ts"

const submission = {
  title: "Community gathering",
  category: "Community",
  year: 2026,
  month: "NOV",
  date: "7",
  time: "9:00 AM onward",
  location: "Scott Park",
  description: "Meet your neighbors.",
}

test("normalizes dates and text without requiring image or review metadata", () => {
  const details = parseEventSubmission({
    ...submission,
    title: "  Community gathering  ",
    month: "nov",
  })
  assert.equal(details.title, submission.title)
  assert.equal(details.date, "07")
  assert.equal(details.month, "NOV")
  assert.equal(details.day, "Saturday, November 7")
  assert.equal(details.image, "")
  assert.equal(details.sourceUrl, undefined)
})

test("rejects missing or invalid required fields", () => {
  for (const field of [
    "title",
    "category",
    "date",
    "month",
    "time",
    "location",
    "description",
  ]) {
    for (const value of [undefined, null, "   ", 12, {}]) {
      assert.throws(
        () => parseEventSubmission({ ...submission, [field]: value }),
        EventSubmissionError,
      )
    }
  }
  for (const value of [undefined, null, [], "event"]) {
    assert.throws(() => parseEventSubmission(value), EventSubmissionError)
  }
})

test("rejects impossible dates and accepts leap days", () => {
  for (const changes of [
    { month: "FEB", date: "29" },
    { month: "APR", date: "31" },
    { date: "00" },
    { date: "32" },
    { date: "1.5" },
    { month: "UNKNOWN" },
    { year: "2026" },
    { year: 2026.5 },
    { year: 0 },
    { year: 10000 },
  ]) {
    assert.throws(
      () => parseEventSubmission({ ...submission, ...changes }),
      EventSubmissionError,
    )
  }
  assert.equal(
    parseEventSubmission({
      ...submission,
      year: 2028,
      month: "FEB",
      date: "29",
    }).day,
    "Tuesday, February 29",
  )
})

test("accepts optional web URLs and rejects nonportable or unsafe schemes", () => {
  const details = parseEventSubmission({
    ...submission,
    sourceUrl: " https://example.com/event ",
    image: "https://example.com/event.jpg",
  })
  assert.equal(details.sourceUrl, "https://example.com/event")
  assert.equal(details.image, "https://example.com/event.jpg")
  for (const field of ["sourceUrl", "image"]) {
    for (const value of [
      "javascript:alert(1)",
      "blob:https://example.com/preview",
      "data:image/png;base64,abc",
      "not a URL",
      12,
    ]) {
      assert.throws(
        () => parseEventSubmission({ ...submission, [field]: value }),
        EventSubmissionError,
      )
    }
  }
})

test("discards client IDs, review fields, and inconsistent weekday labels", () => {
  const details = parseEventSubmission({
    ...submission,
    id: 101,
    status: "approved",
    submittedAt: "fake",
    reviewedAt: "fake",
    rejectionReason: "fake",
    day: "Incorrect weekday",
    extra: "ignored",
  })
  for (const field of [
    "id",
    "status",
    "submittedAt",
    "reviewedAt",
    "rejectionReason",
    "extra",
  ]) {
    assert.equal(field in details, false)
  }
  assert.equal(details.day, "Saturday, November 7")
})
