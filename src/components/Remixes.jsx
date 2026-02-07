import React from 'react'

export function RemixItem({ track, onPlay, onAdd }) {
  const t = track || {
    title: 'Untitled Remix',
    type: 'Remix',
    artwork: '/logo/logoSVG.svg',
    description: 'Remix track.'
  }

  return (
    <div className="latest-item" aria-label={`Remix ${t.title}`}>
      <img className="latest-artwork" src={t.artwork} alt={`${t.title} artwork`} />
      <div className="latest-meta cutive-mono-regular">
        <strong>{t.title}</strong>
        <div style={{ marginTop: 6 }}>{t.type}</div>
        <p className="latest-description" style={{ marginTop: 8 }}>{t.description}</p>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn" aria-label="Play" onClick={() => onPlay && onPlay(t)}>▶</button>
          <button className="btn" aria-label="Add to playlist" onClick={() => onAdd && onAdd(t)}>＋</button>
        </div>
      </div>
    </div>
  )
}

export default function Remixes({ tracks = [], onPlay, onAdd }) {
  return (
    <section className="latest-section" aria-label="Remixes">
      <h2 className="cal-sans-title">Remixes</h2>
      <div className="latest-grid" style={{ gap: 24, justifyContent: 'flex-start' }}>
        {tracks.map(t => <RemixItem key={t.id} track={t} onPlay={onPlay} onAdd={onAdd} />)}
      </div>
    </section>
  )
}
