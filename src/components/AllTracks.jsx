import React, { useEffect, useState } from 'react'
import { playVinyl, pauseVinyl } from '../lib/vinyl'

export default function AllTracks({ allTracks = [], onPlay, onAdd, currentTrackId }) {
  const items = allTracks

  // Track global audio element state so the play button reflects play/pause
  const [audioState, setAudioState] = useState({ src: '', paused: true })
  useEffect(() => {
    const audio = document.querySelector('.audio-player audio')
    if (!audio) return
    const update = () => setAudioState({ src: audio.src || '', paused: audio.paused })
    audio.addEventListener('play', update)
    audio.addEventListener('playing', update)
    audio.addEventListener('pause', update)
    audio.addEventListener('ended', update)
    audio.addEventListener('loadedmetadata', update)
    update()
    return () => {
      audio.removeEventListener('play', update)
      audio.removeEventListener('playing', update)
      audio.removeEventListener('pause', update)
      audio.removeEventListener('ended', update)
      audio.removeEventListener('loadedmetadata', update)
    }
  }, [allTracks])

  return (
    <section 
      className="latest-section fixed z-[1000] text-white opacity-0 translate-y-2 animate-section-fade"
      style={{
        left: 'calc(var(--logo-size) + var(--logo-gap) + 1.125rem)',
        top: '14.375rem',
        maxWidth: 'var(--latest-maxwidth, calc(100% - (var(--logo-size) + var(--logo-gap) + 2rem)))',
        animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s)'
      }}
      aria-label="All tracks"
    >
      <h2 className="font-cal-sans font-bold text-[1.75rem] m-0 mb-2">All Tracks</h2>
      <ul className="list-none p-0 mt-3 max-h-[36rem] overflow-auto [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-white/[0.04]">
        {items.map((it, i) => {
          const isThisPlaying = currentTrackId === it.id && !audioState.paused
          return (
            <li 
              key={it.id} 
              className={`flex items-center justify-between gap-5 py-4 border-b border-white/[0.03] opacity-0 animate-section-fade ${currentTrackId === it.id ? 'bg-gradient-to-r from-white/[0.03] to-white/[0.01] border-l-[3px] border-[#c8c8c8]' : ''}`}
              style={{ animationDelay: `calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s + ${i * 0.05}s)` }}
            >
              <div className="flex items-center gap-4">
                <img className="w-40 h-40 object-cover rounded-md" src={it.artwork || '/logo/logoSVG.svg'} alt={`${it.title} artwork`} />
                <div className="flex flex-col">
                  <div className="font-bold text-base">{it.title}</div>
                  <div className="font-cutive font-normal text-[0.9rem] opacity-90">{it.artist}{it.album ? ` • ${it.album}` : ''}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-cutive text-xs mr-3">{it.duration}</div>
                <div className="flex gap-2">
                  <button
                    className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]"
                    aria-label={isThisPlaying ? 'Pause' : 'Play'}
                    onClick={(e) => {
                      e.stopPropagation()
                      const audio = document.querySelector('.audio-player audio')
                      if (!audio) {
                        if (onPlay) onPlay(it)
                        return
                      }
                      const a = audio.src || ''
                      const s = it.src || ''
                      const isMatch = s && (a.endsWith(s) || a.includes(s))
                      if (isMatch) {
                        if (!audio.paused) {
                          audio.pause()
                          try {
                            pauseVinyl(String(it.id || it._id), it.albumId)
                          } catch (e) {}
                        } else {
                          audio.play().catch(() => {})
                          try {
                            playVinyl(String(it.id || it._id), it.albumId)
                          } catch (e) {}
                        }
                        return
                      }
                      if (onPlay) onPlay(it)
                      setTimeout(() => { try { audio.play().catch(() => {}) } catch (e) {} }, 50)
                      try {
                        playVinyl(String(it.id || it._id), it.albumId)
                      } catch (e) {}
                    }}
                  >{isThisPlaying ? '⏸' : '▶'}</button>
                  <button className="bg-transparent border-none text-white cursor-pointer text-xl p-1.5 rounded-md hover:bg-white/[0.04]" aria-label="Add to playlist" onClick={() => onAdd && onAdd(it)}>＋</button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
