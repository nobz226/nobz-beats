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
  // return objects with the original child and a stable index so we can
  // derive a stable key (avoid remounting when carousel slides)
  const windowItems = () => {
    if (len <= step) return items.map((c, idx) => ({ child: c, srcIndex: idx }))
    const out = []
    for (let k = 0; k < step; k++) {
      const srcIdx = clampIndex(index + k)
      out.push({ child: items[srcIdx], srcIndex: srcIdx })
    }
    return out
  }

  return (
    <div className={`two-up-carousel ${className}`.trim()}>
      <button className="carousel-arrow carousel-arrow--left" aria-label="Previous" onClick={prev}>◀</button>
      <div className="carousel-track">
        {windowItems().map(({ child, srcIndex }) => {
          const stableKey = child && child.key != null
            ? child.key
            : (child?.props?.track?._id || child?.props?.track?.id || String(srcIndex))
          return (
            <div key={stableKey} className="carousel-slot">
              {child}
            </div>
          )
        })}
      </div>
      <button className="carousel-arrow carousel-arrow--right" aria-label="Next" onClick={next}>▶</button>
    </div>
  )
}
