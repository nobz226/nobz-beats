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
    const { fileBuffer, fileInfo } = await readMultipartBody(request)
    if (!fileBuffer || !fileInfo) return jsonResponse({ error: 'no file' }, 400)

    console.log('[uploadArtwork] fileInfo:', fileInfo, 'bufferLength:', fileBuffer?.byteLength ?? fileBuffer?.length)

    // simple validation
    if (!fileInfo.mimeType.startsWith('image/')) return jsonResponse({ error: 'invalid type' }, 400)
    if ((fileBuffer.byteLength || fileBuffer.length) > MAX_IMAGE) return jsonResponse({ error: 'file too large' }, 413)

    const name = `artwork/${Date.now()}-${fileInfo.filename}`
    const key = await storage.put(name, fileBuffer, { contentType: fileInfo.mimeType })
    const url = storage.getUrl(key)
    return jsonResponse({ url }, 200)
  } catch (err) {
    console.error('[uploadArtwork] unexpected error', err)
    return jsonResponse({ error: 'internal server error' }, 500)
  }
})

export const uploadAudio = httpAction(async ({ storage }, request) => {
  try {
    const { fileBuffer, fileInfo } = await readMultipartBody(request)
    if (!fileBuffer || !fileInfo) return jsonResponse({ error: 'no file' }, 400)

    console.log('[uploadAudio] fileInfo:', fileInfo, 'bufferLength:', fileBuffer?.byteLength ?? fileBuffer?.length)

    // validate mime types for audio
    if (!fileInfo.mimeType.startsWith('audio/')) return jsonResponse({ error: 'invalid type' }, 400)
    if ((fileBuffer.byteLength || fileBuffer.length) > MAX_AUDIO) return jsonResponse({ error: 'file too large' }, 413)

    const name = `audio/${Date.now()}-${fileInfo.filename}`
    const key = await storage.put(name, fileBuffer, { contentType: fileInfo.mimeType })
    const url = storage.getUrl(key)
    return jsonResponse({ url }, 200)
  } catch (err) {
    console.error('[uploadAudio] unexpected error', err)
    return jsonResponse({ error: 'internal server error' }, 500)
  }
})

// Cloudinary signing endpoint: returns timestamp + signature + api_key + cloud
export const cloudinarySign = httpAction(async (ctx, request) => {
  try {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET
    if (!cloud || !apiKey || !apiSecret) {
      return jsonResponse({ error: 'cloudinary not configured' }, 503)
    }

    const timestamp = Math.floor(Date.now() / 1000)

    async function sha1Hex(input) {
      if (globalThis.crypto?.subtle?.digest) {
        const data = new TextEncoder().encode(input)
        const digest = await crypto.subtle.digest('SHA-1', data)
        const bytes = new Uint8Array(digest)
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
      }
      try {
        // Node fallback if available
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const cryptoNode = require('crypto')
        return cryptoNode.createHash('sha1').update(input).digest('hex')
      } catch (e) {
        console.error('[cloudinarySign] no crypto available', e.message)
        return null
      }
    }

    const toSign = `timestamp=${timestamp}${apiSecret}`
    const signature = await sha1Hex(toSign)
    if (!signature) return jsonResponse({ error: 'crypto unavailable' }, 500)

    return jsonResponse({ cloud, api_key: apiKey, timestamp, signature })
  } catch (err) {
    console.error('[cloudinarySign] unexpected error', err)
    return jsonResponse({ error: 'internal server error' }, 500)
  }
})

import { httpRouter } from 'convex/server'

const router = httpRouter()
router.route({ path: '/upload/artwork', method: 'POST', handler: uploadArtwork })
router.route({ path: '/upload/artwork', method: 'OPTIONS', handler: optionsOk })
router.route({ path: '/upload/audio', method: 'POST', handler: uploadAudio })
router.route({ path: '/upload/audio', method: 'OPTIONS', handler: optionsOk })

router.route({ path: '/cloudinary/sign', method: 'POST', handler: cloudinarySign })
router.route({ path: '/cloudinary/sign', method: 'OPTIONS', handler: optionsOk })

export default router
