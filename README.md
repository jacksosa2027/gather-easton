# Greater Easton Development Project (GEDP) Website

GEDP is a community event calendar for downtown Easton. Residents and visitors can discover events, organizers can submit them, and calendar staff can review submissions before publishing them.

**Team:** Sam, Ryan, Connor, Alex
**Stakeholders:** Ella Keeling, Julie VanOsdol, Justin Smith (Professor).
**Course:** CS 425 Human Computer Interaction.
**Current Status:** Sprint 3 prototype implemented; live demo verification pending.

## Problem

Event info in Easton is on store walls, Facebook pages, calendars inside of stores, and word of mouth. Residents and visitors currently have to check several sources in order to find things to do, with many not knowing where to start looking.

During a meeting with the clients Ella and Julie, Ella stated that she spent about four hours each week both collecting and organizing information. Organizers also had a lot of difficulty when submitting events, such as an inability to add emojis. We want to make it easier to discover events, have it easier for business managers to find events, and to reduce Ella and Julie's workload.

## Use Case

| User Group | Need |
| --- | --- |
| Residents, visitors | Browse upcoming and future events, understand when they are, and what they are |
| Businesses and event organizers | Submit event information, via a short form |
| GEDP / Easton Main Street staff | Review pending submissions and control which events are published |

## Sprint 3 prototype

- Browse the monthly calendar with search, categories, and relative date filters.
- Open event details with the name, full date, time, venue, and source link when present.
- Submit an event to Supabase KV storage and receive an **Awaiting review** confirmation. Pending events stay off the public calendar after refresh.
- Unlock **Staff review** with a shared PIN, inspect the pending queue, and approve or reject with a reason. Approval updates the public calendar without a page reload.
- Export individual events to Google Calendar.

## Run the frontend

In Figma Make, use the existing development server and preview panel. For a standalone checkout, use Node.js 22 and pnpm 10 as specified in [.mise.toml](.mise.toml):

```sh
pnpm install
pnpm dev
```

Open the URL printed by Vite, normally `http://localhost:8443`. The frontend uses the hosted Supabase project in [utils/supabase/info.tsx](utils/supabase/info.tsx) through [src/utils/eventsApi.ts](src/utils/eventsApi.ts).

### Backend prerequisites

Use an environment with the current [Edge Function source](supabase/functions/server/index.tsx) deployed as `make-server-1f1ed1f9` and the `kv_store_1f1ed1f9` table provisioned. The KV adapter uses the function's `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables; its table schema is shown in [kv_store.tsx](supabase/functions/server/kv_store.tsx).

Starting Vite serves the frontend; backend deployment and database provisioning are separate. The calendar can show fallback seed events when API reads fail, so use the staff API check below before presenting the persistence demo.

## Calendar export

Open an event and choose **Add to Google Calendar** to open a prefilled Google
Calendar event with its name, date, time, venue, description, and organizer link
when present. Review and save the event in Google Calendar. This works without
using **Connect calendar**.

The navigation's **Connect calendar** flow remains a prototype interaction. It
does not sign in to Google or Apple accounts or synchronize calendars.

## Staff API PIN

Set `STAFF_PIN` in the **Supabase Edge Function environment** for the same project used by the frontend. `1234` is an explicit demo example, not a built-in default; an unset or blank value disables staff access.

Create the ignored file `supabase/functions/.env` with your chosen value:

```dotenv
STAFF_PIN=1234
```

With the Supabase CLI installed, sign in and load the file into your hosted project. Replace `YOUR_PROJECT_REF` with `projectId` from `utils/supabase/info.tsx`:

```sh
supabase login
supabase secrets set --project-ref YOUR_PROJECT_REF --env-file supabase/functions/.env
```

Alternatively, add `STAFF_PIN` on the project's **Edge Function Secrets** page in the Supabase Dashboard. See the official [environment-variable guide](https://supabase.com/docs/guides/functions/secrets) and [CLI secrets reference](https://supabase.com/docs/reference/cli/supabase-secrets-set). The command above configures the hosted function; creating a local env file alone does not configure the hosted API.

For hosted calls, the browser helper sends `X-Staff-Pin: <staff-pin>` alongside
`Authorization: Bearer <public-anon-key>`, using the scaffold's legacy anon JWT.
The PIN middleware also accepts `Authorization: Bearer <staff-pin>` directly,
but the hosted gateway's JWT checks can reject that header before it reaches
the middleware. Use the two-header browser pattern for the demo.
Missing or incorrect PINs return `401` with `{ "error": "Unauthorized" }`.
An unset or blank `STAFF_PIN` returns `503` with
`{ "error": "Staff access is not configured" }`.
Public event reads and the health endpoint do not require the staff PIN.

Open **Staff review** in the navigation to enter the PIN. Successful PIN checks
are remembered in `sessionStorage` for the current tab and verified again when
the panel reopens. **Lock staff review** clears the remembered PIN.

### Check staff access before the demo

Replace the placeholders with the configured project, `publicAnonKey` from `utils/supabase/info.tsx`, and the PIN you set:

```sh
curl --include \
  --header "Authorization: Bearer YOUR_PUBLIC_ANON_KEY" \
  --header "X-Staff-Pin: YOUR_STAFF_PIN" \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-1f1ed1f9/events/pending"
```

Expect `200` and `{ "events": [...] }`; an empty queue is `{ "events": [] }`. A `401` means the credentials were rejected, `503` with **Staff access is not configured** means `STAFF_PIN` is missing or blank, and `404` means the deployed function or route needs checking. This check reads the queue without creating or moderating events.

## Sprint 3 demo walkthrough

Use unique names such as **Demo approval — Alex 10:30** and **Demo rejection — Alex 10:35** so existing submissions are easy to distinguish. Choose test dates in the month displayed on the calendar.

Seed events cover October–December 2026. For later demos, browse seeds with **Any date** selected and navigate to those months. Relative date filters use the current browser date: **This weekend** covers Saturday–Sunday (including the current weekend), **Next week** covers the next Monday–Sunday, and **This month** covers the current calendar month.

1. **Browse and inspect.** Search for an event, try a category, and test **This weekend**, **Next week**, and **This month**. Open an event and confirm its name, full date, time, venue, and source when present. Optionally choose **Add to Google Calendar** to inspect the prefilled event.
2. **Prepare the submission demo.** Clear the search, select **All events** and **Any date**, and note the displayed month.
3. **Submit for approval.** Choose **Submit an event** and enter the unique approval name, category, venue, date in the displayed month, start time, description, and optional HTTP/HTTPS source link. Submit once and wait for **Awaiting review**. An image selection is preview-only and is not uploaded.
4. **Verify persistence and privacy.** Close the confirmation, refresh the page, and return to the test event's month. Keep **All events** and **Any date** selected, then search for the unique title. It must still be absent from the public calendar.
5. **Find it as staff.** Open **Staff review**, enter the configured PIN, and locate the pending event. Its presence after the page refresh confirms the submission was saved. Inspect the details, source, and available image preview; use **Refresh queue** if needed.
6. **Approve without reloading.** Choose **Approve** and wait for the saved-review confirmation. The item leaves the queue. Close the staff modal and confirm the event appears in the public calendar without refreshing the page. The selected month, search, category, and date filter are preserved.
7. **Exercise rejection.** Submit a second event with the unique rejection name. Reopen **Staff review**, choose **Reject**, and enter a reason such as **Please confirm the venue.** Choose **Confirm rejection**. The event leaves the queue. Close the panel, select **All events** and **Any date**, and search for the rejection title in its event month. Confirm it is absent. Refresh the page, restore that month and search, and confirm it is still absent.
8. **Check validation and locking.** An incomplete submission is blocked by required fields; a supplied source link must be HTTP/HTTPS. A blank rejection reason must not send a rejection. Choose **Lock staff review**, try an incorrect PIN, and confirm the queue remains private. Enter the correct PIN to regain access, then lock the panel when finished.

If a save fails, the form or rejection reason remains available for retry. Approval is saved before the public-list refresh; a failed refresh shows **Retry calendar refresh** while keeping the confirmed approved event in local calendar state.

## Prototype limits

- Image files are preview-only. New submissions use the default event image; the staff queue can preview stored remote images and handles missing or broken previews.
- Staff can approve or reject submissions; editing event details, organizer accounts, email notifications, imports/scrapers, and duplicate detection are outside this prototype.
- **Connect calendar** is a prototype interaction. Google Calendar export is the working calendar action; ongoing Google/Apple account synchronization is outside Sprint 3.
- Reviewed submissions remain in KV storage. The pending queue shows only `pending` submissions, and the public API shows only `approved` events. There is no rejected-event history screen or demo-data cleanup UI.

## Local checks

Run from the project root after installing dependencies:

```sh
pnpm exec tsc --noEmit
pnpm build
TZ=America/New_York node --experimental-strip-types --test src/utils/eventDateFilter.test.ts supabase/functions/server/event_submission.test.ts
```

These checks cover frontend types/build and submission/date validation. The deployed Supabase configuration, real KV persistence, and browser demo still need the live walkthrough above.

### Browser verification progress

Calendar browsing, category/search filters, and event details passed local Chromium checks on desktop and mobile, with tablet navigation also checked. The run fixed details-modal focus/Escape handling and legacy-response fallback behavior. The hosted API returned 51 events without `status`, so live API-backed browsing still needs verification after the function deployment is updated. See the [November 7 verification report](docs/verification/sprint3-browse.md) for coverage and remaining prerequisites.

The submit/refresh flow also passed in desktop/mobile Chromium using the current function source with isolated persistent test storage: pending records survived reload and stayed out of the public API and calendar. The hosted submission attempt returned `404`, so live persistence/privacy verification remains blocked. See the [submission verification report](docs/verification/sprint3-submission.md).

Staff PIN unlock and approval passed with the same isolated setup: approved records became public without page navigation and remained visible in a fresh browser context without a staff PIN. The hosted staff queue also returned `404`; no live approval was attempted. See the [approval verification report](docs/verification/sprint3-approval.md).

Rejection with a reason passed on desktop/mobile with isolated persistent storage: the reason and review timestamp survived reload, and rejected records stayed out of the pending queue, public API, and calendar, including in a fresh anonymous session. Blank reasons were blocked. The hosted staff queue still returned `404`; no live rejection was attempted. See the [rejection verification report](docs/verification/sprint3-rejection.md).

## Event submission API

`POST /make-server-1f1ed1f9/events` accepts a JSON event object without a staff PIN.
Required fields are `title`, `category`, `year` (integer), `month` (e.g. `NOV`),
`date` (day of month, e.g. `07`), `time`, `location`, and `description`.
Optional fields are `sourceUrl`, `image`, and `alt`; URLs must use HTTP or HTTPS.
Omit browser-only image preview URLs (`blob:`) from submissions.

A successful write returns `201` with `{ "event": { ... } }`. The server assigns
the numeric `id`, `status: "pending"`, and ISO `submittedAt`, and derives `day`
from the calendar date. Client-provided IDs and review metadata are ignored.
Records are saved under `event:submission:{id}` and remain excluded from
`GET /events` until approved. Invalid submissions return `400`; failed KV writes
return `500` without reporting success.

## Staff moderation API

These routes use the staff PIN headers described above:

- `GET /make-server-1f1ed1f9/events/pending` returns `{ "events": [...] }`,
  containing only pending submissions, oldest submission first.
- `POST /make-server-1f1ed1f9/events/:id/approve` approves a pending submission;
  no request body is required.
- `POST /make-server-1f1ed1f9/events/:id/reject` rejects a pending submission and
  requires JSON such as `{ "rejectionReason": "Please confirm the venue." }`.

Both review actions persist `reviewedAt` and return `200` with `{ "event": { ... } }`.
Approval makes the event available on the next public `GET /events` request.
The staff UI also updates its public calendar immediately from the saved approval and refreshes that list in the background.
Rejection saves the trimmed reason and keeps the event off the public list.
Both actions remove the event from the pending queue.
Invalid IDs or rejection bodies return `400`, unknown submissions return `404`,
already reviewed submissions return `409`, and storage failures return `500`.
These actions address submission records only; seeded events are not moderated.
