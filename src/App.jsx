import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import Logo from './components/Logo'
import Nav from './components/Nav'
import Title from './components/Title'
import Latest from './components/Latest'
import Singles from './components/Singles'
import Remixes from './components/Remixes'
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

  // Normalize artwork paths stored in DB that still reference the old
  // `/assets/...` public directory. Vite's `publicDir: 'assets'` serves
  // those files at root (e.g. `/artwork/default.png`), so strip the
  // `/assets/` prefix when present.
  const normalizeAsset = (p) => {
    if (!p) return p
    if (typeof p !== 'string') return p
    return p.replace(/^\/assets\//, '/')
  }

  // fetch catalogue from Convex
  const dbTracks = useQuery('functions/tracks:listTracks') || []
  const dbAlbums = useQuery('functions/albums:listAlbums') || []

  const singles = dbTracks
    .filter(t => !t.albumId && ((t.type || '').toString().toLowerCase() !== 'remix'))
    .map(t => ({
      id: t._id || t.id,
      title: t.title,
      artist: t.artist || 'Nobz',
      artwork: normalizeAsset(t.artwork) || '/artwork/default.png',
      src: t.src,
      duration: t.duration || '0:00',
      description: t.description,
      type: t.type || 'Single'
    }))

  const albums = dbAlbums.map(a => ({
    id: a._id || a.id,
    title: a.title,
    artist: a.artist || 'Nobz',
    artwork: normalizeAsset(a.artwork) || '/artwork/default.png',
    description: a.description,
    tracks: dbTracks
      .filter(t => (t.albumId === (a._id || a.id)))
      .map(t => ({ id: t._id || t.id, title: t.title, src: t.src, duration: t.duration || '0:00', description: t.description, artist: t.artist, albumId: (a._id || a.id) }))
  }))

  const remixes = dbTracks
    .filter(t => (t.type === 'remix'))
    .map(t => ({
      id: t._id || t.id,
      title: t.title,
      artist: t.artist || 'Nobz',
      artwork: normalizeAsset(t.artwork) || '/artwork/default.png',
      src: t.src,
      duration: t.duration || '0:00',
      description: t.description,
      type: t.type || 'Remix'
    }))

  const allTracks = dbTracks.map(t => {
    const album = dbAlbums.find(a => (a._id || a.id) === t.albumId)
    // Prefer the album artwork for tracks that belong to an album so updates
    // to the album's artwork are reflected everywhere (AllTracks view, etc.).
    const artwork = album ? (normalizeAsset(album.artwork) || '/artwork/default.png') : (normalizeAsset(t.artwork) || '/artwork/default.png')
    return {
      id: t._id || t.id,
      title: t.title,
      artist: t.artist || 'Nobz',
      artwork,
      src: t.src,
      duration: t.duration || '0:00',
      description: t.description,
      album: album ? album.title : undefined,
      albumId: album ? (album._id || album.id) : undefined,
      type: t.type || 'single'
    }
  })

  // pick latest track and latest album by createdAt timestamp
  const latestTrackRaw = dbTracks.reduce((best, t) => {
    if (!best) return t
    return (t.createdAt || 0) > (best.createdAt || 0) ? t : best
  }, null)

  const latestTrack = latestTrackRaw ? {
    id: latestTrackRaw._id || latestTrackRaw.id,
    title: latestTrackRaw.title,
    artist: latestTrackRaw.artist || 'Nobz',
    artwork: normalizeAsset(latestTrackRaw.artwork) || '/artwork/default.png',
    src: latestTrackRaw.src,
    duration: latestTrackRaw.duration || '0:00',
    description: latestTrackRaw.description,
    type: latestTrackRaw.type || 'Single'
  } : (singles[0] || null)

  const latestAlbumRaw = dbAlbums.reduce((best, a) => {
    if (!best) return a
    return (a.createdAt || 0) > (best.createdAt || 0) ? a : best
  }, null)

  const latestAlbum = latestAlbumRaw ? (albums.find(x => x.id === (latestAlbumRaw._id || latestAlbumRaw.id)) || {
    id: latestAlbumRaw._id || latestAlbumRaw.id,
    title: latestAlbumRaw.title,
    artist: latestAlbumRaw.artist || 'Nobz',
    artwork: normalizeAsset(latestAlbumRaw.artwork) || '/artwork/default.png',
    description: latestAlbumRaw.description,
    tracks: dbTracks.filter(t => (t.albumId === (latestAlbumRaw._id || latestAlbumRaw.id))).map(t => ({ id: t._id || t.id, title: t.title, src: t.src, duration: t.duration || '0:00', description: t.description, artist: t.artist }))
  }) : (albums[0] || null)

  // Build a combined list of recent additions (tracks and albums),
  // normalized for the Latest view. We'll sort by `createdAt` and
  // keep the five most recent entries.
  const latestCandidates = [
    // include only standalone tracks (no albumId) or explicit remixes
    ...dbTracks
      .filter(t => !t.albumId || (t.type && t.type.toString().toLowerCase() === 'remix'))
      .map(t => ({
      kind: 'track',
      id: t._id || t.id,
      title: t.title,
      artist: t.artist || 'Nobz',
      artwork: normalizeAsset(t.artwork) || '/artwork/default.png',
      src: t.src,
      duration: t.duration || '0:00',
      description: t.description,
      createdAt: t.createdAt || 0
    })),
    ...dbAlbums.map(a => ({
      kind: 'album',
      id: a._id || a.id,
      title: a.title,
      artist: a.artist || 'Nobz',
      artwork: normalizeAsset(a.artwork) || '/artwork/default.png',
      description: a.description,
      tracks: dbTracks
        .filter(t => (t.albumId === (a._id || a.id)))
        .map(t => ({ id: t._id || t.id, title: t.title, src: t.src, duration: t.duration || '0:00', description: t.description, artist: t.artist })),
      createdAt: a.createdAt || 0
    }))
  ]

  const latestItems = latestCandidates.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5)

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

  // Keep the main content (latest section) max-width aligned with the
  // right border of the site nav so the AllTracks list spans up to the
  // nav items. We measure DOM positions and set a CSS variable
  // `--latest-maxwidth` used in CSS.
  useEffect(() => {
    const update = () => {
      try {
        const latest = document.querySelector('.latest-section')
        const nav = document.querySelector('.site-nav')
        if (!latest || !nav) return
        const latestRect = latest.getBoundingClientRect()
        const navRect = nav.getBoundingClientRect()
        // compute available width between latest left and nav right, subtract small gutter
        const gutter = 16
        const max = Math.max(200, Math.round(navRect.right - latestRect.left - gutter))
        document.documentElement.style.setProperty('--latest-maxwidth', `${max}px`)
      } catch (e) {
        // ignore measurement errors
      }
    }

    update()
    window.addEventListener('resize', update)
    const mo = new MutationObserver(update)
    const nav = document.querySelector('.site-nav')
    if (nav) mo.observe(nav, { childList: true, subtree: true })
    return () => { window.removeEventListener('resize', update); mo.disconnect() }
  }, [dbTracks, dbAlbums])

  // player controls and playlist management
  const playTrack = (t) => { setCurrentTrack(t) }

  const addToPlaylist = (t) => {
    setPlaylist(prev => {
      if (prev.find(p => p.id === t.id)) return prev
      return [...prev, t]
    })
  }

  // Play an album: replace playlist with album's tracks and start with the first
  const playAlbum = (album) => {
    if (!album || !album.tracks || album.tracks.length === 0) return
    const items = album.tracks.map(t => ({ ...t, artwork: t.artwork || album.artwork, album: album.title }))
    setPlaylist(items)
    setCurrentTrack(items[0])
  }

  // Add album tracks to the current playlist without clearing or autoplay
  const addAlbumToPlaylist = (album) => {
    if (!album || !album.tracks || album.tracks.length === 0) return
    setPlaylist(prev => {
      const existingIds = new Set(prev.map(p => p.id))
      const toAdd = album.tracks
        .map(t => ({ ...t, artwork: t.artwork || album.artwork, album: album.title }))
        .filter(t => !existingIds.has(t.id))
      return [...prev, ...toAdd]
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
        {route === '/latest' && <Latest items={latestItems} onPlay={playTrack} onAdd={addToPlaylist} onPlayAlbum={playAlbum} onAddAlbum={addAlbumToPlaylist} onPlayTrack={playTrack} onAddTrack={addToPlaylist} />}
        {route === '/singles' && <Singles tracks={singles} onPlay={playTrack} onAdd={addToPlaylist} />}
        {route === '/remixes' && <Remixes tracks={remixes} onPlay={playTrack} onAdd={addToPlaylist} />}
        {route === '/albums' && <Albums tracks={albums} onPlayAlbum={playAlbum} onAddAlbum={addAlbumToPlaylist} onPlayTrack={playTrack} onAddTrack={addToPlaylist} />}
        {route === '/alltracks' && <AllTracks allTracks={allTracks} onPlay={playTrack} onAdd={addToPlaylist} currentTrackId={currentTrack?.id} />}
        {route === '/about' && <About />}
        {route === '/connect' && <Connect /> }
      </main>
      <Player track={currentTrack || { src: '', artwork: '/logo/logoSVG.svg', title: '', artist: '' }} onNext={onNext} onPrev={onPrev} onEnded={onNext} />
      <Playlist tracks={playlist} onSelect={playTrack} onAdd={addToPlaylist} onPlayPlaylist={playPlaylist} onShuffle={shufflePlaylist} onClear={clearPlaylist} currentTrackId={currentTrack?.id} currentTrack={currentTrack} />
    </>
  )
}
