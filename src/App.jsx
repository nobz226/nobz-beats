import React from 'react'
import Logo from './components/Logo'
import Nav from './components/Nav'
import Title from './components/Title'

export default function App() {
  return (
    <>
      <Logo />
      <Nav />
      <Title />
      {/* The rest of the site is intentionally left empty to exactly match current project—add other content here if needed */}
    </>
  )
}
