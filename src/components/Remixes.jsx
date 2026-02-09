import React, { useEffect, useState, useRef } from 'react'
import Cover from './Cover'
import TwoUpCarousel from './TwoUpCarousel'
import { playVinyl, pauseVinyl } from '../lib/vinyl'

export function RemixItem({ track, onPlay, onAdd }) {
  const t = track || {
    title: 'Untitled Remix',
    type: 'Remix',
    artwork: '/logo/logoSVG.svg',
    description: 'Remix track.'
  }

  const [isPlaying, setIsPlaying] = useState(false)
  const trackRef = useRef(t)
  useEffect(() => { trackRef.current = t }, [t])

  const matchesAudioSrc = (audio) => {
    if (!audio || !trackRef.current) return false
    const a = audio.src || ''
    const s = trackRef.current.src || ''
    if (!s) return false
    return a.endsWith(s) || a.includes(s)
  }

  useEffect(() => {
    const audio = document.querySelector('.audio-player audio')
    if (!audio) return
    const update = () => setIsPlaying(matchesAudioSrc(audio) && !audio.paused)
    audio.addEventListener('play', update)
    audio.addEventListener('playing', update)
    audio.addEventListener('pause', update)
    audio.addEventListener('ended', update)
    update()
    return () => {
      audio.removeEventListener('play', update)
      audio.removeEventListener('playing', update)
      audio.removeEventListener('pause', update)
      audio.removeEventListener('ended', update)
    }
  }, [])

  const handleTogglePlay = async () => {
    const audio = document.querySelector('.audio-player audio')
    if (audio && matchesAudioSrc(audio)) {
      if (!audio.paused) {
        audio.pause()
        try { pauseVinyl(String(t.id || t._id)) } catch (e) {}
      } else {
        await audio.play().catch(() => {})
        try { playVinyl(String(t.id || t._id)) } catch (e) {}
      }
      return
    }
    try { playVinyl(String(t.id || t._id)) } catch (e) {}
    if (onPlay) onPlay(t)
    if (audio) setTimeout(() => audio.play().catch(() => {}), 50)
  }

  return (
    <div className="latest-item" aria-label={`Remix ${t.title}`}>
      <Cover track={t} onPlay={onPlay} className="latest-artwork-cover" sleeveImage="/artwork/single.jpg" />
      <div className="latest-meta cutive-mono-regular">
        <strong>{t.title}</strong>
        <div style={{ marginTop: 6 }}>{t.type}</div>
        <p className="latest-description" style={{ marginTop: 8 }}>{t.description}</p>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={handleTogglePlay}>{isPlaying ? '⏸' : '▶'}</button>
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
      <TwoUpCarousel className="latest-grid">
        {tracks.map(t => <RemixItem key={t.id} track={t} onPlay={onPlay} onAdd={onAdd} />)}
      </TwoUpCarousel>
    </section>
  )
}
