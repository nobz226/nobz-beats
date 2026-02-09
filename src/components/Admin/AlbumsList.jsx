import React, { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { uploadToCloudinary } from '../../lib/cloudinary.js'

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
      if (editing.artFile) {
        artworkUrl = await uploadToCloudinary(editing.artFile)
      }

      // update album doc
      await updateAlbum({ id: editing.id, patch: { title: editing.title, description: editing.description, artwork: artworkUrl } })

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
    <div>
      <h3>Albums</h3>

      {editing && (
        <form className="admin-form" onSubmit={submitEdit} style={{ marginBottom: 16 }}>
          <h4>Edit album</h4>
          <label>Title<input value={editing.title} onChange={e => onChangeField('title', e.target.value)} required /></label>
          <label>Description<textarea value={editing.description} onChange={e => onChangeField('description', e.target.value)} /></label>
          <label>Artwork (leave empty to keep current)<input type="file" accept="image/*" onChange={e => onChangeField('artFile', e.target.files?.[0] || null)} /></label>

          <div style={{ marginTop: 8 }}>
            <strong>Tracklist</strong>
            <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>Check tracks to include in this album</div>
            <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
              {allTracks.map(t => {
                const tid = String(t._id || t.id)
                return (
                  <div key={tid} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label style={{ flex: 1 }}>
                      <input type="checkbox" checked={editing.memberIds.has(tid)} onChange={() => toggleTrackMember(tid)} /> {t.title} — <span className="muted">{t.artist}</span>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <button className="btn" type="submit">Save</button>
            <button className="btn" type="button" onClick={cancelEdit} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-table">
        <div className="admin-table-row admin-table-head">
          <div>Artwork</div>
          <div>Title / Description</div>
          <div>Created</div>
          <div>Actions</div>
        </div>
        {sortedAlbums.map(a => {
          const aid = a._id || a.id
          return (
            <div key={String(aid)} className="admin-table-row">
              <div className="art-cell"><img src={a.artwork || '/artwork/default.png'} alt="art" width={64} height={64} /></div>
              <div>
                <strong>{a.title}</strong>
                <div className="muted">{a.description}</div>
              </div>
              <div>{new Date(a.createdAt).toLocaleString()}</div>
              <div className="admin-actions">
                <button className="btn" onClick={() => startEdit(a)}>Edit</button>
                <button className="btn" onClick={() => remove(a._id)}>Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
