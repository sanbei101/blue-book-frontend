import { Search, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ApiListPostsItemResponse } from "@/api/api.schemas";
import { getPosts } from "@/api/posts/posts";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/mutator";

const categories = [
  { name: "美食", color: "from-orange-200 to-rose-200", count: "12.3w 笔记" },
  { name: "穿搭", color: "from-pink-200 to-fuchsia-200", count: "9.8w 笔记" },
  { name: "旅行", color: "from-sky-200 to-indigo-200", count: "8.4w 笔记" },
  { name: "美妆", color: "from-rose-200 to-pink-200", count: "15.2w 笔记" },
  { name: "居家", color: "from-emerald-200 to-teal-200", count: "6.7w 笔记" },
  { name: "健身", color: "from-amber-200 to-orange-200", count: "5.1w 笔记" },
  { name: "母婴", color: "from-violet-200 to-purple-200", count: "4.3w 笔记" },
  { name: "数码", color: "from-slate-200 to-zinc-200", count: "3.9w 笔记" },
];

export function ExplorePage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<ApiListPostsItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPosts({ page: 1, page_size: 6 })
      .then((res) => {
        if (!cancelled) setData(res.data ?? []);
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
          {["穿搭", "美食", "旅行", "居家", "健身", "读书", "咖啡", "户外"].map((t, i) => (
            <Badge
              key={t}
              variant={i < 3 ? "default" : "secondary"}
              className="cursor-pointer rounded-full px-3 py-1"
            >
              <span className="mr-1">#{i + 1}</span>
              {t}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="my-3" />

      <div className="px-3">
        <h2 className="text-sm font-semibold">分类</h2>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {categories.map((c) => (
            <Card
              key={c.name}
              className={c.color + " relative overflow-hidden border-0 bg-gradient-to-br ring-0"}
            >
              <CardContent className="relative flex h-20 items-end p-3">
                <div>
                  <div className="text-lg font-bold text-white drop-shadow">{c.name}</div>
                  <div className="text-[11px] text-white/90 drop-shadow">{c.count}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-3 pt-4">
        <h2 className="text-sm font-semibold">为你推荐</h2>
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
      </div>
    </>
  );
}
