import Link from 'next/link'
import { motion as m } from 'framer-motion'
import { BloqPost } from '@/lib/bloq'
import { cn } from '@/lib/utils'
import { BloqDate, BloqTitle, BloqSummary, BloqBackground, BloqReadingTime } from './parts'
import ViewCounter from '../ViewCounter'
import ClapsCounter from '@/components/shared/ClapsCounter'
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
              <div className="flex flex-col sm:flex-row items-center sm:gap-4">
                <BloqDate post={post} />
                <BloqReadingTime readingTime={post.readingTime} />
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:gap-3">
                <ViewCounter slug={post.url} className="text-xs flex items-center text-gray-500" />
                <ClapsCounter postId={post.url} postType="bloq" interactive={false} className="text-xs flex items-center text-gray-500" />
              </div>
            </div>
            <BloqTitle post={post} />
            <BloqSummary post={post} />
          </div>
        </m.div>
      </m.div>
    </Link>
  );
};
