import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block text-xs font-medium uppercase tracking-wide text-muted", className)}>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "mt-1 h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm leading-relaxed text-fg outline-none focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: InputHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "mt-1 h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}
