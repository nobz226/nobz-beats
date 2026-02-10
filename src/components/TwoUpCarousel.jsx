import React, { useState, useRef, useEffect } from 'react'

/**
 * Fancier Carousel for Desktop
 * - Smooth track sliding animation
 * - Glassmorphic navigation arrows
 * - Progress dots indicator
 * - Proper arrow positioning at the edges of the 2-item view
 */
export default function TwoUpCarousel({ children = [], step = 2, className = '' }) {
  // Ensure we only render valid React elements (guard against accidental plain objects)
  const items = React.Children.toArray(children).filter(c => React.isValidElement(c))
  const len = items.length

  const [index, setIndex] = useState(0)
  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const isDragging = useRef(false)
  const dragMoved = useRef(false)
  const [suppressClicks, setSuppressClicks] = useState(false)
  const startX = useRef(0)
  const currentOffset = useRef(0)
  const raf = useRef(null)
  const slideWidth = useRef(0)
  const lastWheelAt = useRef(0)

  const clearSuppress = (ms = 300) => {
    setSuppressClicks(true)
    setTimeout(() => setSuppressClicks(false), ms)
  }

  const handlePrev = () => { clearSuppress(); setIndex(i => Math.max(0, i - step)) }
  const handleNext = () => { clearSuppress(); setIndex(i => Math.min(len - step, i + step)) }

  // The user wants a 2-up view on desktop.
  // Each item is 20rem wide. Increase gap for more space between covers.
  const itemWidthRem = 20
  const gapWidthRem = 8
  const carouselWidth = `${(itemWidthRem * 2) + gapWidthRem}rem`

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

  if (len === 0) return null

  return (
    <div 
      className={`carousel-container relative mx-auto group pb-0 ${className}`.trim()} 
      style={{ width: carouselWidth }}
    >
      {/* Viewport for the sliding track */}
      <div
        ref={containerRef}
        className="carousel-viewport w-full overflow-hidden lg:overflow-visible pt-4"
        onClickCapture={(e) => {
          // Prevent clicks from firing on children if a drag occurred or clicks are suppressed
          if (dragMoved.current || suppressClicks) {
            try { e.preventDefault(); e.stopPropagation(); if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation() } catch (err) {}
          }
        }}
        onPointerDown={(e) => {
          // Ignore pointerdown on native interactive controls (buttons, links, inputs)
          // but allow elements that merely use role="button" (e.g. Cover) so dragging still works.
          const interactive = e.target && (e.target.closest ? e.target.closest('button, a, input, textarea, select, label, summary') : null)
          if (interactive) return
          isDragging.current = true
          dragMoved.current = false
          startX.current = e.clientX
        }}
        style={{ touchAction: 'pan-y' }}
        onPointerMove={(e) => {
          if (!isDragging.current) return
          const dx = e.clientX - startX.current
          currentOffset.current = dx
          if (Math.abs(dx) > 5) dragMoved.current = true
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
          if (dragMoved.current) {
            // briefly suppress clicks after a drag so accidental clicks don't fire
            setSuppressClicks(true)
            setTimeout(() => setSuppressClicks(false), 300)
          }
          dragMoved.current = false
        }}
        onPointerCancel={(e) => {
          isDragging.current = false
          currentOffset.current = 0
          updateTransform(0)
          try { /* no-op: avoid releasing pointer capture so child clicks fire */ } catch (er) {}
          dragMoved.current = false
        }}
        onWheel={(e) => {
          const now = Date.now()
          if (now - lastWheelAt.current < 200) return
          lastWheelAt.current = now
          // suppress clicks briefly after wheel navigation
          setSuppressClicks(true)
          setTimeout(() => setSuppressClicks(false), 300)
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
              className={`carousel-item flex-shrink-0 w-[20rem] transition-opacity duration-700 ${
                 i >= index && i < index + step ? 'opacity-100' : 'opacity-20 scale-95'
               }`}
              style={{ pointerEvents: suppressClicks ? 'none' : undefined }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows removed */}

      {/* Progress Dots */}
      {/* helper text and progress dots removed per request */}
    </div>
  )
}
