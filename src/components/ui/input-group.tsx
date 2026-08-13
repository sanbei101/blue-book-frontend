import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group flex h-9 w-full items-center rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] outline-none has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4",
  {
    variants: {
      align: {
        "inline-start": "pl-3",
        "inline-end": "order-last pr-1",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "h-full flex-1 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupButton({
  className,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type="button"
      data-slot="input-group-button"
      variant={variant}
      size={size}
      className={cn("mr-1 shrink-0", className)}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva("", {
  variants: { size: { "icon-sm": "", sm: "" } },
  defaultVariants: { size: "icon-sm" },
});

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput };
