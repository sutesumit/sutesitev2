import React, { Suspense } from 'react'
import IntroCard from './components/IntroCard'
import IntroText from './components/IntroText'
import DryKeysQuest from './components/DryKeysQuest'
import BloqFeed from './components/BloqFeed'
import { getBloqPosts, getAllCategories, getAllTags } from '@/lib/bloq'

const page = () => {
  const posts = getBloqPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <div className="container flex flex-col pb-12">
      <IntroCard>
        <DryKeysQuest />
        <IntroText />
      </IntroCard>
      
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