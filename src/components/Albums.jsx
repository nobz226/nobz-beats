import React from 'react'

export function AlbumItem({ track, onPlay, onAdd }) {
  const a = track || {
    title: 'Vol.1',
    type: 'Album',
    artwork: '/assets/artwork/Nobz-Vol.1-Ver3.png',
    description: 'A melange of genres and influences — from metal to dub, trap and classic boom bap.',
    tracks: []
  }

  return (
    <div className="latest-item album-with-tracks" aria-label={`Album ${a.title}`}>
      <div className="album-left">
        <img className="latest-artwork" src={a.artwork} alt={`${a.title} artwork`} />
        <div className="latest-meta cutive-mono-regular">
          <strong>{a.title}</strong>
          <div style={{ marginTop: 6 }}>{a.type}</div>
          <p className="latest-description" style={{ marginTop: 8 }}>{a.description}</p>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn" aria-label="Play album" onClick={() => onPlay && onPlay(a)}>▶</button>
            <button className="btn" aria-label="Add album to playlist" onClick={() => onAdd && onAdd(a)}>＋</button>
          </div>
        </div>
      </div>

      {a.tracks && a.tracks.length > 0 && (
        <div className="album-tracks">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {a.tracks.map(t => (
              <li key={t.id} className="album-track-row">
                <div className="playlist-title">{t.title}</div>
                <div className="album-track-actions">
                  <div className="playlist-meta cutive-mono-regular">{t.duration}</div>
                  <button className="btn" aria-label="Play track" onClick={() => onPlay && onPlay({ ...t, artwork: a.artwork })}>▶</button>
                  <button className="btn" aria-label="Add to playlist" onClick={() => onAdd && onAdd({ ...t, artwork: a.artwork })}>＋</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function Albums({ tracks = [], onPlay, onAdd }) {
  return (
    <section className="latest-section" aria-label="Albums">
      <h2 className="cal-sans-title">Albums</h2>
      <div className="latest-grid" style={{ gap: 24, justifyContent: 'flex-start' }}>
        {tracks.map(t => <AlbumItem key={t.id} track={t} onPlay={onPlay} onAdd={onAdd} />)}
      </div>
    </section>
  )
}
