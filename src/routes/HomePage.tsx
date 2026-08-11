import { useState } from "react";

import { useGetFeedRecommended, useGetSearch } from "@/api/discovery/discovery";
import { CategoryTabs } from "@/components/feed/CategoryTabs";
import { MasonryFeed, MasonryFeedSkeleton } from "@/components/feed/MasonryFeed";
import { TopBar } from "@/components/layout/TopBar";

export function HomePage() {
  const [category, setCategory] = useState("推荐");
  const recommendedQuery = useGetFeedRecommended(
    { page: 1, page_size: 20 },
    { query: { enabled: category === "推荐" } },
  );
  const searchQuery = useGetSearch(
    { q: category, type: "posts", page: 1, page_size: 20 },
    { query: { enabled: category !== "推荐" } },
  );
  const posts =
    category === "推荐"
      ? (recommendedQuery.data?.items ?? [])
      : (searchQuery.data?.posts?.items ?? []);
  const loading = category === "推荐" ? recommendedQuery.isPending : searchQuery.isPending;

  return (
    <>
      <TopBar title="小红书" />
      <CategoryTabs active={category} onChange={setCategory} />
      {loading ? <MasonryFeedSkeleton /> : <MasonryFeed posts={posts} />}
    </>
  );
}
