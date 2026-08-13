import { Link } from "@tanstack/react-router";
import { Heart, ImageOff } from "lucide-react";
import { useState } from "react";

import type { ApiListPostsItemResponse as CardProps } from "@/api/api.schemas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatCount, cn } from "@/lib/utils";

type PostCardProps = {
  post: CardProps;
};

export function PostCard({ post }: PostCardProps) {
  const { id, title, width, height, cover_url, author, like_count, viewer_liked } = post;
  const [imgFailed, setImgFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectRatio = width > 0 && height > 0 ? `${width} / ${height}` : "3 / 4";

  return (
    <Card className="group border-border/40 bg-card w-full min-w-0 overflow-hidden rounded-xl border p-0 shadow-none transition-all duration-200 hover:shadow-md">
      <Link
        to="/posts/$postId"
        params={{ postId: id }}
        className="block w-full max-w-full overflow-hidden"
      >
        {/* 占位与裁剪容器 */}
        <div
          className="bg-muted relative w-full max-w-full overflow-hidden"
          style={{ aspectRatio }}
        >
          {cover_url && !imgFailed ? (
            <img
              src={cover_url}
              alt={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              onError={() => setImgFailed(true)}
              className={cn(
                "block h-full w-full max-w-full object-cover transition-all duration-300 ease-out group-hover:scale-105",
                isLoaded ? "opacity-100" : "opacity-0",
              )}
            />
          ) : (
            <div className="bg-secondary/40 text-muted-foreground flex size-full flex-col items-center justify-center gap-2 p-4">
              <ImageOff className="size-5 opacity-40" />
              <span className="line-clamp-2 text-center text-xs font-medium opacity-60">
                {title}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* 底部文案区 */}
      <div className="p-2.5">
        <Link
          to="/posts/$postId"
          params={{ postId: id }}
          className="text-foreground hover:text-primary line-clamp-2 text-xs leading-snug font-medium transition-colors"
        >
          {title}
        </Link>

        <div className="mt-2 flex items-center justify-between gap-1">
          <Link
            to="/users/$userId"
            params={{ userId: author.id }}
            className="flex min-w-0 items-center gap-1.5 transition-opacity hover:opacity-80"
          >
            <Avatar className="border-border/40 size-5 shrink-0 border">
              {!avatarFailed && (
                <AvatarImage src={author.avatar_url} onError={() => setAvatarFailed(true)} />
              )}
              <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                {author.username.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground truncate text-[11px]">{author.username}</span>
          </Link>

          <div
            className={cn(
              "flex items-center gap-1 text-[11px] shrink-0 transition-colors",
              viewer_liked ? "text-primary font-medium" : "text-muted-foreground",
            )}
          >
            <Heart className={cn("size-3.5", viewer_liked && "fill-primary text-primary")} />
            <span>{formatCount(like_count)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
