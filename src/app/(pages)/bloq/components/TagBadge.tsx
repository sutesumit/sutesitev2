import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tag: string;
  className?: string;
  asLink?: boolean;
  isFeatured?: boolean;
}

/**
 * TagBadge - Display a single tag with optional link to tag page
 */
export default function TagBadge({ tag, className, asLink = true, isFeatured = false }: TagBadgeProps) {
  const badgeClasses = cn(
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-light",
    isFeatured 
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800",
    "transition-colors duration-200",
    className
  );

  if (asLink) {
    return (
      <div 
        className={badgeClasses}
      >
        #{tag}
      </div>
    );
  }

  return (
    <span className={badgeClasses}>
      #{tag}
    </span>
  );
}
