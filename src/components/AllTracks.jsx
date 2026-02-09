import React, { useEffect, useState } from 'react'
import { setVinylState } from '../lib/vinyl'

export default function AllTracks({ allTracks = [], onPlay, onAdd, currentTrackId }) {
  const items = allTracks

  // Track global audio element state so the play button reflects play/pause
  const [audioState, setAudioState] = useState({ src: '', paused: true })
  useEffect(() => {
    const audio = document.querySelector('.audio-player audio')
    if (!audio) return
    const update = () => setAudioState({ src: audio.src || '', paused: audio.paused })
    audio.addEventListener('play', update)
    audio.addEventListener('playing', update)
    audio.addEventListener('pause', update)
    audio.addEventListener('ended', update)
    audio.addEventListener('loadedmetadata', update)
    update()
    return () => {
      audio.removeEventListener('play', update)
      audio.removeEventListener('playing', update)
      audio.removeEventListener('pause', update)
      audio.removeEventListener('ended', update)
      audio.removeEventListener('loadedmetadata', update)
    }
  }, [allTracks])

  return (
    <section className="latest-section alltracks-section" aria-label="All tracks">
      <h2 className="cal-sans-title">All Tracks</h2>
      <ul className="alltracks-list">
        {items.map(it => {
          const isThisPlaying = currentTrackId === it.id && !audioState.paused
          return (
            <li key={it.id} className={`alltracks-item ${currentTrackId === it.id ? 'playing' : ''}`}>
              <div className="alltracks-left">
                <img className="track-artwork" src={it.artwork || '/logo/logoSVG.svg'} alt={`${it.title} artwork`} />
                <div className="alltracks-info">
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{it.title}</div>
                  <div className="cutive-mono-regular" style={{ fontSize: 13 }}>{it.artist}{it.album ? ` • ${it.album}` : ''}</div>
                </div>
              </div>
              <div className="alltracks-right">
                <div className="cutive-mono-regular" style={{ fontSize: 12, marginRight: 12 }}>{it.duration}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn"
                    aria-label={isThisPlaying ? 'Pause' : 'Play'}
                    onClick={(e) => {
                      e.stopPropagation()
                      const audio = document.querySelector('.audio-player audio')
                      if (!audio) {
                        if (onPlay) onPlay(it)
                        return
                      }
                      const a = audio.src || ''
                      const s = it.src || ''
                      const isMatch = s && (a.endsWith(s) || a.includes(s))
                      if (isMatch) {
                        if (!audio.paused) {
                          audio.pause()
                          try {
                            setVinylState(String(it.id || it._id), { spinning: false })
                            if (it.albumId) setVinylState(String(it.albumId), { out: false, spinning: false })
                          } catch (e) {}
                        } else {
                          audio.play().catch(() => {})
                          try {
                            setVinylState(String(it.id || it._id), { out: true, spinning: true })
                            if (it.albumId) setVinylState(String(it.albumId), { out: true, spinning: true })
                          } catch (e) {}
                        }
                        return
                      }
                      if (onPlay) onPlay(it)
                      setTimeout(() => { try { audio.play().catch(() => {}) } catch (e) {} }, 50)
                      try {
                        setVinylState(String(it.id || it._id), { out: true, spinning: true })
                        if (it.albumId) setVinylState(String(it.albumId), { out: true, spinning: true })
                      } catch (e) {}
                    }}
                  >{isThisPlaying ? '⏸' : '▶'}</button>
                  <button className="btn" aria-label="Add to playlist" onClick={() => onAdd && onAdd(it)}>＋</button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
