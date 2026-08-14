import { useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ApiNotificationResponse } from "@/api/api.schemas";
import {
  useGetNotifications,
  useGetNotificationsUnreadCount,
  usePatchNotificationsNotificationIdRead,
  usePostNotificationsReadAll,
} from "@/api/notifications/notifications";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/mutator";

import { AuthPage } from "./UserProfilePage";

const notificationFilters = {
  all: () => true,
  like: (type: string) => ["like", "collect"].includes(type),
  comment: (type: string) => ["comment", "reply"].includes(type),
  follow: (type: string) => type === "follow",
};

const notificationMeta = {
  like: { Icon: Heart, text: "赞了你的笔记" },
  collect: { Icon: Heart, text: "收藏了你的笔记" },
  comment: { Icon: MessageCircle, text: "评论了你的笔记" },
  reply: { Icon: MessageCircle, text: "回复了你的评论" },
  follow: { Icon: UserPlus, text: "关注了你" },
} as const;

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("access_token")),
  );
  const [activeTab, setActiveTab] = useState<keyof typeof notificationFilters>("all");
  const notificationsQuery = useGetNotifications(
    { page: 1, page_size: 50 },
    { query: { enabled: isAuthenticated } },
  );
  const unreadCountQuery = useGetNotificationsUnreadCount({
    query: { enabled: isAuthenticated },
  });
  const readMutation = usePatchNotificationsNotificationIdRead();
  const readAllMutation = usePostNotificationsReadAll();

  useEffect(() => {
    const handleSessionExpired = () => setIsAuthenticated(false);
    window.addEventListener("blue_book:session-expired", handleSessionExpired);
    return () => window.removeEventListener("blue_book:session-expired", handleSessionExpired);
  }, []);

  const refreshNotifications = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationsQuery.queryKey }),
      queryClient.invalidateQueries({ queryKey: unreadCountQuery.queryKey }),
    ]);

  const markAsRead = async (notification: ApiNotificationResponse) => {
    if (notification.read_at) return;
    try {
      await readMutation.mutateAsync({ notificationId: notification.id });
      await refreshNotifications();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.msg : "标记已读失败");
    }
  };

  const markAllAsRead = async () => {
    try {
      await readAllMutation.mutateAsync();
      await refreshNotifications();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.msg : "标记已读失败");
    }
  };

  if (!isAuthenticated) return <AuthPage onAuthenticated={() => setIsAuthenticated(true)} />;

  const notifications = (notificationsQuery.data?.items ?? []).filter((notification) =>
    notificationFilters[activeTab](notification.notification_type),
  );
  const unreadCount = unreadCountQuery.data?.count ?? 0;

  return (
    <>
      <TopBar
        title="消息"
        showSearch={false}
        rightSlot={
          unreadCount > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={readAllMutation.isPending}
              onClick={markAllAsRead}
            >
              <CheckCheck />
              全部已读
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as keyof typeof notificationFilters)}
        className="px-3 pt-2"
      >
        <TabsList variant="line" className="w-full justify-start gap-4">
          <TabsTrigger value="all">
            全部
            {unreadCount > 0 && <Badge className="ml-1 min-w-5 px-1">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="like">赞和收藏</TabsTrigger>
          <TabsTrigger value="comment">评论</TabsTrigger>
          <TabsTrigger value="follow">关注</TabsTrigger>
        </TabsList>

        {Object.keys(notificationFilters).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-2">
            {notificationsQuery.isPending ? (
              <NotificationSkeleton />
            ) : notificationsQuery.isError ? (
              <NotificationEmpty text="消息加载失败" />
            ) : notifications.length ? (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                    disabled={readMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <NotificationEmpty text="还没有相关消息" />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

function NotificationItem({
  notification,
  onRead,
  disabled,
}: {
  notification: ApiNotificationResponse;
  onRead: (notification: ApiNotificationResponse) => Promise<void>;
  disabled: boolean;
}) {
  const meta = notificationMeta[
    notification.notification_type as keyof typeof notificationMeta
  ] ?? {
    Icon: Bell,
    text: "与你互动",
  };

  return (
    <Button
      variant="ghost"
      className="h-auto w-full justify-start gap-3 rounded-none px-1 py-3 text-left whitespace-normal"
      onClick={() => void onRead(notification)}
      disabled={disabled}
    >
      <Avatar size="default">
        <AvatarImage src={notification.actor.avatar_url} />
        <AvatarFallback>{notification.actor.username.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-sm font-medium">
          <meta.Icon className="text-muted-foreground size-3.5" />
          <span className="truncate">{notification.actor.username}</span>
          <span className="text-muted-foreground font-normal">{meta.text}</span>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {formatNotificationTime(notification.created_at)}
        </p>
      </div>
      {!notification.read_at && <span className="bg-primary size-2 shrink-0 rounded-full" />}
    </Button>
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationEmpty({ text }: { text: string }) {
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Bell />
        </EmptyMedia>
        <EmptyTitle>{text}</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}
