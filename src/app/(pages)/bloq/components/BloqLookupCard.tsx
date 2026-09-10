import { resolveBloqPost, type BloqPost } from "@/lib/bloq";
import { cn } from "@/lib/utils";
import BloqCard from "./BloqCard";

interface BloqLookupCardProps {
  /**
   * Post url to embed, e.g. "react-nexus-2026-report".
   * Live session slugs also resolve, with or without the "live/" prefix,
   * e.g. "notes-from-react-nexus-2026".
   * Comma-separated for multiple cards.
   */
  slug: string;
  variant?: "list" | "related-post";
  className?: string;
}

/**
 * Renders BloqCards for posts looked up at render time, from both the MDX
 * content store and live bloq sessions. Async server component; the live
 * lookup hits Supabase, so unresolved slugs render nothing instead of
 * throwing (see resolveBloqPost).
 * Takes only string props so it survives next-mdx-remote's default
 * removeJavaScriptExpressions sanitization inside MDX.
 */
export const BloqLookupCard = async ({
  slug,
  variant = "list",
  className,
}: BloqLookupCardProps) => {
  const posts = (
    await Promise.all(
      slug
        .split(",")
        .map((s) => s.trim())
        .map(resolveBloqPost),
    )
  ).filter((post): post is BloqPost => Boolean(post));

  if (posts.length === 0) return null;

  return (
    <div className={cn("my-4 grid grid-cols-1 gap-2", className)}>
      {posts.map((post) => (
        <BloqCard key={post.url} post={post} variant={variant} />
      ))}
    </div>
  );
};
