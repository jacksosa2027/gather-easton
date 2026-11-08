# CS-425 Gather Easton (GEDP)

**Team:** Sam, Ryan, Connor, Alex

Downtown Easton event info is scattered across venue sites, posters, and social accounts. This project is a React + Vite community calendar where residents and visitors can browse events, organizers can submit them, and Greater Easton Development Partnership (GEDP) staff can review submissions before they appear publicly.

## Focus

Sprint 3 prototype: monthly calendar with search and filters, event details, submission with pending review, staff approve/reject via a shared PIN, and single-event Google Calendar export. Intended users: residents and visitors, event organizers, and Easton Main Street staff.

## Quick start

From the repo root (Node 22 / pnpm 10 per `.mise.toml`):

```sh
pnpm install
pnpm dev        # open the Vite URL, usually http://localhost:8443
```

The app talks to the hosted Supabase function configured in `utils/supabase/info.tsx`. For staff review, set `STAFF_PIN` as an Edge Function secret (for example `1234`). Redeploy `supabase/functions/server` (it imports `supabase/functions/_shared`) as `make-server-1f1ed1f9` if the submit or pending routes return 404.

Optional checks:

```sh
pnpm exec tsc --noEmit
pnpm build
TZ=America/New_York node --experimental-strip-types --test src/utils/eventDateFilter.test.ts supabase/functions/server/event_submission.test.ts
```

## Repo layout

- `src/` - app UI (`App.tsx`), staff review components, hooks, event API helper (`utils/eventsApi.ts`), date filter and Google Calendar utils
- `supabase/functions/server/` - Edge Function: public events, submissions, staff moderation
- `supabase/functions/_shared/` - event type shared by the function and the frontend
- `utils/supabase/` - project id and anon key used by the frontend
- `docs/verification/` - Sprint 3 browser and API verification notes
- `AGENTS.md` - Standalone Vite development and code quality notes

## Known gaps

- The hosted Edge Function must be redeployed for live submit and staff routes (they currently return 404).
- Image upload is preview-only; submissions use a default image.
- Connect calendar is UI-only; Google Calendar export is the working calendar action.
- No organizer accounts, email notifications, imports/scrapers, or duplicate detection.
