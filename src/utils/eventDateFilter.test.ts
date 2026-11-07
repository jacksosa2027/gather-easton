import assert from "node:assert/strict"
import { test } from "node:test"
import {
  getEventDate,
  getEventDateRange,
  isEventInDateRange,
  type EventDateFilter,
} from "./eventDateFilter.ts"

function bounds(filter: EventDateFilter, now: Date) {
  const range = getEventDateRange(filter, now)
  assert.ok(range)
  const parts = (date: Date) => [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ]
  return [parts(range.start), parts(range.end)]
}

test("any date has no range and range calculation does not mutate the clock", () => {
  const now = new Date(2026, 10, 7, 15, 30)
  const timestamp = now.getTime()
  assert.equal(getEventDateRange("any", now), null)
  getEventDateRange("weekend", now)
  assert.equal(now.getTime(), timestamp)
})

test("this weekend includes Saturday and Sunday, including the current weekend", () => {
  for (const now of [
    new Date(2026, 10, 2),
    new Date(2026, 10, 6, 23, 59),
    new Date(2026, 10, 7),
    new Date(2026, 10, 8, 23, 59),
  ]) {
    assert.deepEqual(bounds("weekend", now), [
      [2026, 11, 7, 0, 0],
      [2026, 11, 9, 0, 0],
    ])
  }
})

test("next week is the next Monday through Sunday, rather than the next seven days", () => {
  for (const now of [new Date(2026, 10, 7), new Date(2026, 10, 8)]) {
    assert.deepEqual(bounds("week", now), [
      [2026, 11, 9, 0, 0],
      [2026, 11, 16, 0, 0],
    ])
  }
  assert.deepEqual(bounds("week", new Date(2026, 10, 9)), [
    [2026, 11, 16, 0, 0],
    [2026, 11, 23, 0, 0],
  ])
  assert.deepEqual(bounds("week", new Date(2026, 11, 31)), [
    [2027, 1, 4, 0, 0],
    [2027, 1, 11, 0, 0],
  ])
})

test("calendar month ranges handle leap years and December rollover", () => {
  assert.deepEqual(bounds("month", new Date(2028, 1, 29)), [
    [2028, 2, 1, 0, 0],
    [2028, 3, 1, 0, 0],
  ])
  assert.deepEqual(bounds("month", new Date(2026, 11, 31)), [
    [2026, 12, 1, 0, 0],
    [2027, 1, 1, 0, 0],
  ])
})

test("weekend boundaries stay at local midnight across both daylight saving changes", () => {
  assert.deepEqual(bounds("weekend", new Date(2026, 2, 6)), [
    [2026, 3, 7, 0, 0],
    [2026, 3, 9, 0, 0],
  ])
  assert.deepEqual(bounds("weekend", new Date(2026, 9, 30)), [
    [2026, 10, 31, 0, 0],
    [2026, 11, 2, 0, 0],
  ])
})

test("range membership includes the last day and excludes the next day and wrong year", () => {
  const range = getEventDateRange("weekend", new Date(2026, 10, 7))
  for (const date of ["07", "08"])
    assert.equal(
      isEventInDateRange({ year: 2026, month: "NOV", date }, range),
      true,
    )
  for (const date of ["06", "09"])
    assert.equal(
      isEventInDateRange({ year: 2026, month: "NOV", date }, range),
      false,
    )
  assert.equal(
    isEventInDateRange({ year: 2027, month: "NOV", date: "07" }, range),
    false,
  )
  assert.equal(
    isEventInDateRange({ year: 2026, month: "NOV", date: "31" }, range),
    false,
  )
})

test("event dates use local midnight, retain legacy seed years, and reject invalid calendar dates", () => {
  const date = getEventDate({ month: "nov", date: "7" })
  assert.ok(date)
  assert.equal(date.getTime(), new Date(2026, 10, 7).getTime())
  assert.equal(getEventDate({ year: 2026, month: "FEB", date: "29" }), null)
  assert.equal(
    getEventDate({ year: 2028, month: "FEB", date: "29" })?.getDate(),
    29,
  )
  assert.equal(getEventDate({ year: 2026, month: "UNKNOWN", date: "07" }), null)
  assert.equal(getEventDate({ year: 2026, month: "NOV", date: "1.5" }), null)
  assert.equal(
    getEventDate({ year: 99, month: "JAN", date: "01" })?.getFullYear(),
    99,
  )
})
