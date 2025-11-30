import { BloqPost } from '@/lib/bloq';
import BloqCard from './BloqCard';

interface RelatedPostsProps {
  posts: BloqPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="border-t pt-2">
      {/* <h2 className="text-2xl font-bold mb-6">Related Posts</h2> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <BloqCard key={post.slug} post={post} variant="list" />
        ))}
      </div>
    </section>
  );
}
