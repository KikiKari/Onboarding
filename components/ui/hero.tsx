import type { HTMLAttributes } from "react";

export function Hero({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`relative overflow-hidden ${className}`} {...props} />;
}
