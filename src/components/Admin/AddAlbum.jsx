import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { uploadToStorage } from '../../lib/storage.js'

// helper to upload to Convex HTTP endpoints with robust error messages
// ... (removed)

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
      let artwork = '/artwork/default.png'
      let artworkStorageId = undefined
      if (artFile) {
        const res = await uploadToStorage(artFile)
        artwork = res.url
        artworkStorageId = res.storageId
      }
      const payload = { title, description, artwork, artworkStorageId, createdAt: Date.now() }
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
    <div className="mt-8 max-w-2xl">
      <h3 className="text-xl font-bold mb-6 font-cal-sans">Create album</h3>
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
        
        <label className="block mb-6">
          <span className="block text-sm font-medium mb-1 opacity-80">Artwork</span>
          <input 
            type="file" 
            accept="image/*" 
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
            onChange={e => setArtFile(e.target.files?.[0] || null)} 
          />
        </label>
        
        <div className="mt-2">
          <button 
            className={`px-4 py-2 bg-white/10 text-white rounded font-medium hover:bg-white/20 transition-colors w-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`} 
            type="submit" 
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Create Album'}
          </button>
        </div>
      </form>
    </div>
  )
}
