import React, { useState } from 'react'

export default function TwoUpCarousel({ children = [], step = 2, className = '' }) {
  const items = React.Children.toArray(children)
  const len = items.length
  const [index, setIndex] = useState(0)

  if (len === 0) return null

  const clampIndex = (i) => {
    // normalize to 0..len-1
    return ((i % len) + len) % len
  }

  const prev = () => setIndex(i => clampIndex(i - step))
  const next = () => setIndex(i => clampIndex(i + step))

  // build a two-item window, wrapping when needed
  const windowItems = () => {
    if (len <= step) return items
    const out = []
    for (let k = 0; k < step; k++) {
      out.push(items[clampIndex(index + k)])
    }
    return out
  }

  return (
    <div className={`two-up-carousel ${className}`.trim()}>
      <button className="carousel-arrow carousel-arrow--left" aria-label="Previous" onClick={prev}>◀</button>
      <div className="carousel-track">
        {windowItems().map((child, i) => (
          <div key={i} className="carousel-slot">
            {child}
          </div>
        ))}
      </div>
      <button className="carousel-arrow carousel-arrow--right" aria-label="Next" onClick={next}>▶</button>
    </div>
  )
}
