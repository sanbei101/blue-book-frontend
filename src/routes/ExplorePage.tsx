import { Search, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type {
  ApiListPostsItemResponse,
  ApiSearchResponse,
  ApiTopicResponse,
  ApiTrendingSearchResponse,
} from "@/api/api.schemas";
import {
  getFeedRecommended,
  getSearch,
  getSearchTrending,
  getTopics,
} from "@/api/discovery/discovery";
import { MasonryFeed } from "@/components/feed/MasonryFeed";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/mutator";

export function ExplorePage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<ApiListPostsItemResponse[]>([]);
  const [topics, setTopics] = useState<ApiTopicResponse[]>([]);
  const [trending, setTrending] = useState<ApiTrendingSearchResponse[]>([]);
  const [searchResults, setSearchResults] = useState<ApiSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getSearchTrending({ limit: 8 }),
      getTopics({ page: 1, page_size: 8 }),
      getFeedRecommended({ page: 1, page_size: 6 }),
    ])
      .then(([trendingRes, topicsRes, feedRes]) => {
        if (cancelled) return;
        setTrending(trendingRes.data ?? []);
        setTopics(topicsRes.data ?? []);
        setData(feedRes.data ?? []);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError) toast.error(err.msg);
        else toast.error("加载推荐失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const value = query.trim();
    if (!value) {
      setSearchResults(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      getSearch({ q: value, type: "all", page: 1, page_size: 20 })
        .then((res) => {
          if (!cancelled) setSearchResults(res.data ?? null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          if (err instanceof ApiError) toast.error(err.msg);
          else toast.error("搜索失败");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <>
      <TopBar title="探索" showSearch={false} />
      <div className="px-3 pt-2">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索感兴趣的内容或用户"
            className="bg-muted h-9 rounded-full pl-9 text-sm"
            autoFocus
          />
        </div>
      </div>

      <div className="mt-3 px-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <TrendingUp className="text-primary size-4" />
          <span>热门话题</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {trending.map((item, i) => (
            <Badge
              key={item.keyword}
              variant={i < 3 ? "default" : "secondary"}
              className="cursor-pointer rounded-full px-3 py-1"
              onClick={() => setQuery(item.keyword ?? "")}
            >
              <span className="mr-1">#{i + 1}</span>
              {item.keyword}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="my-3" />

      <div className="px-3">
        <h2 className="text-sm font-semibold">分类</h2>
        <div className="mt-2 grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="bg-muted relative cursor-pointer overflow-hidden border-0 ring-0"
              onClick={() => setQuery(topic.name ?? "")}
            >
              <CardContent className="relative flex h-20 items-end p-3">
                <div>
                  <div className="text-lg font-bold">{topic.name}</div>
                  <div className="text-muted-foreground text-[11px]">
                    {topic.post_count ?? 0} 笔记
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-3 pt-4">
        <h2 className="text-sm font-semibold">{searchResults ? "搜索结果" : "为你推荐"}</h2>
        {searchResults ? (
          searchResults.posts?.length ? (
            <MasonryFeed posts={searchResults.posts} />
          ) : (
            <p className="text-muted-foreground py-12 text-center text-sm">没有找到相关内容</p>
          )
        ) : (
          <div className="mt-2 space-y-2.5">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="ring-foreground/5 flex gap-3 p-2.5 ring-1">
                    <Skeleton className="size-20 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </Card>
                ))
              : data.slice(0, 3).map((p) => (
                  <Card key={p.id} className="ring-foreground/5 flex gap-3 p-2.5 ring-1">
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt={p.title}
                        className="size-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="bg-muted size-20 shrink-0 rounded-lg" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium">{p.title}</p>
                      <p className="text-muted-foreground mt-1 text-xs">{p.author?.username}</p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        👁 {p.view_count ?? 0} 浏览
                      </p>
                    </div>
                  </Card>
                ))}
          </div>
        )}
      </div>
    </>
  );
}
