import { Link } from "@tanstack/react-router";
import { Bookmark, Grid3x3, Heart, Settings } from "lucide-react";
import { useEffect, useState } from "react";

import { useGetMeCollections } from "@/api/collections/collections";
import { useGetMeLikes } from "@/api/likes/likes";
import { useGetUsersUserIdPosts } from "@/api/posts/posts";
import { useGetMeProfile } from "@/api/users/users";
import { MasonryFeed } from "@/components/feed/MasonryFeed";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCount } from "@/lib/utils";

import { AuthPage } from "./UserProfilePage";

const pageParams = { page: 1, page_size: 20 };

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
    { limit: 20 },
    { query: { enabled: Boolean(user?.id) } },
  );
  const collectionsQuery = useGetMeCollections(pageParams, {
    query: { enabled: isAuthenticated },
  });
  const likesQuery = useGetMeLikes(pageParams, { query: { enabled: isAuthenticated } });

  const posts = postsQuery.data?.items ?? [];
  const collections = collectionsQuery.data?.items ?? [];
  const likes = likesQuery.data?.items ?? [];
  const userLoading =
    profileQuery.isPending ||
    (Boolean(user?.id) && postsQuery.isPending) ||
    collectionsQuery.isPending ||
    likesQuery.isPending;

  return (
    <>
      <TopBar
        title="我"
        showSearch={false}
        rightSlot={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="设置"
            nativeButton={false}
            render={<Link to="/settings/api-keys" />}
          >
            <Settings />
          </Button>
        }
      />

      {!isAuthenticated ? (
        <AuthPage onAuthenticated={() => setIsAuthenticated(true)} />
      ) : userLoading ? (
        <ProfileSkeleton />
      ) : user ? (
        <main>
          <section className="border-b px-4 py-6">
            <div className="flex items-start gap-4">
              <Avatar size="lg" className="size-20 shrink-0">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.username.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 pt-1">
                <h2 className="truncate text-lg font-semibold">{user.username}</h2>
                <Badge variant="outline" className="mt-1 font-normal">
                  ID: {user.id}
                </Badge>
                <p className="text-muted-foreground mt-3 text-sm">
                  {user.bio || "还没有填写个人简介"}
                </p>
              </div>
            </div>
          </section>

          <Card className="mx-3 mt-4">
            <CardContent className="grid grid-cols-3 divide-x p-0">
              <ProfileStat label="关注" value={user.following_count} />
              <ProfileStat label="粉丝" value={user.follower_count} />
              <ProfileStat label="获赞与收藏" value={user.received_like_and_collect_count} />
            </CardContent>
          </Card>

          <Tabs defaultValue="posts" className="mt-5">
            <TabsList variant="line" className="w-full justify-around rounded-none px-3">
              <TabsTrigger value="posts" className="flex-1 gap-1.5">
                <Grid3x3 />
                笔记 {user.post_count}
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex-1 gap-1.5">
                <Bookmark />
                收藏 {collectionsQuery.data?.total ?? collections.length}
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex-1 gap-1.5">
                <Heart />
                赞过 {likesQuery.data?.total ?? likes.length}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-0">
              {posts.length ? (
                <MasonryFeed posts={posts} />
              ) : (
                <ProfileEmpty text="还没有发布过笔记" />
              )}
            </TabsContent>
            <TabsContent value="collections" className="mt-0">
              {collections.length ? (
                <MasonryFeed posts={collections} />
              ) : (
                <ProfileEmpty text="暂无收藏" />
              )}
            </TabsContent>
            <TabsContent value="liked" className="mt-0">
              {likes.length ? (
                <MasonryFeed posts={likes} />
              ) : (
                <ProfileEmpty text="暂无赞过的笔记" />
              )}
            </TabsContent>
          </Tabs>
        </main>
      ) : (
        <p className="text-muted-foreground p-6 text-center text-sm">加载失败</p>
      )}
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-3">
      <span className="font-semibold">{formatCount(value)}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

function ProfileEmpty({ text }: { text: string }) {
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Grid3x3 />
        </EmptyMedia>
        <EmptyTitle>{text}</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
