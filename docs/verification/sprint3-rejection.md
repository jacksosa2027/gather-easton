# Sprint 3: rejection reason and public exclusion

**Checked:** November 7, 2026.

**Result:** Rejection with a reason passes on desktop and mobile using the current frontend and API source with isolated persistent test storage. Rejected events stayed out of the public API and calendar before rejection, immediately afterward, after reload, and in a fresh anonymous browser context. Hosted verification remains blocked because `GET /events/pending` returns `404`.

See [raw verification results](sprint3-rejection.json).

## Hosted availability check

Requested the configured staff queue with the app's existing public authorization header, without supplying or guessing a staff PIN:

- `GET /make-server-1f1ed1f9/events/pending` returned **404 Not Found**.
- The [preceding hosted submission check](sprint3-submission.md) created no test event because its submission request also returned `404`.
- No live rejection requests were sent. Hosted rejection and storage persistence are not marked as passed.

## Current-code browser check

Ran the actual Vite frontend in Chromium at desktop (1440 × 1000) and mobile/touch (390 × 844) sizes, with browser time fixed at November 7, 2026, noon in `America/New_York`.

All Supabase requests were intercepted and dispatched to the current Hono function source. Only the KV adapter was replaced with isolated JSON-file storage. The desktop target was a copy of the pending privacy control from the [approval verification](sprint3-approval.md); the mobile target was created through the current submission API in that isolated store. No hosted records were modified. This checks the UI, API helper, PIN middleware, review routes, and public filtering, but does not exercise the hosted Supabase gateway or database.

| Check | Desktop | Mobile |
| --- | --- | --- |
| Unlock staff review and locate the pending target | Pass | Pass |
| Block an empty rejection reason without sending a request | Pass | Pass |
| Block a whitespace-only reason with an actionable error and no request | Pass | Pass |
| Cancel rejection without changing the event or sending a request | Pass | Pass |
| Reject with a reason, sending exactly one request and receiving `200` | Pass | Pass |
| Persist `rejected`, the trimmed reason, and `reviewedAt` | Pass | Pass |
| Preserve `submittedAt` and the optional source URL | Pass | Pass |
| Remove the target from the pending queue and show rejection confirmation | Pass | Pass |
| Exclude the target from the public API and calendar before and after rejection | Pass | Pass |
| Retain rejection and reason after recreating the API instance and reloading the page | Pass | Pass |
| Keep the target out of the staff queue after reload | Pass | Pass |
| Keep the target off the calendar in a fresh context with no staff PIN | Pass | Pass |
| Leave existing approved events publicly visible | Pass | Pass |
| Reject a later attempt to approve the rejected record with `409`, preserving its rejection | Pass | Pass |
| Uncaught browser errors | None | None |

Calendar absence was checked in the target's actual month with matching search, category, and date filters. An approved control was visible before applying the search, and the public API retained the same approved IDs throughout. This rules out an empty feed or mismatched filters as the cause of the target's absence.

No runtime fixes were needed during this check.

## Required hosted follow-up

Resolve the hosted route mismatch by checking/deploying the current [server function](../../supabase/functions/server/index.tsx) and its shared types and helper modules to the project configured in the frontend. Configure `STAFF_PIN` as described in the [README](../../README.md#staff-api-pin).

Create a uniquely named pending test event through the hosted submission endpoint, unlock staff review, reject that event with a reason, then reload and check the pending queue, public API, and calendar from a fresh browser session. Confirm the stored record retains `rejected`, its reason, and its review timestamp. That hosted walkthrough remains outstanding.
