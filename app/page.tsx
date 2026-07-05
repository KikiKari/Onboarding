import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/site/contact-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PondExperience } from "@/components/site/pond-experience";
import { ProjectList } from "@/components/site/project-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
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
      {/* PondExperience nutzt position:fixed und füllt den gesamten Viewport (100vh).
          Um Platz für den Scroll darunter zu schaffen, folgt ein Spacer mit 100vh Höhe.
          Der Header ist per body[data-hero-immersive] CSS verborgen solange die
          Pond-Experience mounted ist — er kommt erst nach Scroll zurück. */}
      <PondExperience />
      <div aria-hidden="true" style={{ height: "100vh" }} />

      <Header />
      <main className="relative z-10 bg-[var(--bg)]">

        <Section id="funktionen" className="pt-24">
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

      </main>
      <Footer />
    </>
  );
}
