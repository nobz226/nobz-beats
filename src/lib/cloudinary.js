// Simple unsigned upload helper for Cloudinary
// Requires these env vars set in your .env or environment:
// REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET

export function hasCloudinaryConfig() {
  const cloud = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_CLOUDINARY_CLOUD_NAME)
  const preset = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET)
  return Boolean(cloud && preset)
}

export async function uploadToCloudinary(file) {
  // Support both Vite import.meta.env and CRA-like process.env fallbacks in dev
  // Require a Convex signer endpoint for signed uploads. This client-only flow
  // will POST to the Convex signer at /cloudinary/sign and then use the returned
  // signature to upload directly to Cloudinary. No unsigned preset fallback.
  const convexBase =
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_CONVEX_SITE_URL || import.meta.env.VITE_CONVEX_URL)) ||
    (typeof process !== 'undefined' && process.env && (process.env.REACT_APP_CONVEX_SITE_URL || process.env.REACT_APP_CONVEX_URL)) ||
    ''

  if (!convexBase) throw new Error('Convex site URL not configured for signed Cloudinary uploads')

  const signUrl = `${convexBase.replace(/\/$/, '')}/cloudinary/sign`
  const signRes = await fetch(signUrl, { method: 'POST' })
  if (!signRes.ok) {
    const txt = await signRes.text().catch(() => '')
    throw new Error(`Cloudinary signer unavailable: ${signRes.status} ${txt}`)
  }
  const signJson = await signRes.json()
  if (!signJson || !signJson.cloud || !signJson.api_key || !signJson.timestamp || !signJson.signature) {
    throw new Error('Cloudinary signer returned invalid response')
  }

  const url = `https://api.cloudinary.com/v1_1/${signJson.cloud}/auto/upload`
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', signJson.api_key)
  fd.append('timestamp', String(signJson.timestamp))
  fd.append('signature', signJson.signature)

  const res = await fetch(url, { method: 'POST', body: fd })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message || 'Cloudinary signed upload failed')
  return json.secure_url
}
