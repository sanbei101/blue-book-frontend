import { Outlet } from "@tanstack/react-router";

import { BottomNav } from "./BottomNav";

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-screen max-w-screen-sm flex-col bg-background">
      <div className="flex-1 pb-16">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
