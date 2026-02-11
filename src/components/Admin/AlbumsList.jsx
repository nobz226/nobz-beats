import React, { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { uploadToStorage } from '../../lib/storage.js'

export default function AlbumsList() {
  const albums = useQuery('functions/albums:listAlbums') || []
  const allTracks = useQuery('functions/tracks:listTracks') || []

  const deleteAlbum = useMutation('functions/albums:deleteAlbum')
  const updateAlbum = useMutation('functions/albums:updateAlbum')
  const updateTrack = useMutation('functions/tracks:updateTrack')

  const [editing, setEditing] = useState(null)

  const remove = async (id) => {
    if (!confirm('Delete this album? This will not delete tracks.')) return
    try {
      await deleteAlbum({ id })
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  const startEdit = (a) => {
    const id = a._id || a.id
    const memberIds = new Set(allTracks.filter(t => (t.albumId === id)).map(t => String(t._id || t.id)))
    setEditing({ id, title: a.title || '', description: a.description || '', artwork: a.artwork || '', artFile: null, memberIds })
  }

  const cancelEdit = () => setEditing(null)

  const toggleTrackMember = (trackId) => {
    setEditing(prev => {
      if (!prev) return prev
      const ids = new Set(prev.memberIds)
      if (ids.has(trackId)) ids.delete(trackId)
      else ids.add(trackId)
      return { ...prev, memberIds: ids }
    })
  }

  const onChangeField = (field, value) => setEditing(prev => ({ ...prev, [field]: value }))

  const submitEdit = async (e) => {
    e.preventDefault()
    if (!editing) return
    try {
      let artworkUrl = editing.artwork || ''
      let artworkStorageId = editing.artworkStorageId
      if (editing.artFile) {
        const res = await uploadToStorage(editing.artFile)
        artworkUrl = res.url
        artworkStorageId = res.storageId
      }

      // update album doc (include artworkStorageId for cleanup)
      await updateAlbum({ id: editing.id, patch: { title: editing.title, description: editing.description, artwork: artworkUrl, artworkStorageId } })

      // compute track membership changes
      const originalMembers = new Set(allTracks.filter(t => (t.albumId === editing.id)).map(t => String(t._id || t.id)))
      const newMembers = new Set(Array.from(editing.memberIds || []))

      // tracks to add: in newMembers but not in originalMembers
      for (const tid of Array.from(newMembers)) {
        if (!originalMembers.has(tid)) {
          try { await updateTrack({ id: tid, patch: { albumId: editing.id } }) } catch (e) { console.error('Failed to add track to album', tid, e) }
        }
      }

      // tracks to remove: in originalMembers but not in newMembers
      for (const tid of Array.from(originalMembers)) {
        if (!newMembers.has(tid)) {
          try { await updateTrack({ id: tid, patch: { albumId: null } }) } catch (e) { console.error('Failed to remove track from album', tid, e) }
        }
      }

      alert('Album updated')
      setEditing(null)
    } catch (err) {
      console.error(err)
      alert('Update failed: ' + (err.message || err))
    }
  }

  const sortedAlbums = useMemo(() => albums.slice().sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)), [albums])

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 font-cal-sans">Albums</h3>

      {editing && (
        <form className="bg-white/5 p-6 rounded-lg mb-8 border border-white/10" onSubmit={submitEdit}>
          <h4 className="text-lg font-bold mb-4">Edit album</h4>
          <label className="block mb-4">
            <span className="block text-sm font-medium mb-1 opacity-80">Title</span>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"
              value={editing.title} 
              onChange={e => onChangeField('title', e.target.value)} 
              required 
            />
          </label>
          <label className="block mb-4">
            <span className="block text-sm font-medium mb-1 opacity-80">Description</span>
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30 min-h-[80px]"
              value={editing.description} 
              onChange={e => onChangeField('description', e.target.value)} 
            />
          </label>
          <label className="block mb-6">
            <span className="block text-sm font-medium mb-1 opacity-80">Artwork (leave empty to keep current)</span>
            <input 
              type="file" 
              accept="image/*" 
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
              onChange={e => onChangeField('artFile', e.target.files?.[0] || null)} 
            />
          </label>

          <div className="mb-6">
            <strong className="block mb-2">Tracklist</strong>
            <div className="text-xs text-white/50 mb-2">Check tracks to include in this album</div>
            <div className="max-h-60 overflow-y-auto border border-white/10 rounded p-2 bg-white/[0.02]">
              {(allTracks || []).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)).map(t => {
                const tid = String(t._id || t.id)
                // If editing.memberIds is undefined, default to empty set to avoid crash
                const isChecked = editing.memberIds && editing.memberIds.has(tid)
                return (
                  <div key={tid} className="flex items-center gap-2 py-1 hover:bg-white/5 rounded px-1">
                    <label className="flex-1 flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="mr-2 accent-white"
                        checked={isChecked} 
                        onChange={() => toggleTrackMember(tid)} 
                      /> 
                      <span className="text-sm">{t.title}</span> 
                      <span className="text-xs text-white/50 ml-2">{t.artist}</span>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/10 text-white rounded font-medium hover:bg-white/20 transition-colors" type="submit">Save</button>
            <button className="px-4 py-2 bg-transparent border border-white/20 text-white rounded font-medium hover:bg-white/5 transition-colors" type="button" onClick={cancelEdit}>Cancel</button>
          </div>
        </form>
      )}

      <div className="w-full">
        <div className="flex items-center border-b border-white/20 py-2 font-bold text-sm text-white/50 bg-white/5 px-4 rounded-t-lg">
          <div className="w-20">Artwork</div>
          <div className="flex-1 px-4">Title / Description</div>
          <div className="w-40">Created</div>
          <div className="w-40 text-right">Actions</div>
        </div>
        {sortedAlbums.map(a => {
          const aid = a._id || a.id
          return (
            <div key={String(aid)} className="flex items-center border-b border-white/5 py-4 px-4 hover:bg-white/[0.02]">
              <div className="w-20">
                <img src={a.artwork || '/artwork/default.png'} alt="art" className="w-16 h-16 object-cover rounded" />
              </div>
              <div className="flex-1 px-4">
                <strong className="block text-white font-medium">{a.title}</strong>
                <div className="text-sm text-white/60">{a.description}</div>
              </div>
              <div className="w-40 text-sm text-white/60">{new Date(a.createdAt).toLocaleDateString()}</div>
              <div className="w-40 flex gap-2 justify-end">
                <button className="px-3 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20" onClick={() => startEdit(a)}>Edit</button>
                <button className="px-3 py-1 bg-red-500/20 text-red-200 rounded text-sm hover:bg-red-500/30" onClick={() => remove(a._id)}>Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
