import React, { useEffect, useRef, useState } from 'react'

// Reusable cover component with vinyl that pops out and spins while playback
export default function Cover({ track, onPlay, className }) {
  const [out, setOut] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const trackRef = useRef(track)

  useEffect(() => { trackRef.current = track }, [track])

  // helper: whether the global audio element src corresponds to this track
  const matchesAudioSrc = (audio) => {
    if (!audio || !trackRef.current) return false
    try {
      const a = audio.src || ''
      const t = trackRef.current.src || ''
      if (!t) return false
      return a.endsWith(t) || a.includes(t)
    } catch (e) {
      return false
    }
  }

  useEffect(() => {
    // Listen to the player audio element in the page (Player renders .audio-player audio)
    const audio = document.querySelector('.audio-player audio')
    if (!audio) return // nothing to do until audio exists

    const onPlay = () => {
      // When any play starts on the page: if it matches this track, spin and ensure it's out;
      // otherwise retract this cover and stop spinning so only the active track shows spinning vinyl.
      if (matchesAudioSrc(audio)) {
        setSpinning(true)
        setOut(true)
      } else {
        setSpinning(false)
        setOut(false)
      }
    }
    const onPlaying = onPlay

    const onPause = () => {
      if (matchesAudioSrc(audio)) setSpinning(false)
    }

    const onEnded = () => {
      if (matchesAudioSrc(audio)) {
        setSpinning(false)
        setOut(false)
      }
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const handleClick = (e) => {
    // Toggle visible/out state. Per requirement: clicking cover pops vinyl out but does not auto-spin.
    setOut(prev => !prev)
  }

  const handlePlay = (e) => {
    e.stopPropagation()
    if (onPlay) onPlay(track)
  }

  return (
    <div className={['cover', className].filter(Boolean).join(' ')} role="button" tabIndex={0} onClick={handleClick} aria-pressed={String(spinning)} aria-label={`Cover ${track?.title || ''}`}>
      {/* Sleeve only - remove artwork image per request */}
      <div className="cover__artwork" aria-hidden="true" />

      <div className={["vinyl", out ? 'vinyl--visible' : ''].join(' ')} aria-hidden={!out}>
        <div className="vinyl__shadow" />
        <div
          className={["vinyl__circle", spinning ? 'vinyl__circle--spin' : ''].join(' ')}
          style={{ backgroundImage: `url(${track?.artwork || '/artwork/default.png'})` }}
        />
      </div>
    </div>
  )
}
