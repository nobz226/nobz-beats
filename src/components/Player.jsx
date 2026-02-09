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
  }, [onEnded])

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
    <div className="audio-player" role="region" aria-label="Audio player">
      <audio ref={audioRef} src={track.src} preload="metadata" />

      <div className="audio-player-inner">
      <div className="player-left">
        <img src={track.artwork} alt="Artwork" className="player-artwork" />
        <div className="player-info">
          <div className="player-title">{track.title}</div>
          <div className="player-artist cutive-mono-regular">{track.artist}</div>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className="btn prev" aria-label="Previous" onClick={handlePrev}>⏮</button>
          <button className="btn play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? '⏸' : '▶'}
          </button>
          <button className="btn next" aria-label="Next" onClick={handleNext}>⏭</button>
        </div>
        <div className="player-progress">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            aria-label="Seek"
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            step="0.01"
            onChange={onSeek}
          />
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <label className="volume">
          <span className="visually-hidden">Volume</span>
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
      </div>
      </div>
    </div>
  )
}
