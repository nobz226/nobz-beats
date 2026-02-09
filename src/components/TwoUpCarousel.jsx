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
    <div className={`relative flex items-center justify-center ${className}`.trim()}>
      <button 
        className="absolute top-1/2 -translate-y-1/2 bg-white/2 border-none text-white w-12 h-12 inline-grid place-items-center cursor-pointer rounded-full text-lg z-40 focus:outline-2 focus:outline-white -left-20" 
        aria-label="Previous" 
        onClick={prev}
      >
        ◀
      </button>
      <div className="flex gap-24 items-start px-14">
        {windowItems().map(({ child, srcIndex }) => {
          const stableKey = child && child.key != null
            ? child.key
            : (child?.props?.track?._id || child?.props?.track?.id || String(srcIndex))
          return (
            <div key={stableKey} className="inline-flex w-[22.5rem] flex-[0_0_22.5rem]">
              {child}
            </div>
          )
        })}
      </div>
      <button 
        className="absolute top-1/2 -translate-y-1/2 bg-white/2 border-none text-white w-12 h-12 inline-grid place-items-center cursor-pointer rounded-full text-lg z-40 focus:outline-2 focus:outline-white -right-20" 
        aria-label="Next" 
        onClick={next}
      >
        ▶
      </button>
    </div>
  )
}
