import React, { useEffect, useRef, useState } from 'react'
import vinylImg from '../../covers/images/default.png'
import { getVinylState, subscribeToVinyl, playVinyl, pauseVinyl, stopVinyl } from '../lib/vinyl'

// Reusable cover component with vinyl that pops out and spins while playback
export default function Cover({ track, onPlay, className, sleeveImage }) {
  const [out, setOut] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const trackRef = useRef(track)
  const rootRef = useRef(null)
  const vinylUnsubRef = useRef(null)

  useEffect(() => { trackRef.current = track }, [track])

  useEffect(() => {
    return () => {
      try {
        if (rootRef.current) {
          rootRef.current.style.setProperty('--parallax-sleeve-x', '0px')
          rootRef.current.style.setProperty('--parallax-sleeve-y', '0px')
          rootRef.current.style.setProperty('--parallax-vinyl-x', '0px')
          rootRef.current.style.setProperty('--parallax-vinyl-y', '0px')
          rootRef.current.style.setProperty('--parallax-tilt-x', '0deg')
          rootRef.current.style.setProperty('--parallax-tilt-y', '0deg')
        }
      } catch (e) {
        /* ignore */
      }
    }
  }, [])

  // (Keep all the helper logic matchesAudioSrc, event listeners, etc.)
  const matchesAudioSrc = (audio) => {
    if (!audio || !trackRef.current) return false
    try {
      const a = audio.src || ''
      const current = trackRef.current
      if (current && Array.isArray(current.tracks) && current.tracks.length > 0) {
        return current.tracks.some(tt => {
          const ts = tt?.src || ''
          if (!ts) return false
          // Fix: use 'a' (audio.src) instead of undefined 'src'
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

  useEffect(() => {
    const current = track
    const myId = (current && ((current._id || current.id)))

    try {
      if (vinylUnsubRef.current) {
        try { vinylUnsubRef.current() } catch (e) {}
        vinylUnsubRef.current = null
      }
    } catch (e) {}

    if (myId) {
      try {
        const primaryId = String(myId)
        try {
          const s = getVinylState(primaryId)
          setOut(!!(s && s.out))
          setSpinning(!!(s && s.spinning))
        } catch (e) {}

        const unsub = subscribeToVinyl(primaryId, (detail) => {
          try {
            setOut(!!detail.out)
            setSpinning(!!detail.spinning)
            if (!detail.out && !detail.spinning) {
              const audioEl = document.querySelector('.audio-player audio')
              if (audioEl && matchesAudioSrc(audioEl) && !audioEl.paused) audioEl.pause()
            }
          } catch (err) {}
        })

        vinylUnsubRef.current = unsub
      } catch (e) {}
    } else {
      setOut(false)
      setSpinning(false)
    }

    return () => {
      try {
        if (vinylUnsubRef.current) {
          try { vinylUnsubRef.current() } catch (e) {}
          vinylUnsubRef.current = null
        }
      } catch (e) {}
    }
  }, [track && (track._id || track.id)])

  const handleClick = (e) => {
    e.stopPropagation()
    const audio = document.querySelector('.audio-player audio')
    const id = (track && ((track._id || track.id)))
    const albumId = (track && Array.isArray(track.tracks) && track.tracks.length > 0) ? id : (track && track.albumId)

    if (audio && matchesAudioSrc(audio)) {
      if (audio.paused) {
        try { playVinyl(String(id), albumId) } catch (e) {}
        audio.play().catch(() => {})
      } else {
        try { pauseVinyl(String(id), albumId) } catch (e) {}
        audio.pause()
      }
      setOut(true)
      setSpinning(!audio.paused)
      return
    }

    setOut(true)
    setSpinning(true)
    try {
      if (id) playVinyl(String(id), albumId)
    } catch (err) {}

    if (onPlay) onPlay(track)
    if (audio) {
      setTimeout(() => audio.play().catch(() => {}), 50)
    }
  }

  const handlePointerMove = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / rect.width
    const dy = (e.clientY - cy) / rect.height

    const maxSleeve = 10
    const maxVinyl = 18
    const maxTilt = 25

    const sx = (dx * maxSleeve).toFixed(2) + 'px'
    const sy = (dy * maxSleeve).toFixed(2) + 'px'
    const vx = (dx * maxVinyl).toFixed(2) + 'px'
    const vy = (dy * maxVinyl).toFixed(2) + 'px'
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
      className={`inline-block relative w-80 h-80 cursor-pointer select-none bg-transparent perspective-[900px] focus-visible:outline-2 focus-visible:outline-white/90 focus-visible:outline-offset-4 ${className || ''}`.trim()}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      aria-pressed={String(spinning)}
      aria-label={`Cover ${track?.title || ''}`}
    >
      <div
        className="w-full h-full bg-black rounded-md relative z-20 shadow-[0_8px_22px_rgba(0,0,0,0.5)] transition-transform duration-[180ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform transform-style-3d"
        aria-hidden="true"
        style={{
          transform: 'translate(var(--parallax-sleeve-x, 0px), var(--parallax-sleeve-y, 0px)) rotateX(var(--parallax-tilt-x, 0deg)) rotateY(var(--parallax-tilt-y, 0deg))',
          backgroundImage: sleeveImage ? `url(${sleeveImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {!(track && Array.isArray(track.tracks) && track.tracks.length > 0) && (
          <img src="/logo/logoSVG.svg" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2/5 h-auto pointer-events-none block" alt="" aria-hidden="true" />
        )}
      </div>

      <div
        className="absolute z-[5] left-1/2 top-1/2 transition-transform duration-[320ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] will-change-transform"
        aria-hidden={!out}
        onClick={(e) => {
          e.stopPropagation()
          try {
            if (spinning) return
            setOut(false)
            try {
              const audio = document.querySelector('.audio-player audio')
              if (audio && matchesAudioSrc(audio)) {
                try { audio.pause() } catch (e) {}
                try { audio.currentTime = 0 } catch (e) {}
              }
            } catch (e) {}
            try {
              const current = trackRef.current
              const myId = current?._id || current?.id
              if (myId) stopVinyl(String(myId))
            } catch (err) {}
          } catch (e) {
            setOut(false)
          }
        }}
        style={{
           width: 'var(--vinyl-width)',
           height: 'var(--vinyl-width)',
           // If out, protrude. If not, hidden behind.
           transform: out
             ? 'translate(calc(-50% + var(--vinyl-protrude) + var(--parallax-vinyl-x, 0px)), calc(-50% + var(--parallax-vinyl-y, 0px))) rotateX(var(--parallax-tilt-x, 0deg)) rotateY(var(--parallax-tilt-y, 0deg))'
             : 'translate(calc(-50% + var(--parallax-vinyl-x, 0px)), calc(-50% + var(--parallax-vinyl-y, 0px))) rotateX(var(--parallax-tilt-x, 0deg)) rotateY(var(--parallax-tilt-y, 0deg))'
        }}
      >
        <div className="hidden absolute left-0 top-0 w-full h-full rounded-full" />
        <div
          className="absolute left-0 top-0 w-full h-full rounded-full bg-cover bg-center bg-no-repeat z-[4] bg-transparent origin-center shadow-none border-none animate-cover-rotate"
          style={{ 
            backgroundImage: `url(${vinylImg})`,
            animationPlayState: spinning ? 'running' : 'paused'
          }}
        />
      </div>
    </div>
  )
}
