import React, { Suspense } from 'react'
import IntroText from './components/IntroText'
import IntroArt from './components/IntroArt'
import BloqFeed from './components/BloqFeed'
import { getBloqPosts, getAllCategories, getAllTags } from '@/lib/bloq'

const page = () => {
  const posts = getBloqPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <div className="container flex flex-col pb-12">
      <div className="blue-border mt-10 h-auto items-center font-roboto-mono">
        <IntroArt />
        <IntroText />
      </div>
      
      <div className="mt-2">
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
          <BloqFeed 
            initialPosts={posts} 
            allCategories={categories} 
            allTags={tags} 
          />
        </Suspense>
      </div>
    </div>
  )
}

export default page