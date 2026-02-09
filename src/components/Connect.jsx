import React from 'react'

export default function Connect() {
  return (
    <section 
      className="latest-section fixed z-[1000] text-white opacity-0 translate-y-2 animate-section-fade"
      style={{
        left: 'calc(var(--logo-size) + var(--logo-gap) + 1.125rem)',
        top: '14.375rem',
        maxWidth: 'var(--latest-maxwidth, calc(100% - (var(--logo-size) + var(--logo-gap) + 2rem)))',
        animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s)'
      }}
      aria-label="Connect"
    >
      <h2 className="font-cal-sans font-bold text-[1.75rem] m-0 mb-2">Connect</h2>
      <p className="font-cutive font-normal">Connect info coming soon.</p>
    </section>
  )
}
