import React from 'react'

export default function Title() {
  return (
    <h1 
      className="fixed left-4 md:left-[3.5rem] lg:left-[8rem] top-[20%] md:top-[30%] whitespace-nowrap text-[2.5rem] md:text-[4.6875rem] font-normal tracking-wider z-[1010] pointer-events-none m-0 p-1 font-rubik opacity-0 text-transparent bg-clip-text"
      style={{
        transformOrigin: 'left center',
        transform: 'translateY(calc(-50% - 1.125rem)) rotate(90deg)',
        animation: 'title-drop var(--title-fade) cubic-bezier(0.22, 0.8, 0.25, 1) forwards',
        animationDelay: 'calc(var(--logo-fade) + var(--title-gap))',
        background: 'linear-gradient(to bottom, #c8c8c8, #1c1c1c)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}
    >
      NOBZ&gt;BEATS
    </h1>
  )
}
