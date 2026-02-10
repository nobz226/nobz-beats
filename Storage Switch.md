Storage Switch
==============

Short answer: Yes — when configured the app uploads audio (and artwork) to Cloudinary.

Evidence and details
- Client helper: `src/lib/cloudinary.js` implements signed Cloudinary uploads.
- Admin UI uses it: `src/components/Admin/AddTrack.jsx`, `src/components/Admin/AddAlbum.jsx`, and `src/components/Admin/AlbumsList.jsx` call `uploadToCloudinary`.
- Server signer: Convex exposes `/cloudinary/sign` in `convex/http.js` which returns `cloud`, `api_key`, `timestamp`, and `signature` for signed uploads.
- Convex storage endpoints also exist: `POST /upload/audio` and `POST /upload/artwork` are implemented in `convex/http.js` and store files in Convex Storage.

Behavior summary
- If Cloudinary env vars are present and the admin UI uploads files, the client will call the Convex signer and then upload directly to Cloudinary.
- If Cloudinary is not configured, the app still contains Convex HTTP endpoints to accept and store uploads, but the admin components currently call Cloudinary.

Environment variables
- Cloudinary (server): `CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` / `VITE_CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` / `VITE_CLOUDINARY_API_SECRET`.
- Client-side (optional unsigned preset): `REACT_APP_CLOUDINARY_CLOUD_NAME` and `REACT_APP_CLOUDINARY_UPLOAD_PRESET` or `VITE_CLOUDINARY_...` equivalents.

Next steps (options)
- Switch admin UI to use Convex storage endpoints (`/upload/audio`, `/upload/artwork`).
- Add a runtime toggle to let admins choose Cloudinary vs Convex storage.
- Keep current Cloudinary flow (ensure env vars set and Convex signer enabled).

If you want, I can implement option (1) or (2) now — tell me which.
