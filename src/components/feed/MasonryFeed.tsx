import type { ApiListPostsItemResponse } from "@/api/api.schemas";
import { Skeleton } from "@/components/ui/skeleton";

import { PostCard } from "./PostCard";

export function MasonryFeed({ posts }: { posts: ApiListPostsItemResponse[] }) {
  return (
    <div className="columns-2 gap-3 px-2 py-2 md:columns-3 xl:columns-4">
      {posts.map((post) => (
        <div key={post.id} className="mb-3 break-inside-avoid">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}

export function MasonryFeedSkeleton() {
  return (
    <div className="columns-2 gap-3 px-2 py-2 md:columns-3 xl:columns-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="border-border/40 mb-3 break-inside-avoid overflow-hidden rounded-xl border p-2"
        >
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <Skeleton className="mt-2.5 h-3.5 w-3/4" />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}
