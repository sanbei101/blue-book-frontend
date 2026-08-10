import { Settings, Share2, Edit3, Grid3x3, Bookmark, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type {
  ApiCollectionItemResponse,
  ApiListPostsItemResponse,
  ApiUserResponse,
} from "@/api/api.schemas";
import { getAuthMe } from "@/api/auth/auth";
import { getMeCollections } from "@/api/collections/collections";
import { getUsersUserIdFollowers, getUsersUserIdFollowing } from "@/api/follows/follows";
import { getPostsUserUserId } from "@/api/posts/posts";
import { MasonryFeed } from "@/components/feed/MasonryFeed";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCount } from "@/lib/utils";
import { ApiError } from "@/mutator";

import { AuthPage } from "./UserProfilePage";

const ME_KEY = "blue_book:me";

export function ProfilePage() {
  const [meId, setMeId] = useState<string | null>(() => localStorage.getItem(ME_KEY));
  const [user, setUser] = useState<ApiUserResponse | undefined>(undefined);
  const [posts, setPosts] = useState<ApiListPostsItemResponse[]>([]);
  const [collections, setCollections] = useState<ApiCollectionItemResponse[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    if (!meId) {
      setUser(undefined);
      setPosts([]);
      setCollections([]);
      return;
    }
    let cancelled = false;
    setUserLoading(true);
    Promise.all([
      getAuthMe(),
      getPostsUserUserId(meId),
      getMeCollections({ page: 1, page_size: 20 }),
      getUsersUserIdFollowers(meId, { page: 1, page_size: 100 }),
      getUsersUserIdFollowing(meId, { page: 1, page_size: 100 }),
    ])
      .then(([userRes, postsRes, collectionsRes, followersRes, followingRes]) => {
        if (cancelled) return;
        setUser(userRes.data);
        setPosts(postsRes.data ?? []);
        setCollections(collectionsRes.data ?? []);
        setFollowerCount(followersRes.data?.length ?? 0);
        setFollowingCount(followingRes.data?.length ?? 0);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError) toast.error(err.msg);
        else toast.error("加载资料失败");
      })
      .finally(() => {
        if (!cancelled) setUserLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [meId]);

  return (
    <>
      <TopBar
        title="我"
        showSearch={false}
        rightSlot={
          <div className="flex items-center">
            <Button variant="ghost" size="icon-sm" aria-label="分享">
              <Share2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="设置">
              <Settings className="size-4" />
            </Button>
          </div>
        }
      />

      {!meId ? (
        <AuthPage onAuthenticated={setMeId} />
      ) : userLoading ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : user ? (
        <>
          <div className="relative">
            <div className="from-primary/30 h-24 bg-gradient-to-br via-rose-200 to-amber-100" />
            <div className="-mt-12 px-4">
              <div className="flex items-end justify-between">
                <Avatar size="lg" className="ring-background size-20 ring-4">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{(user.username ?? "?").slice(0, 1)}</AvatarFallback>
                </Avatar>
                <Button size="sm" variant="outline" className="rounded-full">
                  <Edit3 className="mr-1 size-3" />
                  编辑资料
                </Button>
              </div>

              <div className="mt-2">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg font-bold">{user.username}</h2>
                  <span className="text-muted-foreground text-xs">ID: {user.id}</span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {user.bio || "这个人很懒,什么都没写~"}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-5 text-sm">
                <Stat label="关注" value={followingCount} />
                <Separator orientation="vertical" className="h-3" />
                <Stat label="粉丝" value={followerCount} />
                <Separator orientation="vertical" className="h-3" />
                <Stat
                  label="获赞与收藏"
                  value={posts.reduce(
                    (total, post) => total + (post.like_count ?? 0) + (post.collect_count ?? 0),
                    0,
                  )}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 px-3">
            <Card className="rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 ring-0">
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-semibold">🎉 你有 3 个成就待解锁</p>
                  <p className="text-muted-foreground text-xs">完成新手任务,得限定勋章</p>
                </div>
                <span className="text-muted-foreground">›</span>
              </CardContent>
            </Card>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1 px-3">
            <StatCard Icon={Grid3x3} label="笔记" value={String((posts ?? []).length)} />
            <StatCard Icon={Bookmark} label="收藏" value={String(collections.length)} />
            <StatCard Icon={Heart} label="赞过" value="—" />
          </div>

          <Tabs defaultValue="posts" className="px-3 pt-3">
            <TabsList variant="line" className="w-full justify-around gap-0">
              <TabsTrigger value="posts" className="flex-1">
                <Grid3x3 className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex-1">
                <Bookmark className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex-1">
                <Heart className="size-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-0">
              {(posts ?? []).length ? (
                <MasonryFeed posts={posts ?? []} />
              ) : (
                <p className="text-muted-foreground py-16 text-center text-sm">还没有发布过笔记</p>
              )}
            </TabsContent>
            <TabsContent value="collections" className="mt-0">
              {collections.length ? (
                <MasonryFeed posts={collections} />
              ) : (
                <p className="text-muted-foreground py-16 text-center text-sm">暂无收藏</p>
              )}
            </TabsContent>
            <TabsContent value="liked" className="mt-0">
              <p className="text-muted-foreground py-16 text-center text-sm">暂无赞过</p>
            </TabsContent>
          </Tabs>

          <div className="mt-4 px-3 pb-3">
            <p className="text-muted-foreground text-xs">更多服务</p>
            <div className="mt-2 grid grid-cols-5 gap-2 text-center">
              {[
                { Icon: Heart, label: "我的赞" },
                { Icon: MessageCircle, label: "我的评论" },
                { Icon: Bookmark, label: "收藏夹" },
                { Icon: Edit3, label: "草稿箱" },
                { Icon: Share2, label: "推广" },
              ].map((s) => (
                <button
                  key={s.label}
                  className="hover:bg-muted flex flex-col items-center gap-1 rounded-lg p-2 transition-colors"
                >
                  <s.Icon className="text-muted-foreground size-5" />
                  <span className="text-muted-foreground text-[11px]">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground p-6 text-center text-sm">加载失败</p>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1">
      <span className="font-semibold">{formatCount(value)}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </span>
  );
}

function StatCard({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="ring-foreground/5 ring-1">
      <CardContent className="flex flex-col items-center gap-1 p-2.5">
        <Icon className="text-primary size-4" />
        <span className="text-base font-semibold">{value}</span>
        <span className="text-muted-foreground text-[11px]">{label}</span>
      </CardContent>
    </Card>
  );
}
