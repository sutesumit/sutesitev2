import Link from 'next/link'
import { motion as m, AnimatePresence } from 'framer-motion'
import { Undo2 } from 'lucide-react'
import { BloqPost } from '@/lib/bloq'
import { cn } from '@/lib/utils'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'
import { BloqDate, BloqTitle, BloqSummary, BloqBackground } from './parts'

interface BloqCardDetailProps {
  post: BloqPost;
  className?: string;
}

export const BloqCardDetail = ({ post, className }: BloqCardDetailProps) => {
  const isCollapsed = useScrollCollapse();

  return (
    <m.div
      layout
      transition={{ duration: 0.5, ease: "easeOut" }}
      initial="rest"
      whileHover="hover"
      animate="rest"
      role="article"
      aria-label={post.title}
      className={cn(`relative ${isCollapsed ? '' : 'p-4'} overflow-hidden blue-border col-span-1 flex flex-col cursor-pointer`, className)}
    >
      <BloqBackground />
      
      <m.div 
        className={`flex h-full flex-col ${isCollapsed ? 'px-6 items-center justify-center' : 'px-2'}`}
      >
        {/* Back button & collapsed title */}
        <div className="flex flex-row w-full items-center justify-between overflow-hidden">
          <Link href={`/bloq/`} className="flex shrink-0">
            <div className="inline-flex items-center blue-border rounded px-2 lowercase opacity-75 text-xs hover:bg-blue-100 hover:text-black dark:hover:bg-blue-900 dark:hover:text-white transition-colors duration-500">
              { isCollapsed ? '' : 'All Bloqs'} <Undo2 className="opacity-75 p-1" />
            </div>
          </Link>
          {isCollapsed && 
          <div className="flex-grow inline-block truncate font-medium text-blue-900 dark:text-blue-400 ml-2 text-right">
            {post.title}
          </div>}
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <>
              <BloqDate post={post} />
              <BloqTitle post={post} isDetail={true} />
              <BloqSummary post={post} />
            </>
          )}
        </AnimatePresence>
      </m.div>
    </m.div>
  );
};
