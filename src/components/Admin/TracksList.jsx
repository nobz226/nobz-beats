import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import AlbumsList from './AlbumsList'

export default function TracksList() {
  const tracks = useQuery('functions/tracks:listTracks') || []
  const albums = useQuery('functions/albums:listAlbums') || []
  const [editingId, setEditingId] = useState(null)
  const [editState, setEditState] = useState({})

  const updateTrack = useMutation('functions/tracks:updateTrack')
  const deleteTrack = useMutation('functions/tracks:deleteTrack')

  const startEdit = (track) => {
    setEditingId(track._id)
    setEditState({ title: track.title, description: track.description, type: track.type || 'single' })
  }

  const saveEdit = async (id) => {
    try {
      // Only send properties that the user actually edited and are defined.
      const patch = {}
      if (Object.prototype.hasOwnProperty.call(editState, 'title')) patch.title = editState.title
      if (Object.prototype.hasOwnProperty.call(editState, 'description')) patch.description = editState.description
      if (Object.prototype.hasOwnProperty.call(editState, 'type')) patch.type = editState.type
      // If nothing to update, just close editor
      if (Object.keys(patch).length === 0) {
        setEditingId(null)
        return
      }
      await updateTrack({ id, patch })
      setEditingId(null)
    } catch (err) {
      console.error(err)
      alert('Save failed')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this track? This action is permanent.')) return
    try {
      await deleteTrack({ id })
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 font-cal-sans">All tracks</h3>
      <div className="w-full">
        <div className="flex items-center border-b border-white/20 py-2 font-bold text-sm text-white/50 bg-white/5 px-4 rounded-t-lg">
          <div className="w-20">Artwork</div>
          <div className="flex-1 px-4">Title / Description</div>
          <div className="w-32">Type</div>
          <div className="w-40 text-right">Actions</div>
        </div>
        {tracks.map(track => (
          <div key={String(track._id)} className="flex items-center border-b border-white/5 py-4 px-4 hover:bg-white/[0.02]">
            <div className="w-20">
              <img src={track.artwork || '/artwork/default.png'} alt="art" className="w-16 h-16 object-cover rounded" />
            </div>
            <div className="flex-1 px-4">
              {editingId === track._id ? (
                <div className="flex flex-col gap-2">
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                    value={editState.title} 
                    onChange={e => setEditState({...editState, title: e.target.value})} 
                  />
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                    value={editState.description} 
                    onChange={e => setEditState({...editState, description: e.target.value})} 
                  />
                  <div className="mt-2">
                    <label className="block text-xs text-white/50 mb-1">Type</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                      value={editState.type} 
                      onChange={e => setEditState({...editState, type: e.target.value})}
                    >
                      <option value="single">Single</option>
                      <option value="album">Album track</option>
                      <option value="remix">Remix</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <strong className="block text-white font-medium">{track.title}</strong>
                  <div className="text-sm text-white/60">{track.description}</div>
                </div>
              )}
              <div className="mt-2">
                <label className="block text-xs text-white/50 mb-1">Album</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm"
                  value={track.albumId ? String(track.albumId) : ''}
                  onChange={async (e) => {
                    const val = e.target.value || null
                    try {
                       await updateTrack({ id: track._id, patch: { albumId: val } })
                    } catch (err) {
                      console.error(err)
                      alert('Failed to update album')
                    }
                  }}
                >
                  <option value="">-- none --</option>
                  {albums.map(a => <option key={String(a._id)} value={String(a._id)}>{a.title}</option>)}
                </select>
              </div>
            </div>
            <div className="w-32 text-sm text-white/70">{track.type || 'single'}</div>
            <div className="w-40 flex gap-2 justify-end">
              {editingId === track._id ? (
                <>
                  <button className="px-3 py-1 bg-green-500/20 text-green-200 rounded text-sm hover:bg-green-500/30" onClick={() => saveEdit(track._id)}>Save</button>
                  <button className="px-3 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20" onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded text-sm hover:bg-blue-500/30" onClick={() => startEdit(track)}>Edit</button>
                  <button className="px-3 py-1 bg-red-500/20 text-red-200 rounded text-sm hover:bg-red-500/30" onClick={() => remove(track._id)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
