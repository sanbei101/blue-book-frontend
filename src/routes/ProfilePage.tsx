import { Settings, Share2, Edit3, Grid3x3, Bookmark, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { useGetMeCollections } from "@/api/collections/collections";
import { useGetUsersUserIdPosts } from "@/api/posts/posts";
import { useGetMeProfile } from "@/api/users/users";
import { MasonryFeed } from "@/components/feed/MasonryFeed";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCount } from "@/lib/utils";

import { AuthPage } from "./UserProfilePage";

export function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("access_token")),
  );
  useEffect(() => {
    const handleSessionExpired = () => setIsAuthenticated(false);
    window.addEventListener("blue_book:session-expired", handleSessionExpired);
    return () => window.removeEventListener("blue_book:session-expired", handleSessionExpired);
  }, []);
  const profileQuery = useGetMeProfile({ query: { enabled: isAuthenticated } });
  const user = profileQuery.data;
  const postsQuery = useGetUsersUserIdPosts(
    user?.id ?? "",
    { page: 1, page_size: 20 },
    { query: { enabled: Boolean(user?.id) } },
  );
  const collectionsQuery = useGetMeCollections(
    { page: 1, page_size: 20 },
    { query: { enabled: isAuthenticated } },
  );
  const posts = postsQuery.data?.items ?? [];
  const collections = collectionsQuery.data?.items ?? [];
  const userLoading =
    profileQuery.isPending ||
    (Boolean(user?.id) && (postsQuery.isPending || collectionsQuery.isPending));

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

      {!isAuthenticated ? (
        <AuthPage onAuthenticated={() => setIsAuthenticated(true)} />
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
                  <AvatarFallback>{user.username.slice(0, 1)}</AvatarFallback>
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
                <Stat label="关注" value={user.following_count} />
                <Separator orientation="vertical" className="h-3" />
                <Stat label="粉丝" value={user.follower_count} />
                <Separator orientation="vertical" className="h-3" />
                <Stat label="获赞与收藏" value={user.received_like_and_collect_count} />
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
            <StatCard Icon={Grid3x3} label="笔记" value={String(user.post_count)} />
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
              {posts.length ? (
                <MasonryFeed posts={posts} />
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
