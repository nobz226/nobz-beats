import React, { useEffect, useRef } from 'react'

// Ported GlitchLogo class (keeps behavior identical to the original site)
class GlitchLogo {
  constructor(container) {
    this.container = container
    const imgs = container.querySelectorAll('img')
    this.baseImg = imgs[0]
    this.r = imgs[1]
    this.g = imgs[2]
    this.b = imgs[3]
    this.slices = container.querySelector('div[aria-hidden="true"]')
    this._mounted = false

    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
    this._onResize()

    // start loop
    this._running = true
    this._scheduleNext()
  }

  _onResize() {
    this.rect = this.container.getBoundingClientRect()
  }

  _rand(min, max) { return Math.random() * (max - min) + min }

  _scheduleNext() {
    if (!this._running) return
    const delay = this._rand(250, 3000)
    this._timeout = setTimeout(() => this._trigger(), delay)
  }

  _trigger() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._scheduleNext()
      return
    }

    // small channel offsets
    const rX = this._rand(-18, 18)
    const rY = this._rand(-12, 12)
    const gX = this._rand(-10, 10)
    const gY = this._rand(-8, 8)
    const bX = this._rand(-14, 14)
    const bY = this._rand(-10, 10)

    this.r.style.transform = `translate(${rX}px, ${rY}px)`
    this.g.style.transform = `translate(${gX}px, ${gY}px)`
    this.b.style.transform = `translate(${bX}px, ${bY}px)`

    // small flicker then reset red quickly
    setTimeout(() => { this.r.style.transform = '' }, 120 + Math.random()*120)

    // create glitch slices (guard against full-height slices which can look like duplicates)
    const slices = []
    const maxCount = 4
    const minCount = 1
    const count = Math.floor(this._rand(minCount, maxCount + 1))

    if (this.rect.height > 40 && this.rect.width > 40) {
      for (let i = 0; i < count; i++) {
        const pctBased = Math.floor(this.rect.height * 0.12)
        const maxSliceH = Math.max(8, pctBased)
        const safeMax = Math.max(8, Math.min(maxSliceH, Math.floor(this.rect.height - 8)))

        let h = Math.floor(this._rand(8, safeMax + 1))
        if (h >= this.rect.height) h = Math.max(6, Math.floor(this.rect.height * 0.12))
        if (h < 6) continue

        const y = Math.floor(this._rand(0, Math.max(0, this.rect.height - h - 1)))

        const slice = document.createElement('div')
        slice.className = 'absolute left-0 w-full overflow-hidden'
        slice.style.top = y + 'px'
        slice.style.height = h + 'px'
        slice.style.transition = 'transform 0.36s cubic-bezier(0.22, 0.8, 0.25, 1), opacity 0.28s ease'

        const img = document.createElement('img')
        img.src = this.baseImg.src
        img.alt = ''
        img.setAttribute('aria-hidden', 'true')
        img.style.position = 'absolute'
        img.style.left = '0'
        img.style.top = '0'
        img.style.width = this.rect.width + 'px'
        img.style.height = this.rect.height + 'px'
        img.style.objectFit = 'none'
        img.style.transform = `translateY(-${y}px)`

        slice.appendChild(img)
        this.slices.appendChild(slice)
        slices.push(slice)
      }
    }

    requestAnimationFrame(() => {
      slices.forEach(s => {
        const dx = this._rand(-60, 60)
        s.style.transform = `translateX(${dx}px)`
      })

      setTimeout(() => {
        this.b.style.transform = `translate(${this._rand(-18,18)}px, ${this._rand(-8,8)}px)`
      }, 60)

      setTimeout(() => {
        this.g.style.transform = ''
        this.b.style.transform = ''
        slices.forEach(s => { s.style.opacity = '0'; s.style.transform = 'translateX(0)'; })

        setTimeout(() => { slices.forEach(s => s.remove()) }, 520)
      }, 180 + Math.random()*240)
    })

    this._scheduleNext()
  }

  destroy() {
    this._running = false
    clearTimeout(this._timeout)
    window.removeEventListener('resize', this._onResize)
  }
}

export default function Logo() {
  const rootRef = useRef(null)

  useEffect(() => {
    if (!rootRef.current) return
    const el = rootRef.current
    const instance = new GlitchLogo(el)

    // set explicit width/height attributes for layout stability (no visual change)
    const setImgAttrs = () => {
      const rect = el.getBoundingClientRect()
      const imgs = el.querySelectorAll('img')
      imgs.forEach(img => {
        img.setAttribute('width', Math.round(rect.width))
        img.setAttribute('height', Math.round(rect.height))
      })
    }

    setImgAttrs()
    window.addEventListener('resize', setImgAttrs)

    // match original behavior (expose for debugging)
    window.__glitchLogo = instance
    return () => { instance.destroy(); window.removeEventListener('resize', setImgAttrs) }
  }, [])

  const navigateHome = () => { history.pushState(null, '', '/latest'); window.dispatchEvent(new PopStateEvent('popstate')) }

  const onKeyDown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateHome() } }

  return (
    <div 
      className="logo-container fixed top-0 left-0 flex items-center justify-center z-[1000] overflow-hidden bg-transparent pointer-events-auto cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 focus-visible:rounded-md" 
      style={{ width: 'var(--logo-size)', height: 'var(--logo-size)' }}
      aria-label="Site logo" 
      role="link" 
      tabIndex={0} 
      onClick={navigateHome} 
      onKeyDown={onKeyDown}
    >
      <div 
        ref={rootRef} 
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible opacity-0 scale-96 origin-center animate-logo-fade" 
        role="img" 
        aria-label="Site logo"
      >
        <img className="absolute top-0 left-0 w-full h-full object-contain block z-[1]" src="/logo/logoSVG.svg" alt="Site logo" style={{ transformOrigin: 'center center', transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.18s ease' }} />
        <img className="absolute top-0 left-0 w-full h-full object-contain block z-[2]" src="/logo/logoSVG.svg" aria-hidden="true" style={{ filter: 'url(#redify)', mixBlendMode: 'screen', transformOrigin: 'center center', transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.18s ease' }} />
        <img className="absolute top-0 left-0 w-full h-full object-contain block z-[3]" src="/logo/logoSVG.svg" aria-hidden="true" style={{ filter: 'url(#greenify)', mixBlendMode: 'screen', transformOrigin: 'center center', transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.18s ease' }} />
        <img className="absolute top-0 left-0 w-full h-full object-contain block z-[4]" src="/logo/logoSVG.svg" aria-hidden="true" style={{ filter: 'url(#blueify)', mixBlendMode: 'screen', transformOrigin: 'center center', transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.18s ease' }} />
        <div className="absolute inset-0 z-[6] pointer-events-none" aria-hidden="true"></div>
      </div>
    </div>
  )
}
