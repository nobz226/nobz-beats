import React from 'react'
import Cover from './Cover'

export function SingleItem({ track, onPlay, onAdd }) {
  const t = track || {
    title: 'Armitage',
    type: 'Single',
    artwork: '/logo/logoSVG.svg',
    description: 'Dub inspired chill but brooding beat.'
  }

  return (
    <div className="latest-item" aria-label={`Single ${t.title}`}>
      <Cover track={t} onPlay={onPlay} className="latest-artwork-cover" sleeveImage="/artwork/single.jpg" />
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

export default function Singles({ tracks = [], onPlay, onAdd }) {
  return (
    <section className="latest-section" aria-label="Singles">
      <h2 className="cal-sans-title">Singles</h2>
      <div className="latest-grid" style={{ gap: '6rem', justifyContent: 'flex-start' }}>
        {tracks.map(t => <SingleItem key={t.id} track={t} onPlay={onPlay} onAdd={onAdd} />)}
      </div>
    </section>
  )
}
