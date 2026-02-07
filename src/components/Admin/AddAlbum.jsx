import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { uploadToCloudinary } from '../../lib/cloudinary.js'

function getConvexSiteBase() {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_CONVEX_SITE_URL || import.meta.env.VITE_CONVEX_URL)) ||
    (typeof process !== 'undefined' && process.env && (process.env.REACT_APP_CONVEX_SITE_URL || process.env.REACT_APP_CONVEX_URL)) ||
    ''
  )
}

function getLocalUploadBase() {
  const localPort =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LOCAL_UPLOAD_PORT) ||
    (typeof process !== 'undefined' && process.env && process.env.LOCAL_UPLOAD_PORT) ||
    '5001'
  return `http://localhost:${localPort}`
}

// helper to upload to Convex HTTP endpoints with robust error messages
async function uploadToConvex(endpoint, file) {
  // Send raw bytes with Content-Type and X-Filename headers (matches server fallback)
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-Filename': file.name || 'file'
    },
    body: file
  }

  const res = await fetch(endpoint, opts)
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch (e) { /* ignore */ }
  if (!res.ok) {
    const errMsg = (json && json.error) || text || res.statusText
    throw new Error(`Upload failed: ${errMsg} (status ${res.status})`)
  }
  return json && json.url ? json.url : null
}

export default function AddAlbum() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [artFile, setArtFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const createAlbum = useMutation('functions/albums:createAlbum')

  const onSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      let artwork = ''
      if (artFile) {
        artwork = await uploadToCloudinary(artFile)
      }
      const payload = { title, description, artwork, createdAt: Date.now() }
      await createAlbum(payload)
      alert('Album created')
      setTitle(''); setDescription(''); setArtFile(null)
    } catch (err) {
      console.error(err)
      alert('Failed to create album: ' + (err.message || err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h3>Create album</h3>
      <form className="admin-form" onSubmit={onSubmit}>
        <label>Title<input value={title} onChange={e => setTitle(e.target.value)} required /></label>
        <label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} /></label>
        <label>Artwork<input type="file" accept="image/*" onChange={e => setArtFile(e.target.files?.[0] || null)} /></label>
        <div style={{marginTop: 8}}>
          <button className="btn" type="submit">Create Album</button>
        </div>
      </form>
    </div>
  )
}
