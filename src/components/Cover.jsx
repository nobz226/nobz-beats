import React, { useEffect, useRef, useState } from 'react'

// Reusable cover component with vinyl that pops out and spins while playback
export default function Cover({ track, onPlay, className, sleeveImage }) {
  const [out, setOut] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const trackRef = useRef(track)
  const rootRef = useRef(null)

  useEffect(() => { trackRef.current = track }, [track])

  useEffect(() => {
    return () => {
      try {
        if (rootRef.current) {
          rootRef.current.style.setProperty('--parallax-sleeve-x', '0px')
          rootRef.current.style.setProperty('--parallax-sleeve-y', '0px')
          rootRef.current.style.setProperty('--parallax-vinyl-x', '0px')
          rootRef.current.style.setProperty('--parallax-vinyl-y', '0px')
        }
      } catch (e) {
        /* ignore */
      }
    }
  }, [])

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

    // initial sync: if a track is already loaded/playing when this component mounts,
    // reflect that state immediately so navigating between views keeps the correct UI.
    const sync = () => {
      try {
        if (matchesAudioSrc(audio)) {
          // if the audio for this track is loaded, keep the sleeve out
          setOut(true)
          // spinning only when actually playing
          setSpinning(!audio.paused)
        } else {
          setSpinning(false)
          setOut(false)
        }
      } catch (e) {
        // ignore
      }
    }
    sync()

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const handleClick = (e) => {
    e.stopPropagation()
    // If this track is currently loaded in the global audio element -> toggle play/pause
    const audio = document.querySelector('.audio-player audio')
    if (audio && matchesAudioSrc(audio)) {
      if (audio.paused) {
        audio.play().catch(() => {})
      } else {
        audio.pause()
      }
      // ensure the sleeve is out when toggling play
      setOut(true)
      return
    }

    // If different track or no audio yet: request parent to play this track and try to autoplay
    setOut(true)
    if (onPlay) onPlay(track)
    // attempt to play if audio exists (Player will set src on track change)
    if (audio) {
      setTimeout(() => audio.play().catch(() => {}), 50)
    }
  }

  const handlePlay = (e) => {
    e.stopPropagation()
    if (onPlay) onPlay(track)
  }

  const handlePointerMove = (e) => {
    // Only apply for mouse/pen to avoid touch noise
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / rect.width // roughly -0.5..0.5
    const dy = (e.clientY - cy) / rect.height

    const maxSleeve = 10 // px
    const maxVinyl = 18 // px
    const maxTilt = 25 // degrees for rotateX/rotateY

    const sx = (dx * maxSleeve).toFixed(2) + 'px'
    const sy = (dy * maxSleeve).toFixed(2) + 'px'
    const vx = (dx * maxVinyl).toFixed(2) + 'px'
    const vy = (dy * maxVinyl).toFixed(2) + 'px'

    // tilt: rotateX based on vertical movement (invert so pointer up tilts away),
    // rotateY based on horizontal movement
    const rotX = (-dy * maxTilt).toFixed(2) + 'deg'
    const rotY = (dx * maxTilt).toFixed(2) + 'deg'

    el.style.setProperty('--parallax-sleeve-x', sx)
    el.style.setProperty('--parallax-sleeve-y', sy)
    el.style.setProperty('--parallax-vinyl-x', vx)
    el.style.setProperty('--parallax-vinyl-y', vy)
    el.style.setProperty('--parallax-tilt-x', rotX)
    el.style.setProperty('--parallax-tilt-y', rotY)
  }

  const handlePointerLeave = () => {
    const el = rootRef.current
    if (!el) return
    el.style.setProperty('--parallax-sleeve-x', '0px')
    el.style.setProperty('--parallax-sleeve-y', '0px')
    el.style.setProperty('--parallax-vinyl-x', '0px')
    el.style.setProperty('--parallax-vinyl-y', '0px')
    el.style.setProperty('--parallax-tilt-x', '0deg')
    el.style.setProperty('--parallax-tilt-y', '0deg')
  }

  return (
    <div
      ref={rootRef}
      className={['cover', className].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      aria-pressed={String(spinning)}
      aria-label={`Cover ${track?.title || ''}`}
    >
      {/* Sleeve: use provided sleeveImage or fallback to solid black */}
      <div
        className="cover__artwork"
        aria-hidden="true"
        style={sleeveImage ? { backgroundImage: `url(${sleeveImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <img src="/logo/logoSVG.svg" className="cover__logo" alt="" aria-hidden="true" />
      </div>

      <div
        className={["vinyl", out ? 'vinyl--visible' : ''].join(' ')}
        aria-hidden={!out}
        onClick={(e) => {
          // clicking the vinyl itself should not trigger cover click
          e.stopPropagation()
          // only retract the vinyl when it's not spinning
          if (!spinning) setOut(false)
        }}
      >
        <div className="vinyl__shadow" />
        <div
          className={["vinyl__circle", spinning ? 'vinyl__circle--spin' : ''].join(' ')}
          style={{ backgroundImage: `url(${track?.artwork || '/artwork/default.png'})` }}
        />
      </div>
    </div>
  )
}
