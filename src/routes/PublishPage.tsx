import { useNavigate } from "@tanstack/react-router";
import { ImagePlus, MapPin, Hash, Smile, AtSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { postPosts } from "@/api/posts/posts";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/mutator";

export function PublishPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await postPosts({ title, content, media: [] });
      toast.success("发布成功");
      const id = res.data?.id;
      if (id) void navigate({ to: "/posts/$postId", params: { postId: id } });
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else toast.error("发布失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopBar
        title="发布笔记"
        rightSlot={
          <Button
            size="sm"
            className="rounded-full px-5"
            disabled={!title.trim() || submitting}
            onClick={handlePublish}
          >
            {submitting ? "发布中..." : "发布"}
          </Button>
        }
      />

      <div className="flex items-start gap-2.5 px-3 py-3">
        <Avatar size="default">
          <AvatarFallback>我</AvatarFallback>
        </Avatar>
        <Textarea
          placeholder="分享你的生活、灵感或好物..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-24 border-0 bg-transparent p-0 text-base focus-visible:ring-0"
        />
      </div>

      <div className="px-3">
        <Input
          placeholder="填写标题,让更多人看到你的笔记"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-muted h-10 rounded-lg"
        />
      </div>

      <Separator className="my-3" />

      <div className="px-3">
        <h3 className="mb-2 text-sm font-medium">添加图片 / 视频</h3>
        <div className="grid grid-cols-3 gap-2">
          <button className="border-border bg-muted/30 text-muted-foreground hover:border-primary hover:text-primary flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors">
            <ImagePlus className="size-6" />
            <span className="text-xs">添加</span>
          </button>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="px-3">
        <Card className="ring-foreground/5 ring-1">
          <CardContent className="p-0">
            {[
              { icon: Hash, label: "添加话题", value: "未添加" },
              { icon: AtSign, label: "提到好友", value: "未添加" },
              { icon: MapPin, label: "添加地点", value: "未添加" },
              { icon: Smile, label: "添加心情", value: "未添加" },
            ].map((row, i, arr) => (
              <div key={row.label}>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <row.icon className="text-muted-foreground size-4" />
                    <span className="text-sm">{row.label}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{row.value}</span>
                </div>
                {i < arr.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
