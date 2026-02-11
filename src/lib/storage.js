// Upload helper that sends files to Convex HTTP upload endpoints and returns the stored URL.

function getConvexBase() {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_CONVEX_SITE_URL || import.meta.env.VITE_CONVEX_URL)) ||
    (typeof process !== 'undefined' && process.env && (process.env.REACT_APP_CONVEX_SITE_URL || process.env.REACT_APP_CONVEX_URL)) ||
    ''
  )
}

export function hasStorageConfig() {
  return Boolean(getConvexBase())
}

export async function uploadToStorage(file) {
  const convexBase = getConvexBase()
  if (!convexBase) throw new Error('Convex site URL not configured for uploads')

  const isImage = file.type && file.type.startsWith('image/')
  const isAudio = file.type && file.type.startsWith('audio/')
  const endpoint = isImage ? '/upload/artwork' : isAudio ? '/upload/audio' : null
  if (!endpoint) throw new Error('Unknown file type; only image/* and audio/* are supported')

  const url = `${convexBase.replace(/\/$/, '')}${endpoint}`
  const fd = new FormData()
  fd.append('file', file, file.name)

  const res = await fetch(url, { method: 'POST', body: fd })
  let json
  try { json = await res.json() } catch (e) { throw new Error('Upload failed: invalid JSON response') }
  if (!res.ok) throw new Error(json?.error || `Upload failed: ${res.status}`)
  if (!json.url) throw new Error('Upload succeeded but no url returned')
  return { url: json.url, storageId: json.storageId }
}
