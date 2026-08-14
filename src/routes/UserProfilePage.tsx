import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  LoaderCircle,
  MoreHorizontal,
  MessageCircle,
  Share2,
  Plus,
  Heart,
  Bookmark,
} from "lucide-react";
import { type SubmitEvent, useState } from "react";
import { toast } from "sonner";

import { usePostAuthLogin, usePostAuthRegister } from "@/api/auth/auth";
import { useDeleteUsersUserIdFollow, usePutUsersUserIdFollow } from "@/api/follows/follows";
import { useGetUsersUserIdPosts } from "@/api/posts/posts";
import { getGetMeProfileQueryKey, useGetUsersUserId } from "@/api/users/users";
import { MasonryFeed } from "@/components/feed/MasonryFeed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCount } from "@/lib/utils";
import { ApiError } from "@/mutator";

const ME_KEY = "blue_book:me";

type AuthMode = "login" | "register";

export function AuthPage({ onAuthenticated }: { onAuthenticated?: (userId: string) => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const loginMutation = usePostAuthLogin();
  const registerMutation = usePostAuthRegister();
  const submitting = loginMutation.isPending || registerMutation.isPending;

  const handleModeChange = (value: string) => {
    if (value === "login" || value === "register") {
      setMode(value);
      setError("");
    }
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = username.trim();

    if (normalizedUsername.length < 3 || normalizedUsername.length > 32) {
      setError("用户名长度需为 3-32 个字符");
      return;
    }
    if (password.length < 6 || password.length > 128) {
      setError("密码长度需为 6-128 个字符");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setError("");
    try {
      const auth =
        mode === "login"
          ? await loginMutation.mutateAsync({ data: { username: normalizedUsername, password } })
          : await registerMutation.mutateAsync({
              data: { username: normalizedUsername, password },
            });

      if (!auth.access_token) {
        setError("登录凭证获取失败,请稍后重试");
        return;
      }

      localStorage.setItem("access_token", auth.access_token);
      if (auth.refresh_token) localStorage.setItem("refresh_token", auth.refresh_token);
      localStorage.setItem(ME_KEY, auth.user.id);

      toast.success(mode === "login" ? "登录成功" : "注册成功");
      onAuthenticated?.(auth.user.id);
      if (!onAuthenticated) void navigate({ to: "/me" });
    } catch (err) {
      setError(err instanceof ApiError ? err.msg : mode === "login" ? "登录失败" : "注册失败");
    }
  };

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" />
          返回首页
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-xl">
            <BookOpen className="size-6" />
          </div>
          <div>
            <p className="text-primary text-2xl font-bold tracking-tight">小红书</p>
            <p className="text-muted-foreground text-sm">记录生活,发现真实有趣</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{mode === "login" ? "欢迎回来" : "创建你的账号"}</CardTitle>
            <CardDescription>
              {mode === "login" ? "登录后继续你的生活记录" : "加入小红书,分享你的生活灵感"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={handleModeChange} className="gap-5">
              <TabsList className="grid h-10 w-full grid-cols-2">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="register">注册</TabsTrigger>
              </TabsList>
              <TabsContent value={mode} className="mt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="auth-username" className="text-sm font-medium">
                      用户名
                    </label>
                    <Input
                      id="auth-username"
                      name="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="请输入用户名"
                      autoComplete="username"
                      minLength={3}
                      maxLength={32}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="auth-password" className="text-sm font-medium">
                      密码
                    </label>
                    <Input
                      id="auth-password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="请输入密码"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      minLength={6}
                      maxLength={128}
                      required
                    />
                  </div>
                  {mode === "register" && (
                    <div className="space-y-1.5">
                      <label htmlFor="auth-confirm-password" className="text-sm font-medium">
                        确认密码
                      </label>
                      <Input
                        id="auth-confirm-password"
                        name="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="请再次输入密码"
                        autoComplete="new-password"
                        minLength={6}
                        maxLength={128}
                        required
                      />
                    </div>
                  )}

                  {error && (
                    <p role="alert" className="text-destructive text-sm">
                      {error}
                    </p>
                  )}

                  <Button type="submit" className="h-10 w-full" disabled={submitting}>
                    {submitting && <LoaderCircle className="animate-spin" />}
                    {submitting ? "提交中..." : mode === "login" ? "登录" : "注册"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          登录即代表你同意小红书的服务协议与隐私政策
        </p>
      </div>
    </main>
  );
}

export function UserProfilePage({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const userQuery = useGetUsersUserId(userId);
  const user = userQuery.data;
  const postsQuery = useGetUsersUserIdPosts(
    userId,
    { limit: 20 },
    { query: { enabled: Boolean(user) } },
  );
  const followMutation = usePutUsersUserIdFollow();
  const unfollowMutation = useDeleteUsersUserIdFollow();
  const posts = postsQuery.data?.items ?? [];
  const userLoading = userQuery.isPending || (Boolean(user) && postsQuery.isPending);

  const handleFollow = async () => {
    if (!user) return;
    const next = !user.viewer_following;
    try {
      if (next) await followMutation.mutateAsync({ userId });
      else await unfollowMutation.mutateAsync({ userId });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQuery.queryKey }),
        queryClient.invalidateQueries({ queryKey: getGetMeProfileQueryKey() }),
      ]);
      toast.success(next ? "已关注" : "已取消关注");
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("操作失败");
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
            <AvatarFallback>{user.username.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-muted-foreground mt-0.5 text-xs">小红书号: {user.id}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span>
                <span className="font-semibold">{formatCount(user.post_count)}</span>{" "}
                <span className="text-muted-foreground text-xs">笔记</span>
              </span>
              <span>
                <span className="font-semibold">{formatCount(user.follower_count)}</span>{" "}
                <span className="text-muted-foreground text-xs">粉丝</span>
              </span>
              <span>
                <span className="font-semibold">{formatCount(user.following_count)}</span>{" "}
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
            variant={user.viewer_following ? "outline" : "default"}
            disabled={followMutation.isPending || unfollowMutation.isPending}
          >
            {user.viewer_following ? "已关注" : "关注"}
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
          <KV label="笔记" value={String(user.post_count)} />
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
          {posts.length ? (
            <MasonryFeed posts={posts} />
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
