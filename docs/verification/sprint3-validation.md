# Sprint 3: required-field form validation

**Checked:** November 7, 2026.

**Result:** Incomplete required fields are blocked on desktop and mobile before an API request is sent. Verification found and fixed a gap where whitespace-only event names, venues, and descriptions passed browser validation and reached the API.

See [raw verification results](sprint3-validation.json).

## Browser coverage

Ran the actual Vite frontend in Chromium at desktop (1440 × 1000) and mobile/touch (390 × 844) sizes. Browser time was fixed at November 7, 2026, noon in `America/New_York`.

All Supabase requests were intercepted and dispatched to the current Hono function source with an isolated JSON-file KV adapter. No hosted submissions or moderation requests were sent. These checks verify the current frontend's validation and a successful submission against the current API source; hosted deployment and persistence still require the walkthrough documented in the [README](../../README.md#sprint-3-demo-walkthrough).

| Check | Desktop | Mobile |
| --- | --- | --- |
| Block a completely empty submission without sending a request | Pass | Pass |
| Block an empty event name, with all other required fields filled | Pass | Pass |
| Block an unselected category, with all other required fields filled | Pass | Pass |
| Block an empty venue, with all other required fields filled | Pass | Pass |
| Block a missing date, with all other required fields filled | Pass | Pass |
| Block a missing start time, with all other required fields filled | Pass | Pass |
| Block an empty description, with all other required fields filled | Pass | Pass |
| Focus the invalid required field | Pass | Pass |
| Honor required fields when submitting with Enter | Pass | Pass |
| Block whitespace-only event name, venue, and description without a request | Pass after fix | Pass after fix |
| Clear the validation error when meaningful text replaces whitespace | Pass | Pass |
| Block a malformed source URL and an FTP URL without a request | Pass | Pass |
| Allow source URL and image to remain empty | Pass | Pass |
| Submit a complete event exactly once, returning `201` and showing Awaiting review | Pass | Pass |
| Block empty and whitespace-only staff PINs without a queue request | Pass | Pass |
| Block empty and whitespace-only rejection reasons without a moderation request | Pass | Pass |
| Leave the pending event unchanged after invalid rejection attempts | Pass | Pass |
| Uncaught browser errors | None | None |

The final run sent only one write request per device: the complete, valid event submission. Every incomplete submission and rejection attempt was stopped before the API. Category validation was checked with the original unselected placeholder while the other fields were filled.

## Fix made during verification

The browser's `required` attribute accepts strings containing only spaces. The submission handler trimmed those strings, so the API received empty required text and rejected the request instead of the form blocking it.

The event name, venue, and description now set a browser validity error when their value contains only whitespace. Entering meaningful text clears that error. Empty values continue to use the native required-field validation. Existing API validation remains in place.

## Additional checks

- `pnpm exec tsc --noEmit` passed.
- `pnpm build` passed, with the existing Vite configuration compatibility warning.
- Date-filter and submission-validation tests passed: **12 tests, 0 failures**.
