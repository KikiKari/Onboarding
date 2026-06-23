import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Shared = { variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" };
type LinkProps = Shared & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type NativeProps = Shared & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

const styles = {
  primary: "bg-accent text-white shadow-[var(--shadow-sm)] hover:bg-[var(--accent-press)] hover:-translate-y-px hover:shadow-[var(--shadow-md)]",
  secondary: "border border-line-strong bg-surface text-ink hover:border-ink hover:-translate-y-px",
  ghost: "text-ink-2 hover:text-accent",
};

export function Button(props: LinkProps | NativeProps) {
  const { variant = "primary", size = "md", className = "", children, ...rest } = props;
  const classes = `focus-ring inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] font-medium no-underline transition duration-[var(--motion-fast)] ${size === "sm" ? "px-5 py-2.5 text-sm" : "px-6 py-3.5 text-[0.9375rem]"} ${styles[variant]} ${className}`;
  if ("href" in props && props.href) {
    return <Link className={classes} href={props.href} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</Link>;
  }
  return <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>;
}
