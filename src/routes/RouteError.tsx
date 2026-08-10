import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RouteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <AlertCircle className="text-destructive/60 size-12" />
      <div>
        <h2 className="text-lg font-semibold">出错了</h2>
        <p className="text-muted-foreground mt-1 text-sm">加载页面时出现问题,请重试</p>
      </div>
      <Button onClick={reset} variant="outline" className="rounded-full">
        重新加载
      </Button>
    </div>
  );
}
