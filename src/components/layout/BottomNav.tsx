import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Bell, User } from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: Home, label: "首页" },
  { to: "/explore", icon: Search, label: "探索" },
  { to: "/publish", icon: null, label: "发布" },
  { to: "/notifications", icon: Bell, label: "消息" },
  { to: "/me", icon: User, label: "我" },
] as const;

export function BottomNav() {
  const { location } = useRouterState();

  return (
    <nav
      data-slot="bottom-nav"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-16 max-w-screen-sm items-stretch justify-around border-t border-border/60 bg-background/95 px-1 backdrop-blur-lg"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isPublish = tab.label === "发布";
        const isActive = !isPublish && location.pathname === tab.to;

        if (isPublish) {
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="relative flex flex-1 flex-col items-center justify-center"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-transform active:scale-95">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            {Icon && <Icon className="size-5" strokeWidth={isActive ? 2.4 : 1.8} />}
            <span className={cn(isActive && "font-medium")}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
