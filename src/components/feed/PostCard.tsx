import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatCount, cn } from "@/lib/utils";

type PostCardProps = {
  post: {
    id?: string;
    title?: string;
    cover_url?: string;
    view_count?: number;
    author?: { id?: string; username?: string; avatar_url?: string };
  };
};

const COVER_GRADIENTS = [
  "from-rose-200 via-pink-200 to-fuchsia-200",
  "from-amber-200 via-orange-200 to-rose-200",
  "from-sky-200 via-indigo-200 to-violet-200",
  "from-emerald-200 via-teal-200 to-cyan-200",
  "from-violet-200 via-purple-200 to-pink-200",
];

function coverGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return COVER_GRADIENTS[Math.abs(h) % COVER_GRADIENTS.length];
}

export function PostCard({ post }: PostCardProps) {
  const id = post.id ?? "";
  const [imgFailed, setImgFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <Card className="gap-0 rounded-2xl py-0 ring-1 ring-foreground/5">
      <Link
        to="/posts/$postId"
        params={{ postId: id }}
        className="block"
        activeProps={{ className: "opacity-90" }}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden bg-muted",
            `bg-gradient-to-br ${coverGradient(id || post.title || "x")}`,
          )}
          style={{ aspectRatio: ratio ?? 3 / 4 }}
        >
          {post.cover_url && !imgFailed ? (
            <img
              src={post.cover_url}
              alt={post.title ?? ""}
              loading="lazy"
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setRatio(img.naturalWidth / img.naturalHeight);
                }
              }}
              onError={() => setImgFailed(true)}
              className="size-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-end p-3">
              <span className="line-clamp-2 text-sm font-semibold text-white drop-shadow-md">
                {post.title}
              </span>
            </div>
          )}
          <span className="absolute right-1.5 bottom-1.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {formatCount(post.view_count)}
          </span>
        </div>
      </Link>

      <div className="px-2.5 py-2">
        <Link
          to="/posts/$postId"
          params={{ postId: id }}
          className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground hover:text-primary"
        >
          {post.title}
        </Link>

        <div className="mt-1.5 flex items-center justify-between">
          <Link
            to="/users/$userId"
            params={{ userId: post.author?.id ?? "u1" }}
            className="flex min-w-0 items-center gap-1.5"
          >
            <Avatar size="sm">
              {post.author?.avatar_url && !avatarFailed && (
                <AvatarImage
                  src={post.author.avatar_url}
                  onError={() => setAvatarFailed(true)}
                />
              )}
              <AvatarFallback>{(post.author?.username ?? "?").slice(0, 1)}</AvatarFallback>
            </Avatar>
            <span className="truncate text-[11px] text-muted-foreground">
              {post.author?.username}
            </span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Heart className="size-3" /> 0
            </span>
            <span className="flex items-center gap-0.5">
              <MessageCircle className="size-3" />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
