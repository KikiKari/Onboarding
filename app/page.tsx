import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/site/contact-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { NarrationToggle } from "@/components/site/narration-toggle";
import { PondHero } from "@/components/site/pond-hero";
import { ProjectList } from "@/components/site/project-list";
import { RotatingHeadline } from "@/components/site/rotating-headline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Hero } from "@/components/ui/hero";
import { Section } from "@/components/ui/section";
import { siteContent } from "@/content";

const iconPaths = {
  circle: <circle cx="12" cy="12" r="7" />,
  diamond: <rect x="6.5" y="6.5" width="11" height="11" transform="rotate(45 12 12)" />,
  plus: <path d="M12 5v14M5 12h14" strokeLinecap="round" />,
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero id="top" className="min-h-[clamp(43rem,92vh,64rem)] bg-[linear-gradient(165deg,#e8ebde_0%,#eee9dc_55%,#f6f2e9_100%)]">
          <Image src="/media/hero-meadow.png" alt="" fill priority className="object-cover opacity-75" sizes="100vw" />
          <div className="absolute inset-0 bg-[radial-gradient(62%_56%_at_52%_42%,rgba(248,246,239,.74),rgba(248,246,239,.16)_55%,transparent_76%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg),transparent_36%)]" />
          <Container className="relative z-10 flex flex-col gap-8 py-[var(--space-20)]">
            <Reveal><Badge>{siteContent.hero.badge}</Badge></Reveal>
            <Reveal delay={0.06}>
              <h1 className="display m-0 max-w-[18ch] text-[clamp(2.75rem,6vw,5rem)] leading-none">
                {siteContent.hero.prefix} <RotatingHeadline words={siteContent.hero.verbs} />
              </h1>
            </Reveal>
            <Reveal delay={0.16} className="flex flex-col items-center gap-5 text-center">
              <p className="m-0 max-w-[56ch] text-[clamp(1rem,1.5vw,1.1875rem)] leading-relaxed text-ink-2">{siteContent.hero.subline}</p>
            </Reveal>
            <Reveal delay={0.08}><PondHero /></Reveal>
          </Container>
          <NarrationToggle />
        </Hero>

        <Section id="funktionen">
          <Container>
            <Reveal className="mb-12 max-w-[60ch]">
              <span className="eyebrow text-muted">Funktionen</span>
              <h2 className="display mt-3.5 text-[clamp(2rem,4vw,2.875rem)] leading-tight">Bausteine, die sich wiederverwenden lassen.</h2>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-2">Die Informationsarchitektur der Vorlage wird mit realen Projektwegen und belastbaren Komponenten gefüllt.</p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {siteContent.features.map((feature, index) => (
                <Reveal delay={index * 0.08} key={feature.title}>
                  <Link href={feature.href} className="group block h-full no-underline">
                    <Card className="flex h-full flex-col gap-4 p-7 transition duration-[var(--motion-fast)] group-hover:-translate-y-1 group-hover:border-line-strong group-hover:shadow-[var(--shadow-md)]">
                      <span className={`flex size-12 items-center justify-center rounded-[var(--radius-md)] border border-line bg-surface-2 ${index === 0 ? "text-accent-2" : index === 1 ? "text-accent-3" : "text-accent"}`}>
                        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">{iconPaths[feature.icon as keyof typeof iconPaths]}</svg>
                      </span>
                      <h3 className="display m-0 text-2xl">{feature.title}</h3>
                      <p className="m-0 text-[0.9375rem] leading-relaxed text-muted">{feature.text}</p>
                      <span className="mt-auto pt-2 font-mono text-xs text-accent">/mehr-erfahren →</span>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="projekte" className="border-y border-line bg-[var(--bg)]">
          <Container>
            <Reveal className="mb-10 max-w-[60ch]">
              <span className="eyebrow text-muted">Projekte</span>
              <h2 className="display mt-3.5 text-[clamp(2rem,4vw,2.875rem)] leading-tight">Neun eigenständige Werkzeuge, ein gemeinsamer Rahmen.</h2>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-2">Jede Kugel im Teich entspricht einer dieser Zeilen — hier ruhen sie still und geordnet.</p>
            </Reveal>
            <Reveal>
              <ProjectList />
            </Reveal>
          </Container>
        </Section>

        <Section id="demos">
          <Container className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <span className="eyebrow text-accent">Im Detail</span>
              <h2 className="display mt-3.5 text-[clamp(2rem,3.4vw,2.5rem)] leading-tight">Ergebnisse werden nicht nur beschrieben, sondern ausprobiert.</h2>
              <p className="mt-5 max-w-[52ch] leading-relaxed text-ink-2">Vision-Check demonstriert lokale Bildanalyse. Das Periodensystem zeigt, wie eigenständige Experimente in dasselbe Designsystem überführt werden.</p>
              <ul className="mt-6 space-y-3 pl-5 text-muted">
                <li>Kamera- und Bild-Workflow ohne Cloud-Schlüssel</li>
                <li>Interaktive Detailansichten</li>
                <li>Responsive, zugängliche Bedienung</li>
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/demos/vision-check">Vision-Check öffnen →</Button>
                <Button href="/labs/periodensystem" variant="secondary">Periodensystem</Button>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-lg)]">
                <Image src="/media/feature-spotlight.png" alt="Generiertes Spotlight-Motiv für die Projekt-Demos" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
            </Reveal>
          </Container>
        </Section>

        <Section id="schritte" className="border-y border-line bg-surface-2">
          <Container>
            <Reveal className="mb-12">
              <span className="eyebrow text-muted">Schritte</span>
              <h2 className="display mt-3.5 text-[clamp(2rem,4vw,2.875rem)]">Wie es funktioniert</h2>
            </Reveal>
            <div className="grid gap-8 md:grid-cols-3">
              {siteContent.steps.map((step, index) => (
                <Reveal delay={index * 0.08} key={step.number}>
                  <div className="border-t border-line-strong pt-5">
                    <span className="font-mono text-xs text-accent">{step.number}</span>
                    <h3 className="display mt-5 text-2xl">{step.title}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{step.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="kontakt" className="relative overflow-hidden">
          <Image src="/media/cta-background.png" alt="" fill className="object-cover opacity-35" sizes="100vw" />
          <Container className="relative grid items-start gap-12 lg:grid-cols-[1fr_.8fr]">
            <Reveal>
              <span className="eyebrow text-accent">Loslegen</span>
              <h2 className="display mt-4 max-w-[16ch] text-[clamp(2.25rem,5vw,3.75rem)] leading-tight">Bereit für den nächsten Schritt?</h2>
              <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-ink-2">Beschreiben Sie kurz, welches Projekt oder welche Zusammenarbeit Sie interessiert.</p>
            </Reveal>
            <Reveal delay={0.08}><ContactForm /></Reveal>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
