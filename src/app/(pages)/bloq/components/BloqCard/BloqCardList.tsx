import Link from 'next/link'
import { motion as m } from 'framer-motion'
import { BloqPost } from '@/lib/bloq'
import { cn } from '@/lib/utils'
import { BloqDate, BloqTitle, BloqSummary, BloqBackground, BloqReadingTime } from './parts'
import ViewCounter from '@/components/shared/ViewCounter'
import ClapsCounter from '@/components/shared/ClapsCounter'
// import TagList from '../TagList'

interface BloqCardListProps {
  post: BloqPost;
  variant?: 'list' | 'related-post';
  className?: string;
}

export const BloqCardList = ({ post, variant = 'list', className }: BloqCardListProps) => {
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
        
        <m.div layout className="flex h-full flex-col">
          <div className="flex-1">
            <div className='flex flex-wrap flex-row items-center justify-between gap-y-2 mb-2'>
              <div className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4",
                variant === 'related-post' && "hidden"
              )}>
                <BloqDate post={post} />
                <BloqReadingTime readingTime={post.readingTime} />
              </div>
              <div className={cn(
                "flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 ml-auto",
                variant === 'related-post' && "w-full flex-row justify-between ml-0"
              )}>
                <ViewCounter type="bloq" identifier={post.url} className="text-xs flex items-center text-gray-500" />
                <ClapsCounter postId={post.url} postType="bloq" interactive={false} className="text-xs !p-0 flex items-center text-gray-500" />
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
