import React from 'react'
import { SingleItem } from './Singles'
import { AlbumItem } from './Albums'
import TwoUpCarousel from './TwoUpCarousel'

export default function Latest({ items = [], onPlay, onAdd, onPlayAlbum, onAddAlbum, onPlayTrack, onAddTrack }) {
  // `items` is an array of normalized objects with `kind: 'track'|'album'`.
  return (
    <section className="latest-section" aria-label="Latest release">
      <h2 className="cal-sans-title">Latest</h2>
      <TwoUpCarousel className="latest-grid latest--featured">
        {items.map(it => {
          if (it.kind === 'album') {
            // pass album-shaped object to AlbumItem
            return (
              <AlbumItem
                key={`album-${it.id}`}
                track={it}
                onPlayAlbum={onPlayAlbum}
                onAddAlbum={onAddAlbum}
                onPlayTrack={onPlayTrack}
                onAddTrack={onAddTrack}
              />
            )
          }
          // default to track
          return <SingleItem key={`track-${it.id}`} track={it} onPlay={onPlay} onAdd={onAdd} />
        })}
      </TwoUpCarousel>
    </section>
  )
}
