import React from 'react'
import { SingleItem } from './Singles'
import { AlbumItem } from './Albums'
import TwoUpCarousel from './TwoUpCarousel'

export default function Latest({ items = [], onPlay, onAdd, onPlayAlbum, onAddAlbum, onPlayTrack, onAddTrack }) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // `items` is an array of normalized objects with `kind: 'track'|'album'`.
  return (
    <section 
      className={`latest-section fixed z-[1000] text-white opacity-0 translate-y-2 animate-section-fade ${isMobile ? 'left-0 right-0 w-full flex flex-col overflow-hidden' : 'p-0 custom-scrollbar'}`}
      style={{
        left: isMobile ? '0' : 'var(--main-left)',
        top: 'var(--main-top)',
        bottom: isMobile ? '8rem' : 'auto',
        width: isMobile ? '100%' : 'auto',
        maxWidth: isMobile ? 'none' : 'var(--latest-maxwidth, calc(100% - (var(--logo-size) + var(--logo-gap) + 2rem)))',
        animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s)'
      }}
      aria-label="Latest release"
    >
      <h2 className={`font-cal-sans font-bold text-[1.75rem] m-0 mb-2 ${isMobile ? 'px-4' : ''}`}>Latest</h2>
      
      {!isMobile ? (
        <TwoUpCarousel className="grid gap-8 md:gap-24 items-start justify-center mt-3 grid-cols-1 lg:grid-cols-[22.5rem_1fr]">
          {items.map(it => {
            if (it.kind === 'album') {
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
            return <SingleItem key={`track-${it.id}`} track={it} onPlay={onPlay} onAdd={onAdd} className="flex flex-col gap-3 items-center w-[22.5rem]" />
          })}
        </TwoUpCarousel>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col gap-16 mt-6 pb-24 items-center px-4">
          {items.map(it => {
            if (it.kind === 'album') {
              return (
                <AlbumItem
                  key={`album-mob-${it.id}`}
                  track={it}
                  onPlayAlbum={onPlayAlbum}
                  onAddAlbum={onAddAlbum}
                  onPlayTrack={onPlayTrack}
                  onAddTrack={onAddTrack}
                />
              )
            }
            return <SingleItem key={`track-mob-${it.id}`} track={it} onPlay={onPlay} onAdd={onAdd} />
          })}
        </div>
      )}
    </section>
  )
}
