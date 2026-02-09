import React, { useState, useRef, useEffect } from 'react'

/**
 * Fancier Carousel for Desktop
 * - Smooth track sliding animation
 * - Glassmorphic navigation arrows
 * - Progress dots indicator
 * - Proper arrow positioning at the edges of the 2-item view
 */
export default function TwoUpCarousel({ children = [], step = 2, className = '' }) {
  const items = React.Children.toArray(children)
  const len = items.length
  if (len === 0) return null

  const [index, setIndex] = useState(0)
  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const currentOffset = useRef(0)
  const raf = useRef(null)
  const slideWidth = useRef(0)
  const lastWheelAt = useRef(0)

  const handlePrev = () => setIndex(i => Math.max(0, i - step))
  const handleNext = () => setIndex(i => Math.min(len - step, i + step))

  // compute slide width (px) based on first item and gap
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const first = track.querySelector('.carousel-item')
    if (!first) return
    const itemW = first.getBoundingClientRect().width
    const styles = getComputedStyle(track)
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0
    slideWidth.current = Math.round(itemW + gap)
  }, [len])

  // update transform from index + any drag offset
  const updateTransform = (offsetPx = 0) => {
    const t = trackRef.current
    if (!t) return
    const base = -index * (slideWidth.current || (itemWidthRem * 16 + gapWidthRem * 16))
    t.style.transform = `translateX(${base + offsetPx}px)`
  }

  useEffect(() => {
    // reset any transient offset when index changes
    currentOffset.current = 0
    updateTransform(0)
  }, [index])

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  // The user wants a 2-up view on desktop.
  // Each item is 22.5rem wide (360px), and we use a gap of 6rem (md:gap-24).
  // Total visible width = (22.5 * 2) + 6 = 51rem.
  const itemWidthRem = 22.5
  const gapWidthRem = 6
  const carouselWidth = `${(itemWidthRem * 2) + gapWidthRem}rem`

  return (
    <div 
      className="carousel-container relative mx-auto group pb-12" 
      style={{ width: carouselWidth }}
    >
      {/* Viewport for the sliding track */}
      <div
        ref={containerRef}
        className="carousel-viewport w-full overflow-hidden lg:overflow-visible pt-4"
        onPointerDown={(e) => {
          // Ignore pointerdown on native interactive controls (buttons, links, inputs)
          // but allow elements that merely use role="button" (e.g. Cover) so dragging still works.
          const interactive = e.target && (e.target.closest ? e.target.closest('button, a, input, textarea, select, label, summary') : null)
          if (interactive) return
          isDragging.current = true
          startX.current = e.clientX
        }}
        style={{ touchAction: 'pan-y' }}
        onPointerMove={(e) => {
          if (!isDragging.current) return
          const dx = e.clientX - startX.current
          currentOffset.current = dx
          if (raf.current) cancelAnimationFrame(raf.current)
          raf.current = requestAnimationFrame(() => updateTransform(currentOffset.current))
        }}
        onPointerUp={(e) => {
          if (!isDragging.current) return
          isDragging.current = false
          const dx = currentOffset.current
          const threshold = (slideWidth.current || 160) * 0.25
          if (dx < -threshold) {
            handleNext()
          } else if (dx > threshold) {
            handlePrev()
          } else {
            updateTransform(0)
          }
          currentOffset.current = 0
          if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null }
        }}
        onPointerCancel={(e) => {
          isDragging.current = false
          currentOffset.current = 0
          updateTransform(0)
          try { /* no-op: avoid releasing pointer capture so child clicks fire */ } catch (er) {}
        }}
        onWheel={(e) => {
          const now = Date.now()
          if (now - lastWheelAt.current < 200) return
          lastWheelAt.current = now
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            if (e.deltaY > 0) handleNext()
            else handlePrev()
          } else {
            if (e.deltaX > 0) handleNext()
            else handlePrev()
          }
        }}
      >
        <div 
          ref={trackRef}
          className="carousel-track flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
          style={{ gap: `${gapWidthRem}rem` }}
        >
          {items.map((child, i) => (
            <div 
              key={i} 
              className={`carousel-item flex-shrink-0 w-[22.5rem] transition-opacity duration-700 ${
                 i >= index && i < index + step ? 'opacity-100' : 'opacity-20 scale-95'
               }`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Styled with Glassmorphism */}
      {index > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-[-3rem] top-[35%] -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white backdrop-blur-xl z-50 transition-all hover:bg-white/10 hover:border-white/20 hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer"
          aria-label="Previous"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {index + step < len && (
        <button
          onClick={handleNext}
          className="absolute right-[-3rem] top-[35%] -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white backdrop-blur-xl z-50 transition-all hover:bg-white/10 hover:border-white/20 hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer"
          aria-label="Next"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Progress Dots */}
      {len > step && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3">
          {Array.from({ length: Math.ceil(len / step) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i * step)}
              className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer ${
                Math.floor(index / step) === i 
                  ? 'w-10 bg-white/80' 
                  : 'w-3 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
