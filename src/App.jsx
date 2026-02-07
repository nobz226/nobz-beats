import React, { useState, useEffect } from 'react'
import Logo from './components/Logo'
import Nav from './components/Nav'
import Title from './components/Title'
import Latest from './components/Latest'
import Singles from './components/Singles'
import Albums from './components/Albums'
import AllTracks from './components/AllTracks'
import About from './components/About'
import Connect from './components/Connect'
import Player from './components/Player'
import Playlist from './components/Playlist'

const normalize = (p) => (p === '/' || p === '' ? '/latest' : p)

export default function App() {
  const [route, setRoute] = useState(normalize(window.location.pathname))

  // sample catalogue
  const singles = [
    { id: 's1', title: 'Armitage', artist: 'NOBZ>BEATS', artwork: '/assets/logo/logoSVG.svg', src: '/assets/audio/sample.mp3', duration: '3:25' }
  ]

  const albums = [
    {
      id: 'a1',
      title: 'Vol.1',
      artist: 'NOBZ>BEATS',
      artwork: '/assets/artwork/Nobz-Vol.1-Ver3.png',
      description: 'A melange of genres and influences — from metal to dub, trap and classic boom bap.',
      tracks: [
        { id: 'a1t1', title: 'Awakening', artist: 'NOBZ>BEATS', src: '/assets/audio/sample.mp3', duration: '4:12' },
        { id: 'a1t2', title: 'Afterglow', artist: 'NOBZ>BEATS', src: '/assets/audio/sample.mp3', duration: '5:04' }
      ]
    }
  ]

  // app state: playlist and current track
  const [playlist, setPlaylist] = useState(singles)
  const [currentTrack, setCurrentTrack] = useState(singles[0])

  useEffect(() => {
    const onPop = () => setRoute(normalize(window.location.pathname))
    window.addEventListener('popstate', onPop)

    // ensure default route is /latest instead of root
    if (window.location.pathname === '/' || window.location.pathname === '') {
      history.replaceState(null, '', '/latest')
      setRoute('/latest')
    }

    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // player controls and playlist management
  const playTrack = (t) => { setCurrentTrack(t) }

  const addToPlaylist = (t) => {
    setPlaylist(prev => {
      if (prev.find(p => p.id === t.id)) return prev
      return [...prev, t]
    })
  }

  const playPlaylist = () => {
    if (playlist.length) setCurrentTrack(playlist[0])
  }

  const shufflePlaylist = () => {
    setPlaylist(prev => {
      const copy = [...prev]
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy
    })
  }

  const clearPlaylist = () => setPlaylist([])

  const onNext = () => {
    const idx = playlist.findIndex(p => p.id === currentTrack.id)
    if (idx >= 0 && idx < playlist.length - 1) setCurrentTrack(playlist[idx + 1])
  }
  const onPrev = () => {
    const idx = playlist.findIndex(p => p.id === currentTrack.id)
    if (idx > 0) setCurrentTrack(playlist[idx - 1])
  }

  return (
    <>
      <Logo />
      <Nav />
      <Title />
      <main className="main-content">
        {route === '/latest' && <Latest single={singles[0]} album={albums[0]} onPlay={playTrack} onAdd={addToPlaylist} />}
        {route === '/singles' && <Singles tracks={singles} onPlay={playTrack} onAdd={addToPlaylist} />}
        {route === '/albums' && <Albums tracks={albums} onPlay={playTrack} onAdd={addToPlaylist} />}
        {route === '/alltracks' && <AllTracks singles={singles} albums={albums} onPlay={playTrack} onAdd={addToPlaylist} currentTrackId={currentTrack?.id} />}
        {route === '/about' && <About />}
        {route === '/connect' && <Connect /> }
      </main>
      <Player track={currentTrack} onNext={onNext} onPrev={onPrev} onEnded={onNext} />
      <Playlist tracks={playlist} onSelect={playTrack} onAdd={addToPlaylist} onPlayPlaylist={playPlaylist} onShuffle={shufflePlaylist} onClear={clearPlaylist} currentTrackId={currentTrack?.id} />
    </>
  )
}
