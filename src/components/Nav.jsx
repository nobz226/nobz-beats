import React from 'react'

export default function Nav() {
  const onClick = (e) => {
    const anchor = e.target.closest && e.target.closest('a')
    if (!anchor) return
    const href = anchor.getAttribute('href')
    // handle only internal app routes that start with '/'
    if (href && href.startsWith('/')) {
      e.preventDefault()
      history.pushState(null, '', href)
      // notify the app that navigation happened
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }

  return (
    <nav className="site-nav" aria-label="Primary navigation" onClick={onClick}>
      <a href="/singles">&gt;Singles</a>
      <a href="/albums">&gt;Albums</a>
      <a href="/alltracks">&gt;AllTracks</a>
      <a href="/about">&gt;About</a>
      <a href="/connect">&gt;Connect</a>
    </nav>
  )
}  
