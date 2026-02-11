// HTTP actions to accept file uploads and store them in Convex Storage
// POST /upload/artwork -> multipart form with file in 'file'
// POST /upload/audio -> multipart form with file in 'file'

import { httpAction } from './_generated/server.js'

// helpers to read multipart form via Request.formData()
async function readMultipartBody(req) {
  const contentType = req.headers?.get?.('content-type') || ''
  console.log('[readMultipartBody] contentType:', contentType)

  if (contentType.startsWith('multipart/')) {
    // Handle multipart/form-data
    try {
      const form = await req.formData()
      const file = form.get('file')
      if (file) {
        const arrayBuffer = await file.arrayBuffer()
        const fileBuffer = new Uint8Array(arrayBuffer)
        const fileInfo = { filename: file.name || 'file', mimeType: file.type || 'application/octet-stream' }
        return { fileBuffer, fileInfo }
      }
    } catch (e) {
      console.log('[readMultipartBody] formData failed:', e.message)
    }
  } else {
    // Handle raw bytes with headers
    console.log('[readMultipartBody] trying raw arrayBuffer')
    try {
      const arrayBuffer = await req.arrayBuffer()
      console.log('[readMultipartBody] arrayBuffer length:', arrayBuffer.byteLength)
      const fileBuffer = new Uint8Array(arrayBuffer)
      const filename = req.headers?.get?.('x-filename') || 'file'
      const mimeType = contentType || 'application/octet-stream'
      const fileInfo = { filename, mimeType }
      return { fileBuffer, fileInfo }
    } catch (err) {
      console.log('[readMultipartBody] arrayBuffer failed:', err.message)
    }
  }

  return { fileBuffer: null, fileInfo: null }
}

const MAX_AUDIO = 25 * 1024 * 1024 // 25MB
const MAX_IMAGE = 5 * 1024 * 1024 // 5MB

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    // include X-Filename so preflight responses allow raw uploads from non-browser clients
    'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Filename',
    'Access-Control-Max-Age': '86400'
  }
}

const jsonResponse = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: corsHeaders() })
const emptyResponse = (status = 204) => new Response(null, { status, headers: corsHeaders() })

// Simple HTTP action to reply to preflight OPTIONS requests with correct CORS headers
export const optionsOk = httpAction(async (ctx, request) => {
  return emptyResponse(204)
})

export const uploadArtwork = httpAction(async ({ storage }, request) => {
  try {
    if (!storage || (typeof storage.put !== 'function' && typeof storage.store !== 'function')) {
      console.error('[uploadArtwork] Convex Storage unavailable or misconfigured', storage)
      return jsonResponse({ error: 'Convex Storage unavailable on this deployment' }, 503)
    }
    const { fileBuffer, fileInfo } = await readMultipartBody(request)
    if (!fileBuffer || !fileInfo) return jsonResponse({ error: 'no file' }, 400)

    console.log('[uploadArtwork] fileInfo:', fileInfo, 'bufferLength:', fileBuffer?.byteLength ?? fileBuffer?.length)

    // simple validation
    if (!fileInfo.mimeType.startsWith('image/')) return jsonResponse({ error: 'invalid type' }, 400)
    if ((fileBuffer.byteLength || fileBuffer.length) > MAX_IMAGE) return jsonResponse({ error: 'file too large' }, 413)

    const name = `artwork/${Date.now()}-${fileInfo.filename}`
    let storageId
    if (typeof storage.put === 'function') {
      // older API: put(name, bytes, opts) -> key
      storageId = await storage.put(name, fileBuffer, { contentType: fileInfo.mimeType })
    } else {
      // newer API: store(blob) -> storage id
      const blob = new Blob([fileBuffer], { type: fileInfo.mimeType })
      storageId = await storage.store(blob)
    }
    const url = typeof storage.getUrl === 'function' ? await storage.getUrl(storageId) : null
    return jsonResponse({ url, storageId }, 200)
  } catch (err) {
    console.error('[uploadArtwork] unexpected error', err)
    return jsonResponse({ error: 'internal server error' }, 500)
  }
})

export const uploadAudio = httpAction(async ({ storage }, request) => {
  try {
    if (!storage || (typeof storage.put !== 'function' && typeof storage.store !== 'function')) {
      console.error('[uploadAudio] Convex Storage unavailable or misconfigured', storage)
      return jsonResponse({ error: 'Convex Storage unavailable on this deployment' }, 503)
    }
    const { fileBuffer, fileInfo } = await readMultipartBody(request)
    if (!fileBuffer || !fileInfo) return jsonResponse({ error: 'no file' }, 400)

    console.log('[uploadAudio] fileInfo:', fileInfo, 'bufferLength:', fileBuffer?.byteLength ?? fileBuffer?.length)

    // validate mime types for audio
    if (!fileInfo.mimeType.startsWith('audio/')) return jsonResponse({ error: 'invalid type' }, 400)
    if ((fileBuffer.byteLength || fileBuffer.length) > MAX_AUDIO) return jsonResponse({ error: 'file too large' }, 413)

    const name = `audio/${Date.now()}-${fileInfo.filename}`
    let storageId
    if (typeof storage.put === 'function') {
      storageId = await storage.put(name, fileBuffer, { contentType: fileInfo.mimeType })
    } else {
      const blob = new Blob([fileBuffer], { type: fileInfo.mimeType })
      storageId = await storage.store(blob)
    }
    const url = typeof storage.getUrl === 'function' ? await storage.getUrl(storageId) : null
    return jsonResponse({ url, storageId }, 200)
  } catch (err) {
    console.error('[uploadAudio] unexpected error', err)
    return jsonResponse({ error: 'internal server error' }, 500)
  }
})

// Cloudinary signing removed: uploads now go to Convex Storage endpoints

import { httpRouter } from 'convex/server'

const router = httpRouter()
router.route({ path: '/upload/artwork', method: 'POST', handler: uploadArtwork })
router.route({ path: '/upload/artwork', method: 'OPTIONS', handler: optionsOk })
router.route({ path: '/upload/audio', method: 'POST', handler: uploadAudio })
router.route({ path: '/upload/audio', method: 'OPTIONS', handler: optionsOk })

// cloudinary signing endpoints removed

export default router
