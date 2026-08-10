import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  MoreHorizontal,
  MessageCircle,
  Share2,
  Plus,
  Heart,
  Bookmark,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ApiUserResponse, ApiListPostsItemResponse } from "@/api/api.schemas";
import {
  deleteUsersUserIdFollow,
  getUsersUserIdFollowers,
  getUsersUserIdFollowing,
  putUsersUserIdFollow,
} from "@/api/follows/follows";
import { getPostsUserUserId } from "@/api/posts/posts";
import { getUsersUserId } from "@/api/users/users";
import { MasonryFeed } from "@/components/feed/MasonryFeed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCount } from "@/lib/utils";
import { ApiError } from "@/mutator";

export function UserProfilePage({ userId }: { userId: string }) {
  const [following, setFollowing] = useState(false);
  const [user, setUser] = useState<ApiUserResponse | undefined>(undefined);
  const [posts, setPosts] = useState<ApiListPostsItemResponse[]>([]);
  const [followerCount, setFollowerCount] = useState<number | undefined>(undefined);
  const [followingCount, setFollowingCount] = useState<number | undefined>(undefined);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setUserLoading(true);
    Promise.all([
      getUsersUserId(userId),
      getPostsUserUserId(userId),
      getUsersUserIdFollowers(userId, { page: 1, page_size: 100 }),
      getUsersUserIdFollowing(userId, { page: 1, page_size: 100 }),
    ])
      .then(([userRes, postsRes, followersRes, followingRes]) => {
        if (cancelled) return;
        setUser(userRes.data);
        setPosts(postsRes.data ?? []);
        setFollowerCount(followersRes.data?.length ?? 0);
        setFollowingCount(followingRes.data?.length ?? 0);
      })
      .catch(() => {
        if (!cancelled) setUser(undefined);
      })
      .finally(() => {
        if (!cancelled) setUserLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleFollow = async () => {
    const next = !following;
    setFollowing(next);
    try {
      const response = next
        ? await putUsersUserIdFollow(userId)
        : await deleteUsersUserIdFollow(userId);
      setFollowing(response.data?.following ?? next);
      setFollowerCount(response.data?.follower_count ?? followerCount);
      toast.success(next ? "已关注" : "已取消关注");
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("操作失败");
      setFollowing(!next);
    }
  };

  if (userLoading) {
    return (
      <div className="space-y-3 p-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-muted-foreground text-sm">用户不存在或加载失败</p>
        <Button render={<Link to="/" />} variant="outline" className="rounded-full">
          返回首页
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background mx-auto max-w-5xl pb-16">
      <header className="border-border/60 bg-background/95 sticky top-0 z-30 flex h-12 items-center justify-between border-b px-3 backdrop-blur">
        <Link
          to="/"
          className="hover:bg-muted flex size-9 items-center justify-center rounded-full"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-sm font-semibold">{user.username}</h1>
        <button className="hover:bg-muted flex size-9 items-center justify-center rounded-full">
          <MoreHorizontal className="size-4" />
        </button>
      </header>

      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="ring-primary/20 size-20 ring-2">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>{(user.username ?? "?").slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-muted-foreground mt-0.5 text-xs">小红书号: {user.id}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span>
                <span className="font-semibold">{formatCount(posts.length)}</span>{" "}
                <span className="text-muted-foreground text-xs">笔记</span>
              </span>
              <span>
                <span className="font-semibold">{formatCount(followerCount)}</span>{" "}
                <span className="text-muted-foreground text-xs">粉丝</span>
              </span>
              <span>
                <span className="font-semibold">{formatCount(followingCount)}</span>{" "}
                <span className="text-muted-foreground text-xs">关注</span>
              </span>
            </div>
          </div>
        </div>

        <p className="text-foreground/90 mt-3 text-sm">{user.bio}</p>

        <div className="mt-3 flex gap-2">
          <Button
            onClick={handleFollow}
            className="flex-1 rounded-full"
            variant={following ? "outline" : "default"}
          >
            {following ? "已关注" : "关注"}
          </Button>
          <Button variant="outline" className="flex-1 rounded-full">
            <MessageCircle className="mr-1 size-3.5" />
            私信
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" aria-label="分享">
            <Share2 className="size-4" />
          </Button>
        </div>
      </div>

      <Card className="ring-foreground/5 mx-3 ring-1">
        <CardContent className="divide-border grid grid-cols-3 divide-x p-0">
          <KV label="获赞" value={formatCount(0)} />
          <KV label="收藏" value={formatCount(0)} />
          <KV label="笔记" value={String((posts ?? []).length)} />
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="px-3 pt-3">
        <TabsList variant="line" className="w-full justify-around gap-0">
          <TabsTrigger value="posts" className="flex-1">
            笔记
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
            <EmptyState text="该用户还没有发布过笔记" />
          )}
        </TabsContent>
        <TabsContent value="collections" className="mt-0">
          <EmptyState text="暂无收藏" />
        </TabsContent>
        <TabsContent value="liked" className="mt-0">
          <EmptyState text="这个人还没有赞过任何内容" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-3 text-center">
      <span className="text-base font-semibold">{value}</span>
      <span className="text-muted-foreground text-[11px]">{label}</span>
    </div>
  );
}

function EmptyState({ text = "暂无内容" }: { text?: string }) {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-16">
      <Plus className="size-8" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
