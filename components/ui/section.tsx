import type { HTMLAttributes } from "react";

export function Section({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`content-auto py-[var(--space-24)] ${className}`} {...props} />;
}
