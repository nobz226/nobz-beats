import React, { useEffect, useState, useRef } from 'react'
import Cover from './Cover'
import TwoUpCarousel from './TwoUpCarousel'
import { playVinyl, pauseVinyl } from '../lib/vinyl'

export function SingleItem({ track, onPlay, onAdd, className = '' }) {
  const t = track || {
    title: 'Armitage',
    type: 'Single',
    artwork: '/logo/logoSVG.svg',
    description: 'Dub inspired chill but brooding beat.'
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
    <div className={`flex flex-col gap-3 items-center w-full max-w-[20rem] ${className}`.trim()} aria-label={`Single ${t.title}`}>
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

export default function Singles({ tracks = [], onPlay, onAdd }) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <section 
      className={`latest-section fixed ${isMobile ? 'z-[1000]' : 'z-[1004]'} text-white opacity-0 translate-y-2 animate-section-fade ${isMobile ? 'left-0 right-0 w-full flex flex-col overflow-hidden' : 'p-0 custom-scrollbar'}`}
      style={{
        left: isMobile ? '0' : 'var(--main-left)',
        top: isMobile ? 'var(--main-top)' : 'calc(var(--main-top) - 1rem)',
        bottom: isMobile ? '0' : '6rem',
        width: isMobile ? '100%' : 'auto',
        maxWidth: isMobile ? 'none' : 'var(--latest-maxwidth, calc(100% - (var(--logo-size) + var(--logo-gap) + 2rem)))',
        animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s)'
      }}
      aria-label="Singles"
    >
      <h2 className={`font-cal-sans font-bold text-[1.75rem] m-0 mb-2 ${isMobile ? 'px-4 text-center' : ''}`}>Singles</h2>
      
      {!isMobile ? (
        <TwoUpCarousel className="grid gap-8 md:gap-24 items-start justify-center mt-3 grid-cols-1 lg:grid-cols-[repeat(2,20rem)]">
          {tracks.map(t => <SingleItem key={t.id} track={t} onPlay={onPlay} onAdd={onAdd} />)}
        </TwoUpCarousel>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col gap-16 mt-6 pb-24 items-center px-4">
          {tracks.map(t => <SingleItem key={`mob-${t.id}`} track={t} onPlay={onPlay} onAdd={onAdd} />)}
        </div>
      )}
    </section>
  )
}
