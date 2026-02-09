import React, { useEffect, useRef, useState } from 'react'
import Cover from './Cover'
import TwoUpCarousel from './TwoUpCarousel'
import { playVinyl, pauseVinyl } from '../lib/vinyl'

export function AlbumItem({ track, onPlayAlbum, onAddAlbum }) {
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
    <div className="latest-item" aria-label={`Album ${a.title}`}>
      <Cover track={a} onPlay={() => onPlayAlbum && onPlayAlbum(a)} className="latest-artwork-cover" sleeveImage={a.artwork} />
      <div className="latest-meta cutive-mono-regular">
        <strong>{a.title}</strong>
        <div style={{ marginTop: 6 }}>{a.type}</div>
        <p className="latest-description" style={{ marginTop: 8 }}>{a.description}</p>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={handleTogglePlay}>{isPlaying ? '⏸' : '▶'}</button>
          <button className="btn" aria-label="Add album to playlist" onClick={(e) => { e.stopPropagation(); onAddAlbum && onAddAlbum(a) }}>＋</button>
        </div>
      </div>
    </div>
  )
}

// (tracklist/duration loading removed — albums use same simple cover behavior as singles/remixes)

export default function Albums({ tracks = [], onPlayAlbum, onAddAlbum, onPlayTrack, onAddTrack }) {
  return (
    <section className="latest-section" aria-label="Albums">
      <h2 className="cal-sans-title">Albums</h2>
      <TwoUpCarousel className="latest-grid">
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
    </section>
  )
}
