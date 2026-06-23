import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { projectBySlug, projects } from "@/content";

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = projectBySlug.get((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = projectBySlug.get((await params).slug);
  if (!project) notFound();
  return (
    <>
      <Header />
      <main>
        <Section className="relative overflow-hidden border-b border-line pt-[var(--space-20)]">
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_80%_30%,rgba(46,125,123,.13),transparent_60%),radial-gradient(60%_70%_at_15%_80%,rgba(168,84,47,.1),transparent_65%)]" />
          <Container className="relative grid items-center gap-12 lg:grid-cols-[1fr_.9fr]">
            <div>
              <Badge>{project.platform}</Badge>
              <h1 className="display mt-5 text-[clamp(3rem,7vw,5.5rem)] leading-none">{project.title}</h1>
              <p className="mt-6 max-w-[46ch] text-xl leading-relaxed text-ink-2">{project.summary}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {project.tags.map((tag) => <span className="rounded-[var(--radius-pill)] border border-line-strong bg-surface px-3 py-1.5 font-mono text-xs text-muted" key={tag}>{tag}</span>)}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={project.github} target="_blank" rel="noreferrer">Quellcode öffnen →</Button>
                {project.demo ? <Button href={project.demo} variant="secondary">Demo starten</Button> : null}
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-lg)]">
              <Image src={project.media} alt={`Motiv für ${project.title}`} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 45vw" />
            </div>
          </Container>
        </Section>
        <Section>
          <Container className="grid gap-12 md:grid-cols-[.65fr_1.35fr]">
            <div>
              <span className="eyebrow text-muted">Projektprofil</span>
              <dl className="mt-6 space-y-5 text-sm">
                <div><dt className="text-muted">Plattform</dt><dd className="mt-1 text-lg">{project.platform}</dd></div>
                <div><dt className="text-muted">Repository-Modell</dt><dd className="mt-1 text-lg">Ein Projekt pro Branch</dd></div>
                <div><dt className="text-muted">Lizenz</dt><dd className="mt-1 text-lg">MIT</dd></div>
              </dl>
            </div>
            <div>
              <span className="eyebrow text-accent">Im Detail</span>
              <h2 className="display mt-4 text-[clamp(2rem,4vw,3rem)]">Was dieses Projekt leistet</h2>
              <p className="mt-6 max-w-[60ch] text-lg leading-loose text-ink-2">{project.detail}</p>
              <Link className="mt-8 inline-block font-mono text-sm text-accent" href="/#projekte">← Alle Projekte</Link>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
