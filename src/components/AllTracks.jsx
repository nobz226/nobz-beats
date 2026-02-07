import React from 'react'

export default function AllTracks({ allTracks = [], onPlay, onAdd, currentTrackId }) {
  const items = allTracks

  return (
    <section className="latest-section" aria-label="All tracks">
      <h2 className="cal-sans-title">All Tracks</h2>
      <ul className="alltracks-list">
        {items.map(it => (
          <li key={it.id} className={`alltracks-item ${currentTrackId === it.id ? 'playing' : ''}`}>
            <div className="alltracks-left">
              <img className="track-artwork" src={it.artwork || '/assets/logo/logoSVG.svg'} alt={`${it.title} artwork`} />
              <div className="alltracks-info">
                <div style={{ fontWeight: 700, fontSize: 16 }}>{it.title}</div>
                <div className="cutive-mono-regular" style={{ fontSize: 13 }}>{it.artist}{it.album ? ` • ${it.album}` : ''}</div>
              </div>
            </div>
            <div className="alltracks-right">
              <div className="cutive-mono-regular" style={{ fontSize: 12, marginRight: 12 }}>{it.duration}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" aria-label="Play" onClick={() => onPlay && onPlay(it)}>▶</button>
                <button className="btn" aria-label="Add to playlist" onClick={() => onAdd && onAdd(it)}>＋</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
