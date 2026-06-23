import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center">
      <Container className="text-center">
        <span className="eyebrow text-accent">404</span>
        <h1 className="display mt-4 text-6xl">Projekt nicht gefunden.</h1>
        <p className="mt-5 text-ink-2">Der angeforderte Projekt-Slug ist nicht Teil des kuratierten Index.</p>
        <Link className="mt-8 inline-block font-mono text-sm text-accent" href="/">Zur Startseite →</Link>
      </Container>
    </main>
  );
}
