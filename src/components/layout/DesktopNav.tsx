import { Link, useRouterState } from "@tanstack/react-router";

import { NAV_TABS } from "./nav";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function DesktopNav() {
  const { location } = useRouterState();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
              <span className="text-xl font-bold tracking-tight text-primary">小红书</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.to;
                return (
                  <SidebarMenuItem key={tab.to}>
                    <SidebarMenuButton isActive={isActive} render={<Link to={tab.to} />}>
                      <Icon className="size-4" />
                      <span>{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
