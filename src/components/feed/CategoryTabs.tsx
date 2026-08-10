import { cn } from "@/lib/utils";

const tabs = ["推荐", "穿搭", "美食", "美妆", "旅行", "居家", "母婴", "健身", "数码"];

export function CategoryTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex h-9 [scrollbar-width:none] items-center gap-4 overflow-x-auto px-3 [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => {
        const isActive = active === t;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={cn(
              "relative shrink-0 text-sm transition-colors",
              isActive ? "font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            {t}
            {isActive && (
              <span className="bg-primary absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
