import React, { useEffect, useRef, useState } from 'react'
import { playVinyl, pauseVinyl } from '../lib/vinyl'

export default function Playlist({ tracks = [], onSelect, onAdd, onPlayPlaylist, onShuffle, onClear, onRemove, onReorder, currentTrackId, currentTrack }) {
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

      // prefer symmetric gap between nav and playlist and between playlist and player
      const desiredGap = 8 // px between nav/playlist and playlist/player
      const minTop = Math.round(navRect.bottom + desiredGap)
      const minHeight = 120

      if (playerRect) {
        // compute the vertical bounds where the playlist can live
        const topBound = Math.round(navRect.bottom + desiredGap)
        const bottomBound = Math.max(0, Math.round(playerRect.top - desiredGap))
        const availableBetween = Math.max(0, bottomBound - topBound)

        // If there's enough room, center the playlist vertically in that slot
        if (availableBetween >= minHeight) {
          const h = Math.min(desiredHeight, availableBetween)
          // compute exact center line between nav bottom and player top then center element on it
          const centerLine = (navRect.bottom + playerRect.top) / 2
          let top = Math.round(centerLine - h / 2)
          // clamp so element does not cross nav bottom or player top
          const minAllowedTop = Math.round(navRect.bottom + desiredGap)
          const maxAllowedTop = Math.round(playerRect.top - desiredGap - h)
          if (top < minAllowedTop) top = minAllowedTop
          if (top > maxAllowedTop) top = maxAllowedTop
          el.style.top = top + 'px'
          el.style.height = h + 'px'
          el.style.maxHeight = availableBetween + 'px'
          return
        }

        // Not enough space to keep the full desiredGap; compute a reduced symmetric gap
        const totalSpace = Math.max(0, playerRect.top - navRect.bottom)
        const possibleGap = Math.max(4, Math.floor((totalSpace - minHeight) / 2))
        const gapAdj = Math.min(desiredGap, possibleGap)
        const newTopBound = Math.round(navRect.bottom + gapAdj)
        const newBottomBound = Math.max(0, Math.round(playerRect.top - gapAdj))
        const availableAfterAdj = Math.max(0, newBottomBound - newTopBound)
        const h2 = Math.min(desiredHeight, Math.max(minHeight, availableAfterAdj))
        const top2 = Math.round(newTopBound + Math.max(0, (availableAfterAdj - h2) / 2))
        el.style.top = top2 + 'px'
        el.style.height = Math.max(0, Math.min(h2, availableAfterAdj)) + 'px'
        el.style.maxHeight = Math.max(0, availableAfterAdj) + 'px'
        return
      }

      // No player: place below nav and grow downward
      el.style.top = minTop + 'px'
      const bottomReserved = 24
      const available = Math.max(minHeight, window.innerHeight - minTop - bottomReserved)
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

  const [expanded, setExpanded] = useState(false)
  // Desktop visibility (persisted). Default to hidden on first load.
  const [visible, setVisible] = useState(() => {
    try {
      const v = localStorage.getItem('playlist_visible')
      return v === null ? false : v === '1'
    } catch (e) {
      return false
    }
  })

  const toggleVisible = () => {
    setVisible(v => {
      try { localStorage.setItem('playlist_visible', v ? '0' : '1') } catch (e) {}
      return !v
    })
  }

  const toggleRef = React.useRef(null)
  const [highlight, setHighlight] = useState(false)
  const prevLenRef = useRef((tracks && tracks.length) || 0)
  const [draggingIdx, setDraggingIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

  // When playlist receives items while hidden, enable highlight and keep it
  // until the user expands or shows the playlist.
  useEffect(() => {
    const prev = prevLenRef.current || 0
    const cur = (tracks && tracks.length) || 0
    // If the playlist grows (user added track(s)) while hidden, enable highlight.
    if (cur > prev && !visible) {
      setHighlight(true)
    }
    prevLenRef.current = cur
  }, [tracks && tracks.length, visible])

  // Clear highlight when playlist is shown/expanded by the user
  useEffect(() => {
    if (visible || expanded) setHighlight(false)
  }, [visible, expanded])

  // Position the desktop toggle so it sits half-over the playlist's left edge
  React.useEffect(() => {
    const btn = toggleRef.current
    const el = ref.current
    if (!btn) return

    const update = () => {
      try {
        // If playlist hidden, keep button at right edge
        if (!visible) {
          btn.style.left = ''
          btn.style.right = '0.5rem'
          return
        }
        if (!el) return
        const rect = el.getBoundingClientRect()
        const btnW = btn.offsetWidth || 36
        const left = Math.max(8, Math.round(rect.left - btnW / 2))
        btn.style.left = left + 'px'
        // override class `right-2` by setting inline right to auto
        btn.style.right = 'auto'
      } catch (e) {
        // ignore
      }
    }

    // run on next frame to catch CSS transitions
    requestAnimationFrame(update)
    window.addEventListener('resize', update)
    const mo = new MutationObserver(update)
    if (el) mo.observe(el, { attributes: true, childList: true, subtree: true })
    // reposition after CSS transitions/animations finish
    if (el) {
      el.addEventListener('transitionend', update)
      el.addEventListener('animationend', update)
    }

    return () => {
      window.removeEventListener('resize', update)
      if (el) {
        el.removeEventListener('transitionend', update)
        el.removeEventListener('animationend', update)
      }
      mo.disconnect()
    }
  }, [visible, expanded])

  return (
    <>
      <button 
        className="lg:hidden fixed bottom-24 right-4 z-[1010] bg-white/[0.05] border border-white/[0.1] text-white p-3 rounded-full backdrop-blur-md shadow-lg"
        onClick={() => setExpanded(!expanded)}
        aria-label="Toggle Playlist"
      >
        {expanded ? '✕' : '🎵'}
      </button>
      <aside 
        ref={ref} 
        className={`playlist fixed right-4 lg:right-auto lg:left-auto top-[4.6875rem] w-[calc(100vw-2rem)] md:max-w-[22.5rem] h-auto max-h-[calc(100vh-12rem)] md:max-h-[calc(100vh-7.5rem)] overflow-y-auto overflow-x-hidden custom-scrollbar z-[1010] text-white p-3 rounded-lg bg-[#1c1c1c]/95 lg:bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] lg:border-none shadow-2xl lg:shadow-none transition-all duration-500 ease-[cubic-bezier(0.22,0.8,0.25,1)] ${expanded ? 'translate-x-0 opacity-100 pointer-events-auto' : (visible ? 'translate-x-[120%] opacity-0 pointer-events-none lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto' : 'translate-x-[120%] opacity-0 pointer-events-none lg:translate-x-[120%] lg:opacity-0 lg:pointer-events-none')} font-cutive`}
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
        {tracks.map((t, idx) => (
          <li 
            key={t.id} 
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(idx))
              e.dataTransfer.effectAllowed = 'move'
              setDraggingIdx(idx)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              setDragOverIdx(idx)
            }}
            onDrop={(e) => {
              e.preventDefault()
              const from = parseInt(e.dataTransfer.getData('text/plain'), 10)
              const to = idx
              setDraggingIdx(null)
              setDragOverIdx(null)
              if (!Number.isNaN(from) && typeof onReorder === 'function' && from !== to) {
                try { onReorder(from, to) } catch (err) { console.error('onReorder error', err) }
              }
            }}
            onDragEnd={() => { setDraggingIdx(null); setDragOverIdx(null) }}
            className={`py-1.5 px-2 rounded-md cursor-pointer hover:bg-white/[0.04] focus:outline-none focus:bg-white/[0.04] ${currentTrackId === t.id ? 'bg-gradient-to-r from-white/[0.03] to-white/[0.01] border-l-[3px] border-[#c8c8c8]' : ''} ${dragOverIdx === idx ? 'bg-white/[0.03]' : ''} ${draggingIdx === idx ? 'opacity-60' : ''}`} 
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
                    <>
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

                      <button
                        className="bg-transparent border-none text-white cursor-pointer text-xl font-semibold p-1.5 rounded-md hover:bg-white/[0.04]"
                        aria-label="Remove from playlist"
                        onClick={(e) => {
                          e.stopPropagation()
                          try {
                            if (!confirm('Remove this track from the playlist?')) return
                            if (onRemove) onRemove(t.id)
                          } catch (err) { console.error('Failed to remove from playlist', err) }
                        }}
                      >−</button>
                    </>
                  )
                })()}
              </div>
            </div>
          </li>
        ))}
      </ul>
      </aside>
      {/* Desktop toggle button to hide/unhide playlist (outside aside so it's always reachable) */}
      <button
        title={visible ? 'Hide playlist' : 'Show playlist'}
        aria-label={visible ? 'Hide playlist' : 'Show playlist'}
        onClick={toggleVisible}
        ref={toggleRef}
        className={`hidden lg:flex fixed right-2 top-1/2 z-[1011] -translate-y-1/2 items-center justify-center w-9 h-9 bg-white/5 text-white rounded-full border border-white/[0.06] hover:bg-white/10 transition-all ${highlight ? 'ring-4 ring-white/30 pulse-highlight' : ''}`}
      >
        {visible ? '▶' : '◀'}
      </button>
    </>
  )
}
