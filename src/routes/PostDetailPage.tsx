import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  Copy,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useDeletePostsPostIdCollection,
  usePutPostsPostIdCollection,
} from "@/api/collections/collections";
import { useGetPostsPostIdComments, usePostComments } from "@/api/comments/comments";
import { useGetFeedRecommended } from "@/api/discovery/discovery";
import { useDeleteUsersUserIdFollow, usePutUsersUserIdFollow } from "@/api/follows/follows";
import {
  useDeleteCommentsCommentIdLike,
  useDeletePostsPostIdLike,
  usePutCommentsCommentIdLike,
  usePutPostsPostIdLike,
} from "@/api/likes/likes";
import { useGetPostsPostId } from "@/api/posts/posts";
import { getGetMeProfileQueryKey, getGetUsersUserIdQueryKey } from "@/api/users/users";
import { MasonryFeed } from "@/components/feed/MasonryFeed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCount, formatRelativeTime } from "@/lib/utils";
import { ApiError } from "@/mutator";

export function PostDetailPage({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const [comment, setComment] = useState("");
  const [coverRatio, setCoverRatio] = useState<number | null>(null);
  const postQuery = useGetPostsPostId(postId, { query: { staleTime: 0 } });
  const commentsQuery = useGetPostsPostIdComments(postId, { page: 1, page_size: 20 });
  const relatedQuery = useGetFeedRecommended({ page: 1, page_size: 6 });
  const likeMutation = usePutPostsPostIdLike();
  const unlikeMutation = useDeletePostsPostIdLike();
  const collectMutation = usePutPostsPostIdCollection();
  const uncollectMutation = useDeletePostsPostIdCollection();
  const followMutation = usePutUsersUserIdFollow();
  const unfollowMutation = useDeleteUsersUserIdFollow();
  const createCommentMutation = usePostComments();
  const likeCommentMutation = usePutCommentsCommentIdLike();
  const unlikeCommentMutation = useDeleteCommentsCommentIdLike();
  const post = postQuery.data;
  const comments = commentsQuery.data?.items ?? [];
  const related = relatedQuery.data?.items ?? [];

  const handleImageSelect = (i: number) => {
    setActiveImage(i);
    setCoverRatio(null);
  };

  const handleLike = async () => {
    if (!post) return;
    const next = !post.viewer_liked;
    try {
      if (next) await likeMutation.mutateAsync({ postId });
      else await unlikeMutation.mutateAsync({ postId });
      await queryClient.invalidateQueries({ queryKey: postQuery.queryKey });
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("操作失败");
    }
  };

  const handleCollection = async () => {
    if (!post) return;
    const next = !post.viewer_collected;
    try {
      if (next) await collectMutation.mutateAsync({ postId });
      else await uncollectMutation.mutateAsync({ postId });
      await queryClient.invalidateQueries({ queryKey: postQuery.queryKey });
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("操作失败");
    }
  };

  const handleFollow = async () => {
    const author = post?.author;
    if (!author) return;
    const next = !author.viewer_following;
    try {
      if (next) await followMutation.mutateAsync({ userId: author.id });
      else await unfollowMutation.mutateAsync({ userId: author.id });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: postQuery.queryKey }),
        queryClient.invalidateQueries({ queryKey: getGetUsersUserIdQueryKey(author.id) }),
        queryClient.invalidateQueries({ queryKey: getGetMeProfileQueryKey() }),
      ]);
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("操作失败");
    }
  };

  const handleComment = async () => {
    const content = comment.trim();
    if (!content) return;
    try {
      await createCommentMutation.mutateAsync({ data: { post_id: postId, content } });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: commentsQuery.queryKey }),
        queryClient.invalidateQueries({ queryKey: postQuery.queryKey }),
      ]);
      setComment("");
      toast.success("评论成功");
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("评论失败");
    }
  };

  const handleCommentLike = async (commentId: string, viewerLiked: boolean) => {
    if (!commentId) return;
    const next = !viewerLiked;
    try {
      if (next) await likeCommentMutation.mutateAsync({ commentId });
      else await unlikeCommentMutation.mutateAsync({ commentId });
      await queryClient.invalidateQueries({ queryKey: commentsQuery.queryKey });
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("操作失败");
    }
  };

  const handleShare = async () => {
    const shareData = { title: post?.title, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("链接已复制");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error("分享失败,请稍后重试");
    }
  };

  if (postQuery.isPending) {
    return (
      <div className="mx-auto grid max-w-6xl gap-5 p-4 md:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] md:p-5">
        <Skeleton className="aspect-[3/4] w-full md:aspect-auto md:h-[calc(100vh-2.5rem)]" />
        <div className="space-y-5 py-3">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-muted-foreground text-sm">笔记无法加载,请稍后重试</p>
        <Button render={<Link to="/" />} variant="outline">
          返回首页
        </Button>
      </div>
    );
  }

  const { author, media, tags } = post;
  const cover = media[activeImage]?.media_url ?? "";
  const dotButtons = media.map((_, i) => i);

  return (
    <main className="bg-background md:bg-muted/40 min-h-screen md:p-5">
      <div className="bg-card mx-auto max-w-6xl md:grid md:h-[calc(100vh-2.5rem)] md:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] md:overflow-hidden md:border">
        <div
          className="bg-muted relative w-full overflow-hidden md:sticky md:top-5 md:!aspect-auto md:h-[calc(100vh-2.5rem)]"
          style={{ aspectRatio: coverRatio ?? 3 / 4 }}
        >
          {cover ? (
            <img
              src={cover}
              alt={post.title}
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setCoverRatio(img.naturalWidth / img.naturalHeight);
                }
              }}
              className="size-full object-contain"
            />
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center p-8 text-center text-sm">
              暂无图片
            </div>
          )}

          <Link
            to="/"
            aria-label="返回首页"
            className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur transition-colors hover:bg-black/60"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="更多操作"
              className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur transition-colors hover:bg-black/60"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="min-w-28">
              <DropdownMenuItem onClick={() => void handleShare()}>
                <Copy />
                分享笔记
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {media.length > 1 && (
            <>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {dotButtons.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleImageSelect(i)}
                    aria-label={`查看第 ${i + 1} 张图片`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeImage ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
              <span className="absolute right-3 bottom-3 rounded-full bg-black/45 px-2 py-0.5 text-xs text-white tabular-nums backdrop-blur">
                {activeImage + 1}/{media.length}
              </span>
            </>
          )}
        </div>

        <section className="flex min-w-0 flex-col pb-20 md:h-full md:overflow-hidden md:pb-0">
          <div className="border-border/70 border-b px-4 pt-5 pb-4 md:px-6 md:pt-7">
            <div className="flex items-start gap-3">
              <Link to="/users/$userId" params={{ userId: author.id }}>
                <Avatar size="lg" className="ring-border size-11 ring-1">
                  <AvatarImage src={author.avatar_url} />
                  <AvatarFallback>{author.username.slice(0, 1)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1 pt-0.5">
                <Link
                  to="/users/$userId"
                  params={{ userId: author.id }}
                  className="hover:text-primary text-sm font-semibold"
                >
                  {author.username}
                </Link>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatRelativeTime(post.created_at)} · {formatCount(post.view_count)} 浏览
                </p>
              </div>
              <Button
                size="sm"
                className="mt-0.5 rounded-full px-3"
                variant={author.viewer_following ? "outline" : "default"}
                onClick={handleFollow}
                disabled={followMutation.isPending || unfollowMutation.isPending}
              >
                {author.viewer_following ? "已关注" : "关注"}
              </Button>
            </div>

            <h1 className="mt-5 text-[1.35rem] leading-snug font-bold text-balance">
              {post.title}
            </h1>
            <div className="text-foreground/90 mt-3 text-sm leading-7 whitespace-pre-wrap">
              {post.content}
            </div>

            {tags.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="h-6 rounded-full px-2 text-xs font-medium"
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <div className="border-border/70 border-b px-4 py-3 md:px-6">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleLike}
                className={`hover:bg-muted flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors ${
                  post.viewer_liked ? "text-primary" : "text-muted-foreground"
                }`}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
                aria-label="点赞笔记"
              >
                <Heart className={`size-4 ${post.viewer_liked ? "fill-primary" : ""}`} />
                {formatCount(post.like_count)}
              </button>
              <button
                type="button"
                onClick={handleCollection}
                className={`hover:bg-muted flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors ${
                  post.viewer_collected ? "text-primary" : "text-muted-foreground"
                }`}
                disabled={collectMutation.isPending || uncollectMutation.isPending}
                aria-label="收藏笔记"
              >
                <Bookmark className={`size-4 ${post.viewer_collected ? "fill-primary" : ""}`} />
                {formatCount(post.collect_count)}
              </button>
              <span className="text-muted-foreground ml-auto flex items-center gap-1.5 px-2 text-xs">
                <MessageCircle className="size-4" />
                {formatCount(post.comment_count)}
              </span>
              <button
                type="button"
                aria-label="分享笔记"
                title="分享笔记"
                onClick={() => void handleShare()}
                className="text-muted-foreground hover:bg-muted flex size-8 items-center justify-center rounded-md transition-colors"
              >
                <Share2 className="size-4" />
              </button>
            </div>
          </div>

          <div className="border-border/70 bg-background fixed inset-x-0 bottom-0 z-40 border-t px-3 py-2 shadow-[0_-8px_24px_-18px_rgba(0,0,0,0.35)] md:static md:px-6 md:py-3 md:shadow-none">
            <div className="flex items-center gap-2">
              <InputGroup className="bg-muted focus-within:bg-background flex-1 rounded-full border-transparent">
                <InputGroupInput
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleComment();
                    }
                  }}
                  placeholder="说点什么..."
                />
                <InputGroupButton
                  onClick={() => void handleComment()}
                  aria-label="发表评论"
                  title="发表评论"
                  disabled={createCommentMutation.isPending}
                >
                  <Send className="text-primary" />
                </InputGroupButton>
              </InputGroup>
            </div>
          </div>

          <Tabs defaultValue="comments" className="min-h-0 px-4 pt-3 md:flex-1 md:px-6">
            <TabsList variant="line" className="w-full justify-start gap-5">
              <TabsTrigger value="comments" className="flex-none px-0">
                评论 {post.comment_count}
              </TabsTrigger>
              <TabsTrigger value="related" className="flex-none px-0">
                相关推荐
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-3 min-h-0 md:overflow-hidden">
              <ScrollArea className="md:h-full md:pr-3">
                {comments.length === 0 ? (
                  <Empty className="py-12">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <MessageCircle />
                      </EmptyMedia>
                      <EmptyTitle>还没有评论</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="border-border/60 flex gap-3 border-b py-4 last:border-b-0"
                    >
                      <Avatar size="default" className="size-8">
                        <AvatarImage src={c.author_avatar} />
                        <AvatarFallback>{c.author_username.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground text-xs font-medium">
                          {c.author_username}
                        </p>
                        <p className="mt-1 text-sm leading-6">{c.content}</p>
                        <div className="text-muted-foreground mt-1.5 flex items-center gap-3 text-[11px]">
                          <span>{formatRelativeTime(c.created_at)}</span>
                          <button type="button" className="hover:text-foreground transition-colors">
                            回复
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCommentLike(c.id, c.viewer_liked)}
                        className={`flex min-w-8 flex-col items-center gap-0.5 pt-0.5 ${c.viewer_liked ? "text-primary" : "text-muted-foreground"}`}
                        aria-label="点赞评论"
                        disabled={likeCommentMutation.isPending || unlikeCommentMutation.isPending}
                      >
                        <Heart className={`size-4 ${c.viewer_liked ? "fill-primary" : ""}`} />
                        <span className="text-[10px] tabular-nums">
                          {formatCount(c.like_count)}
                        </span>
                      </button>
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="related" className="mt-3 min-h-0 md:overflow-hidden">
              <ScrollArea className="md:h-full md:pr-3">
                {related.length > 0 ? (
                  <MasonryFeed posts={related} />
                ) : (
                  <Empty className="py-12">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Bookmark />
                      </EmptyMedia>
                      <EmptyTitle>暂无推荐</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
