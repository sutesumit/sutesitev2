import React from 'react'
import IntroText from './components/IntroText'
import IntroArt from './components/IntroArt'
import BloqCard from './components/BloqCard'
import { getBloqPosts } from '@/lib/bloq'

const page = () => {
  const posts = getBloqPosts();

  return (
    <div className="container flex flex-col pb-10">
      <div className="blue-border mt-10 h-auto items-center font-roboto-mono lowercase">
        <IntroArt />
        <IntroText />
      </div>
      <div
        className='all-tiles grid sm:grid-cols-2 grid-cols-1 mt-4 gap-3'
      >
        {posts.map((post) => (
          <BloqCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}

export default page