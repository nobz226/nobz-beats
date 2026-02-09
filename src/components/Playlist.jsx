import React, { useEffect, useRef, useState } from 'react'

export default function Playlist({ tracks = [], onSelect, onAdd, onPlayPlaylist, onShuffle, onClear, currentTrackId, currentTrack }) {
  // tracks passed from app state (playlist)
  const [durations, setDurations] = useState({})
  // load durations for playlist tracks
  useEffect(() => {
    if (!tracks || tracks.length === 0) return
    const cleaners = []
    tracks.forEach(t => {
      if (!t || !t.src) return
      if (durations[t.id]) return
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
  }, [tracks])

  const ref = useRef(null)

  // Track global audio element state so each item can reflect play/pause
  const [audioState, setAudioState] = useState({ src: '', paused: true })
  useEffect(() => {
    const audio = document.querySelector('.audio-player audio')
    if (!audio) return
    const update = () => setAudioState({ src: audio.src || '', paused: audio.paused })
    audio.addEventListener('play', update)
    audio.addEventListener('playing', update)
    audio.addEventListener('pause', update)
    audio.addEventListener('ended', update)
    // also update on loadedmetadata in case src changes
    audio.addEventListener('loadedmetadata', update)
    update()
    return () => {
      audio.removeEventListener('play', update)
      audio.removeEventListener('playing', update)
      audio.removeEventListener('pause', update)
      audio.removeEventListener('ended', update)
      audio.removeEventListener('loadedmetadata', update)
    }
  }, [tracks])

  useEffect(() => {
    const updatePos = () => {
      const el = ref.current
      if (!el) return
      const nav = document.querySelector('.site-nav')
      if (!nav) return

      const navRect = nav.getBoundingClientRect()

      // if viewport is narrow, let CSS media query stack playlist under the nav
      if (window.innerWidth <= 1120) {
        el.style.left = ''
        el.style.top = ''
        el.style.height = ''
        el.style.maxHeight = ''
        return
      }

      // position the playlist a fixed distance from the viewport right edge (20px)
      const elW = el.offsetWidth || el.getBoundingClientRect().width || 320
      const desiredRightGap = 20
      let left = Math.round(window.innerWidth - elW - desiredRightGap)

      // ensure we don't overlap the nav and stay inside the viewport
      const minLeft = Math.round(navRect.right + 12)
      const maxLeft = Math.max(8, Math.round(window.innerWidth - elW - 8))
      left = Math.min(Math.max(left, minLeft), maxLeft)
      el.style.left = left + 'px'

      const desiredHeight = 800
      const player = document.querySelector('.audio-player')
      const playerRect = player ? player.getBoundingClientRect() : null

      if (playerRect) {
        // try to position the playlist above the player with a 50px gap
        const gapFromPlayer = 80
        const maxSpaceAbovePlayer = Math.max(0, playerRect.top - gapFromPlayer - 8) // 8px safety for nav/top

        if (maxSpaceAbovePlayer >= 120) {
          const h = Math.min(desiredHeight, maxSpaceAbovePlayer)
          el.style.height = h + 'px'
          el.style.maxHeight = maxSpaceAbovePlayer + 'px'

          // position so bottom is gapFromPlayer above the player's top
          const top = Math.round(playerRect.top - h - gapFromPlayer)
          // but don't move above the nav's top
          el.style.top = Math.max(navRect.top, top) + 'px'
          return
        }
      }

      // fallback: place starting at the nav top and grow downward without overlapping player
      el.style.top = navRect.top + 'px'
      const bottomReserved = playerRect ? (playerRect.height + 24) : 24
      const available = Math.max(120, window.innerHeight - navRect.top - bottomReserved)
      const h = Math.min(desiredHeight, available)
      el.style.height = h + 'px'
      el.style.maxHeight = available + 'px'
    }

    updatePos()
    window.addEventListener('resize', updatePos)
    const mo = new MutationObserver(updatePos)
    const nav = document.querySelector('.site-nav')
    if (nav) mo.observe(nav, { childList: true, subtree: true })

    return () => { window.removeEventListener('resize', updatePos); mo.disconnect() }
  }, [])

  return (
    <aside ref={ref} className="playlist" aria-label="Playlist">
      {currentTrack && (
        <div className="currently-playing" aria-label="Currently playing">
          <img className="currently-playing-art" src={currentTrack.artwork || '/artwork/default.png'} alt="Artwork" />
          <div className="currently-playing-meta">
            <div className="currently-playing-title">{currentTrack.title}</div>
            <div className="currently-playing-sub muted">{currentTrack.album ? `${currentTrack.album} — ${currentTrack.title}` : currentTrack.artist}</div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="cal-sans-title" style={{ fontSize: '18px', margin: 0 }}>Playlist</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" aria-label="Play playlist" onClick={() => onPlayPlaylist && onPlayPlaylist()}>▶</button>
          <button className="btn" aria-label="Shuffle playlist" onClick={() => onShuffle && onShuffle()}>🔀</button>
          <button className="btn" aria-label="Clear playlist" onClick={() => onClear && onClear()}>✖</button>
        </div>
      </div>

      <ul className="playlist-list" style={{ marginTop: 12 }}>
        {tracks.map(t => (
          <li key={t.id} className={`playlist-item ${currentTrackId === t.id ? 'playing' : ''}`} tabIndex={0} role="button">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }} onClick={() => onSelect && onSelect(t)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onSelect && onSelect(t) } }}>
                <div className="playlist-title">{t.title}</div>
                <div className="playlist-meta cutive-mono-regular">{t.artist} · {durations[t.id] || t.duration || '0:00'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
                {(() => {
                  const isThisPlaying = currentTrackId === t.id && !audioState.paused
                  return (
                    <button
                      className="btn"
                      aria-label={isThisPlaying ? 'Pause' : 'Play'}
                      onClick={(e) => {
                        e.stopPropagation()
                        const audio = document.querySelector('.audio-player audio')
                        if (!audio) {
                          if (onSelect) onSelect(t)
                          return
                        }
                        const a = audio.src || ''
                        const s = t.src || ''
                        const isMatch = s && (a.endsWith(s) || a.includes(s))
                        if (isMatch) {
                          if (!audio.paused) audio.pause()
                          else audio.play().catch(() => {})
                          return
                        }
                        if (onSelect) onSelect(t)
                        setTimeout(() => { try { audio.play().catch(() => {}) } catch (e) {} }, 50)
                      }}
                    >{isThisPlaying ? '⏸' : '▶'}</button>
                  )
                })()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
