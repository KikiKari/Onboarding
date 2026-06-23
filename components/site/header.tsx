"use client";

import Link from "next/link";
import { useState } from "react";
import { siteContent } from "@/content";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl">
      <Container className="flex min-h-17 items-center justify-between gap-6 py-3.5">
        <Link className="focus-ring flex items-center gap-2.5 no-underline" href="/">
          <span className="size-4 rotate-45 rounded-[0.1875rem] bg-accent" />
          <span className="display text-[1.3125rem]">{siteContent.brand}</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[0.9375rem] text-ink-2 md:flex" aria-label="Hauptnavigation">
          {siteContent.navigation.map((item) => <Link className="focus-ring hover:text-accent" href={`/${item.href}`} key={item.href}>{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Link className="focus-ring text-[0.9375rem] text-ink-2 hover:text-accent" href="#kontakt">Kontakt</Link>
          <Button href="#projekte" size="sm">Ausprobieren</Button>
        </div>
        <button className="focus-ring rounded-[var(--radius-sm)] border border-line px-3 py-2 text-sm md:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Navigation umschalten">Menü</button>
      </Container>
      {open ? (
        <nav className="border-t border-line bg-bg px-6 py-5 md:hidden" aria-label="Mobile Navigation">
          <div className="flex flex-col gap-4">
            {siteContent.navigation.map((item) => <Link href={`/${item.href}`} onClick={() => setOpen(false)} key={item.href}>{item.label}</Link>)}
            <Link href="#kontakt" onClick={() => setOpen(false)}>Kontakt</Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
