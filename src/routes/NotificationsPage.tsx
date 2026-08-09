import { Bell } from "lucide-react";

import { TopBar } from "@/components/layout/TopBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function NotificationsPage() {
  return (
    <>
      <TopBar title="消息" />

      <Tabs defaultValue="all" className="px-3 pt-2">
        <TabsList variant="line" className="w-full justify-start gap-4">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="like">赞和收藏</TabsTrigger>
          <TabsTrigger value="comment">评论</TabsTrigger>
          <TabsTrigger value="follow">关注</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-2">
          <EmptyState text="登录后查看你的新消息" />
        </TabsContent>
        <TabsContent value="like" className="mt-2">
          <EmptyState text="还没有新的赞和收藏" />
        </TabsContent>
        <TabsContent value="comment" className="mt-2">
          <EmptyState text="还没有新的评论" />
        </TabsContent>
        <TabsContent value="follow" className="mt-2">
          <EmptyState text="还没有新的关注" />
        </TabsContent>
      </Tabs>

      <Separator className="my-3" />

      <Card className="mx-3 ring-1 ring-foreground/5">
        <CardContent className="flex items-center gap-3 p-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">官方通知</p>
            <p className="text-xs text-muted-foreground">活动 · 系统消息</p>
          </div>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
            NEW
          </span>
        </CardContent>
      </Card>

      <div className="mt-6 px-3 pb-4">
        <p className="text-xs text-muted-foreground">推荐的创作者</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Avatar size="default">
                <AvatarFallback>创</AvatarFallback>
              </Avatar>
              <span className="line-clamp-1 text-[11px] text-muted-foreground">创作者</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
      <Avatar size="lg" className="bg-muted">
        <AvatarFallback>📭</AvatarFallback>
      </Avatar>
      <p className="text-sm">{text}</p>
    </div>
  );
}
