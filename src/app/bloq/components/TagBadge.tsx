import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tag: string;
  className?: string;
  asLink?: boolean;
}

/**
 * TagBadge - Display a single tag with optional link to tag page
 */
export default function TagBadge({ tag, className, asLink = true }: TagBadgeProps) {
  const badgeClasses = cn(
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-light",
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "hover:bg-blue-200 dark:hover:bg-blue-800",
    "transition-colors duration-200",
    className
  );

  if (asLink) {
    return (
      <Link 
        href={`/bloq/tag/${encodeURIComponent(tag)}`}
        className={badgeClasses}
      >
        #{tag}
      </Link>
    );
  }

  return (
    <span className={badgeClasses}>
      #{tag}
    </span>
  );
}
