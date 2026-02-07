import React, { useState, useEffect } from 'react'

export function AlbumItem({ track, onPlayAlbum, onAddAlbum, onPlayTrack, onAddTrack }) {
  const [expanded, setExpanded] = useState(false)
  const [durations, setDurations] = useState({})
  const a = track || {
    title: 'Vol.1',
    type: 'Album',
    artwork: '/artwork/Nobz-Vol.1-Ver3.png',
    description: 'A melange of genres and influences — from metal to dub, trap and classic boom bap.',
    tracks: []
  }
  useLoadDurations(expanded, a.tracks, setDurations)

  return (
    <div className="latest-item album-with-tracks" aria-label={`Album ${a.title}`}>
      <div className="album-left">
        <img
          className="latest-artwork"
          src={a.artwork}
          alt={`${a.title} artwork`}
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={() => setExpanded(prev => !prev)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(prev => !prev) } }}
        />
        <div className="latest-meta cutive-mono-regular">
          <strong>{a.title}</strong>
          <div style={{ marginTop: 6 }}>{a.type}</div>
          <p className="latest-description" style={{ marginTop: 8 }}>{a.description}</p>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn" aria-label="Play album" onClick={() => onPlayAlbum && onPlayAlbum(a)}>▶</button>
            <button className="btn" aria-label="Add album to playlist" onClick={() => onAddAlbum && onAddAlbum(a)}>＋</button>
          </div>
        </div>
      </div>

      {a.tracks && a.tracks.length > 0 && (
          <div className={`album-tracks ${expanded ? 'expanded' : 'collapsed'}`} aria-hidden={!expanded}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {a.tracks.map(t => (
                <li key={t.id} className="album-track-row">
                  <div className="playlist-title">{t.title}</div>
                  <div className="album-track-actions">
                    <div className="playlist-meta cutive-mono-regular">{durations[t.id] || t.duration || '0:00'}</div>
                    <button className="btn" aria-label="Play track" onClick={() => onPlayTrack && onPlayTrack({ ...t, artwork: a.artwork, album: a.title })}>▶</button>
                    <button className="btn" aria-label="Add to playlist" onClick={() => onAddTrack && onAddTrack({ ...t, artwork: a.artwork, album: a.title })}>＋</button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}

  // load track durations when expanded
  function useLoadDurations(expanded, tracks, setDurations) {
    useEffect(() => {
      if (!expanded || !tracks || tracks.length === 0) return
      const cleaners = []
      tracks.forEach(t => {
        if (!t || !t.src) return
        // if duration already present in state or track, skip
        setDurations(prev => {
          if (prev[t.id] || (t.duration && t.duration !== '0:00')) return prev
          return prev
        })
      })

      tracks.forEach(t => {
        if (!t || !t.src) return
        // skip if already loaded
        setDurations(prev => {
          if (prev[t.id]) return prev
          return prev
        })
        const audio = new Audio()
        audio.preload = 'metadata'
        audio.src = t.src
        const onLoaded = () => {
          const sec = audio.duration || 0
          const m = Math.floor(sec / 60)
          const s = Math.floor(sec % 60).toString().padStart(2, '0')
          setDurations(prev => ({ ...prev, [t.id]: `${m}:${s}` }))
        }
        const onError = () => {
          // ignore errors; leave fallback duration
        }
        audio.addEventListener('loadedmetadata', onLoaded)
        audio.addEventListener('error', onError)
        cleaners.push(() => {
          audio.removeEventListener('loadedmetadata', onLoaded)
          audio.removeEventListener('error', onError)
          try { audio.src = '' } catch (e) {}
        })
      })

      return () => cleaners.forEach(fn => fn())
    }, [expanded, tracks, setDurations])
  }

export default function Albums({ tracks = [], onPlayAlbum, onAddAlbum, onPlayTrack, onAddTrack }) {
  return (
    <section className="latest-section" aria-label="Albums">
      <h2 className="cal-sans-title">Albums</h2>
      <div className="latest-grid" style={{ gap: 24, justifyContent: 'flex-start' }}>
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
      </div>
    </section>
  )
}
