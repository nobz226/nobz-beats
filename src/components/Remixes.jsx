import React, { useEffect, useState, useRef } from 'react'
import Cover from './Cover'
import TwoUpCarousel from './TwoUpCarousel'
import { playVinyl, pauseVinyl } from '../lib/vinyl'

export function RemixItem({ track, onPlay, onAdd, className = '' }) {
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
    <div className={`flex flex-col gap-3 items-center w-[22.5rem] ${className}`.trim()} aria-label={`Remix ${t.title}`}>
      <Cover track={t} onPlay={onPlay} className="mr-4" sleeveImage="/artwork/single.jpg" />
      <div className="font-cutive text-center">
        <strong className="block text-lg font-bold">{t.title}</strong>
        <div className="mt-1.5">{t.type}</div>
        <p className="max-w-80 mx-auto mt-2 leading-relaxed text-center text-[0.9375rem] break-words">{t.description}</p>
        <div className="mt-2 flex gap-2 justify-center">
          <button className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={handleTogglePlay}>{isPlaying ? '⏸' : '▶'}</button>
          <button className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]" aria-label="Add to playlist" onClick={() => onAdd && onAdd(t)}>＋</button>
        </div>
      </div>
    </div>
  )
}

export default function Remixes({ tracks = [], onPlay, onAdd }) {
  return (
    <section 
      className="latest-section fixed z-[1000] text-white opacity-0 translate-y-2 animate-section-fade"
      style={{
        left: 'calc(var(--logo-size) + var(--logo-gap) + 1.125rem)',
        top: '14.375rem',
        maxWidth: 'var(--latest-maxwidth, calc(100% - (var(--logo-size) + var(--logo-gap) + 2rem)))',
        animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s)'
      }}
      aria-label="Remixes"
    >
      <h2 className="font-cal-sans font-bold text-[1.75rem] m-0 mb-2">Remixes</h2>
      <TwoUpCarousel className="grid gap-24 items-start justify-center mt-3 grid-cols-[repeat(2,22.5rem)]">
        {tracks.map(t => <RemixItem key={t.id} track={t} onPlay={onPlay} onAdd={onAdd} />)}
      </TwoUpCarousel>
    </section>
  )
}
