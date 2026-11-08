# Gather Easton

Standalone React + Vite + Tailwind CSS community calendar backed by a hosted Supabase Edge Function.

## Development Server

Run `pnpm install`, then `pnpm dev` to start Vite at `http://localhost:8443`. Changes hot reload automatically. Use an existing development server when one is already running.

Run `pnpm exec tsc --noEmit` and `pnpm build` to check the frontend. Run the existing regression tests with:

```sh
TZ=America/New_York node --experimental-strip-types --test src/utils/eventDateFilter.test.ts supabase/functions/server/event_submission.test.ts
```

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React and Tailwind CSS v4 plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm
- `supabase/functions/server/` - Event routes, validation, staff PIN checks, and KV persistence
- `supabase/functions/_shared/events.ts` - Shared event types
- `utils/supabase/info.tsx` - Hosted project id and anon key

Keep the live function prefix `make-server-1f1ed1f9` and table name `kv_store_1f1ed1f9` compatible with the hosted deployment.

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. No Tailwind config file or PostCSS config is needed.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
