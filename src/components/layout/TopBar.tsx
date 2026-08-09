import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TopBarProps = {
  title?: string;
  showSearch?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
};

export function TopBar({ title, showSearch = true, rightSlot, className }: TopBarProps) {
  return (
    <header
      data-slot="top-bar"
      className={cn(
        "sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border/60 bg-background/95 px-3 backdrop-blur-lg",
        className,
      )}
    >
      {title ? (
        <h1 className="text-base font-semibold tracking-wide">{title}</h1>
      ) : (
        <Link to="/" className="select-none">
          <span className="text-xl font-bold tracking-tight text-primary">小红书</span>
        </Link>
      )}

      {showSearch && (
        <Link to="/explore" className="ml-2 max-w-sm flex-1 md:max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              placeholder="搜索你感兴趣的内容"
              className="h-8 cursor-pointer rounded-full bg-muted pl-8 text-sm"
            />
          </div>
        </Link>
      )}

      {rightSlot && <div className="flex items-center">{rightSlot}</div>}
    </header>
  );
}

export function TopBarAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Button variant="ghost" size="icon-sm" render={<Link to={to} aria-label={label} />}>
      {icon}
    </Button>
  );
}
