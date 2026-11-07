# Sprint 3: submit, refresh, and pending-event privacy

**Checked:** November 7, 2026.

**Result:** The current implementation passes the browser flow with isolated persistent test storage. Hosted verification is blocked: the configured `POST /events` endpoint returns `404`, so no live pending record was created.

See [raw verification results](sprint3-submission.json) for the hosted response and the separate desktop/mobile checks.

## Hosted attempt

Used the actual Vite frontend in Chromium and submitted one clearly labeled test event, with a unique name and a date in the displayed November 2026 calendar. No API requests were intercepted in this attempt.

- `POST /make-server-1f1ed1f9/events` returned **404**.
- The UI showed **Events API request failed (404)** and retained the form title for retry.
- The UI did not show **Awaiting review** or claim the event was saved.
- Only one submission request was sent; there were no uncaught browser errors.

The event's absence from the calendar is **not** counted as successful privacy verification because creation failed. Hosted persistence and pending-event privacy remain unverified.

## Current-code browser check

Used the actual Vite frontend and current Hono function source in Chromium, with desktop (1440 × 1000) and mobile/touch (390 × 844) viewports. Supabase requests were intercepted and dispatched to the current route handlers. Only the KV adapter was replaced, using an isolated temporary JSON file to persist records across function-instance recreation.

This checks the UI and route behavior; it does not exercise the hosted Supabase database or gateway. The browser clock was fixed at November 7, 2026, noon in `America/New_York`.

| Check | Desktop | Mobile |
| --- | --- | --- |
| Fill required fields and submit through the real form | Pass | Pass |
| Send exactly one POST, without client-assigned ID or review status | Pass | Pass |
| Receive `201`, server-assigned numeric ID, `pending`, and ISO submission timestamp | Pass | Pass |
| Display **Awaiting review** after the write succeeds | Pass | Pass |
| Save under `event:submission:{id}` in the persistent test adapter | Pass | Pass |
| Keep the event out of the public API and calendar immediately | Pass | Pass |
| Reload the page and recreate the API instance; retain the pending record | Pass | Pass |
| Read the record from the staff-only pending queue after reload | Pass | Pass |
| Keep it off the calendar in a fresh browser context | Pass | Pass |
| Render an approved control event in the same month | Pass | Pass |
| Uncaught browser errors | None | None |

The calendar checks used **All events**, **Any date**, and the event's actual month. An approved control event remained visible, so the pending event was not merely hidden by unrelated filters or a broken public feed. The desktop submission included an organizer URL; the mobile submission omitted it.

No approval or rejection actions were performed during this verification.

## Required hosted follow-up

The current [server source](../../supabase/functions/server/index.tsx) includes the missing POST route. Check/deploy that implementation, its helper modules, and shared types to `make-server-1f1ed1f9` in the project configured by the frontend, with the required KV table available.

Then rerun the [README demo walkthrough](../../README.md#sprint-3-demo-walkthrough) against the hosted service: require a successful pending submission, refresh the page, and confirm the record stays off the public calendar while still being available to staff. `STAFF_PIN` is required to inspect the staff queue; public submission itself does not require it.
