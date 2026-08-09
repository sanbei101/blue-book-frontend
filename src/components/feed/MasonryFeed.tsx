import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";

type FeedItem = {
  id?: string;
  title?: string;
  cover_url?: string;
  view_count?: number;
  author?: { id?: string; username?: string; avatar_url?: string };
};

const HEIGHTS = [280, 220, 320, 240, 300, 260, 340, 200, 280, 360];

export function MasonryFeed({ posts }: { posts: FeedItem[] }) {
  // Distribute posts into two columns alternately, like Xiaohongshu
  const left: { post: FeedItem; height: number }[] = [];
  const right: { post: FeedItem; height: number }[] = [];

  posts.forEach((post, i) => {
    const height = HEIGHTS[i % HEIGHTS.length];
    if (i % 2 === 0) left.push({ post, height });
    else right.push({ post, height });
  });

  return (
    <div className="grid grid-cols-2 gap-2.5 px-2.5 py-2.5">
      <div className="flex flex-col gap-2.5">
        {left.map(({ post, height }) => (
          <PostCard key={post.id} post={post} height={height} />
        ))}
      </div>
      <div className="flex flex-col gap-2.5">
        {right.map(({ post, height }) => (
          <PostCard key={post.id} post={post} height={height} />
        ))}
      </div>
    </div>
  );
}

export function MasonryFeedSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 px-2.5 py-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full rounded-xl" style={{ height: HEIGHTS[i] }} />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
