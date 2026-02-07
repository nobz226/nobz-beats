import React from 'react'
import { SingleItem } from './Singles'
import { AlbumItem } from './Albums'

export default function Latest({ single, album, onPlay, onAdd }) {
  return (
    <section className="latest-section" aria-label="Latest release">
      <h2 className="cal-sans-title">Latest</h2>

      <div className="latest-grid">
        <SingleItem track={single} onPlay={onPlay} onAdd={onAdd} />
        <AlbumItem track={album} onPlay={onPlay} onAdd={onAdd} />
      </div>
    </section>
  )
}
