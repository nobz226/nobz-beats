import React, { useEffect, useRef, useState } from 'react'
import vinylImg from '../../covers/images/default.png'
import { setVinylState, getVinylState, subscribeToVinyl } from '../lib/vinyl'

// Reusable cover component with vinyl that pops out and spins while playback
export default function Cover({ track, onPlay, className, sleeveImage }) {
  const [out, setOut] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const trackRef = useRef(track)
  const rootRef = useRef(null)
  const vinylUnsubRef = useRef(null)

  // Use centralized vinyl store (via `src/lib/vinyl`) for shared state

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
      const current = trackRef.current
      // If this is an album (has tracks), match any track src
      if (current && Array.isArray(current.tracks) && current.tracks.length > 0) {
        return current.tracks.some(tt => {
          const ts = tt?.src || ''
          if (!ts) return false
          return a.endsWith(ts) || a.includes(ts)
        })
      }
      const t = current.src || ''
      if (!t) return false
      return a.endsWith(t) || a.includes(t)
    } catch (e) {
      return false
    }
  }

  // Mount audio listeners once; subscription to vinyl store is handled
  // separately per-track so that when `track` prop changes we re-subscribe
  useEffect(() => {
    const audio = document.querySelector('.audio-player audio')
    if (!audio) return

    const onPlay = () => {
      if (matchesAudioSrc(audio)) {
        setSpinning(true)
        setOut(true)
      } else {
        setSpinning(false)
        setOut(false)
      }
    }
    const onPlaying = onPlay
    const onPause = () => { if (matchesAudioSrc(audio)) setSpinning(false) }
    const onEnded = () => { if (matchesAudioSrc(audio)) { setSpinning(false); setOut(false) } }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    // initial sync with audio element
    try {
      if (matchesAudioSrc(audio)) {
        setOut(true)
        setSpinning(!audio.paused)
      }
    } catch (e) {}

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  // Subscribe/unsubscribe to vinyl store whenever the `track` prop (id) changes.
  useEffect(() => {
    const myId = (track && ((track._id || track.id)))
    // cleanup previous
    try {
      if (vinylUnsubRef.current) {
        vinylUnsubRef.current()
        vinylUnsubRef.current = null
      }
    } catch (e) {}

    if (myId) {
      try {
        const s = getVinylState(String(myId))
        if (s) {
          if (typeof s.out === 'boolean') setOut(s.out)
          if (typeof s.spinning === 'boolean') setSpinning(s.spinning)
        }
      } catch (e) {}

      vinylUnsubRef.current = subscribeToVinyl(String(myId), (detail) => {
        try {
          const { out: o, spinning: s } = detail || {}
          if (typeof o === 'boolean') setOut(o)
          if (typeof s === 'boolean') setSpinning(s)
          if (o === false && s === false) {
            const audioEl = document.querySelector('.audio-player audio')
            if (audioEl && matchesAudioSrc(audioEl) && !audioEl.paused) audioEl.pause()
          }
        } catch (err) {}
      })
    } else {
      // no id: reset UI
      setOut(false)
      setSpinning(false)
    }

    return () => {
      try { if (vinylUnsubRef.current) { vinylUnsubRef.current(); vinylUnsubRef.current = null } } catch (e) {}
    }
  }, [track && (track._id || track.id)])

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
    // update global vinyl state for this item
    try {
      const id = (track && ((track._id || track.id)))
      if (id) setVinylState(String(id), { out: true, spinning: true })
    } catch (err) {}

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
          try {
            // retract the sleeve
            setOut(false)
            // if it was spinning for the current track, pause playback and stop spinning
                    if (spinning) {
                      const audio = document.querySelector('.audio-player audio')
                      if (audio && matchesAudioSrc(audio) && !audio.paused) {
                        audio.pause()
                      }
                      setSpinning(false)
                    }
                    // update global state and notify other covers
                    try {
                      const current = trackRef.current
                      const myId = current?._id || current?.id
                        if (myId) setVinylState(String(myId), { out: false, spinning: false })
                    } catch (err) {}
          } catch (e) {
            setOut(false)
          }
        }}
      >
        <div className="vinyl__shadow" />
        <div
          className={["vinyl__circle", spinning ? 'vinyl__circle--spin' : ''].join(' ')}
          style={{ backgroundImage: `url(${vinylImg})` }}
        />
      </div>
    </div>
  )
}
