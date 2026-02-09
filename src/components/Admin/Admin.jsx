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
      <main className="p-8 max-w-md mx-auto mt-20 bg-white/[0.03] rounded-lg">
        <h2 className="text-2xl font-bold mb-6 font-cal-sans">Admin Login</h2>
        <form onSubmit={login}>
          <label className="block mb-4">
            <span className="block text-sm font-medium mb-1">Username</span>
            <input 
              className="w-full bg-white/[0.05] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </label>
          <label className="block mb-6">
            <span className="block text-sm font-medium mb-1">Password</span>
            <input 
              type="password" 
              className="w-full bg-white/[0.05] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white/30"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </label>
          <div>
            <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded w-full transition-colors" type="submit">Sign in</button>
          </div>
        </form>
        <p className="mt-4 text-sm opacity-50 font-cutive">Configure admin credentials via <code>VITE_ADMIN_USER</code> and <code>VITE_ADMIN_PASSWORD</code>.</p>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-6xl mx-auto mt-20">
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold font-cal-sans">Admin {username ? `— ${username}` : ''}</h2>
        <div className="flex gap-2">
          <button className={`px-3 py-1.5 rounded transition-colors ${tab === 'tracks' ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`} onClick={() => setTab('tracks')}>Tracks</button>
          <button className={`px-3 py-1.5 rounded transition-colors ${tab === 'albums' ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`} onClick={() => setTab('albums')}>Albums</button>
          <button className={`px-3 py-1.5 rounded transition-colors ${tab === 'addTrack' ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`} onClick={() => setTab('addTrack')}>Add Track</button>
          <button className={`px-3 py-1.5 rounded transition-colors ${tab === 'addAlbum' ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`} onClick={() => setTab('addAlbum')}>Add Album</button>
          <button className="px-3 py-1.5 rounded bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors ml-4" onClick={logout}>Logout</button>
        </div>
      </header>

      <section>
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
