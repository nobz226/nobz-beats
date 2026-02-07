import React from 'react'

export default function Latest() {
  const latest = {
    title: 'No Escape',
    type: 'Single',
    artwork: '/assets/logo/logoSVG.svg',
    description: 'Out now — stream on all platforms.'
  }

  return (
    <section className="latest-section" aria-label="Latest release">
      <h2 className="cal-sans-title">Latest</h2>
      <img className="latest-artwork" src={latest.artwork} alt={`${latest.title} artwork`} />
      <div className="latest-meta cutive-mono-regular">
        <div><strong>{latest.title}</strong> · {latest.type}</div>
        <p style={{ marginTop: '8px', marginBottom: 0 }}>{latest.description}</p>
      </div>
    </section>
  )
}
