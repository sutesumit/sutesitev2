import Link from 'next/link'
import { motion as m } from 'framer-motion'
import { BloqPost } from '@/lib/bloq'
import { cn } from '@/lib/utils'
import { BloqDate, BloqTitle, BloqSummary, BloqBackground } from './parts'

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
        
        <m.div layout className="flex h-full flex-col px-2">
          <BloqDate post={post} />
          <BloqTitle post={post} />
          <BloqSummary post={post} />
        </m.div>
      </m.div>
    </Link>
  );
};
