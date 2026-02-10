import React, { useEffect, useRef, useState } from 'react'

export default function Nav() {
  const navRef = useRef(null)
  const [open, setOpen] = useState(false)

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
      // close mobile menu after navigation
      setOpen(false)
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

  const navItemClass = "text-white no-underline font-doto text-lg md:text-2xl font-medium py-2 px-3 rounded-md opacity-0 hover:bg-white/[0.08] focus:bg-white/[0.08] focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
  const navItemStyle = {
    fontOpticalSizing: 'auto',
    fontStyle: 'normal',
    fontVariationSettings: '"ROND" 0',
    transform: 'translateX(-0.75rem)',
    animation: 'nav-slide 0.6s cubic-bezier(0.22, 0.8, 0.25, 1) forwards',
    willChange: 'transform, opacity',
    transition: 'background-color 0.12s ease, color 0.12s ease, transform 0.45s cubic-bezier(0.22, 0.8, 0.25, 1), opacity 0.45s cubic-bezier(0.22, 0.8, 0.25, 1)'
  }

  return (
    <nav ref={navRef} className="site-nav fixed top-4 lg:top-[4.6875rem] right-4 lg:right-20 w-full lg:w-auto flex flex-col lg:flex-row items-end lg:items-center gap-4 z-[1002]" aria-label="Primary navigation">
      <button
        className="lg:hidden relative z-[1102] text-[1.625rem] p-2 cursor-pointer rounded-lg border-none text-white bg-white/[0.03] hover:bg-white/[0.08]"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {open ? '✕' : '☰'}
      </button>

      <div className={`${open ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-4 flex-wrap items-end lg:items-center bg-[#1c1c1c]/95 lg:bg-transparent p-6 lg:p-0 rounded-xl shadow-2xl lg:shadow-none border border-white/[0.05] lg:border-none backdrop-blur-lg lg:backdrop-blur-none z-[1101]`} onClick={onClick}>
        <a href="/singles" className={navItemClass} style={{...navItemStyle, animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.12s)'}}>&gt;Singles</a>
        <a href="/albums" className={navItemClass} style={{...navItemStyle, animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.24s)'}}>&gt;Albums</a>
        <a href="/remixes" className={navItemClass} style={{...navItemStyle, animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.36s)'}}>&gt;Remixes</a>
        <a href="/alltracks" className={navItemClass} style={{...navItemStyle, animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.48s)'}}>&gt;AllTracks</a>
        <a href="/about" className={navItemClass} style={{...navItemStyle, animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.6s)'}}>&gt;About</a>
        <a href="/connect" className={navItemClass} style={{...navItemStyle, animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s)'}}>&gt;Connect</a>
      </div>
    </nav>
  )
}
