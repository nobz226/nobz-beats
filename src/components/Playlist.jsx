import React, { useEffect, useRef, useState } from 'react'
import { playVinyl, pauseVinyl } from '../lib/vinyl'

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
    <aside 
      ref={ref} 
      className="playlist fixed top-[4.6875rem] w-[22.5rem] h-[34.375rem] max-h-[calc(100vh-7.5rem)] overflow-y-auto z-[1002] text-white p-3 rounded-lg opacity-0 left-auto bg-white/[0.03] translate-x-5 animate-playlist-slide font-cutive [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-white/[0.06]"
      style={{ animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s + var(--title-fade) + var(--player-gap) + var(--playlist-gap))' }}
      aria-label="Playlist"
    >
      {currentTrack && (
        <div className="flex gap-3 items-center py-2 pb-3 mb-2 border-b border-white/[0.03]" aria-label="Currently playing">
          <img className="w-[3.25rem] h-[3.25rem] object-cover rounded-md" src={currentTrack.artwork || '/artwork/default.png'} alt="Artwork" />
          <div className="flex flex-col">
            <div className="font-bold text-[0.95rem]">{currentTrack.title}</div>
            <div className="text-[0.8rem] opacity-90">{currentTrack.album ? `${currentTrack.album} — ${currentTrack.title}` : currentTrack.artist}</div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h3 className="font-cal-sans font-bold text-lg m-0">Playlist</h3>
        <div className="flex gap-2">
          <button className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]" aria-label="Play playlist" onClick={() => onPlayPlaylist && onPlayPlaylist()}>▶</button>
          <button className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]" aria-label="Shuffle playlist" onClick={() => onShuffle && onShuffle()}>🔀</button>
          <button className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]" aria-label="Clear playlist" onClick={() => onClear && onClear()}>✖</button>
        </div>
      </div>

      <ul className="list-none m-0 p-0 flex flex-col gap-2 mt-3">
        {tracks.map(t => (
          <li 
            key={t.id} 
            className={`py-1.5 px-2 rounded-md cursor-pointer hover:bg-white/[0.04] focus:outline-none focus:bg-white/[0.04] ${currentTrackId === t.id ? 'bg-gradient-to-r from-white/[0.03] to-white/[0.01] border-l-[3px] border-[#c8c8c8]' : ''}`} 
            tabIndex={0} 
            role="button"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1" onClick={() => onSelect && onSelect(t)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onSelect && onSelect(t) } }}>
                <div className="font-cal-sans font-semibold text-sm">{t.title}</div>
                <div className="font-cutive font-normal text-white/90">{t.artist} · {durations[t.id] || t.duration || '0:00'}</div>
              </div>
              <div className="flex gap-2 ml-2">
                {(() => {
                  const isThisPlaying = currentTrackId === t.id && !audioState.paused
                  return (
                    <button
                      className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]"
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
                          if (!audio.paused) {
                            audio.pause()
                            try {
                              pauseVinyl(String(t.id || t._id), t.albumId)
                            } catch (e) {}
                          } else {
                            audio.play().catch(() => {})
                            try {
                              playVinyl(String(t.id || t._id), t.albumId)
                            } catch (e) {}
                          }
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
