import type { HTMLAttributes } from "react";

export function Badge({ className = "", children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`eyebrow inline-flex items-center gap-2 text-muted ${className}`} {...props}>
      <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
      {children}
    </span>
  );
}
