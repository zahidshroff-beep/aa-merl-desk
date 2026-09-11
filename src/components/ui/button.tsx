import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:opacity-90",
        outline: "border border-border bg-surface text-fg hover:bg-sunken",
        ghost: "text-muted hover:bg-sunken hover:text-fg",
        danger: "bg-danger text-accent-fg hover:opacity-90",
      },
      size: {
        sm: "h-9 min-h-9 px-3",
        md: "h-11 min-h-11 px-4",
      },
    },
    defaultVariants: { variant: "primary", size: "sm" },
  },
);

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
