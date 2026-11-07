# Greater Easton Development Project (GEDP) Website

GEDP is a website which is a scraper and business powered website which collects a myraid of events happening in downtown Easton so that both tourists and residents can view all of the events happening in downtown Easton on any given day.

**Team:** Sam, Ryan, Connor, Alex
**Stakeholders:** Ella Keeling, Julie VanOsdol, Justin Smith (Professor).
**Course:** CS 425 Human Computer Interaction.
**Current Status:** Sprint 1 completed, research document. Sprint 2 underway.

## Problem

Event info in Easton is on store walls, Facebook pages, calendars inside of stores, and word of mouth. Residents and visitors currently have to check several sources in order to find things to do, with many not knowing where to start looking.

During a meeting with the clients Ella and Julie, Ella stated that she spent about four hours each week both collecting and organizing information. Organizers also had a lot of difficulty when submitting events, such as an inability to add emojis. We want to make it easier to discover events, have it easier for business managers to find events, and to reduce Ella and Julie's workload.

## Use Case

| User Group | Need |
| --- | --- |
| Residents, visitors | Browse upcoming and future events, understand when they are, and what they are |
| Businesses and event organizers | Submit event information, via a short form |
| GEDP / Easton Main Street staff | Review submissions, manage published events, avoid duplicate events |

## Workflow

1. Find an event, use tags to filter out specific events, open an event to see detail in it. Make event info easily shareable.
2. Submit event details, include image and link, receive a confirmation of the submission awaiting review.
3. Inspect pending docs, correct information, approve or reject submissions, provide reasoning when changes are needed.

## Staff API PIN

Set `STAFF_PIN` in the Supabase Edge Function environment. For local demos, put
`STAFF_PIN=1234` in the ignored `supabase/functions/.env` file and load it with
the Supabase CLI's `--env-file supabase/functions/.env` option. Use your own PIN
for a deployed environment; there is no automatic fallback when it is unset.

The pending queue and approve/reject paths require either
`Authorization: Bearer <staff-pin>` or `X-Staff-Pin: <staff-pin>`.
For calls through the Supabase gateway, use `X-Staff-Pin` alongside the existing
`Authorization: Bearer <public-anon-key>` header.
Missing or incorrect PINs return `401` with `{ "error": "Unauthorized" }`.
An unset or blank `STAFF_PIN` returns `503` with
`{ "error": "Staff access is not configured" }`.
Public event reads and the health endpoint do not require the staff PIN.

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
