import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const attachmentVariants = cva(
  "group/attachment relative flex shrink-0 overflow-hidden rounded-xl border bg-card text-card-foreground transition-colors",
  {
    variants: {
      orientation: {
        horizontal: "min-w-48 items-center gap-2 p-2",
        vertical: "w-24 flex-col",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

function Attachment({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof attachmentVariants>) {
  return (
    <div
      data-slot="attachment"
      data-orientation={orientation}
      className={cn(attachmentVariants({ orientation }), className)}
      {...props}
    />
  );
}

function AttachmentGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-group"
      className={cn("flex snap-x gap-3 overflow-x-auto py-1", className)}
      {...props}
    />
  );
}

function AttachmentMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-media"
      className={cn(
        "bg-muted relative flex aspect-square w-full items-center justify-center overflow-hidden text-muted-foreground group-data-[orientation=horizontal]/attachment:size-12 [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover",
        className,
      )}
      {...props}
    />
  );
}

function AttachmentContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-content"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  );
}

function AttachmentTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="attachment-title" className={cn("block truncate text-xs font-medium", className)} {...props} />
  );
}

function AttachmentDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="attachment-description"
      className={cn("mt-0.5 block truncate text-[11px] text-muted-foreground", className)}
      {...props}
    />
  );
}

function AttachmentActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-actions"
      className={cn("absolute top-1 right-1 z-10", className)}
      {...props}
    />
  );
}

function AttachmentAction({ className, ...props }: React.ComponentProps<typeof Button>) {
  return <Button data-slot="attachment-action" variant="secondary" size="icon-xs" {...props} className={cn("rounded-full shadow-sm", className)} />;
}

export {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
};
