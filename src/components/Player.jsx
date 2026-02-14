import React, { useRef, useState, useEffect } from 'react'
import { playVinyl, pauseVinyl, stopVinyl } from '../lib/vinyl'

// Simple audio player — replace the sample track with real sources as needed
export default function Player({ track, onNext, onPrev, onEnded }) {
  const audioRef = useRef(null)
  const endTimeoutRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const albumId = track && track.albumId
    const onLoaded = () => setDuration(audio.duration || 0)
    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onEnd = () => {
      setPlaying(false)
      if (onEnded) onEnded()
      // stop spinning immediately but don't retract sleeve right away to
      // avoid flicker when the player advances to the next track in an album.
      try {
        const id = (track && ((track._id || track.id)))
        const albumId = track && track.albumId
        if (id) {
          pauseVinyl(String(id), albumId)
        }

        // schedule a short delayed retraction only if playback doesn't move
        // to a different track within a short window
        try {
          if (endTimeoutRef.current) {
            clearTimeout(endTimeoutRef.current)
            endTimeoutRef.current = null
          }
        } catch (e) {}

        endTimeoutRef.current = setTimeout(() => {
          try {
            const audio = audioRef.current
            // retract only if the audio still references the same track and is paused
            const prevId = id
            if (!audio) return
            const lastId = audio._lastTrackId
            if (String(lastId) === String(prevId) && audio.paused) {
              try {
                if (id) stopVinyl(String(id), albumId)
              } catch (err) {}
            }
          } catch (err) {}
        }, 80)
      } catch (err) {}
    }

    // Keep `playing` state in sync with the actual audio element so
    // external play/pause (from playlist or covers) updates the UI here.
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    // update vinyl state when audio play/pause occurs
    const onPlayState = () => {
      try {
        const id = (track && ((track._id || track.id)))
        if (id) {
          playVinyl(String(id), albumId)
        }
      } catch (err) {}
    }
    const onPauseState = () => {
      try {
        const id = (track && ((track._id || track.id)))
        if (id) {
          pauseVinyl(String(id), albumId)
        }
      } catch (err) {}
    }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('playing', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('play', onPlayState)
    audio.addEventListener('playing', onPlayState)
    audio.addEventListener('pause', onPauseState)

    // initial sync
    setPlaying(!audio.paused)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('playing', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('play', onPlayState)
      audio.removeEventListener('playing', onPlayState)
      audio.removeEventListener('pause', onPauseState)
      try {
        if (endTimeoutRef.current) {
          clearTimeout(endTimeoutRef.current)
          endTimeoutRef.current = null
        }
      } catch (e) {}
    }
  }, [onEnded, track])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  // When `track` prop changes, update audio source and try to play
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!track || !track.src) return

    // retract vinyl for previous track when switching
    try {
      const prevId = audioRef.current?._lastTrackId
      const prevAlbumId = audioRef.current?._lastAlbumId
      const newId = (track && ((track._id || track.id)))
      const newAlbumId = (track && track.albumId)
      if (prevId && String(prevId) !== String(newId)) {
        stopVinyl(String(prevId), prevAlbumId)
      }
      // If we switched albums, retract the previous album sleeve as well
      if (prevAlbumId && newAlbumId && String(prevAlbumId) !== String(newAlbumId)) {
        try { stopVinyl(String(prevAlbumId)) } catch (e) {}
      }
    } catch (err) {}

    audio.src = track.src
    audio.load()
    setCurrentTime(0)
    setDuration(0)
    // Ensure vinyl is visible/spinning for the new track immediately (match playlist)
    try {
      const id = track && ((track._id || track.id))
      const albumId = track && track.albumId
      if (id) playVinyl(String(id), albumId)
    } catch (e) {}
    // attempt to autoplay on track change
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    try { if (audio) {
      audio._lastTrackId = (track && ((track._id || track.id)))
      audio._lastAlbumId = (track && track.albumId)
    } } catch (e) {}
  }, [track])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      const id = track && ((track._id || track.id))
      const albumId = track && track.albumId
      if (playing) {
        // pause: stop spinning but keep sleeve out
        audio.pause()
        setPlaying(false)
        try {
          if (id) pauseVinyl(String(id), albumId)
        } catch (e) {}
      } else {
        // play: show sleeve and start spinning immediately (match playlist behavior)
        try {
          if (id) playVinyl(String(id), albumId)
        } catch (e) {}
        await audio.play()
        setPlaying(true)
      }
    } catch (err) {
      console.warn('Playback failed', err)
    }
  }

  const handlePrev = () => { if (onPrev) onPrev() }
  const handleNext = () => { if (onNext) onNext() }

  const onSeek = (e) => {
    const audio = audioRef.current
    if (!audio) return
    const t = Number(e.target.value)
    audio.currentTime = t
    setCurrentTime(t)
  }

  const formatTime = (t) => {
    if (!t || Number.isNaN(t)) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div 
      className="audio-player fixed left-15 bottom-0 z-[1003] bg-transparent flex items-center justify-center py-2.5 w-full lg:right-[3.50rem] h-auto lg:h-[4.5rem]" 
      role="region" 
      aria-label="Audio player"
    >
      <audio ref={audioRef} src={track.src} preload="metadata" />

      <div 
        className="w-[calc(100%-2rem)] max-w-[48rem] flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 py-3 md:py-2 px-3.5 rounded-xl md:rounded-[0.625rem] pointer-events-auto opacity-0 bg-[#1c1c1c]/95 shadow-[0_0.375rem_1.125rem_rgba(0,0,0,0.5)] border border-white/5 translate-y-3 animate-player-drop"
        style={{ animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s + var(--title-fade) + var(--player-gap))' }}
      >
        <div className="flex items-center gap-3 w-full md:min-w-[11.25rem] md:flex-1">
          <img src={track.artwork} alt="Artwork" className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-md" />
          <div className="flex flex-col overflow-hidden w-full">
            <div className="font-cal-sans font-semibold text-white text-xs md:text-sm truncate">{track.title}</div>

            <div className="flex items-center gap-3 w-full mt-1 md:mt-0">
              <div className="flex items-center gap-2 flex-none">
                <button className="bg-transparent border-none text-white cursor-pointer text-xl p-1 rounded-md hover:bg-white/[0.04]" aria-label="Previous" onClick={handlePrev}><ion-icon name="play-skip-back" className="text-xl text-white"></ion-icon></button>
                <button className="bg-transparent border-none text-white cursor-pointer text-2xl p-1 rounded-md hover:bg-white/[0.04]" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                  {playing ? <ion-icon name="pause" className="text-2xl text-white"></ion-icon> : <ion-icon name="play" className="text-2xl text-white"></ion-icon>}
                </button>
                <button className="bg-transparent border-none text-white cursor-pointer text-xl p-1 rounded-md hover:bg-white/[0.04]" aria-label="Next" onClick={handleNext}><ion-icon name="play-skip-forward" className="text-xl text-white"></ion-icon></button>
              </div>

              <div className="flex items-center gap-2 flex-auto min-w-0 max-w-full">
                <span className="font-cutive text-[10px] md:text-xs text-white/90 min-w-[2.5rem]">{formatTime(currentTime)}</span>
                <input
                  aria-label="Seek"
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  step="0.01"
                  onChange={onSeek}
                  className="flex-auto w-full accent-red-500"
                />
                <span className="font-cutive text-[10px] md:text-xs text-white/90 min-w-[2.5rem]">{formatTime(duration)}</span>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <ion-icon name="volume-high" className="text-white text-base"></ion-icon>
                <input
                  aria-label="Volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 accent-red-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
