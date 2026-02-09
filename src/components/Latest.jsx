import React from 'react'
import { SingleItem } from './Singles'
import { AlbumItem } from './Albums'
import TwoUpCarousel from './TwoUpCarousel'

export default function Latest({ items = [], onPlay, onAdd, onPlayAlbum, onAddAlbum, onPlayTrack, onAddTrack }) {
  // `items` is an array of normalized objects with `kind: 'track'|'album'`.
  return (
    <section 
      className="latest-section fixed z-[1000] text-white opacity-0 translate-y-2 animate-section-fade"
      style={{
        left: 'calc(var(--logo-size) + var(--logo-gap) + 1.125rem)',
        top: '14.375rem',
        maxWidth: 'var(--latest-maxwidth, calc(100% - (var(--logo-size) + var(--logo-gap) + 2rem)))',
        animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s)'
      }}
      aria-label="Latest release"
    >
      <h2 className="font-cal-sans font-bold text-[1.75rem] m-0 mb-2">Latest</h2>
      <TwoUpCarousel className="grid gap-24 items-start justify-center mt-3 grid-cols-[22.5rem_1fr]">
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
                className="col-start-2 w-full max-w-none items-stretch"
              />
            )
          }
          // default to track
          return <SingleItem key={`track-${it.id}`} track={it} onPlay={onPlay} onAdd={onAdd} className="flex flex-col gap-3 items-center w-[22.5rem]" />
        })}
      </TwoUpCarousel>
    </section>
  )
}
