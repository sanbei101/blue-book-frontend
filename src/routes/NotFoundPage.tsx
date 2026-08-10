import { Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <SearchX className="text-muted-foreground/40 size-16" />
      <div>
        <h2 className="text-lg font-semibold">页面走丢了</h2>
        <p className="text-muted-foreground mt-1 text-sm">要不回到首页继续看看?</p>
      </div>
      <Button render={<Link to="/" />} className="rounded-full">
        回到首页
      </Button>
    </div>
  );
}
