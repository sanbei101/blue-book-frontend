import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ApiListPostsItemResponse } from "@/api/api.schemas";
import { getSearch, getFeedRecommended } from "@/api/discovery/discovery";
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
    const request =
      category === "推荐"
        ? getFeedRecommended({ page: 1, page_size: 20 })
        : getSearch({ q: category, type: "posts", page: 1, page_size: 20 });
    request
      .then((res) => {
        if (cancelled) return;
        if (Array.isArray(res.data)) setPosts(res.data);
        else setPosts(res.data?.posts ?? []);
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
