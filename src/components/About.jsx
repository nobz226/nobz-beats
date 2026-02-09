import React from 'react'

export default function About() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return (
    <section 
      className={`latest-section fixed z-[1000] text-white opacity-0 translate-y-2 animate-section-fade ${isMobile ? 'left-0 right-0 w-full flex flex-col overflow-hidden' : 'p-0 custom-scrollbar'}`}
      style={{
        left: isMobile ? '0' : 'var(--main-left)',
        top: 'var(--main-top)',
        bottom: isMobile ? '8rem' : 'auto',
        width: isMobile ? '100%' : 'auto',
        maxWidth: isMobile ? 'none' : 'var(--latest-maxwidth, calc(100% - (var(--logo-size) + var(--logo-gap) + 2rem)))',
        animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s)'
      }}
      aria-label="About"
    >
      <h2 className={`font-cal-sans font-bold text-[1.75rem] m-0 mb-2 ${isMobile ? 'px-4' : ''}`}>About</h2>
      <div className={`font-cutive font-normal flex-1 overflow-x-hidden custom-scrollbar ${isMobile ? 'overflow-y-auto px-4 pb-24' : ''}`}>
        <p>About page coming soon.</p>
      </div>
    </section>
  )
}
