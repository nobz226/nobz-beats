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
    setEditState({ title: track.title, description: track.description })
  }

  const saveEdit = async (id) => {
    try {
      // Only send properties that the user actually edited and are defined.
      const patch = {}
      if (Object.prototype.hasOwnProperty.call(editState, 'title')) patch.title = editState.title
      if (Object.prototype.hasOwnProperty.call(editState, 'description')) patch.description = editState.description
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
    <div className="admin-tracks">
      <h3>All tracks</h3>
      <div className="admin-table">
        <div className="admin-table-row admin-table-head">
          <div>Artwork</div>
          <div>Title / Description</div>
          <div>Type</div>
          <div>Actions</div>
        </div>
        {tracks.map(track => (
          <div key={String(track._id)} className="admin-table-row">
            <div className="art-cell">
              <img src={track.artwork || '/assets/artwork/default.png'} alt="art" width={64} height={64} />
            </div>
            <div>
              {editingId === track._id ? (
                <div>
                  <input value={editState.title} onChange={e => setEditState({...editState, title: e.target.value})} />
                  <textarea value={editState.description} onChange={e => setEditState({...editState, description: e.target.value})} />
                </div>
              ) : (
                <div>
                  <strong>{track.title}</strong>
                  <div className="muted">{track.description}</div>
                </div>
              )}
              <div style={{marginTop: 8}}>
                <label style={{display: 'block', fontSize: 12}}>Album</label>
                <select
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
            <div>{track.type || 'single'}</div>
            <div className="admin-actions">
              {editingId === track._id ? (
                <>
                  <button className="btn" onClick={() => saveEdit(track._id)}>Save</button>
                  <button className="btn" onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn" onClick={() => startEdit(track)}>Edit</button>
                  <button className="btn" onClick={() => remove(track._id)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
