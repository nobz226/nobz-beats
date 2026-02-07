import React, { useEffect, useRef } from 'react'

export default function Nav() {
  const navRef = useRef(null)

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

  useEffect(() => {
    const updatePos = () => {
      const el = navRef.current
      if (!el) return

      // allow media query to stack nav on small screens
      if (window.innerWidth <= 1120) {
        el.style.left = ''
        return
      }

      const logo = document.querySelector('.logo-container')
      const playlist = document.querySelector('.playlist')

      const logoRect = logo ? logo.getBoundingClientRect() : { right: 0 }
      const playlistRect = playlist ? playlist.getBoundingClientRect() : null

      const style = getComputedStyle(document.documentElement)
      const gap = parseInt(style.getPropertyValue('--logo-gap')) || 16

      const leftBound = Math.round(logoRect.right + gap)
      const rightBound = playlistRect ? Math.round(playlistRect.left) : Math.round(window.innerWidth - gap)

      const navW = Math.round(el.getBoundingClientRect().width)

      // center nav within the available horizontal slot between logo and playlist
      const available = Math.max(0, rightBound - leftBound)
      const desiredLeft = leftBound + Math.max(0, Math.floor((available - navW) / 2))

      // clamp so nav doesn't overlap logo area or overflow viewport / playlist
      const minLeft = leftBound
      const maxLeft = Math.max(minLeft, Math.round(rightBound - navW))

      const finalLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft)
      el.style.left = finalLeft + 'px'
    }

    updatePos()
    window.addEventListener('resize', updatePos)
    const mo = new MutationObserver(updatePos)
    const logo = document.querySelector('.logo-container')
    const playlist = document.querySelector('.playlist')
    if (logo) mo.observe(logo, { attributes: true, childList: true, subtree: true })
    if (playlist) mo.observe(playlist, { attributes: true, childList: true, subtree: true })

    return () => { window.removeEventListener('resize', updatePos); mo.disconnect() }
  }, [])

  return (
    <nav ref={navRef} className="site-nav" aria-label="Primary navigation" onClick={onClick}>
      <a href="/singles">&gt;Singles</a>
      <a href="/albums">&gt;Albums</a>
      <a href="/remixes">&gt;Remixes</a>
      <a href="/alltracks">&gt;AllTracks</a>
      <a href="/about">&gt;About</a>
      <a href="/connect">&gt;Connect</a>
    </nav>
  )
}  
