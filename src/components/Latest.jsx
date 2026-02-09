import React from 'react'
import { SingleItem } from './Singles'
import { AlbumItem } from './Albums'

export default function Latest({ single, album, onPlay, onAdd, onPlayAlbum, onAddAlbum, onPlayTrack, onAddTrack }) {
  return (
    <section className="latest-section" aria-label="Latest release">
      <h2 className="cal-sans-title">Latest</h2>

      <div className="latest-grid latest--featured">
        <SingleItem track={single} onPlay={onPlay} onAdd={onAdd} />
        <AlbumItem
          track={album}
          onPlayAlbum={onPlayAlbum || onPlay}
          onAddAlbum={onAddAlbum || onAdd}
          onPlayTrack={onPlayTrack || onPlay}
          onAddTrack={onAddTrack || onAdd}
        />
      </div>
    </section>
  )
}
