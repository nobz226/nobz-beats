import React, { useEffect, useRef } from 'react'

export default function Playlist({ tracks = [], onSelect, onAdd, onPlayPlaylist, onShuffle, onClear, currentTrackId }) {
  // tracks passed from app state (playlist)


  const ref = useRef(null)

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
                <div className="playlist-meta cutive-mono-regular">{t.artist} · {t.duration}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
                <button className="btn" aria-label="Play item" onClick={() => onSelect && onSelect(t)}>▶</button>
                <button className="btn" aria-label="Add to playlist" onClick={() => onAdd && onAdd(t)}>＋</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
