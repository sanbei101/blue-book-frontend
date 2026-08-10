import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type {
  ApiGetPostsResponse,
  ApiCommentResponse,
  ApiListPostsItemResponse,
} from "@/api/api.schemas";
import {
  deletePostsPostIdCollection,
  putPostsPostIdCollection,
} from "@/api/collections/collections";
import { getPostsPostIdComments, postComments } from "@/api/comments/comments";
import { getFeedRecommended } from "@/api/discovery/discovery";
import { deleteUsersUserIdFollow, putUsersUserIdFollow } from "@/api/follows/follows";
import {
  deleteCommentsCommentIdLike,
  deletePostsPostIdLike,
  putCommentsCommentIdLike,
  putPostsPostIdLike,
} from "@/api/likes/likes";
import { getPostsPostId } from "@/api/posts/posts";
import { MasonryFeed } from "@/components/feed/MasonryFeed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCount } from "@/lib/utils";
import { ApiError } from "@/mutator";

export function PostDetailPage({ postId }: { postId: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false);
  const [following, setFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [collectCount, setCollectCount] = useState(0);
  const [comment, setComment] = useState("");
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [post, setPost] = useState<ApiGetPostsResponse | undefined>(undefined);
  const [comments, setComments] = useState<ApiCommentResponse[]>([]);
  const [coverRatio, setCoverRatio] = useState<number | null>(null);
  const [related, setRelated] = useState<ApiListPostsItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const handleImageSelect = (i: number) => {
    setActiveImage(i);
    setCoverRatio(null);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getPostsPostId(postId),
      getPostsPostIdComments(postId),
      getFeedRecommended({ page: 1, page_size: 6 }),
    ])
      .then(([postRes, commentsRes, relatedRes]) => {
        if (cancelled) return;
        setPost(postRes.data);
        setLiked(postRes.data?.liked ?? false);
        setCollected(postRes.data?.collected ?? false);
        setLikeCount(postRes.data?.like_count ?? 0);
        setCollectCount(postRes.data?.collect_count ?? 0);
        setComments(commentsRes.data ?? []);
        setRelated(relatedRes.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setPost(undefined);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    try {
      const response = next
        ? await putPostsPostIdLike(postId)
        : await deletePostsPostIdLike(postId);
      setLiked(response.data?.liked ?? next);
      setLikeCount(response.data?.like_count ?? likeCount);
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("操作失败");
      setLiked(!next);
    }
  };

  const handleCollection = async () => {
    const next = !collected;
    setCollected(next);
    try {
      const response = next
        ? await putPostsPostIdCollection(postId)
        : await deletePostsPostIdCollection(postId);
      setCollected(response.data?.collected ?? next);
      setCollectCount(response.data?.collect_count ?? collectCount);
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("操作失败");
      setCollected(!next);
    }
  };

  const handleFollow = async () => {
    const authorId = post?.author?.id;
    if (!authorId) return;
    const next = !following;
    setFollowing(next);
    try {
      const response = next
        ? await putUsersUserIdFollow(authorId)
        : await deleteUsersUserIdFollow(authorId);
      setFollowing(response.data?.following ?? next);
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("操作失败");
      setFollowing(!next);
    }
  };

  const handleComment = async () => {
    const content = comment.trim();
    if (!content) return;
    try {
      await postComments({ post_id: postId, content });
      const response = await getPostsPostIdComments(postId);
      setComments(response.data ?? []);
      setComment("");
      toast.success("评论成功");
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("评论失败");
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!commentId) return;
    const next = !commentLikes[commentId];
    setCommentLikes((current) => ({ ...current, [commentId]: next }));
    try {
      const response = next
        ? await putCommentsCommentIdLike(commentId)
        : await deleteCommentsCommentIdLike(commentId);
      setComments((current) =>
        current.map((item) =>
          item.id === commentId
            ? { ...item, like_count: response.data?.like_count ?? item.like_count }
            : item,
        ),
      );
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("操作失败");
      setCommentLikes((current) => ({ ...current, [commentId]: !next }));
    }
  };

  if (loading || !post) {
    return (
      <div className="space-y-3 p-3">
        <Skeleton className="aspect-[3/4] w-full rounded-none" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  const media = post.media ?? [];
  const cover = media[activeImage]?.media_url ?? "";
  const dotButtons = media.map((_, i) => i);

  return (
    <div className="bg-background mx-auto max-w-5xl">
      {/* Hero image */}
      <div
        className="bg-muted relative mx-auto w-full max-w-xl overflow-hidden"
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
          <div className="from-primary/20 to-primary/5 size-full bg-gradient-to-br" />
        )}

        <Link
          to="/"
          className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <button className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur">
          <MoreHorizontal className="size-4" />
        </button>

        {media.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {dotButtons.map((i) => (
              <button
                key={i}
                onClick={() => handleImageSelect(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeImage ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
        {media.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white backdrop-blur">
            {activeImage + 1}/{media.length}
          </span>
        )}
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-xl leading-tight font-bold">{post.title}</h1>
        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
          <span>{post.created_at}</span>
          <span>·</span>
          <span>{formatCount(post.view_count)} 浏览</span>
        </div>
      </div>

      <Separator className="my-3" />

      <Card className="ring-foreground/5 mx-3 ring-1">
        <CardContent className="flex items-center gap-3 p-3">
          <Link to="/users/$userId" params={{ userId: post.author?.id ?? "" }}>
            <Avatar size="lg">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback>{(post.author?.username ?? "?").slice(0, 1)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              to="/users/$userId"
              params={{ userId: post.author?.id ?? "" }}
              className="hover:text-primary text-sm font-semibold"
            >
              {post.author?.username}
            </Link>
          </div>
          <Button
            size="sm"
            className="rounded-full px-5"
            variant={following ? "outline" : "default"}
            onClick={handleFollow}
          >
            {following ? "已关注" : "关注"}
          </Button>
        </CardContent>
      </Card>

      <div className="text-foreground/90 px-4 py-3 text-sm leading-relaxed">{post.content}</div>

      {post.tags?.length ? (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {post.tags.map((tag) => (
            <Badge key={tag.id ?? tag.name} variant="secondary" className="rounded-full">
              #{tag.name}
            </Badge>
          ))}
        </div>
      ) : null}

      <Separator />

      <Tabs defaultValue="comments" className="px-3 pt-2">
        <TabsList variant="line" className="w-full justify-start gap-4">
          <TabsTrigger value="comments">评论 {comments?.length ?? 0}</TabsTrigger>
          <TabsTrigger value="related">相关推荐</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="mt-2 space-y-0 pb-24">
          {(comments ?? []).length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">还没有评论,快来抢沙发</p>
          ) : (
            (comments ?? []).map((c) => (
              <div key={c.id} className="flex gap-2.5 py-2.5">
                <Avatar size="default">
                  <AvatarImage src={c.author_avatar} />
                  <AvatarFallback>{(c.author_username ?? "?").slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-xs font-medium">{c.author_username}</p>
                  <p className="mt-0.5 text-sm">{c.content}</p>
                  <div className="text-muted-foreground mt-1 flex items-center gap-3 text-[11px]">
                    <span>{c.created_at}</span>
                    <button>回复</button>
                  </div>
                </div>
                <button
                  onClick={() => handleCommentLike(c.id ?? "")}
                  className={`flex flex-col items-center gap-0.5 ${commentLikes[c.id ?? ""] ? "text-primary" : "text-muted-foreground"}`}
                  aria-label="点赞评论"
                >
                  <Heart className={`size-4 ${commentLikes[c.id ?? ""] ? "fill-primary" : ""}`} />
                  <span className="text-[10px]">{formatCount(c.like_count)}</span>
                </button>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="related" className="mt-2 pb-24">
          {related && related.length > 0 ? (
            <MasonryFeed posts={related} />
          ) : (
            <p className="text-muted-foreground py-10 text-center text-sm">暂无推荐</p>
          )}
        </TabsContent>
      </Tabs>

      <div className="border-border/60 bg-background/95 fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-5xl items-center gap-2 border-t px-3 py-2 backdrop-blur">
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleComment();
            }
          }}
          placeholder="说点什么..."
          className="bg-muted h-9 flex-1 rounded-full"
        />
        <button
          onClick={() => void handleComment()}
          className="text-primary flex items-center gap-1 text-xs"
          aria-label="发表评论"
        >
          <Send className="size-5" />
        </button>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-xs ${liked ? "text-primary" : "text-muted-foreground"}`}
        >
          <Heart className={`size-5 ${liked ? "fill-primary" : ""}`} />
          {formatCount(likeCount)}
        </button>
        <button
          onClick={handleCollection}
          className={`flex items-center gap-1 text-xs ${collected ? "text-primary" : "text-muted-foreground"}`}
          aria-label="收藏帖子"
        >
          <Bookmark className={`size-5 ${collected ? "fill-primary" : ""}`} />
          {formatCount(collectCount)}
        </button>
        <button className="text-muted-foreground flex items-center gap-1 text-xs">
          <MessageCircle className="size-5" />
          {comments?.length ?? 0}
        </button>
        <button className="text-muted-foreground flex items-center gap-1 text-xs">
          <Share2 className="size-5" />
        </button>
      </div>
    </div>
  );
}
