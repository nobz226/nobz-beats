import React, { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { uploadToCloudinary } from '../../lib/cloudinary.js'

// helper to get the site base for Convex HTTP actions (prefer site URL)
function getConvexSiteBase() {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_CONVEX_SITE_URL || import.meta.env.VITE_CONVEX_URL)) ||
    (typeof process !== 'undefined' && process.env && (process.env.REACT_APP_CONVEX_SITE_URL || process.env.REACT_APP_CONVEX_URL)) ||
    ''
  )
}

function getLocalUploadBase() {
  // local upload server (start with `npm run start-uploads`)
  const localPort =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LOCAL_UPLOAD_PORT) ||
    (typeof process !== 'undefined' && process.env && process.env.LOCAL_UPLOAD_PORT) ||
    '5001'
  return `http://localhost:${localPort}`
}

// helper to upload to Convex HTTP endpoints with robust error messages
async function uploadToConvex(endpoint, file) {
  // Send raw bytes with Content-Type and X-Filename headers (avoids server formData issues)
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

export default function AddTrack() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('single')
  const [artFile, setArtFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [albumId, setAlbumId] = useState('')
  const [uploading, setUploading] = useState(false)

  const albums = useQuery('functions/albums:listAlbums') || []
  const createTrack = useMutation('functions/tracks:createTrack')

  const onSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      let artworkUrl = ''
      if (artFile) {
        // If an artwork file is provided, upload it (signed Cloudinary)
        artworkUrl = await uploadToCloudinary(artFile)
      } else if (type === 'album' && albumId) {
        // No artwork provided but track is part of an album -> use album artwork
        const alb = albums.find(a => (a._id || a.id) === albumId)
        artworkUrl = alb?.artwork || '/artwork/default.png'
      } else if (type === 'single' || type === 'remix') {
        // Single or remix with no artwork -> use default
        artworkUrl = '/artwork/default.png'
      }

      let audioUrl = ''
      if (audioFile) {
        audioUrl = await uploadToCloudinary(audioFile)
      }

      const payload = { title, description, artwork: artworkUrl, src: audioUrl, type, createdAt: Date.now() }
      if (albumId) payload.albumId = albumId
      await createTrack(payload)
      alert('Track created')
      setTitle(''); setDescription(''); setArtFile(null); setAudioFile(null); setAlbumId('')
    } catch (err) {
      console.error(err)
      alert('Failed to add track: ' + (err.message || err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h3>Add track</h3>
      <form className="admin-form" onSubmit={onSubmit}>
        <label>Title<input value={title} onChange={e => setTitle(e.target.value)} required /></label>
        <label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} /></label>
        <label>Type<select value={type} onChange={e => setType(e.target.value)}>
          <option value="single">Single</option>
          <option value="album">Album track</option>
          <option value="remix">Remix</option>
        </select></label>
        {type === 'album' && (
          <label>Album<select value={albumId} onChange={e => setAlbumId(e.target.value)}>
            <option value="">-- choose album --</option>
            {albums.map(a => <option key={String(a._id || a.id)} value={a._id || a.id}>{a.title}</option>)}
          </select></label>
        )}
        <label>Artwork (optional)<input type="file" accept="image/*" onChange={e => setArtFile(e.target.files?.[0] || null)} /></label>
        <label>Audio (mp3/wav/flac)<input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)} /></label>
        <div style={{marginTop: 8}}>
          <button className="btn" type="submit" disabled={uploading}>{uploading ? 'Uploading…' : 'Add Track'}</button>
        </div>
      </form>
    </div>
  )
}
