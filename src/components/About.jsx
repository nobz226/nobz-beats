import React from 'react'

function SectionImage({ src, className = '' }) {
  return (
    <div className={`flex-shrink-0 overflow-hidden rounded-lg ${className}`}>
      <img src={src} alt="" className="w-full h-full object-cover" />
    </div>
  )
}

function Section({ title, children, image = false, isMobile = false, imageSrc = '' }) {
  return (
    <div className="mb-8">
      {image && (
        <div className={isMobile ? 'flex justify-center mb-4' : 'hidden'}>
          <SectionImage src={imageSrc} className="w-full max-w-[200px] h-[200px]" />
        </div>
      )}
      <h3 className="font-cal-sans font-bold text-[1.2rem] text-white mb-3">{title}</h3>
      <div className="font-cutive text-[0.9375rem] leading-relaxed text-white/80 space-y-3">
        {children}
      </div>
    </div>
  )
}

export default function About() {
  const [isMobile, setIsMobile] = React.useState(false)
  const [contentMaxWidth, setContentMaxWidth] = React.useState('auto')

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  React.useEffect(() => {
    const update = () => {
      const section = document.querySelector('.latest-section')
      const playlistBtn = document.querySelector('.playlist-toggle')
      if (!section || !playlistBtn) {
        setContentMaxWidth('auto')
        return
      }
      const sectionRect = section.getBoundingClientRect()
      const btnRect = playlistBtn.getBoundingClientRect()
      const max = Math.max(200, Math.round(btnRect.left - sectionRect.left - 16))
      setContentMaxWidth(`${max}px`)
    }
    update()
    window.addEventListener('resize', update)
    const mo = new MutationObserver(update)
    const playlistBtn = document.querySelector('.playlist-toggle')
    if (playlistBtn) mo.observe(playlistBtn, { attributes: true })
    return () => { window.removeEventListener('resize', update); mo.disconnect() }
  }, [])

  const sections = [
    {
      title: 'Bio',
      image: '/about/aboutPortrait.jpg',
      content: [
        "I'm a Romanian-born, Vancouver-based beat maker and music producer with a lifelong passion for music, art, technology, and urban culture.",
        'Long before I started making beats, I was teaching myself how to play drums and spending countless hours on a skateboard. Those two things taught me a lot about rhythm, creativity, persistence, and finding my own style. Over the years, that same mindset naturally extended into music production, graphic design, and an ongoing fascination with technology and creative tools.',
        "I'm constantly inspired by the connection between sound and visual art, and I try to bring that perspective into everything I create. When I'm not making beats, I'm usually exploring new technology, digging for inspiration, working on design projects, or practicing as a beginner turntablist."
      ]
    },
    {
      title: 'Influences',
      image: '/about/deftones.jpg',
      content: [
        "My influences come from all over the musical spectrum, but they've always shared one thing in common: originality.",
        'I grew up listening to heavy music and still draw a lot of inspiration from bands like Deftones, Pantera, Nightwish, Queens of the Stone Age, and Alice in Chains. I love the energy, atmosphere, and emotion that those artists bring to their music.',
        'Electronic music has had an equally big impact on my sound, especially drum and bass and UK electronica. Artists like Noisia, The Prodigy, and The Chemical Brothers showed me how powerful sound design, rhythm, and experimentation can be.',
        'Hip hop is at the core of everything I do. The raw creativity of 90s underground artists like Company Flow, Group Home, and Show & A.G. continues to influence the way I approach beats. I\'ve also always been drawn to artists who blur genre boundaries, like Cypress Hill and their heavier, rock-influenced projects.',
        "All of those influences come together in my music, creating a sound that pulls from different worlds without being tied to any one of them but giving back to all of them."
      ]
    },
    {
      title: 'Method',
      image: '/about/mikro.jpg',
      content: [
        'My process is hands-on from start to finish.',
        'I play and record the main musical elements on my tracks myself, and I program and perform the drums using a Maschine Mikro and an Akai MPK Mini. Alongside original instrumentation, I layer samples sourced from vinyl records, digital libraries, and sounds collected from a wide variety of genres and eras.',
        'Most ideas start in Maschine, where I can quickly sketch out grooves, melodies, and arrangements. Once the track has what I call the "meat and potatoes" in place, I move everything into Ableton Live by bouncing the MIDI to audio.',
        "That's where I focus on shaping the final record—building structure, creating dynamics, refining sounds, mixing, and mastering. My goal is always to blend the feel of live musicianship with the flexibility of modern production, creating music that feels organic, textured, and hard-hitting."
      ]
    }
  ]

  return (
    <section 
      className={`latest-section fixed ${isMobile ? 'z-[1000]' : 'z-[1004]'} text-white opacity-0 translate-y-2 animate-section-fade ${isMobile ? 'left-0 right-0 w-full' : 'p-0'} flex flex-col overflow-hidden custom-scrollbar`}
      style={{
        left: isMobile ? '0' : 'var(--main-left)',
        top: isMobile ? 'var(--main-top)' : 'calc(var(--main-top) - 1rem)',
        bottom: isMobile ? '0' : '6rem',
        width: isMobile ? '100%' : 'auto',
        maxWidth: isMobile ? 'none' : contentMaxWidth,
        animationDelay: 'calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s)'
      }}
      aria-label="About"
    >
      <h2 className={`font-cal-sans font-bold text-[1.75rem] m-0 mb-3 ${isMobile ? 'px-4 text-center' : ''}`}>About</h2>

      <div className={`flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar ${isMobile ? 'px-4 pb-24' : 'px-1'}`}>
        <div className={isMobile ? 'flex flex-col gap-8' : 'flex flex-col gap-10'}>
          {sections.map((section, i) => (
            <div key={section.title} className={!isMobile ? 'flex gap-6 items-start' : ''}>
              {!isMobile && (
                <div className="flex-shrink-0 w-[200px]">
                  <SectionImage src={section.image} className="w-full h-[220px]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Section title={section.title} image={isMobile} isMobile={isMobile} imageSrc={section.image}>
                  {section.content.map((p, j) => <p key={j}>{p}</p>)}
                </Section>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
