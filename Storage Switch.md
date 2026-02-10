Storage Switch
==============

Short answer: No — Cloudinary has been removed. The app now uploads audio and artwork to Convex Storage.

Evidence and details
-- Client helper: `src/lib/storage.js` was added to upload directly to Convex HTTP endpoints.
-- Admin UI uses it: `src/components/Admin/AddTrack.jsx`, `src/components/Admin/AddAlbum.jsx`, and `src/components/Admin/AlbumsList.jsx` call `uploadToStorage` (backed by Convex Storage).
- Convex storage endpoints exist: `POST /upload/audio` and `POST /upload/artwork` in `convex/http.js` store files in Convex Storage.

Behavior summary
- Admin uploads now POST files to the Convex `/upload/audio` and `/upload/artwork` endpoints and save the returned `url` in Convex DB documents.

Environment variables
- Convex client/site URL: `VITE_CONVEX_URL` or `VITE_CONVEX_SITE_URL` (required for upload calls from the browser).

Next steps (options)
- (A) Keep current flow (Convex Storage only).
- (B) Add a runtime toggle in the Admin UI to choose between different storage backends (if you later reintroduce another backend).

I implemented option (A) — admin uploads now use Convex Storage. If you'd like the toggle (B) I can add it next.
