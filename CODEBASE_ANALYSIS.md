# Repository Analysis — nobz-beats-react

**Date:** 2026-02-11

## Overview

- Stack: React (Vite) frontend, Convex backend (server functions + schema), Tailwind/PostCSS for styling. Public assets are served from the `assets/` folder configured as Vite `publicDir`.
- Purpose: music catalogue + player with admin tools to manage `tracks` and `albums`.

## Entry points & runtime flow

- Root HTML: index.html
- Client bootstrap: `src/main.jsx` — creates `ConvexReactClient`, mounts `App` in React StrictMode.
- App shell / router: `src/App.jsx` — pathname-based routing, playlist/player global state, queries Convex functions.
- Vite config: `vite.config.js` — `publicDir: 'assets'` so `/assets/...` are copied to build.

## Frontend structure

- Main files: `src/main.jsx`, `src/App.jsx`.
- Components: `src/components/` (views and UI primitives). Notable subfolder: `src/components/Admin/` (admin pages and forms).
- CSS: `css/styles.css` (imported in `src/main.jsx`), Tailwind/PostCSS configured in `postcss.config.js` and `tailwind.config.js`.

## Backend / Convex

- Schema: `convex/schema.js` — defines two tables: `tracks` and `albums` (expects `createdAt` timestamps).
- Server functions: `convex/functions/tracks.js` and `convex/functions/albums.js` providing list/create/update/delete operations.
- Client usage: `App.jsx` calls `functions/tracks:listTracks` and `functions/albums:listAlbums` via `useQuery`.

## package.json: scripts & dependencies

- Scripts: `dev` = `vite`, `build` = `vite build`, `preview` = `vite preview`.
- Runtime deps: `convex`, `react`, `react-dom`.
- Dev tooling: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`.
- Extras present but not currently referenced in repo: `express`, `cors`, `multer` (check if intended for an upload server or removable).

## Notable observations & potential issues

- `src/main.jsx` reads `VITE_CONVEX_URL` (or `REACT_APP_CONVEX_URL`) — ensure this env var is set in dev and production builds.
- `package.json` includes `express`, `multer`, `cors` but no corresponding server files; consider removing or adding intended upload server code.
- No tests or linting config detected; adding ESLint and a basic test harness would improve maintainability.
- No `.env.example` or docs for required environment variables — add one for developer onboarding.
- Convex `createdAt` is a number; some code falls back to `0` when missing. Ensure consistent timestamping at write time.

## Quick recommended next steps

1. Add `.env.example` documenting `VITE_CONVEX_URL` and other env vars.
2. Audit `package.json` dependencies; remove unused server libs or add server implementation for uploads if intended.
3. Add ESLint + Prettier and a simple test setup (e.g., Vitest or Jest) covering core logic (playlist helpers, normalize functions).
4. Document Convex deployment steps (how to push functions and schema) and any required Convex CLI commands.
5. Optionally generate a component usage map to aid refactors — I can produce this next.

## How to run locally (quick)

```bash
npm install
# set VITE_CONVEX_URL in your environment or .env file
npm run dev
```

## Files inspected (high level)

- `src/main.jsx`
- `src/App.jsx`
- `src/components/` (multiple components including `Admin/`)
- `convex/schema.js`
- `convex/functions/tracks.js`
- `convex/functions/albums.js`
- `vite.config.js`
- `package.json`

---

If you want, I can now (A) map component usage and routes, (B) scan for unused deps, or (C) add `.env.example` and a short README section. Tell me which to do next.
