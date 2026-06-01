# Nobz Beats — Agentic Coding Rules

## Project Overview

A music streaming web app built with React 18 + Vite 5, styled with Tailwind CSS 3, and backed by Convex (serverless DB, storage, and HTTP actions). The app features a vinyl-themed UI with a glitch logo, parallax covers, audio player with visualizer, and playlist management.

## Tech Stack

- **Frontend:** React 18 (JSX), Vite 5, PostCSS, Autoprefixer
- **Styling:** Tailwind CSS 3 (`tailwind.config.js` for theme), custom CSS in `css/styles.css`
- **Backend:** Convex (schema, queries, mutations, HTTP actions, file storage)
- **Icons:** Ionicons (`<ion-icon>` web components)
- **Fonts:** Google Fonts (Cutive Mono, Doto, Rubik 80s Fade) + Cal Sans
- **Deployment:** Vercel (SPA rewrites in `vercel.json`)

## Conventions

### Styling — Tailwind First

- **Always use Tailwind utility classes** before considering custom CSS. All components must be styled primarily with Tailwind.
- Custom CSS lives only in `css/styles.css` and is used only when Tailwind cannot express the rule (e.g., `::-webkit-scrollbar`, range input pseudo-elements, `@keyframes`, complex media queries).
- **No inline CSS `style` objects** except for:
  - Dynamic values (e.g., `animationDelay`, `transform` values from pointer tracking, CSS custom property overrides)
  - Animation delays coordinated via CSS custom properties (`var(--logo-fade)`, `var(--title-gap)`, etc.)
  - Dynamically computed positions (e.g., nav left offset via `el.style.left`)
- When you do need a `style` prop, keep it minimal. Move static styles to classes.
- **Never use `!important`** in any CSS. If a specificity issue arises, increase selector specificity (e.g., `html body .my-class`) or restructure the HTML.
- All colors must use the custom `dark`, `white`, and `grey` Tailwind colors defined in `tailwind.config.js` (extendable via `@apply` in CSS if needed). Semantics:
  - `bg-dark` / `text-white` for backgrounds / foregrounds (actual values: `#1c1c1c` / `#c8c8c8`)
  - `bg-white/[0.03]`, `hover:bg-white/[0.08]` for glass-morphism surfaces
  - `accent-red-500` for player progress and volume highlights
- Custom font families via `font-cutive`, `font-cal-sans`, `font-doto`, `font-rubik`.

### Component Architecture

- **Default exports** for every component file. Named exports only for sub-components within the same file (e.g., `export function SingleItem()` inside `Singles.jsx`).
- **File naming:** PascalCase for components (`Player.jsx`, `TwoUpCarousel.jsx`), camelCase for utilities (`storage.js`, `vinyl.js`).
- **Props:** Destructure props in the function signature. Default values as needed.
- **Event handlers:** Prefix with `handle` for DOM events (`handleTogglePlay`, `handlePrev`) or use `on*` for callbacks passed as props.
- **State and data:** App-level state (playlist, current track, route) lives in `App.jsx`. No context, Redux, or Zustand. Component-local state for UI concerns (open/close, hover, form state).
- **Forms:** Controlled inputs with `useState`. Admin forms use the pattern: `className="w-full bg-white/[0.05] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"`.
- **Accessibility:** Include `aria-label`, `role`, `aria-pressed`, `aria-expanded`, `aria-hidden`, `tabIndex`, and keyboard handlers (`onKeyDown`). Use `sr-only` for visually hidden but accessible content.
- **Console logging:** Use `console.debug` for development logging, `console.error` for errors. Clean up before production.

### File Organization

```
src/
  main.jsx              # Entry point
  App.jsx               # Shell: routing, state, data fetching
  convex/api.js         # Legacy HTTP client (unused by app)
  lib/
    storage.js          # Upload helper
    vinyl.js            # Global vinyl state bus (EventTarget on window)
  components/
    *.jsx               # All page/view components
    Admin/
      Admin.jsx         # Admin dashboard shell
      AddTrack.jsx      # Upload track form
      AddAlbum.jsx      # Create album form
      TracksList.jsx    # Track CRUD
      AlbumsList.jsx    # Album CRUD
      ErrorBoundary.jsx # React error boundary
css/
  styles.css            # Tailwind directives + custom CSS classes
convex/
  schema.js             # Database schema
  functions/
    tracks.js           # listTracks, createTrack, updateTrack, deleteTrack
    albums.js           # listAlbums, createAlbum, updateAlbum, deleteAlbum
  http.js               # HTTP actions: /upload/artwork, /upload/audio
```

- All components in `src/components/`, grouped by feature only for admin (`Admin/` subdirectory).
- Use relative imports (no path aliases configured).
- Keep `App.jsx` as the single state orchestrator; extract complex logic to `src/lib/` files.

### JavaScript Style

- **No semicolons** (standard codebase convention).
- **Single quotes** for strings.
- **2-space indentation.**
- **No TypeScript** on the frontend (Convex generated files use `.d.ts`).
- **No propTypes** (React 18, no TS).
- Use `const`/`let`, prefer `const`. `function` keyword for component declarations and named exports.
- **Defensive coding:** Wrap operations that can throw in `try/catch` (especially DOM queries, audio API calls). Use optional chaining (`?.`) and nullish coalescing (`||`).
- Array/object spread and destructuring are preferred.

### Convex Patterns

#### Schema (`convex/schema.js`)

```js
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  tracks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    artwork: v.optional(v.string()),
    artworkStorageId: v.optional(v.id('_storage')),
    src: v.optional(v.string()),
    srcStorageId: v.optional(v.id('_storage')),
    type: v.optional(v.string()),
    albumId: v.optional(v.id('albums')),
    createdAt: v.number()
  }),
  albums: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    artwork: v.optional(v.string()),
    artworkStorageId: v.optional(v.id('_storage')),
    createdAt: v.number()
  })
})
```

- Every table has `createdAt: v.number()` set with `Date.now()` on insert.
- Storage IDs are stored as `v.optional(v.id('_storage'))`.
- `null` is not accepted for optional fields — normalize to `undefined` before insert/patch (delete the key).

#### Functions (`convex/functions/*.js`)

- Import from `../_generated/server`: `{ query, mutation }`.
- **Queries** accept `{ db }`, return collected data.
- **Mutations** accept `{ db, storage }`, destructure additional args.
- Update mutations accept `{ id, patch }` as a single object argument.
- Delete mutations clean up associated Convex Storage objects before deletion.
- Use defensive `try/catch` around storage operations.

```js
// Query pattern
export const listTracks = query(async ({ db }) => {
  return await db.table('tracks').query().collect()
})

// Create pattern (mutation)
export const createTrack = mutation(async ({ db }, track) => {
  // Handle null albumId
  if (track && Object.prototype.hasOwnProperty.call(track, 'albumId') && track.albumId === null) {
    track = { ...track }
    delete track.albumId
  }
  const doc = Object.assign({ createdAt: Date.now() }, track)
  return await db.table('tracks').insert(doc)
})

// Update pattern (mutation with storage cleanup)
export const updateTrack = mutation(async ({ db, storage }, { id, patch }) => {
  // Clean up old storage if replacing
  const existing = await db.table('tracks').get(id)
  if (existing && patch.artworkStorageId && existing.artworkStorageId) {
    await storage.delete(existing.artworkStorageId)
  }
  await db.table('tracks').patch(id, patch)
  return true
})
```

- Call functions from the client via string paths: `'functions/tracks:listTracks'`.
- Use `useQuery` and `useMutation` hooks from `convex/react`.

#### HTTP Actions (`convex/http.js`)

- File uploads use `httpAction` from `../_generated/server.js`.
- Support both `multipart/form-data` and raw `arrayBuffer` uploads.
- Validate MIME type and file size server-side:
  - Images: max 5MB, `image/*`
  - Audio: max 25MB, `audio/*`
- Return CORS headers via helper function.
- For storing files, handle both `storage.put()` (legacy) and `storage.store()` (newer API) for compatibility.

#### Client-Side Upload (`src/lib/storage.js`)

- Uses `import.meta.env.VITE_CONVEX_URL` or `VITE_CONVEX_SITE_URL` for the base URL.
- POSTs to `/upload/artwork` or `/upload/audio` with `FormData`.
- Returns `{ url, storageId }` on success.

### Animation Conventions

- Animated entrance sequences use CSS custom properties for timing coordination:
  ```jsx
  style={{ animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.12s)' }}
  ```
- Custom properties defined in `:root` (`css/styles.css`): `--logo-fade`, `--title-fade`, `--player-fade`, `--playlist-fade`, etc.
- Keyframes and animation classes defined in `tailwind.config.js` theme.extend (use `animate-*` classes). Duplicate definitions in `css/styles.css` only if needed for CSS-only features.
- Respect `prefers-reduced-motion: reduce` — disable all animations.

### Glass-morphism Style Guide

```jsx
// Surface
className="bg-white/[0.03] border border-white/10 rounded-lg"

// Hover surface
className="hover:bg-white/[0.08]"

// Active/selected surface
className="bg-white text-black"

// Form inputs
className="w-full bg-white/[0.05] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"

// Buttons
className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]"

// Admin navigation tabs
className={`px-3 py-1.5 rounded transition-colors ${isActive ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`}
```

### Responsive Breakpoints

- 768px (mobile/tablet split)
- 1024px (tablet/desktop split)
- Use a `[isMobile, setIsMobile]` pattern based on `window.innerWidth < 1024` in page components for conditional rendering adjustments.
- Player goes full-width at mobile (see `css/styles.css` @media max-width: 767px).

## Vercel Deployment

- `vercel.json` rewrites all routes to `/index.html` (SPA).
- Public assets served from `assets/` directory via Vite's `publicDir: 'assets'`.

## Dependencies

- **Runtime:** `react`, `react-dom`, `convex`
- **Dev:** `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`
- **Unused (don't add)** : `express`, `cors`, `multer` (leftover from previous pattern)
