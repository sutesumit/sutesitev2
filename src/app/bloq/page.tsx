import React from 'react'
import IntroText from './components/IntroText'
import IntroArt from './components/IntroArt'

const page = () => {
  return (
    <article className="container blue-border mt-10 h-auto items-center font-roboto-mono lowercase">
      <IntroArt />
      <IntroText />
    </article>
  )
}

export default page
