import React, { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { uploadToStorage } from '../../lib/storage.js'

  // helper to upload to Convex HTTP endpoints with robust error messages
// ... (removed)

export default function AddTrack() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('single')
  const [artFile, setArtFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [albumId, setAlbumId] = useState('')
  const [uploading, setUploading] = useState(false)

  // ... (keep hooks)
  const albums = useQuery('functions/albums:listAlbums') || []
  const createTrack = useMutation('functions/tracks:createTrack')

  const onSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      let artworkUrl = '/artwork/default.png'
      let artworkStorageId = undefined
      if (artFile) {
        const res = await uploadToStorage(artFile)
        artworkUrl = res.url
        artworkStorageId = res.storageId
      } else if (type === 'album' && albumId) {
        const alb = albums.find(a => (a._id || a.id) === albumId)
        if (alb && alb.artwork) artworkUrl = alb.artwork
      }

      let audioUrl = ''
      let audioStorageId = undefined
      if (audioFile) {
        const res = await uploadToStorage(audioFile)
        audioUrl = res.url
        audioStorageId = res.storageId
      } else {
        throw new Error('Audio file is required')
      }

      const payload = { 
        title, 
        description, 
        artwork: artworkUrl, 
        artworkStorageId,
        src: audioUrl, 
        srcStorageId: audioStorageId,
        type, 
        createdAt: Date.now() 
      }
      if (albumId && type === 'album') payload.albumId = albumId
      
      await createTrack(payload) // This might need arguments like { ...payload } depending on mutation definition
      // The original code passed `payload` directly. Assuming `createTrack` expects the object.
      // Wait, original: `await createTrack(payload)`
      // Correct.

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
    <div className="mt-8 max-w-2xl">
      <h3 className="text-xl font-bold mb-6 font-cal-sans">Add track</h3>
      <form className="bg-white/5 p-6 rounded-lg border border-white/10" onSubmit={onSubmit}>
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 opacity-80">Title</span>
          <input 
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
          />
        </label>
        
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 opacity-80">Description</span>
          <textarea 
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30 min-h-[80px]"
            value={description} 
            onChange={e => setDescription(e.target.value)} 
          />
        </label>

        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 opacity-80">Type</span>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"
            value={type} 
            onChange={e => setType(e.target.value)}
          >
            <option value="single">Single</option>
            <option value="album">Album track</option>
            <option value="remix">Remix</option>
          </select>
        </label>
        
        {type === 'album' && (
          <label className="block mb-4">
            <span className="block text-sm font-medium mb-1 opacity-80">Album</span>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"
              value={albumId} 
              onChange={e => setAlbumId(e.target.value)}
              required
            >
              <option value="">-- choose album --</option>
              {albums.map(a => <option key={String(a._id || a.id)} value={a._id || a.id}>{a.title}</option>)}
            </select>
          </label>
        )}
        
        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1 opacity-80">Artwork (optional)</span>
          <input 
            type="file" 
            accept="image/*" 
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
            onChange={e => setArtFile(e.target.files?.[0] || null)} 
          />
        </label>
        
        <label className="block mb-6">
          <span className="block text-sm font-medium mb-1 opacity-80">Audio (mp3/wav/flac)</span>
          <input 
            type="file" 
            accept="audio/*" 
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
            onChange={e => setAudioFile(e.target.files?.[0] || null)} 
            required
          />
        </label>
        
        <div className="mt-2">
          <button 
            className={`px-4 py-2 bg-white/10 text-white rounded font-medium hover:bg-white/20 transition-colors w-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`} 
            type="submit" 
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Add Track'}
          </button>
        </div>
      </form>
    </div>
  )
}
