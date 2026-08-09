import { Outlet } from "@tanstack/react-router";

import { BottomNav } from "./BottomNav";
import { DesktopNav } from "./DesktopNav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell() {
  return (
    <SidebarProvider>
      <DesktopNav />
      <SidebarInset>
        <div className="mx-auto w-full max-w-screen-sm pb-16 md:max-w-5xl md:pb-0">
          <Outlet />
        </div>
      </SidebarInset>
      <BottomNav className="md:hidden" />
    </SidebarProvider>
  );
}
