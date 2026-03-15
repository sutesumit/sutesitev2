import { motion as m } from 'framer-motion'
import { Clock, Calendar } from 'lucide-react'
import { BloqPost } from '@/lib/bloq'

interface BloqPartProps {
  post: BloqPost;
  className?: string;
}

interface BloqReadingTimeProps {
  readingTime?: number;
  className?: string;
}

export const BloqReadingTime = ({ readingTime, className }: BloqReadingTimeProps) => {
  if (!readingTime) return null;

  return (
    <m.div 
      layout 
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 0.5 }}
      className={`text-xs flex items-center gap-1 shrink-0 ${className || ''}`}
    >
      <Clock className="w-3 h-3" />
      <span>{readingTime} min read</span>
    </m.div>
  );
};

interface BloqDateProps extends BloqPartProps {
  shouldHide?: boolean;
}

export const BloqDate = ({ post, shouldHide = false }: BloqDateProps) => {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <m.div 
      layout 
      initial={{ opacity: 1, height: "auto" }}
      animate={{ 
        opacity: shouldHide ? 0 : 0.5, 
        height: shouldHide ? 0 : "auto",
      }}
      className="text-xs flex items-center gap-1 overflow-hidden shrink-0"
    >
      <Calendar className="w-3 h-3" />
      <span>{formattedDate}</span>
    </m.div>
  );
};

interface BloqTitleProps extends BloqPartProps {
  shouldHide?: boolean;
  isDetail?: boolean;
}

export const BloqTitle = ({ post, shouldHide = false, isDetail = false }: BloqTitleProps) => {
  return (
    <m.div 
      layout 
      initial={{ opacity: 1, height: "auto", marginBottom: 4 }}
      animate={{ 
        opacity: shouldHide ? 0 : 1, 
        height: shouldHide ? 0 : "auto",
        marginBottom: shouldHide ? 0 : 4
      }}
      className={`font-medium truncate text-blue-900 dark:text-blue-400 pb-1 ${isDetail ? '' : 'project-item'}`}
    >
      {post.title}
    </m.div>
  );
};

interface BloqSummaryProps extends BloqPartProps {
  shouldHide?: boolean;
  isDetail?: boolean;
}

export const BloqSummary = ({ post, shouldHide = false, isDetail = false }: BloqSummaryProps) => {
  return (
    <m.div 
      layout
      initial={{ opacity: 1, height: "auto" }}
      animate={{ 
        opacity: shouldHide ? 0 : 0.75, 
        width: shouldHide ? 0 : "auto",
        height: shouldHide ? 0 : "auto" 
      }}
      className={`text-xs ${isDetail ? 'line-clamp-none' : 'line-clamp-2'} overflow-hidden`}
    >
      {post.summary}
    </m.div>
  );
};

export const BloqBackground = () => {
  return (
    <m.div
      variants={{
        rest: { scale: 1, opacity: 0, rotate: 0, y: -100 },
        hover: { scale: 6, opacity: 0.4, rotate: 45 },
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`backdrop flex rounded-lg bg-blue-400 dark:bg-blue-900 inset-0 -z-10 absolute opacity-25`}
    ></m.div>
  );
};
