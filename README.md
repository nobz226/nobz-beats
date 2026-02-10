# Nobz Beats — Vite + React Port

A small single-page React app built with Vite that uses Convex for backend data storage and serverless HTTP actions.

This README explains how the project is wired together, how data flows between the client and Convex, what each major folder contains, required environment variables, and common developer tasks. It's written for a beginner so you can modify and extend the app.

Quick start

- Install dependencies:

```bash
npm install
```

- Start the development server (client):

```bash
npm run dev
```

- Build for production:

```bash
npm run build
```

Project overview

- Client: a Vite + React single-page application located in the `src/` folder. The app implements client-side routing (history API) to support routes like `/latest`, `/singles`, `/albums`, etc.
-- Backend: Convex is used for data storage and serverless functions. Convex server code lives in the `convex/` folder and defines the database schema, server functions, and HTTP actions for uploads.
- Static assets: `assets/` is treated as Vite's public directory (configured via `vite.config.js`) and is copied to the build output. Global CSS is in `css/styles.css`.

Repository structure (important files)

- `index.html` — app root.
- `vite.config.js` — Vite configuration (sets `publicDir: 'assets'`).
- `package.json` — scripts and dependencies.
- `src/` — React app sources:
	- `main.jsx` — app entry: creates Convex client and mounts `App`.
	- `App.jsx` — main application: routes, queries data, manages playlist and player state.
	- `components/` — UI components (Player, Nav, Latest, Albums, Admin, etc.).
	- `lib/` — small helpers: `vinyl.js` (global play-state bus) and `storage.js` (upload helper).
- `convex/` — Convex backend:
	- `schema.js` — database tables (`tracks`, `albums`).
	- `functions/` — Convex query/mutation functions used by the client (e.g. `listTracks`, `createTrack`).
	- `http.js` — HTTP actions exposed by Convex for uploads.

How the app is wired (data flow)

1. Data model (Convex):
	 - `tracks` table: stores track metadata (title, artwork URL, audio `src`, optional `albumId`, `createdAt`, etc.).
	 - `albums` table: stores albums with artwork and list of tracks is derived by querying `tracks` with `albumId`.

2. Client queries:
	 - The main app uses `useQuery('functions/tracks:listTracks')` and `useQuery('functions/albums:listAlbums')` (Convex React hooks) to read data. These functions are implemented in `convex/functions/*.js` and return arrays of documents.

3. Client mutations & uploads:
 	- To create or update tracks/albums the UI (Admin pages) calls Convex mutation functions in `convex/functions/`.
 	- For file uploads (artwork/audio) the app uploads files to Convex Storage via the HTTP actions defined in `convex/http.js`:
 		- `POST /upload/artwork` expects multipart `file` or raw bytes and returns a `url` pointing to the stored object.
 		- `POST /upload/audio` similar for audio files.

Key client pieces

- `src/main.jsx` — creates a `ConvexReactClient` with `import.meta.env.VITE_CONVEX_URL` (or fallback) and wraps the app in `ConvexProvider`. If `VITE_CONVEX_URL` is empty the Convex client will be created with an empty string — set the env var for a real endpoint.
- `src/App.jsx` — central router and state manager. Responsibilities:
	- Normalize incoming data (artwork paths, strip `/assets/` prefix).
	- Build the `singles`, `albums`, `remixes` and `allTracks` collections from the raw Convex data.
	- Manage playback state: playlist array and `currentTrack`.
	- Provide APIs to components: `playTrack`, `addToPlaylist`, `playAlbum`, etc.
- `src/components/Player.jsx` — audio player component that wraps an HTML `<audio>` element and integrates with the visual vinyl state via `src/lib/vinyl.js`.
- `src/lib/vinyl.js` — global event bus and store (attached to `window.__vinylBus` / `window.__vinylStateStore`) used to coordinate artwork sleeve/rotation state between the player and cover components.

Convex backend details

- `convex/schema.js` defines two tables:
	- `tracks` with fields: `title` (string), `description` (optional string), `artwork` (optional string), `src` (optional string), `type` (optional string), `albumId` (optional Convex id), `createdAt` (number)
	- `albums` with fields: `title`, `description` (optional), `artwork` (optional), `createdAt` (number)
- `convex/functions/*.js` implement server-side queries and mutations. Example:
	- `listTracks` returns all `tracks` documents.
	- `createTrack` inserts a new track with `createdAt: Date.now()` and normalizes `albumId` (removes `null`).
-- `convex/http.js` exposes HTTP endpoints for uploads. These endpoints use `storage.put` to store bytes in Convex Storage and return a `url`.

Environment variables (important)

- `VITE_CONVEX_URL` or `VITE_CONVEX_SITE_URL` — Convex client/site URL used by the browser app. Set this in your Vite `.env` as `VITE_CONVEX_URL=https://your-convex-site.convex.cloud` or similar.
- The important env vars for running the app are:
 	- `VITE_CONVEX_URL` or `VITE_CONVEX_SITE_URL`

Example `.env` (for local dev with Vite):

```text
VITE_CONVEX_URL=https://dev-your-site.convex.cloud
```

Notes and gotchas

- Routing: this is an SPA using the history API. For direct URL visits you must configure hosting to serve `index.html` for unknown paths. `vercel.json` already rewrites all routes to `index.html`.
- `assets/` is used as Vite's `publicDir`. Previously files were served under `/assets/...`; the app normalizes older DB records to remove `/assets/` so files live at `/artwork/...` in production.
- `package.json` previously referenced `scripts/check-uploads.js`, which is not present in the repo. That script was replaced with a no-op echo to avoid broken `npm run` errors.
- There are devDependencies (`express`, `cors`, `multer`) in `package.json` which are not used by this repo; you can remove them to speed installs.

Common developer tasks

- Start the client dev server:

```bash
npm run dev
```

- Start Convex locally (if you are using Convex locally and have the CLI):

```bash
# install convex CLI if needed
npm i -g convex
# start convex dev server
convex dev
```

- Add a new track (example using Convex SDK or `convex/` API):
	- From the Admin UI in the app (if enabled) use the Add Track form.
	- Or call the Convex mutation `createTrack` from a script.

- Upload artwork via Convex HTTP action (raw POST):

```bash
curl -X POST -F "file=@cover.png" https://your-convex-site.convex.cloud/upload/artwork
```

-- Uploads from the client post to Convex `/upload/*` endpoints which return a `url` to store in DB documents.

Where to look when things break

- Client console errors: open browser devtools to inspect network requests and JS errors.
- Convex function errors: check the Convex dashboard or the logs produced by `convex dev`.
- Upload failures: inspect the response body from `/upload/*` endpoints and ensure the request contains correct multipart/form-data or raw bytes.

Tips for extending the app

- Adding fields to `tracks` or `albums`:
	1. Update `convex/schema.js` to include the new field (with validators in `convex/values`).
	2. Update server functions in `convex/functions/` to accept/save the new field.
	3. Update client components (`src/components/Admin/*`, `src/App.jsx`, and any display components) to read and render the new field.

- Replace Convex with another backend: Convex is used for both DB and simple HTTP actions in this project. To swap it out you'll need to:
	1. Replace Convex queries/mutations in `src/` with API calls to your new backend.
	2. Implement equivalent upload endpoints and storage (S3/etc.).

Maintenance suggestions

- Remove unused devDependencies from `package.json` (`express`, `cors`, `multer`) if you won't be running an Express server locally.
- Add a simple linter/formatter (ESLint + Prettier) to maintain code style.

License & credits

- This repository is a small port of an existing site to Vite + React and Convex. Review licensing and assets before publishing.

If something is unclear or you want me to add step-by-step instructions (for example: "how to run the Convex dev server locally and populate sample data"), tell me which area and I'll expand that section.
