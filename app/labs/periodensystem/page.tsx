import { PeriodicTable } from "@/components/labs/periodic-table";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata = { title: "Interaktives Periodensystem" };

export default function PeriodicTablePage() {
  return (
    <>
      <Header />
      <main>
        <Section className="pt-[var(--space-16)]">
          <Container>
            <Badge>Lab Experiment</Badge>
            <h1 className="display mt-4 text-[clamp(3rem,7vw,5rem)]">Periodensystem der Elemente</h1>
            <p className="mt-5 max-w-[60ch] text-lg text-ink-2">React-Adaption des vorhandenen lokalen Experiments. Wählen Sie ein Element für die Detailansicht.</p>
            <div className="mt-10"><PeriodicTable /></div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
