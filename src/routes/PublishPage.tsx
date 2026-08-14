import { useNavigate } from "@tanstack/react-router";
import { AtSign, Hash, ImagePlus, MapPin, Smile, Video, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import type { ApiCreateMediaItem } from "@/api/api.schemas";
import { ApiCreateMediaItemMediaType } from "@/api/api.schemas";
import { usePostMediaPresign } from "@/api/media/media";
import { usePostPosts } from "@/api/posts/posts";
import { TopBar } from "@/components/layout/TopBar";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/mutator";

export function PublishPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const presignMutation = usePostMediaPresign();
  const createPostMutation = usePostPosts();
  const isPublishing = uploading || createPostMutation.isPending;

  useEffect(() => {
    const urls = mediaFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [mediaFiles]);

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMediaFiles((files) => [...files, ...Array.from(event.target.files ?? [])]);
    event.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, "");
    if (!tag || tags.includes(tag)) return;
    setTags((currentTags) => [...currentTags, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag));
  };

  const uploadMedia = async (files: File[]): Promise<ApiCreateMediaItem[]> => {
    return Promise.all(
      files.map(async (file, index) => {
        const presignRes = await presignMutation.mutateAsync({
          data: { content_type: file.type || "application/octet-stream" },
        });
        const uploadUrl = presignRes.upload_url;
        const objectKey = presignRes.object_key;
        if (!uploadUrl || !objectKey) throw new Error("获取媒体上传地址失败");

        let uploadRes: Response;
        try {
          uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: file,
          });
        } catch {
          throw new Error("媒体上传请求失败,请检查网络或对象存储跨域配置");
        }
        if (!uploadRes.ok) throw new Error(`媒体上传失败 (${uploadRes.status})`);

        return {
          media_type: file.type.startsWith("video/")
            ? ApiCreateMediaItemMediaType.video
            : ApiCreateMediaItemMediaType.image,
          media_key: objectKey,
          sort_order: index,
        };
      }),
    );
  };

  const handlePublish = async () => {
    if (!title.trim()) return;
    try {
      setUploading(mediaFiles.length > 0);
      const media = await uploadMedia(mediaFiles);
      const res = await createPostMutation.mutateAsync({
        data: { title: title.trim(), content: content.trim(), media, tags },
      });
      toast.success("发布成功");
      const id = res.id;
      if (id) void navigate({ to: "/posts/$postId", params: { postId: id } });
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.msg);
      else if (err instanceof Error) toast.error(err.message);
      else toast.error("发布失败");
    } finally {
      setUploading(false);
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
            disabled={!title.trim() || isPublishing}
            onClick={handlePublish}
          >
            {uploading ? "上传中..." : createPostMutation.isPending ? "发布中..." : "发布"}
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
        <div className="flex gap-3 overflow-x-auto py-1">
          <input
            id="publish-media"
            type="file"
            accept="image/*,video/*"
            multiple
            className="sr-only"
            onChange={handleFilesChange}
          />
          <label
            htmlFor="publish-media"
            aria-disabled={isPublishing}
            className="border-border bg-muted/30 text-muted-foreground hover:border-primary hover:text-primary flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors"
          >
            <ImagePlus className="size-6" />
            <span className="text-xs">添加</span>
          </label>
          {mediaFiles.length > 0 && (
            <AttachmentGroup>
              {mediaFiles.map((file, index) => {
                const previewUrl = previewUrls[index];
                const isVideo = file.type.startsWith("video/");
                return (
                  <Attachment key={`${file.name}-${file.lastModified}`} orientation="vertical">
                    <AttachmentMedia>
                      {previewUrl &&
                        (isVideo ? (
                          <video src={previewUrl} muted preload="metadata" />
                        ) : (
                          <img src={previewUrl} alt={file.name} />
                        ))}
                      {isVideo ? (
                        <Video className="absolute size-5 text-white drop-shadow" />
                      ) : null}
                    </AttachmentMedia>
                    <AttachmentContent className="w-full px-2 pb-2">
                      <AttachmentTitle>{file.name}</AttachmentTitle>
                      <AttachmentDescription>{isVideo ? "视频" : "图片"}</AttachmentDescription>
                    </AttachmentContent>
                    <AttachmentActions>
                      <AttachmentAction
                        aria-label={`移除 ${file.name}`}
                        disabled={isPublishing}
                        onClick={() => removeMedia(index)}
                      >
                        <X />
                      </AttachmentAction>
                    </AttachmentActions>
                  </Attachment>
                );
              })}
            </AttachmentGroup>
          )}
        </div>
      </div>

      <Separator className="my-3" />

      <div className="px-3">
        <Card className="ring-foreground/5 ring-1">
          <CardContent className="p-0">
            {[
              { icon: AtSign, label: "提到好友" },
              { icon: MapPin, label: "添加地点" },
              { icon: Smile, label: "添加心情" },
            ].map((row, i, arr) => (
              <div key={row.label}>
                <button
                  type="button"
                  onClick={() => toast.message("该功能需要后端接口支持")}
                  className="hover:bg-muted flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <row.icon className="text-muted-foreground size-4" />
                    <span className="text-sm">{row.label}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">暂不支持</span>
                </button>
                {i < arr.length - 1 && <Separator />}
              </div>
            ))}
            <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className="hover:bg-muted flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors"
                  />
                }
              >
                <span className="flex items-center gap-2.5">
                  <Hash className="text-muted-foreground size-4" />
                  <span className="text-sm">添加话题</span>
                </span>
                <span className="text-muted-foreground text-xs">
                  {tags.length ? `${tags.length} 个话题` : "未添加"}
                </span>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72">
                <p className="font-medium">添加话题</p>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="输入话题名称"
                    maxLength={50}
                  />
                  <Button type="button" size="sm" onClick={addTag}>
                    添加
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="bg-muted hover:bg-muted/70 flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors"
                      >
                        #{tag}
                        <X className="size-3" />
                      </button>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
