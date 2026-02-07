import React, { useState } from 'react'
import TracksList from './TracksList'
import AlbumsList from './AlbumsList'
import AddTrack from './AddTrack'
import AddAlbum from './AddAlbum'
import ErrorBoundary from './ErrorBoundary'

export default function Admin() {
  const [tab, setTab] = useState('tracks')
  const [authed, setAuthed] = useState(() => localStorage.getItem('admin_authed') === '1')
  const [username, setUsername] = useState(() => localStorage.getItem('admin_user') || '')
  const [password, setPassword] = useState('')

  // debug mount/unmount and auth changes
  React.useEffect(() => {
    console.debug('[Admin] mounted, authed=', authed, 'username=', username)
    return () => console.debug('[Admin] unmounted')
  }, [])
  React.useEffect(() => { console.debug('[Admin] authed changed ->', authed) }, [authed])

  const ADMIN_USER = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_USER) || process.env.REACT_APP_ADMIN_USER || 'admin'
  const ADMIN_PWD = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_PASSWORD) || process.env.REACT_APP_ADMIN_PASSWORD || 'admin'

  const login = (e) => {
    e.preventDefault()
    if (username === ADMIN_USER && password === ADMIN_PWD) {
      localStorage.setItem('admin_authed', '1')
      localStorage.setItem('admin_user', username)
      setAuthed(true)
    } else {
      alert('Invalid username or password')
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_authed')
    localStorage.removeItem('admin_user')
    setAuthed(false)
    setUsername('')
    setPassword('')
  }

  if (!authed) {
    return (
      <main className="admin-page">
        <h2>Admin Login</h2>
        <form onSubmit={login} className="admin-form">
          <label>
            Username
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <div>
            <button className="btn" type="submit">Sign in</button>
          </div>
        </form>
        <p className="muted">Configure admin credentials via <code>VITE_ADMIN_USER</code> and <code>VITE_ADMIN_PASSWORD</code> (or <code>REACT_APP_ADMIN_USER</code> / <code>REACT_APP_ADMIN_PASSWORD</code> as fallback).</p>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h2>Admin {username ? `— ${username}` : ''}</h2>
        <div style={{display: 'flex', gap: 8}}>
          <button className="btn" onClick={() => setTab('tracks')}>Tracks</button>
          <button className="btn" onClick={() => setTab('albums')}>Albums</button>
          <button className="btn" onClick={() => setTab('addTrack')}>Add Track</button>
          <button className="btn" onClick={() => setTab('addAlbum')}>Add Album</button>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <section className="admin-body">
        {tab === 'tracks' && (
          <ErrorBoundary>
            <TracksList />
          </ErrorBoundary>
        )}
        {tab === 'albums' && (
          <ErrorBoundary>
            <AlbumsList />
          </ErrorBoundary>
        )}
        {tab === 'addTrack' && (
          <ErrorBoundary>
            <AddTrack />
          </ErrorBoundary>
        )}
        {tab === 'addAlbum' && (
          <ErrorBoundary>
            <AddAlbum />
          </ErrorBoundary>
        )}
      </section>
    </main>
  )
}
