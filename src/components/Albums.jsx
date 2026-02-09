import React, { useEffect, useRef, useState } from 'react'
import Cover from './Cover'
import TwoUpCarousel from './TwoUpCarousel'
import { playVinyl, pauseVinyl } from '../lib/vinyl'

export function AlbumItem({ track, onPlayAlbum, onAddAlbum, className = '' }) {
  const a = track || {
    title: 'Vol.1',
    type: 'Album',
    artwork: '/artwork/Nobz-Vol.1-Ver3.png',
    description: 'A melange of genres and influences — from metal to dub, trap and classic boom bap.'
  }

  const [isPlaying, setIsPlaying] = useState(false)
  const trackRef = useRef(a)
  useEffect(() => { trackRef.current = a }, [a])

  useEffect(() => {
    const audio = document.querySelector('.audio-player audio')
    if (!audio) return

    const matchesAudio = () => {
      try {
        const src = audio.src || ''
        const current = trackRef.current
        if (current && Array.isArray(current.tracks) && current.tracks.length > 0) {
          return current.tracks.some(tt => {
            const ts = tt?.src || ''
            if (!ts) return false
            return src.endsWith(ts) || src.includes(ts)
          })
        }
        const t = current.src || ''
        if (!t) return false
        return src.endsWith(t) || src.includes(t)
      } catch (e) {
        return false
      }
    }

    const update = () => setIsPlaying(matchesAudio() && !audio.paused)

    audio.addEventListener('play', update)
    audio.addEventListener('playing', update)
    audio.addEventListener('pause', update)
    audio.addEventListener('ended', update)
    update()

    return () => {
      audio.removeEventListener('play', update)
      audio.removeEventListener('playing', update)
      audio.removeEventListener('pause', update)
      audio.removeEventListener('ended', update)
    }
  }, [])

  const handleTogglePlay = async (e) => {
    e.stopPropagation()
    const audio = document.querySelector('.audio-player audio')
    if (audio && isPlaying) {
      audio.pause()
      setIsPlaying(false)
      try { pauseVinyl(String(a.id || a._id)) } catch (e) {}
      return
    }
    // Ensure album vinyl is visible and spinning immediately when play is requested
    try {
      try { playVinyl(String(a.id || a._id)) } catch (e) {}
    } catch (e) {}
    if (onPlayAlbum) onPlayAlbum(a)
    if (audio) setTimeout(() => audio.play().catch(() => {}), 50)
  }

  return (
    <div className={`flex flex-col gap-3 items-center w-full max-w-[22.5rem] ${className}`.trim()} aria-label={`Album ${a.title}`}>
      <Cover track={a} onPlay={() => onPlayAlbum && onPlayAlbum(a)} className="mr-4" sleeveImage={a.artwork} />
      <div className="font-cutive text-center">
        <strong className="block text-lg font-bold">{a.title}</strong>
        <div className="mt-1.5">{a.type}</div>
        <p className="max-w-80 mx-auto mt-2 leading-relaxed text-center text-[0.9375rem] break-words">{a.description}</p>
        <div className="mt-2 flex gap-2 justify-center">
          <button className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={handleTogglePlay}>{isPlaying ? '⏸' : '▶'}</button>
          <button className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]" aria-label="Add album to playlist" onClick={(e) => { e.stopPropagation(); onAddAlbum && onAddAlbum(a) }}>＋</button>
        </div>
      </div>
    </div>
  )
}

// (tracklist/duration loading removed — albums use same simple cover behavior as singles/remixes)

export default function Albums({ tracks = [], onPlayAlbum, onAddAlbum, onPlayTrack, onAddTrack }) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
      aria-label="Albums"
    >
      <h2 className={`font-cal-sans font-bold text-[1.75rem] m-0 mb-2 ${isMobile ? 'px-4' : ''}`}>Albums</h2>
      
      {!isMobile ? (
        <TwoUpCarousel className="grid gap-8 md:gap-24 items-start justify-center mt-3 grid-cols-1 lg:grid-cols-[repeat(2,22.5rem)]">
          {tracks.map(t => (
            <AlbumItem
              key={t.id}
              track={t}
              onPlayAlbum={onPlayAlbum}
              onAddAlbum={onAddAlbum}
              onPlayTrack={onPlayTrack}
              onAddTrack={onAddTrack}
            />
          ))}
        </TwoUpCarousel>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col gap-16 mt-6 pb-24 items-center px-4">
          {tracks.map(t => (
            <AlbumItem
              key={`mob-${t.id}`}
              track={t}
              onPlayAlbum={onPlayAlbum}
              onAddAlbum={onAddAlbum}
              onPlayTrack={onPlayTrack}
              onAddTrack={onAddTrack}
            />
          ))}
        </div>
      )}
    </section>
  )
}
