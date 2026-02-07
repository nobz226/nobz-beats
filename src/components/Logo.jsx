import React, { useEffect, useRef } from 'react'

// Ported GlitchLogo class (keeps behavior identical to the original site)
class GlitchLogo {
  constructor(container) {
    this.container = container
    this.r = container.querySelector('.logo-r')
    this.g = container.querySelector('.logo-g')
    this.b = container.querySelector('.logo-b')
    this.slices = container.querySelector('.glitch-slices')
    this.baseImg = container.querySelector('.logo-base')
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
        slice.className = 'glitch-slice'
        slice.style.top = y + 'px'
        slice.style.height = h + 'px'

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

  return (
    <div className="logo-container" aria-label="Site logo">
      <div ref={rootRef} className="logo-glitch" role="img" aria-label="Site logo">
        <img className="logo-base" src="/assets/logo/logoSVG.svg" alt="Site logo" />
        <img className="logo-r" src="/assets/logo/logoSVG.svg" aria-hidden="true" />
        <img className="logo-g" src="/assets/logo/logoSVG.svg" aria-hidden="true" />
        <img className="logo-b" src="/assets/logo/logoSVG.svg" aria-hidden="true" />
        <div className="glitch-slices" aria-hidden="true"></div>
      </div>
    </div>
  )
}
