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

const normalize = (p) => (p === '/' || p === '' ? '/latest' : p)

export default function App() {
  const [route, setRoute] = useState(normalize(window.location.pathname))

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

  return (
    <>
      <Logo />
      <Nav />
      <Title />
      <main className="main-content">
        {route === '/latest' && <Latest />}
        {route === '/singles' && <Singles />}
        {route === '/albums' && <Albums />}
        {route === '/alltracks' && <AllTracks />}
        {route === '/about' && <About />}
        {route === '/connect' && <Connect /> }
      </main>
    </>
  )
}
