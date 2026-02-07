# Nobz Beats — Vite + React Port

This workspace contains a Vite + React app that reproduces the existing site exactly as it behaved before.

Commands

- npm install — install dependencies
- npm run dev — start dev server (running now)
- npm run build — production build

Notes

- The original `css/styles.css` and `assets/` are preserved and used as-is to keep appearance and behavior identical.
- The original `js/script.js` was removed; its logic is ported into `src/components/Logo.jsx`.
- Components added: `src/components/Logo.jsx`, `Nav.jsx`, `Title.jsx` — they render the same DOM and behavior as the original site.

SPA routing notes

- The app uses client-side routing (history.pushState) to produce clean URLs like `/latest`, `/singles`, etc. For direct visits to those URLs to work in production you must configure your hosting to fallback to `index.html` for unknown routes (Netlify `_redirects`, Vercel default behavior, or a server rewrite to `/index.html`).
