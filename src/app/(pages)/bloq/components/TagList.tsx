import TagBadge from './TagBadge';

interface TagListProps {
  tags: string[];
  className?: string;
  maxTags?: number;
  asLinks?: boolean;
}

/**
 * TagList - Display a list of tags with optional truncation
 */
export default function TagList({ tags, className, maxTags, asLinks = true }: TagListProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className || ''}`}>
      {displayTags.map((tag) => (
        <TagBadge key={tag} tag={tag} asLink={asLinks} />
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extralight text-gray-600 dark:text-gray-400">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
