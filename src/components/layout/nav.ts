import { Home, Search, Bell, User, Plus } from "lucide-react";

export const NAV_TABS = [
  { to: "/", icon: Home, label: "首页" },
  { to: "/explore", icon: Search, label: "探索" },
  { to: "/publish", icon: Plus, label: "发布" },
  { to: "/notifications", icon: Bell, label: "消息" },
  { to: "/me", icon: User, label: "我" },
] as const;

export type NavTab = (typeof NAV_TABS)[number];
