# Sprint 3: calendar browsing verification

**Checked:** November 7, 2026.

**Result:** Local browser interactions pass. The configured hosted API does not yet match the review-status contract, so live API-backed browsing needs another check after the function deployment is updated.

## Browser coverage

Ran Playwright against the actual Vite app in Chromium, using desktop (1440 × 1000), mobile (390 × 844, touch), and tablet (900 × 1000) viewports. Browser date was fixed at November 7, 2026, noon in `America/New_York` for repeatable relative-date checks.

The interaction checks used controlled API responses with approved, pending, and rejected fixtures. A separate request exercised the configured hosted Supabase API without mocking it. See [raw browser results](sprint3-browse.json).

| Check | Result |
| --- | --- |
| Render approved events and hide pending/rejected events | Pass, desktop and mobile |
| Browse previous/next month, October–January, including year rollover | Pass, desktop and mobile |
| Display an empty month and recover through navigation | Pass, desktop and mobile |
| Search by title or venue, case-insensitively | Pass, desktop and mobile |
| Combine category and search filters, show no results, reset filters | Pass, desktop and mobile |
| Combine When with search; select weekend/week and clear the date filter | Pass, desktop and mobile |
| Open details with name, full date/year, time, venue, and optional source link | Pass, desktop and mobile |
| Open details by keyboard, keep Tab focus inside, close with Escape, return focus | Pass after fixes, desktop and mobile |
| Close details using Close or the backdrop | Pass, desktop and mobile |
| Keep the page within viewport width; scroll the calendar horizontally on mobile | Pass |
| Open/close mobile navigation; collapse header at tablet width | Pass |
| Uncaught browser errors | None |

Screenshots of the calendar and event details were also inspected at desktop and mobile sizes.

## Issues fixed during verification

In [App.tsx](../../src/App.tsx):

- Opening event details left focus on the calendar behind the modal. The dialog now focuses Close, contains keyboard focus, locks background scrolling, and restores focus when dismissed.
- Escape did not close event details. It now dismisses the dialog.
- A successful HTTP response containing legacy events without `status` replaced the approved fallback data, reducing the visible November calendar to four initial events. Such a response now preserves the approved fallback and displays the calendar refresh error. Legacy events are never implicitly approved.

## Hosted API mismatch

The configured public `GET /events` returned HTTP `200` with **51 events, all missing `status`**. That response is incompatible with the current server implementation, which should migrate seed events to `approved` and return approved-only records.

With the frontend guard in place, the same live response leaves **34 approved fallback events** visible in November and shows the refresh warning. This verifies the fallback behavior; it does not verify the hosted event feed as current.

Check/deploy the current [server function](../../supabase/functions/server/index.tsx), including its shared types and helper modules, to the project used by the frontend. Then rerun the hosted read and confirm returned events have `status: "approved"` and the warning clears.

Live submission persistence and staff approval/rejection remain separate verification steps. This browsing check made no submission or moderation requests.
