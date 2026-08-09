import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ApiListPostsItemResponse } from "@/api/api.schemas";
import { getPosts } from "@/api/posts/posts";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { MasonryFeed, MasonryFeedSkeleton } from "@/components/feed/MasonryFeed";
import { TopBar } from "@/components/layout/TopBar";
import { ApiError } from "@/mutator";

export function HomePage() {
  const [category, setCategory] = useState("推荐");
  const [posts, setPosts] = useState<ApiListPostsItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPosts({ page: 1, page_size: 20 })
      .then((res) => {
        if (!cancelled) setPosts(res.data ?? []);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError) toast.error(err.msg);
        else toast.error("加载帖子失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <>
      <TopBar title="小红书" />
      <CategoryTabs active={category} onChange={setCategory} />
      {loading ? <MasonryFeedSkeleton /> : <MasonryFeed posts={posts} />}
    </>
  );
}
