# Sprint 3: staff unlock, approval, and public visibility

**Checked:** November 7, 2026.

**Result:** The current implementation passes the PIN → pending queue → approval → public calendar flow on desktop and mobile with isolated persistent test storage. Hosted verification remains blocked because `GET /events/pending` returns `404`.

See [raw verification results](sprint3-approval.json).

## Hosted availability check

Requested the configured staff queue using the app's existing public authorization header, without supplying or guessing a staff PIN:

- `GET /make-server-1f1ed1f9/events/pending` returned **404 Not Found**.
- The [preceding hosted submission check](sprint3-submission.md) also returned `404`, so it created no pending test event to approve.
- No live approval requests were sent. Hosted PIN validation, approval persistence, and publication are not marked as passed.

## Current-code browser check

Ran the actual Vite frontend in Chromium at desktop (1440 × 1000) and mobile/touch (390 × 844) sizes. Browser date was fixed at November 7, 2026, noon in `America/New_York`.

All Supabase requests were intercepted and dispatched to the current Hono function source. The KV adapter used a temporary JSON file containing copies of the pending records created during the submission verification. This exercises the UI, API helper, PIN middleware, and review routes; it does not exercise the hosted Supabase gateway or database.

Only those isolated test records were approved. A separate pending control record was kept private throughout.

| Check | Desktop | Mobile |
| --- | --- | --- |
| Keep the queue hidden before a successful PIN check | Pass | Pass |
| Reject the deliberately incorrect test PIN with `401` and show an error | Pass | Pass |
| Accept the configured isolated test PIN with `200` and display the pending queue | Pass | Pass |
| Remember the PIN in the tab and revalidate on reopening | Pass | Pass |
| Approve the existing pending test record with `200` | Pass | Pass |
| Save `approved` and `reviewedAt`, preserving submission time and source | Pass | Pass |
| Remove the approved record from the pending queue and show confirmation | Pass | Pass |
| Refresh the public API and render the approved event without page navigation | Pass; 0 navigations | Pass; 0 navigations |
| Preserve month, search, category, and When selection | Pass | Pass |
| Open the newly published event and verify its date, time, venue, and optional source | Pass | Pass |
| Clear saved access with **Lock staff review** | Pass | Pass |
| Retain approval after recreating the API instance and reloading the page | Pass | Pass |
| Display the event in a fresh public browser context without a staff PIN | Pass | Pass |
| Keep the other pending control out of the public API/calendar | Pass | Pass |
| Uncaught browser errors | None | None |

The public-calendar checks used the event's actual month with matching search/category/date filters. A document marker and navigation counter confirmed the approval update happened in the existing page. The follow-up public read carried no staff PIN. Mobile checks scrolled the calendar to the published event and confirmed it was inside the viewport.

No runtime fixes were needed during this check.

## Required hosted follow-up

Check/deploy the current [server function](../../supabase/functions/server/index.tsx), its shared types, and helper modules to the project used by the frontend. Configure `STAFF_PIN` as described in the [README](../../README.md#staff-api-pin), then create a uniquely named pending test event through the hosted submission endpoint.

Repeat the same browser flow against the hosted service: unlock with the configured staff PIN, approve that test event, and confirm it appears publicly without refreshing the page and remains visible without staff access. The hosted `404` must be resolved before that result can be claimed.
