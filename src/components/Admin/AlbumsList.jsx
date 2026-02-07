import React from 'react'
import { useQuery, useMutation } from 'convex/react'

export default function AlbumsList() {
  const albums = useQuery('functions/albums:listAlbums') || []
  const deleteAlbum = useMutation('functions/albums:deleteAlbum')

  const remove = async (id) => {
    if (!confirm('Delete this album? This will not delete tracks.')) return
    try {
      await deleteAlbum({ id })
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  return (
    <div>
      <h3>Albums</h3>
      <div className="admin-table">
        <div className="admin-table-row admin-table-head">
          <div>Artwork</div>
          <div>Title / Description</div>
          <div>Created</div>
          <div>Actions</div>
        </div>
        {albums.map(a => (
          <div key={String(a._id)} className="admin-table-row">
            <div className="art-cell"><img src={a.artwork || '/assets/artwork/default.png'} alt="art" width={64} height={64} /></div>
            <div>
              <strong>{a.title}</strong>
              <div className="muted">{a.description}</div>
            </div>
            <div>{new Date(a.createdAt).toLocaleString()}</div>
            <div className="admin-actions">
              <button className="btn" onClick={() => remove(a._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
