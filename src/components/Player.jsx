import React, { useRef, useState, useEffect } from 'react'

// Simple audio player — replace the sample track with real sources as needed
export default function Player({ track, onNext, onPrev, onEnded }) {
  const audioRef = useRef(null)
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
    }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
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

    audio.src = track.src
    audio.load()
    setCurrentTime(0)
    setDuration(0)
    // attempt to autoplay on track change
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [track])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (playing) {
        audio.pause()
        setPlaying(false)
      } else {
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
