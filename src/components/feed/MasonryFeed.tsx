import { Skeleton } from "@/components/ui/skeleton";

import { PostCard } from "./PostCard";

type FeedItem = {
  id?: string;
  title?: string;
  cover_url?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  author?: { id?: string; username?: string; avatar_url?: string };
};

export function MasonryFeed({ posts }: { posts: FeedItem[] }) {
  return (
    <div className="columns-2 gap-2.5 px-2.5 py-2.5 md:columns-3 xl:columns-4">
      {posts.map((post) => (
        <div key={post.id} className="mb-2.5 break-inside-avoid">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}

export function MasonryFeedSkeleton() {
  return (
    <div className="columns-2 gap-2.5 px-2.5 py-2.5 md:columns-3 xl:columns-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="mb-2.5 break-inside-avoid">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <Skeleton className="mt-2 h-3 w-3/4" />
          <Skeleton className="mt-1 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
