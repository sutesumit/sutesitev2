import Link from 'next/link'
import { motion as m } from 'framer-motion'
import { BloqPost } from '@/lib/bloq'
import { cn } from '@/lib/utils'
import { BloqDate, BloqTitle, BloqSummary, BloqBackground } from './parts'
import ViewCounter from '../ViewCounter'
// import TagList from '../TagList'

interface BloqCardListProps {
  post: BloqPost;
  className?: string;
}

export const BloqCardList = ({ post, className }: BloqCardListProps) => {
  const animationProps = {
    initial: "rest",
    whileHover: "hover",
    animate: "rest"
  };

  return (
    <Link href={`/bloq/${post.url}`} className="contents">
      <m.div
        layout
        role="article"
        aria-label={post.title}
        className={cn(`relative p-4 overflow-hidden blue-border project-list col-span-1 flex flex-col cursor-pointer`, className)}
        {...animationProps}
      >
        <BloqBackground />
        
        <m.div layout className="flex h-full flex-col px-2 justify-between">
          <div className="flex-1">
            <div className='flex justify-between'>
              <BloqDate post={post} />
              <ViewCounter slug={post.url} className="text-xs opacity-60 flex items-center text-gray-500" />
            </div>
            <BloqTitle post={post} />
            <BloqSummary post={post} />
          </div>
          
          {/* Tags section */}
          {/* {post.tags && post.tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <TagList tags={post.tags} maxTags={5} asLinks={false} />
            </div>
          )} */}
        </m.div>
      </m.div>
    </Link>
  );
};
