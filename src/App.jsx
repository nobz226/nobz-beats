import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import Logo from './components/Logo'
import Nav from './components/Nav'
import Title from './components/Title'
import Latest from './components/Latest'
import Singles from './components/Singles'
import Albums from './components/Albums'
import AllTracks from './components/AllTracks'
import About from './components/About'
import Connect from './components/Connect'
import Admin from './components/Admin/Admin'
import ErrorBoundary from './components/Admin/ErrorBoundary'
import Player from './components/Player'
import Playlist from './components/Playlist'

const normalize = (p) => {
  if (!p || p === '/') return '/latest'
  // strip trailing slashes and ignore query/hash
  const clean = p.split('?')[0].split('#')[0].replace(/\/+$|^\s+|\s+$/g, '')
  return clean.replace(/\/$/, '') || '/latest'
}

export default function App() {
  const [route, setRoute] = useState(normalize(window.location.pathname))

  // fetch catalogue from Convex
  const dbTracks = useQuery('functions/tracks:listTracks') || []
  const dbAlbums = useQuery('functions/albums:listAlbums') || []

  const singles = dbTracks
    .filter(t => !t.albumId)
    .map(t => ({
      id: t._id || t.id,
      title: t.title,
      artist: t.artist || 'NOBZ>BEATS',
      artwork: t.artwork || '/assets/artwork/default.png',
      src: t.src,
      duration: t.duration || '0:00',
      description: t.description,
      type: t.type || 'Single'
    }))

  const albums = dbAlbums.map(a => ({
    id: a._id || a.id,
    title: a.title,
    artist: a.artist || 'NOBZ>BEATS',
    artwork: a.artwork || '/assets/artwork/default.png',
    description: a.description,
    tracks: dbTracks
      .filter(t => (t.albumId === (a._id || a.id)))
      .map(t => ({ id: t._id || t.id, title: t.title, src: t.src, duration: t.duration || '0:00', description: t.description, artist: t.artist }))
  }))

  // app state: playlist and current track
  const [playlist, setPlaylist] = useState([])
  const [currentTrack, setCurrentTrack] = useState(null)

  // initialize playlist when data loads
  useEffect(() => {
    if (!currentTrack && singles.length > 0) {
      setPlaylist(singles)
      setCurrentTrack(singles[0])
    }
  }, [singles])

  useEffect(() => {
    const onPop = () => {
      console.debug('[App] popstate ->', window.location.pathname)
      setRoute(normalize(window.location.pathname))
    }
    window.addEventListener('popstate', onPop)

    // ensure default route is /latest instead of root
    if (window.location.pathname === '/' || window.location.pathname === '') {
      console.debug('[App] replacing root with /latest')
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

  if (route === '/admin') {
    // When on the admin dashboard render ONLY the admin page (nothing else)
    // Wrap Admin in an ErrorBoundary so Convex errors don't unmount the app
    return (
      <>
        <ErrorBoundary>
          <Admin />
        </ErrorBoundary>
      </>
    )
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
      <Player track={currentTrack || { src: '', artwork: '/assets/logo/logoSVG.svg', title: '', artist: '' }} onNext={onNext} onPrev={onPrev} onEnded={onNext} />
      <Playlist tracks={playlist} onSelect={playTrack} onAdd={addToPlaylist} onPlayPlaylist={playPlaylist} onShuffle={shufflePlaylist} onClear={clearPlaylist} currentTrackId={currentTrack?.id} />
    </>
  )
}
