import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="bg-[var(--footer-bg)] py-[var(--space-16)] text-[var(--footer-fg)]">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="display text-2xl no-underline">Projekt</Link>
            <p className="mt-4 max-w-xs text-sm text-[var(--footer-muted)]">Ideen werden verständliche, prüfbare Systeme.</p>
          </div>
          {[
            ["Projekt", ["Projekte", "Demos", "Kontakt"]],
            ["Quellen", ["GitHub", "Canva", "Design Export"]],
            ["Rechtliches", ["Datenschutz", "Impressum", "MIT-Lizenz"]],
          ].map(([title, links]) => (
            <div key={title as string}>
              <h2 className="eyebrow text-[var(--footer-muted)]">{title as string}</h2>
              <ul className="mt-4 space-y-3 p-0 text-sm">
                {(links as string[]).map((link) => <li className="list-none" key={link}><span>{link}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 font-mono text-xs tracking-wide text-[var(--footer-muted)]">
          <span>© 2026 PROJEKT — MIT</span>
          <span>9 PROJEKTE / 2 PLATTFORMEN</span>
        </div>
      </Container>
    </footer>
  );
}
